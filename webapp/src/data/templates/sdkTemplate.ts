import { processInstructions, amendTsConfigFile } from '../../utils/sdkUtils';
import { Instruction, InstructionParam, Account } from '../../types/uiTypes';
import { Dispatch } from 'react';
import { SetStateAction } from 'react';
import { Project } from '../../interfaces/project';
import { LogEntry } from '../../hooks/useTerminalLogs';
import { Wallet } from '@coral-xyz/anchor';
import { User } from '../../contexts/AuthContext';

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
    addLog: (message: string, type: LogEntry['type']) => void,
    user: User | null
): Promise<string> => {
    if (!user) throw new Error('User not found');
    const walletPrivateKey = user.walletPrivateKey;
    if (!walletPrivateKey) throw new Error('Wallet private key not found');

    const updatedInstructions = processInstructions( 
        _instructions, 
        instructionNodes, 
        aiInstructions );

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
                const ix = await this.${_programFieldName}.methods.${name}(${params.map(param => param.name).join(", ")}).accounts({
                    ${accountMappings}
                }).instruction();

                const transaction = new web3.Transaction().add(ix);
                transaction.recentBlockhash = (await this.${_programFieldName}.provider.connection.getLatestBlockhash()).blockhash;

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
        
        const secretKey = [${JSON.parse(walletPrivateKey)}];
        const wallet = new Wallet(Keypair.fromSecretKey(new Uint8Array(secretKey)));
    
        const provider = new AnchorProvider(connection, wallet, {
            preflightCommitment: 'processed',
        });
    
        return new ${_programClassName}SDK(provider, idl);
    };
    `;

    const getPdaFunction = () => {
       return `
            async get${_programClassName}Pda(initializer: web3.PublicKey): Promise<web3.PublicKey> {
                try {
                    const seeds = [
                        Buffer.from("counter"),
                        initializer.toBuffer(),
                    ];
            
                    const counterAccountPda = web3.PublicKey.createProgramAddressSync(
                        seeds,
                        this.${_programFieldName}.programId
                    );
            
                    return counterAccountPda;
                } catch (error) {
                    console.error("Error deriving PDA:", error);
                    throw error;
                }
            }
        `;
    }

    await amendTsConfigFile(projectContext, setIsPolling, setIsLoading, addLog);

    return `
        import { Connection, PublicKey, Keypair } from '@solana/web3.js';
        import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
        import { Program, Idl, web3 } from '@coral-xyz/anchor';
        import idlJson from '../target/idl/counter_program.json'; 
        import { CounterProgram } from '../target/types/counter_program';
        const idl = idlJson as CounterProgram;

        export class ${_programClassName}SDK {
            private ${_programFieldName}: Program<CounterProgram>;

            constructor(
                provider: AnchorProvider, 
                idl: CounterProgram, 
                programId: string = "${programId}"
            ) {
                this.${_programFieldName} = new Program<${_programClassName}>(idl, provider);
            }

            ${getPdaFunction()}

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