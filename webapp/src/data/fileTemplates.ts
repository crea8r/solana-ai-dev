import { snakeToPascal, normalizeName, extractInstructionContext } from '../utils/genCodeUtils';

export const getLibRsTemplate = async (
  projectId: string,
  programName: string,
  programId: string,
  instructionContextMapping: Record<string, { context: string; params: string }>,
  instructionPaths: string[]
): Promise<string> => {
  const instructionContexts = Object.entries(instructionContextMapping);
  console.log("instructionContexts", instructionContexts);

  // Generate imports for each instruction
  const instructionImports = instructionContexts
    .map(([instruction, { context, params }]) => {
      console.log("!!!!!instruction", instruction);
      console.log("!!!!!context", context);
      console.log("!!!!!params", params);
      const moduleName = instruction.startsWith('run_') ? instruction.slice(4) : instruction;
      const contextStruct = context;
      const paramsStruct = params;
      const imports = [contextStruct, paramsStruct].filter(Boolean).join(", ");
      return `use instructions::${moduleName}::{${imports}};`;
    })
    .join('\n');

  // Generate program implementation
  const programFunctions = instructionContexts
    .map(([instruction, { context, params }]) => {
      const moduleName = instruction.startsWith('run_') ? instruction.slice(4) : instruction;
      const publicFuncName = moduleName;
      const contextStruct = snakeToPascal(context);
      const paramsStruct = snakeToPascal(params);
      return `
    pub fn ${publicFuncName}(ctx: Context<${contextStruct}>, params: ${paramsStruct}) -> Result<()> {
        instructions::${moduleName}::${instruction}(ctx, params)
    }`;
    })
    .join('\n');

  return `
use anchor_lang::prelude::*;

declare_id!("${programId}");

pub mod instructions;
pub mod state;

${instructionImports}

#[program]
pub mod ${normalizeName(programName)} {
    use super::*;

    ${programFunctions}
}
`;
};

export const getModRsTemplate = (instructions: string[]): string => {
  const normalizedInstructions = instructions.map((instruction) => {
    return instruction.startsWith('run_') ? instruction.slice(4) : instruction;
  });

  return [
    normalizedInstructions.map(name => `pub mod ${name};`).join('\n'),
    '',
    normalizedInstructions.map(name => `pub use ${name}::*;`).join('\n')
  ].join('\n');
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
  console.log("accountStructs", accountStructs);

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
  functionLogic: string,
  contextStruct: string,
  paramsStruct: string,
  accounts: { name: string; type: string; attributes: string[] }[],
  paramsFields: { name: string; type: string }[],
  errorCodes: { name: string; msg: string }[]
): string => {
  const pascalCaseName = snakeToPascal(instructionName);
  const errorEnumName = `${pascalCaseName}ErrorCode`;

  const errorCodesEnum = errorCodes.map(
      ({ name, msg }) => 
      `#[msg("${msg}")] ${name},`
    ).join('\n');

  const accountsStruct = accounts.map(
      ({ name, type, attributes }) =>
        `#[account(${attributes.join(", ")})] pub ${name}: ${type},`).join('\n\n');

  const paramsStructFields = paramsFields.map(({ name, type }) => `pub ${name}: ${type},`).join('\n');

  return `
    use anchor_lang::prelude::*;
    use crate::state::*;

    pub fn ${instructionName}(ctx: Context<${contextStruct}>, params: ${paramsStruct}) -> Result<()> {
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
    ${errorCodesEnum}
    }
    `;
};




  
