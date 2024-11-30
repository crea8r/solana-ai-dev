import instructionSchema from '../data/ai_schema/instruction_schema.json';
import { getInstructionTemplate } from '../data/fileTemplates';

export const genInstructionPrompt = (
  programName: string,
  programDescription: string,
  instruction: {
    name: string;
    description: string;
    parameters: string;
    logic: string;
  },
  accounts: {
    name: string;
    description: string;
    dataStructure: string;
  }[],
  stateContent: string,
  generalInstruction: string
): string => {
  
  const instructionSchemaString = `${JSON.stringify(instructionSchema)}`;
  const instructionTemplate = `
    use anchor_lang::prelude::*;
    use crate::state::*;

    // Generic function for an instruction
    pub fn function_one(ctx: Context<FunctionOneContext>, params: FunctionOneParams) -> Result<()> {
        // Logic for function_one
        Ok(())
    }

    // Context structure for the instruction
    #[derive(Accounts)]
    pub struct FunctionOneContext<'info> {
        #[account(init, payer = user_account)]
        pub user_account: Signer<'info>,
        #[account(mut)]
        pub data_account: Account<'info, DataAccount>,
    }

    // Parameters structure for the instruction
    #[derive(AnchorSerialize, AnchorDeserialize)]
    pub struct FunctionOneParams {
        pub parameter_one: String,
        pub parameter_two: u64,
    }

    // Error codes related to the instruction
    #[error_code]
    pub enum FunctionOneErrorCode {
        #[msg("Error one description")]
        ErrorOne,
        #[msg("Error two description")]
        ErrorTwo,
    }
  `;

  const accountsInfo = accounts.map(account => `
- **Name**: ${account.name}
  - **Description**: ${account.description}
  - **Data Structure**:
    \`\`\`json
    ${account.dataStructure}
    \`\`\`
  `).join('\n');

  const prompt = `
${generalInstruction}

--- File to Generate ---
- **File Name**: ${instruction.name}.rs
- **Purpose**: Implement the instruction "${instruction.name}".

--- Instruction Details ---
- **Name**: ${instruction.name}
- **Description**: ${instruction.description}
- **Parameters**:
  \`\`\`
  ${instruction.parameters}
  \`\`\`
- **Logic**:
  \`\`\`
  ${instruction.logic}
  \`\`\`

--- Accounts ---
${accountsInfo}

--- State Content ---
Include the following state definitions in your context:
\`\`\`rust
${stateContent}
\`\`\`

--- Instructions ---
You will generate the instruction file \`${instruction.name}.rs\` implementing the logic as specified.

--- Output Requirements ---
- **ONLY PROVIDE THE JSON OBJECT**: Do not include any additional text or explanations.
- **JSON Schema**: Your output must strictly conform to the following JSON schema: ${instructionSchemaString}.
- **Template**: After your response, your json output will be inserted into the following template: ${instructionTemplate}.

### Json Field Descriptions:
1. "function_name": The name of the function, which should be "${instruction.name}".
2. "context_struct": The struct name for context 
3. "params_struct": The struct name for parameters 
4. "accounts": A list of accounts used by the instruction, each with:
   - "name": Account name as a string.
   - "type": Account type (e.g., "Account<'info, StructName'>", "Signer<'info'>").
   - "attributes": A list of attributes (e.g., ["init", "mut", "signer"]).
5. "params_fields": A list of parameter fields, each with:
   - "name": Parameter name as a string.
   - "type": Parameter type (e.g., "u64", "String").
6. "error_codes": A list of error codes, each with:
   - "name": Error code name in PascalCase.
   - "msg": A human-readable error message.
7. "function_logic": A string containing the main function logic.

!Important: if the instruction requires a system program (for example, if the instruction initialises a new account), always use the correct arguments of 'info and System.
for example: pub system_program: Program<'info, System>

!If an account is specified as the \`payer\` in the \`#[account(init)]\` constraint, ensure it is declared as \`#[account(mut)]\` in the \`#[derive(Accounts)]\` struct. For example:

- Input: \`#[account(init, payer = initializer, space = ...)]\`
- Output: \`#[account(mut)] pub initializer: Signer<'info>,\`

This ensures the \`payer\` account is mutable as required by Anchor's constraints.

!It is very important that you add the Overflow variant to the error enum if applicable!

### Additional Instructions:
- Always follow this JSON structure. All fields must be present, even if empty (use empty strings or empty arrays as placeholders).
- The "function_name" should be "${instruction.name}".
- **Do not include any extraneous text, explanations, or code fences (\`\`\`json).**
- **Provide only the JSON object as the response.**
`;
  return prompt;
};