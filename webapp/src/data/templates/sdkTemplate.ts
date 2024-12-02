import { amendTsConfigFile, processInstructions } from '../../utils/uiUtils';
import { Instruction, InstructionParam, Account } from '../../types/uiTypes';
import { Dispatch } from 'react';
import { SetStateAction } from 'react';
import { Project } from '../../interfaces/project';
import { LogEntry } from '../../hooks/useTerminalLogs';

const typeMapping = (type: string): string => {
    switch (type) {
    case 'u64':
        return 'number';
    case 'Pubkey':
    case 'PubKey':
        return 'web3.PublicKey';
    default:
        return type;
    }
};

export const getSdkTemplate = async (
    _programClassName: string,
    _programFieldName: string,
    programId: string,
    _instructions: Instruction[],
    accounts: Account[],
    instructionNodes: { data: { label: string; item?: { description?: string } } }[],
    aiInstructions: { function_name: string; params_fields: InstructionParam[] }[],
    _rootPath: string,
    _idlPath: string,
    _walletPublicKey: string,
    projectContext: Project,
    setProjectContext: Dispatch<SetStateAction<Project>>,
    setIsPolling: Dispatch<SetStateAction<boolean>>,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
    addLog: (message: string, type: LogEntry['type']) => void
): Promise<string> => {

    const updatedInstructions = processInstructions( _instructions, instructionNodes, aiInstructions );

    setProjectContext((prevContext) => ({
    ...prevContext,
    details: {
        ...prevContext.details,
        idl: {
        ...prevContext.details.idl,
        parsed: {
            instructions: updatedInstructions,
            accounts,
        },
        },
    },
    }));

    const instructionFunctions = updatedInstructions.map(({ name, description, params, context }) => {
        const uniqueParams = new Map<string, string>();

        params.forEach(param => {
            const mappedType = typeMapping(param.type as string); 
            if (!uniqueParams.has(param.name)) uniqueParams.set(param.name, `${param.name}: ${mappedType}`);
        }); 

        context.accounts.forEach(account => {
        if (!uniqueParams.has(account.name)) uniqueParams.set(account.name, `${account.name}: ${account.isSigner ? "web3.Keypair" : "web3.PublicKey"}`);
        });   

        const paramsList = Array.from(uniqueParams.values()).join(", ");
        
        const accountMappings = context.accounts .map(account => `${account.name}: ${account.name}${account.isSigner ? '.publicKey' : ''}`).join(",\n          ");
        
        const signersList = context.accounts.filter(account => account.isSigner).map(account => account.name).join(", ");

        return `
        // ${description}
        async ${name}(${paramsList}): Promise<web3.Transaction> {
            try {
            // Create the transaction instruction
            const ix = await this.${_programFieldName}.methods.${name}(${params.map(param => param.name).join(", ")}).accounts({
                ${accountMappings}
            }).instruction();

            // Construct the transaction
            const transaction = new web3.Transaction().add(ix);
            transaction.recentBlockhash = (await this.${_programFieldName}.provider.connection.getLatestBlockhash()).blockhash;

            // Sign the transaction if there are any signers
            ${signersList ? `transaction.sign(${signersList});` : ''}

            return transaction;
            } catch (error) {
            console.error('Error executing ${name}:', error);
            throw error;
            }
        }`;
    }).join("\n");

    const accountFetchers = accounts.map(({ name, description, fields }) => {
        const fieldMappings = fields.map(({ name, type }) => {
        const typeConversion = type === 'u64' ? '.toNumber()' : '';
        return `${name}: account.account.${name}${typeConversion}`;
        }).join(",\n          ");

        return `
        // ${description}
        async fetch${name}Accounts(): Promise<${name}[]> {
            try {
            const accounts = await this.${_programFieldName}.account.${name}.all();
            return accounts.map(account => ({
                ${fieldMappings}
            }));
            } catch (error) {
            console.error('Error fetching ${name} accounts:', error);
            throw error;
            }
        }`;
    }).join("\n");

    const setupFunction = `
        export const setup${_programClassName} = () => {
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        
        // Replace this with the wallet you're using
        const wallet = new Wallet("${_walletPublicKey}");

        // Initialize provider
        const provider = new AnchorProvider(connection, wallet, {
            preflightCommitment: 'processed',
        });

        // Create and return the SDK instance
        return new ${_programClassName}SDK(provider, idl);
        };
    `;

    await amendTsConfigFile(projectContext, setIsPolling, setIsLoading, addLog);

    return `
        import { Connection, PublicKey } from '@solana/web3.js';
        import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
        import { Program, Idl, web3, TransactionFn } from '@coral-xyz/anchor';

        import idl from '..${_idlPath}'; 

        export class ${_programClassName}SDK {
        private ${_programFieldName}: Program;

        constructor(provider: AnchorProvider, idl: Idl, programId: string = "${programId}") {
            this.${_programFieldName} = new Program(idl, new PublicKey("${programId}"), provider);
        }

        ${instructionFunctions}

        ${accountFetchers}
        }

        ${setupFunction}

        // Types for program accounts.
        ${accounts.map(({ name, fields }) => {
        const fieldsStr = fields
            .map(({ name, type }) => `  ${name}: ${typeMapping(type)};`)
            .join("\n");
        return `export interface ${name} {
            ${fieldsStr}
        }`;
        }).join("\n\n")}
    `;
};