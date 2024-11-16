import { Instruction } from '../items/Instruction';

export const genIns = (instruction: Instruction) => {
  const instructionName = instruction.getName();
  const contextStruct = `${instructionName}Context`;
  const paramsStruct = `${instructionName}Params`;

  const templatePrompt = `
--- Instruction Template ---
Here is the template for generating instruction files:

\`\`\`rust
use anchor_lang::prelude::*;
use crate::state::*;

pub fn run_${instructionName}(ctx: Context<${contextStruct}>, params: ${paramsStruct}) -> Result<()> {
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

--- Generate Content ---
Please provide the following in structured JSON:
1. Function logic (without the signature).
2. Accounts (name, type, attributes).
3. Parameters (name, type).
4. Error codes and messages.

Provide the required instruction details in the following strict JSON format:
{
  "function_name": "run_{instruction_name}",
  "context_struct": "{ContextStruct}",
  "params_struct": "{ParamsStruct}",
  "accounts": [
    {"name": "{account_name}", "type": "{account_type}", "attributes": ["{attributes}"]}
  ],
  "params_fields": [
    {"name": "{param_name}", "type": "{param_type}"}
  ],
  "error_codes": [
    {"name": "{error_name}", "msg": "{error_message}"}
  ],
  "function_logic": "{function_logic}"
}
  
### Field Descriptions:
1. "function_name": The name of the function in snake_case format prefixed with "run_".
2. "context_struct": The struct name for context (e.g., {InstructionName}Context).
3. "params_struct": The struct name for parameters (e.g., {InstructionName}Params).
4. "accounts": A list of accounts used by the instruction, each with:
   - "name": Account name as a string.
   - "type": Account type (e.g., "Signer", "Program", "System").
   - "attributes": A list of attributes (e.g., ["mut", "signer"]).
5. "params_fields": A list of parameter fields, each with:
   - "name": Parameter name as a string.
   - "type": Parameter type (e.g., "u64", "String").
6. "error_codes": A list of error codes, each with:
   - "name": Error code name in PascalCase.
   - "msg": A human-readable error message.
7. "function_logic": A string containing the main function logic.

### Additional Instructions:
- Always follow this JSON structure. All fields must be present, even if empty (use empty strings or arrays as placeholders).
- Do not include any extraneous text or explanations outside the JSON object.
`;

  return templatePrompt;
};
