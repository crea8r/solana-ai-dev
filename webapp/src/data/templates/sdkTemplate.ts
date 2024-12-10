import { 
    processInstructions, 
    amendTsConfigFile, 
    toCamelCase 
} from '../../utils/sdkUtils';
import { Instruction, InstructionParam, Account, PDA } from '../../types/uiTypes';
import { Dispatch } from 'react';
import { SetStateAction } from 'react';
import { Project } from '../../interfaces/project';
import { LogEntry } from '../../hooks/useTerminalLogs';
import { Wallet } from '@coral-xyz/anchor';
import { User } from '../../contexts/AuthContext';
import { toSnakeCase } from '../../utils/uiUtils';

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
    _pdas: PDA[],
    accounts: Account[],
    instructionNodes: { data: { label: string; item?: { description?: string } } }[],
    aiInstructions: { function_name: string; params_fields: InstructionParam[] }[],
    _rootPath: string,
    _idlPath: string,
    _walletPublicKey: string,
    _walletPrivateKey: string,
    projectContext: Project,
    setProjectContext: Dispatch<SetStateAction<Project>>,
    setIsPolling: Dispatch<SetStateAction<boolean>>,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
    addLog: (message: string, type: LogEntry['type']) => void,
    user: User
): Promise<string> => {
    console.log("wallet private key- sdktemplate", _walletPrivateKey);
    const systemAccountAddresses = [
        "11111111111111111111111111111111", 
        "SysvarRent111111111111111111111111111111111", 
        "SysvarC1ock111111111111111111111111111111111", 
    ];
    
    const systemAccountNames = [
        "system_program",
        "rent",
        "clock",
        "associatedTokenProgram",
        "tokenProgram"
    ];

    if (_pdas.length === 0) throw new Error('No PDAs found');

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

    const programSnakeCaseName = toSnakeCase(_programClassName);

    const instructionFunctions = updatedInstructions.map(({ name, description, params, context }) => {
        const camelCaseName = toCamelCase(name);
        const uniqueParams = new Map<string, string>();

        const pdaAccountsContext = context.accounts.filter(account => account.pda);
        const pdaInitCheck = pdaAccountsContext
            .map(account => `!this.${toCamelCase(account.name)}Pda`)
            .join(' || ');
    
        params.forEach(param => {
            const mappedType = typeMapping(param.type as string); 
            if (!uniqueParams.has(param.name)) uniqueParams.set(param.name, `${param.name}: ${mappedType}`);
        });        
    
        context.accounts
        .filter(account => account.name !== "system_program")
        .forEach(account => {
            const camelCaseAccountName = toCamelCase(account.name);
            //if (!uniqueParams.has(account.name)) uniqueParams.set(camelCaseAccountName, `${camelCaseAccountName}: ${account.isSigner ? "web3.Keypair" : "web3.PublicKey"}`);
        });
    
        const paramsList = Array.from(uniqueParams.values()).join(", ");
    
        const accountMappings = context.accounts
            .filter(account => account.name !== "system_program")
            .map(account => {
                const accountName = account.name;
                const camelCaseAccountName = toCamelCase(accountName);
                const publicKeyVar = `${camelCaseAccountName}PubKey`;
            
                if (account.pda) {
                    if (typeof account.pda !== 'boolean') {
                        // It's a PDA initializer
                        if (!account.pda.seeds || account.pda.seeds.length === 0) {
                            throw new Error("PDA seeds not found or empty");
                        }
                    
                        const seeds = account.pda.seeds.map(seed => {
                            if (seed.kind === "const") {
                                if (!seed.value) {
                                    throw new Error("PDA seed value for 'const' kind is missing");
                                }
                                return `Buffer.from([${seed.value.join(", ")}])`;
                            } else if (seed.kind === "account") {
                                if (!seed.path) {
                                    throw new Error("PDA seed path for 'account' kind is missing");
                                }
                                return `${toCamelCase(seed.path)}PubKey.toBuffer()`;
                            }
                            throw new Error("Unknown PDA seed kind");
                        }).join(", ");
                    
                        return `
                            const ${publicKeyVar} = web3.PublicKey.createProgramAddressSync(
                                [${seeds}],
                                this.${_programFieldName}.programId
                            );`;
                    } else {
                        // It's a dependent PDA
                        return `${camelCaseAccountName}: ${publicKeyVar}${account.isSigner ? ".publicKey" : ""}`;
                    }
                } else {
                    // Not a PDA
                    return `${camelCaseAccountName}: ${publicKeyVar}${account.isSigner ? ".publicKey" : ""}`;
                }
            }).join(",\n          ");

        const signersList = context.accounts
            .filter(account => account.isSigner)
            .map(account => {
                const camelCaseName = toCamelCase(account.name);
        
                if (account.name === "initializer") return `this.${camelCaseName}`;
        
                return camelCaseName;
            }).join(", ");
    
            const accountOverrides = `{ 
                ${context.accounts
                    .filter(account => {
                        // Exclude irrelevant accounts
                        if (!context.accounts.some(instrAccount => instrAccount.name === account.name)) return false;
                        
                        // Exclude system accounts
                        if (account.systemAccount) return false;
                        if (account.address && systemAccountAddresses.includes(account.address)) return false;
                        if (systemAccountNames.includes(account.name)) return false;
            
                        // Include valid accounts
                        return true;
                    })
                    .map(account => {
                        const camelCaseName = toCamelCase(account.name);
            
                        // Handle special case for `initializer`
                        if (account.name === "initializer") {
                            return `${camelCaseName}: this.${camelCaseName}`; // Assume `this.initializer` is a PublicKey
                        }
            
                        // Use PDA if available
                        if (account.pda) {
                            return `${camelCaseName}: this.${camelCaseName}Pda`;
                        }
            
                        // For signer accounts, use `.publicKey`
                        if (account.isSigner) {
                            return `${camelCaseName}: ${camelCaseName}.publicKey`;
                        }
            
                        // Default case
                        return `${camelCaseName}: ${camelCaseName}`;
                    })
                    .join(", ")}
            }`;
                    
            
            
        const paramsTypes = params.map(param => {
            const accountContext = context.accounts.find(acc => acc.name === param.name);
            if (!accountContext)  throw new Error(`Account ${param.name} not found in context.accounts`);
    
            const paramType = accountContext.isSigner ? "web3.Keypair" : "web3.PublicKey";
            return `${param.name}: ${paramType}`;
        }).join(", ");

        const paramsArg = params.map(param => {
            const accountContext = context.accounts.find(acc => acc.name === param.name);
            if (!accountContext) throw new Error(`Account ${param.name} not found in context.accounts`);

            return accountContext.isSigner ? `${param.name}: ${param.name}.publicKey` : `${param.name}: ${param.name}`;
        }).join(", ");

        console.log('name', camelCaseName);
        console.log('context', context);
        console.log('pdaAccountsContext', pdaAccountsContext);
        console.log('params', paramsList);
    
        return `
        // ${description}
        async ${camelCaseName}(${paramsTypes}): Promise<web3.Transaction> {
            try {
                if (!this.initializer || ${pdaInitCheck}) throw new Error("PDA is not initialized. Call \`initialize${_programClassName}Pdas\` first.");

                const accounts = await this.getAccountsForInstruction('${name}', ${accountOverrides});
                
                const ix = await this.${_programFieldName}.methods.${camelCaseName}({${paramsArg}})
                .accounts(accounts).instruction();
    
                const transaction = new web3.Transaction().add(ix);
                transaction.recentBlockhash = (await this.${_programFieldName}.provider.connection.getLatestBlockhash()).blockhash;
    
                ${signersList ? `transaction.sign(${signersList});` : ''}
    
                return transaction;
            } catch (error) {
                console.error('Error executing ${camelCaseName}:', error);
                throw error;
            }
        }`;
    }).join("\n");
    
    const accountFetchers = accounts.map(({ name, description, fields }) => {
        const fieldMappings = fields.map(({ name, type }) => {
        const typeConversion = type === 'u64' ? '.toNumber()' : '';
        const camelCaseFieldName = toCamelCase(name);
        return `${camelCaseFieldName}: account.account.${camelCaseFieldName}${typeConversion}`;
        }).join(",\n          ");

        return `
        // ${description}
        async fetch${toCamelCase(name)}s(): Promise<${name}[]> {
            try {
            const accounts = await this.${_programFieldName}.account.${toCamelCase(name)}.all();
            return accounts.map(account => ({
                ${fieldMappings}
            }));
            } catch (error) {
            console.error('Error fetching ${toCamelCase(name)} accounts:', error);
            throw error;
            }
        }`;
    }).join("\n");

    const setupFunction = `
    export const setup${_programClassName} = () => {
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        
        const secretKey = [${Object.values(JSON.parse(_walletPrivateKey))}];
        const wallet = new Wallet(Keypair.fromSecretKey(new Uint8Array(secretKey)));
    
        const provider = new AnchorProvider(connection, wallet, {
            preflightCommitment: 'processed',
        });
    
        return new ${_programClassName}SDK(provider, idl);
    };
    `;

    const getPdaFunction = (_pdas: PDA[]): string => {
        return _pdas.map((pda) => {
            const pdaNameCamel = toCamelCase(pda.name);
            return `
            async get${toCamelCase(pda.name)}Pda(initializer: web3.PublicKey): Promise<web3.PublicKey> {
                try {
                    const seeds = [
                        Buffer.from("${pda.name}"),
                        initializer.toBuffer(),
                    ];
            
                    const [${pdaNameCamel}Pda] = web3.PublicKey.findProgramAddressSync(
                        seeds,
                        this.${_programFieldName}.programId
                    );
            
                    return ${pdaNameCamel}Pda;
                } catch (error) {
                    console.error("Error deriving PDA for ${pda.name}:", error);
                    throw error;
                }
            }
            `;
        }).join("\n");
    };

    const getAccountsForInstruction = (_programFieldName: string): string => {
        return `
        async getAccountsForInstruction(instructionName: string, overrides: Record<string, web3.PublicKey> = {}): Promise<Record<string, web3.PublicKey>> {
            try {
                const idl = this.${_programFieldName}.idl;
                const instruction = idl.instructions.find(instr => instr.name === instructionName);
                if (!instruction) throw new Error(\`Instruction '\${instructionName}' not found in the IDL\`);
    
                const accounts: Record<string, web3.PublicKey> = {};
                const systemAccounts = ['systemProgram', 'rent', 'clock', 'associatedTokenProgram', 'tokenProgram'];
    
                for (const account of instruction.accounts) {
                    const accountName: string = account.name;
    
                    if (overrides[accountName]) {
                        accounts[accountName] = overrides[accountName];
                    } else if (systemAccounts.includes(accountName)) {
                        accounts[accountName] = this.resolveSystemProgramAccount(accountName);
                    } else if (this[accountName + 'Pda']) {
                        accounts[accountName] = this[accountName + 'Pda'] as web3.PublicKey;
                    } else {
                        throw new Error(\`Unable to resolve account: \${accountName}. Provide it in the overrides or initialize the PDA.\`);
                    }
                }
    
                return accounts;
    
            } catch (error) {
                console.error(\`Error inferring accounts for instruction \${instructionName}:\`, error);
                throw error;
            }
        }
        `;
    };

    const isValidPublicKey = `
    isValidPublicKey(publicKey: web3.PublicKey): boolean {
        try { return web3.PublicKey.isOnCurve(publicKey); } 
        catch (error) { return false; }
    };`;

    const resolveSystemProgramAccount = `
        resolveSystemProgramAccount(accountName: string): web3.PublicKey {
            switch (accountName) {
                case 'systemProgram':
                    return web3.SystemProgram.programId;
                case 'rent':
                    return web3.SYSVAR_RENT_PUBKEY;
                case 'clock':
                    return web3.SYSVAR_CLOCK_PUBKEY;
                case 'associatedTokenProgram':
                    return ASSOCIATED_TOKEN_PROGRAM_ID;
                case 'tokenProgram':
                    return TOKEN_PROGRAM_ID;
                default:
                    throw new Error(\`Unknown system account: \${accountName}\`);
            }
        }`;
    
    const pdasClassFields = _pdas.map((pda) => `private ${toCamelCase(pda.name)}Pda?: web3.PublicKey;`).join("\n            ");

    const initializeMethod = (_programClassName: string, _pdas: PDA[]): string => {
        const pdaInitializationCode = _pdas
            .map((pda) => `this.${toCamelCase(pda.name)}Pda = await this.get${toCamelCase(pda.name)}Pda(initializer);`)
            .join("\n            ");
    
        return `
        async initialize${_programClassName}Pdas(initializer: web3.PublicKey): Promise<void> {
            try {
                this.initializer = initializer;
                ${pdaInitializationCode}
            } catch (error) {
                console.error("Error initializing PDAs:", error);
                throw error;
            }
        }
        `;
    };

    await amendTsConfigFile(projectContext, setIsPolling, setIsLoading, addLog);

    // ${projectContext.details.idl.parsed.metadata?.name}
    return `
        import { Connection, PublicKey, Keypair } from '@solana/web3.js';
        import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
        import { Program, Idl, web3 } from '@coral-xyz/anchor';
        import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
        const idlJson = require('../target/idl/${programSnakeCaseName}.json'); 
        import { ${_programClassName} } from '../target/types/${programSnakeCaseName}';
        const idl = idlJson as ${_programClassName};

        export class ${_programClassName}SDK {
            private ${_programFieldName}: Program<${_programClassName}>;
            private initializer?: web3.PublicKey;
            ${pdasClassFields}

            constructor(
                provider: AnchorProvider, 
                idl: ${_programClassName}, 
                programId: string = "${programId}"
            ) {
                this.${_programFieldName} = new Program<${_programClassName}>(idl, provider);
                if (!this.${_programFieldName}.programId) (this.${_programFieldName} as any).programId = new web3.PublicKey(programId);
            }

            ${initializeMethod(_programClassName, _pdas)}

            ${getPdaFunction(_pdas)}

            ${getAccountsForInstruction(_programFieldName)}

            ${isValidPublicKey}

            ${resolveSystemProgramAccount}

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