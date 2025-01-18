export const getInstructionTemplate = (
    details: any,
    _functionLogic: string = "// AI_FUNCTION_LOGIC"
  ): string => {
    const docComment = details.doc_description
    ? `#[doc = r"${details.doc_description}"]`
    : '';
    const instructionName = details.name;
    const contextStructName = details.context_name;
    const paramsStructName = details.params_name;
    const errorEnumName = details.error_enum_name;

    const accountsStruct = (details.accounts).map(({ name, type, constraints }: any) => {
        const accountConstraints = constraints?.length > 0 ? `#[account(${constraints.join(", ")})]\n` : '';
        return `${accountConstraints}    pub ${name}: ${type},`;
    }).join('\n');
  
    const paramsStruct = (details.params || []).map(({ name, type }: any) => `    pub ${name}: ${type},`).join('\n');

    const eventsStruct = (details.events || []).map((event: any) => `
        #[event]
        pub struct ${event.name} {
            ${(event.fields || []).map(({ name, type }: any) => `    pub ${name}: ${type},`).join('\n')}
        }
        `,).join('\n') || '';
  
    const errorCodesStruct = (details.error_codes || []).map(({ name, msg }: any) => `    #[msg("${msg}")] ${name},`).join('\n');
  
    return `
    use anchor_lang::prelude::*;
    use crate::state::*;
  
    ${docComment}
    pub fn ${instructionName}(ctx: Context<${contextStructName}>, params: ${paramsStructName}) -> Result<()> {
        ${_functionLogic}
    }
  
    #[derive(Accounts)]
    pub struct ${contextStructName}<'info> {
        ${accountsStruct}
    }
  
    #[derive(AnchorSerialize, AnchorDeserialize)]
    pub struct ${paramsStructName} {
        ${paramsStruct}
    }
  
    #[error_code]
    pub enum ${errorEnumName} {
    ${errorCodesStruct}
    }

    ${eventsStruct}
    `;

    
};