import { snakeToPascal, normalizeName, extractInstructionContext } from '../utils/genCodeUtils';

export const getLibRsTemplate = async (
    projectId: string,
    programName: string,
    programId: string,
    instructions: string[],
    instructionPaths: string[]
): Promise<string> => {
    const instructionContextMapping = await extractInstructionContext(projectId, instructions, instructionPaths);
    const instructionContexts = Object.values(instructionContextMapping);

    return `
  use anchor_lang::prelude::*;
  
  declare_id!("${programId}");
  
  pub mod instructions;
  pub mod state;
  
  #[program]
  pub mod ${normalizeName(programName)} {
      use super::*;
  
      ${instructions
        .map((instruction, index) => {
          const funcName = normalizeName(instruction);
          const structName = snakeToPascal(instructionContexts[index]);
          const paramsStruct = `Params${snakeToPascal(instructionContexts[index])}`;
  
          return `
      pub fn ${funcName}(ctx: Context<${structName}>, params: ${paramsStruct}) -> ProgramResult {
          instructions::${funcName}(ctx, params)
      }`;
        })
        .join('\n')}
  }
  `;
};
  

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
  
