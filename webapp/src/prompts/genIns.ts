import { Instruction } from "../items/Instruction";
import instructionSchema from "../data/ai_schema/instruction_schema.json";

export const genIns = (instruction: Instruction) => {
  const instructionName = instruction.getName();
  const contextStruct = `${instructionName}Context`;
  const paramsStruct = `${instructionName}Params`;

  const templatePrompt = `
--- Instruction Template ---
Here is the template for generating instruction files:

!Important: if the instruction requires a system program (for example, if the instruction initialises a new account), always use the correct arguments of 'info and System.
for example: pub system_program: Program<'info, System>

!If an account is specified as the \`payer\` in the \`#[account(init)]\` constraint, ensure it is declared as \`#[account(mut)]\` in the \`#[derive(Accounts)]\` struct. For example:

- Input: \`#[account(init, payer = initializer, space = ...)]\`
- Output: \`#[account(mut)] pub initializer: Signer<'info>,\`

This ensures the \`payer\` account is mutable as required by Anchor's constraints.

!Don't forget to add the Overflow variant to the error enum if applicable.!

\`\`\`rust
use anchor_lang::prelude::*;
use crate::state::*;

pub fn ${instructionName}(ctx: Context<${contextStruct}>, params: ${paramsStruct}) -> Result<()> {
    // Instruction logic here
    Ok(())
}

#[derive(Accounts)]
pub struct ${contextStruct}<'info> {
    // List of accounts involved
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ${paramsStruct} {
    // List of parameters
}

#[error_code]
pub enum ${instructionName}ErrorCode {
    // Error codes
}
\`\`\`

--- JSON Structure ---
  Provide the output strictly as a JSON object in this exact format:
${JSON.stringify(instructionSchema, null, 2)}

### Field Descriptions:
1. "function_name": The name of the function, which should be "${instructionName}".
2. "context_struct": The struct name for context (e.g., ${contextStruct}).
3. "params_struct": The struct name for parameters (e.g., ${paramsStruct}).
4. "accounts": A list of accounts used by the instruction, each with:
   - "name": Account name as a string.
   - "type": Account type (e.g., "Account<'info, StructName'>", "Signer<'info'>").
   - "attributes": A list of attributes (e.g., ["init", "mut", "signer"]).
5. "params_fields": A list of parameter fields, each with:
   - "name": Parameter name as a string.
   - "type": Parameter type (e.g., "u64", "String").
   - "expected_source": Indicates the expected source of the parameter value. Options include:
      - "wallet": Indicates the value should come from the Solai user's wallet public key.
      - "account": Indicates the value should come from another on-chain account.
      - "none": Indicates no specific source is required (e.g., numeric or string input from the user).
6. "error_codes": A list of error codes, each with:
   - "name": Error code name in PascalCase.
   - "msg": A human-readable error message.
7. "function_logic": A string containing the main function logic.

### Additional Instructions:
- Always follow this JSON structure. All fields must be present, even if empty (use empty strings or empty arrays as placeholders).
- The "function_name" should be "${instructionName}".
- **Do not include any extraneous text, explanations, or code fences (\`\`\`json).**
- **Provide only the JSON object as the response.**

`;

  return templatePrompt;
};

