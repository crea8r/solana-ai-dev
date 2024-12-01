import { snakeToPascal, normalizeName, extractInstructionContext } from '../utils/genCodeUtils';

export const getLibRsTemplate = (
  programName: string,
  programId: string,
  instructionDetails: { instruction_name: string; context: string; params: string }[]
): string => {
  // Generate imports for each instruction
  const instructionImports = instructionDetails
    .map(({ instruction_name, context, params }) => {
      const moduleName = instruction_name; // Module name is the instruction name
      const imports = [context, params].filter(Boolean).join(", ");
      return `use instructions::${moduleName}::{${imports}};`;
    })
    .join('\n');

  // Generate program implementation
  const programFunctions = instructionDetails
    .map(({ instruction_name, context, params }) => {
      const moduleName = instruction_name;
      const functionName = instruction_name; // The function name in lib.rs matches the module name
      const contextStruct = context;
      const paramsStruct = params;
      return `
        pub fn ${functionName}(ctx: Context<${contextStruct}>, params: ${paramsStruct}) -> Result<()> {
            instructions::${moduleName}::${functionName}(ctx, params)
        }`;
    })
    .join('\n');

  return `
  use anchor_lang::prelude::*;

  pub mod instructions;
  pub mod state;
  use instructions::*;

  declare_id!("${programId}");

  #[program]
  pub mod ${programName} {
      use super::*;
      
      ${programFunctions}
  }
  `;
};

export const getModRsTemplate = (instructions: string[], additionalContext?: string): string => {
  const imports = instructions.map((name) => `pub mod ${name};`).join('\n');
  const exports = instructions.map((name) => `pub use ${name}::*;`).join('\n');

  return [
    additionalContext ? `// ${additionalContext}` : '',
    exports,
    '',
    imports
  ].filter(Boolean).join('\n');
};

export const getStateTemplate = (
  accountStructs: {
    name: string;
    description?: string;
    data_structure: {
      fields: { field_name: string; field_type: string; attributes?: string[] }[];
    };
  }[]
): string => {
  //console.log("accountStructs", accountStructs);

  // Deduplicate accounts by `name`
  const uniqueAccounts = Array.from(
    new Map(accountStructs.map(account => [account.name, account])).values()
  );

  const accounts = uniqueAccounts
    .map(({ name, description, data_structure }) => {
      const fieldsStr = data_structure.fields
        .map(({ field_name, field_type, attributes }) => {
          const attributeStr = attributes?.length
            ? attributes.map(attr => `    #[${attr}]`).join('\n') + '\n'
            : '';
          return `${attributeStr}    pub ${field_name}: ${field_type},`;
        })
        .join('\n');

      const descriptionStr = description
        ? `#[doc = "${description}"]\n`
        : '';

      return `
${descriptionStr}#[account]
pub struct ${name} {
${fieldsStr}
}
`;
    })
    .join('\n');

  return `
use anchor_lang::prelude::*;

${accounts}
`;
};

export const getInstructionTemplate = (
  instructionName: string,
  functionName: string,
  functionLogic: string,
  contextStruct: string,
  paramsStruct: string,
  accounts: { name: string; type: string; attributes: string[] }[],
  paramsFields: { name: string; type: string }[],
  errorCodes: { name: string; msg: string }[]
): string => {
  const pascalName = snakeToPascal(instructionName);
  const errorEnumName = pascalName.startsWith("Run") ? pascalName.slice(3) + "ErrorCode" : pascalName + "ErrorCode";

  const accountsStruct = accounts.map(
      ({ name, type, attributes }) =>
        `    #[account(${attributes.join(", ")})]\n    pub ${name}: ${type},`
    ).join('\n\n');

  const paramsStructFields = paramsFields.map(({ name, type }) => `    pub ${name}: ${type},`).join('\n');

  return `
  use anchor_lang::prelude::*;
  use crate::state::*;

  pub fn ${functionName}(ctx: Context<${contextStruct}>, params: ${paramsStruct}) -> Result<()> {
      ${functionLogic}
  }

  #[derive(Accounts)]
  pub struct ${contextStruct}<'info> {
  ${accountsStruct}
  }

  #[derive(AnchorSerialize, AnchorDeserialize)]
  pub struct ${paramsStruct} {
  ${paramsStructFields}
  }

  #[error_code]
  pub enum ${errorEnumName} {
  ${errorCodes.map(({ name, msg }) => `    #[msg("${msg}")] ${name},`).join('\n')}
  }
  `;
};

export const getSdkTemplate = (
  programName: string,
  programId: string,
  instructions: { 
    name: string; 
    description: string; 
    params: string[]; 
    context: { accounts: { name: string; isSigner: boolean; isWritable: boolean }[] }; 
  }[],
  accounts: { name: string; description: string; fields: { name: string; type: string }[] }[]
): string => {
  const instructionFunctions = instructions.map(({ name, description, params, context }) => {
    const uniqueParams = new Map<string, string>();

    params.forEach(param => { if (!uniqueParams.has(param)) uniqueParams.set(param, `${param}: any`); });
    
    context.accounts.forEach(account => { if (!uniqueParams.has(account.name)) uniqueParams.set(account.name, `${account.name}: ${account.isSigner ? 'web3.Keypair' : 'web3.PublicKey'}`); });
    
    const paramsList = Array.from(uniqueParams.values()).join(", ");
    
    const accountMappings = context.accounts .map(account => `${account.name}: ${account.name}${account.isSigner ? '.publicKey' : ''}`).join(",\n          ");
    
    const signersList = context.accounts.filter(account => account.isSigner).map(account => account.name).join(", ");

    return `
      // ${description}
      async ${name}(${paramsList}): Promise<Transaction> {
        try {
          // Create the transaction instruction
          const ix = await this.program.methods.${name}(${params.join(", ")}).accounts({
              ${accountMappings}
          }).instruction();

          // Construct the transaction
          const transaction = new web3.Transaction().add(ix);
          transaction.recentBlockhash = (await this.program.provider.connection.getLatestBlockhash()).blockhash;

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
    // Map fields to correctly extract from account without using `.data`
    const fieldMappings = fields.map(({ name, type }) => {
      const typeConversion = type === 'u64' ? '.toNumber()' : '';
      return `${name}: account.account.${name}${typeConversion}`;
    }).join(",\n          ");

    return `
      // ${description}
      async fetch${name}Accounts(): Promise<${name}[]> {
        try {
          const accounts = await this.program.account.${name.toLowerCase()}.all();
          return accounts.map(account => ({
            ${fieldMappings}
          }));
        } catch (error) {
          console.error('Error fetching ${name} accounts:', error);
          throw error;
        }
      }`;
  }).join("\n");

  // Update the TypeScript types for program accounts
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

  const setupFunction = `
    export const setup${programName} = () => {
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      
      // Replace this with the wallet you're using
      const wallet = new Wallet(/* Add your wallet instance here */);

      // Initialize provider
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: 'processed',
      });

      // Create and return the SDK instance
      return new ${programName}SDK(provider, idl);
    };
  `;

  return `
    import { Connection, PublicKey } from '@solana/web3.js';
    import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
    import { Program, Idl, web3, Transaction } from '@coral-xyz/anchor';

    // Replace with the path to your IDL file
    import idl from './path-to-idl.json'; 

    // SDK for interacting with the ${programName} program.
    export class ${programName}SDK {
      private program: Program;

      constructor(provider: AnchorProvider, idl: Idl, programId: string = "${programId}") {
        this.program = new Program(idl, programId, provider);
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

export const getTestTemplate = (
  programName: string,
  programId: string,
  instructions: { name: string; description: string; params: string[] }[],
  accounts: { name: string; description: string; fields: { name: string; type: string }[] }[]
): string => {
  // Generate test cases for each instruction
  const instructionTests = instructions
    .map(({ name, description, params }) => {
      const paramsList = params.map((param) => `${param}: any`).join(", ");
      return `
  it("should execute ${name} instruction", async () => {
    // Arrange: Set up accounts and parameters
    const params = { ${params.map((param) => `${param}: "example_value"`).join(", ")} };
    const accounts = {
      // Add required account public keys here
    };

    // Act: Call the instruction
    const tx = await program.methods.${name}(${params.map((param) => `params.${param}`).join(", ")})
      .accounts(accounts)
      .rpc();

    // Assert: Verify the expected outcome
    console.log("Transaction signature", tx);
    // TODO: Add assertions to validate the program state
  });`;
    })
    .join("\n");

  // Generate helper functions for account initialization
  const accountHelpers = accounts
    .map(({ name, fields }) => {
      return `
  /**
   * Helper function to create and initialize a ${name} account.
   */
  const create${name}Account = async () => {
    const newAccount = web3.Keypair.generate();
    await program.methods.initialize${name.toLowerCase()}()
      .accounts({
        ${fields.map(({ name }) => `${name}: newAccount.publicKey`).join(",\n        ")}
      })
      .signers([newAccount])
      .rpc();
    return newAccount;
  };`;
    })
    .join("\n");

  return `
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { ${programName} } from '../target/types/${programName}';

describe("${programName} Tests", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.${programName} as Program<${programName}>;

  ${accountHelpers}

  ${instructionTests}
});
`;
};





  
