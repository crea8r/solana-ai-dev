export const getInstructionTemplate = (
    details: any,
    _functionLogic: string = "// AI_FUNCTION_LOGIC",
  ): string => {
    const docComment = details.doc_description
    ? `#[doc = r"${details.doc_description}"]`
    : '';
    const instructionName = details.name;
    const contextStructName = details.context_name;
    const paramsStructName = details.params_name;
    const errorEnumName = details.error_enum_name;

    const parsedImports = details.imports
      .map(
        ({ module, items }: any) =>
          `use ${module}::${items.length === 1 && items[0] === "*" ? "*" : `{${items.join(", ")}}`};`
      )
      .join("\n");

    const accountsStruct = (details.accounts || [])
      .map(({ name, type, constraints }: any) => {
        const accountConstraints = constraints?.length > 0 ? `#[account(${constraints.join(", ")})]\n` : '';
        if (type === "Account") {
          return `${accountConstraints}    pub ${name.snake}: Account<'info, ${name.pascal}>,`;
        }
        if (type === "Signer") {
          return `${accountConstraints}    pub ${name.snake}: Signer<'info>,`;
        }
        if (type === "Program") {
          return `${accountConstraints}    pub ${name.snake}: Program<'info, System>,`;
        }
        if (type === "Sysvar") {
          return `${accountConstraints}    pub ${name.snake}: Sysvar<'info, Rent>,`;
        }
        return `${accountConstraints}    pub ${name.snake}: ${type},`;
      }).join('\n');
  
    const paramsStruct = (details.params || [])
        .map(({ name, type }: any) => {
            return `    pub ${name}: ${type},`;
        })
        .join('\n');

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
    ${parsedImports}
  
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