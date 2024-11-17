import { Node, Edge } from 'react-flow-renderer';

// Helper function to convert snake_case to PascalCase
const snakeToPascal = (str: string) => {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

// Generate the lib.rs file content based on instruction mapping
export const genLib = (
  programName: string,
  programId: string,
  instructionContextMapping: Record<string, { context: string; params: string }>
): string => {
  const instructionContexts = Object.entries(instructionContextMapping);

  // Generate imports for each instruction
  const instructionImports = instructionContexts
    .map(([instruction, { context, params }]) => {
      const moduleName = instruction.replace(/^run_/, '');
      const imports = [context, params].filter(Boolean).join(', ');
      return `use instructions::${moduleName}::{${imports}};`;
    })
    .join('\n');

  // Generate program implementation
  const programFunctions = instructionContexts
    .map(([instruction, { context, params }]) => {
      const moduleName = instruction;
      const publicFuncName = moduleName;
      const contextStruct = snakeToPascal(context);
      const paramsStruct = snakeToPascal(params);
      return `
    pub fn ${publicFuncName}(ctx: Context<${contextStruct}>, params: ${paramsStruct}) -> Result<()> {
        instructions::${moduleName}::${instruction}(ctx, params)
    }`;
    })
    .join('\n');

  // Return the generated lib.rs content
  return `
use anchor_lang::prelude::*;

declare_id!("${programId}");

pub mod instructions;
pub mod state;

${instructionImports}

#[program]
pub mod ${programName} {
    use super::*;

    ${programFunctions}
}
`;
};
