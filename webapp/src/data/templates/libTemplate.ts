export const getLibRsTemplate = (
    _programName: string,
    _programId: string,
    _fileDetails: any[]
  ): string => {

    /*
    const instructionImports = _fileDetails
      .map(({ instruction_name, context, params }) => {
        const moduleName = instruction_name; // Module name is the instruction name
        const imports = [context, params].filter(Boolean).join(", ");
        return `use instructions::${moduleName}::{${imports}};`;
      })
      .join('\n');
    */

   console.log("Lib fileDetails", _fileDetails);
  
    const programFunctions = _fileDetails.map(({ instruction_name, context, params }) => {
        const moduleName = instruction_name;
        const functionName = instruction_name;
        const contextStruct = context;
        const paramsStruct = params;
        return `
          pub fn ${functionName}(ctx: Context<${contextStruct}>, params: ${paramsStruct}) -> Result<()> {
              instructions::${moduleName}::${functionName}(ctx, params)
          }`;
      }).join('\n');
  
    return `
    use anchor_lang::prelude::*;
  
    pub mod instructions;
    pub mod state;
    use instructions::*;
  
    declare_id!("${_programId}");
  
    #[program]
    pub mod ${_programName} {
        use super::*;
        
        ${programFunctions}
    }
    `;
  };