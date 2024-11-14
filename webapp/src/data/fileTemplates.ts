import { snakeToPascal, normalizeName } from '../utils/genCodeUtils';

export const getLibRsTemplate = (
    programName: string,
    programId: string,
    instructions: string[]
  ): string => `
  use anchor_lang::prelude::*;
  
  declare_id!("${programId}");
  
  pub mod instructions;
  
  #[program]
  pub mod ${normalizeName(programName)} {
      use super::*;
  
      ${instructions
        .map(instruction => {
          const funcName = normalizeName(instruction);
          const structName = snakeToPascal(instruction);
          const paramsStruct = `Params${snakeToPascal(instruction)}`;
  
          return `
      pub fn ${funcName}(ctx: Context<${structName}>, params: ${paramsStruct}) -> ProgramResult {
          instructions::${funcName}(ctx, params)
      }`;
        })
        .join('\n')}
  }
  `;
  

  export const getModRsTemplate = (instructions: string[]): string => {
    const normalizedInstructions = instructions.map(normalizeName);
  
    return [
      normalizedInstructions.map(name => `pub mod ${name.replace('run_', '')};`).join('\n'),
      '',
      normalizedInstructions
        .map(name => `pub use ${name.replace('run_', '')}::${name};`)
        .join('\n')
    ].join('\n');
  };
  
