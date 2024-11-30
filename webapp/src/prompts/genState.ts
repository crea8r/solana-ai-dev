import stateSchema from '../data/ai_schema/state_schema.json';

export const genStatePrompt = (
  programName: string,
  programDescription: string,
  accounts: {
    name: string;
    description: string;
    dataStructure: string;
  }[],
  instructions: {
    name: string;
    description: string;
    parameters: string;
    logic: string;
  }[],
  generalInstruction: string
): string => {
  
  const stateSchemaString = ` ${JSON.stringify(stateSchema)} `;
  const stateTemplate = `
    use anchor_lang::prelude::*;

    // Generic account definition
    #[doc = "Description of AccountOne"]
    #[account]
    pub struct AccountOne<'info> {
        #[derive(Debug)]
        pub field_one: String,
        pub field_two: u64,
    }

    // Another account example
    #[doc = "Description of AccountTwo"]
    #[account]
    pub struct AccountTwo {
        pub field_one: PubKey,
        pub field_two: u64,
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

  const instructionsInfo = instructions.map(instruction => `
  - **Name**: ${instruction.name}
    - **Description**: ${instruction.description}
    - **Parameters**:
      \`\`\`
      ${instruction.parameters}
      \`\`\`
    `).join('\n');

  const prompt = `
${generalInstruction}

--- File to Generate ---
- **File Name**: state.rs
- **Purpose**: Define the program's accounts.

--- Accounts ---
${accountsInfo}

--- Instructions ---
${instructionsInfo}

--- Output Requirements ---
- **ONLY PROVIDE THE JSON OBJECT**: Do not include any additional text or explanations.
- **JSON Schema**: Your output must strictly conform to the following JSON schema: ${stateSchemaString}
- **Template**: After your response, your json output will be inserted into the following template: ${stateTemplate}

### Field Descriptions:
1. "name": The account name as a string.
2. "description": A description of the account.
3. "data_structure": The structure of the account as JSON.

### Additional Instructions:
- Always follow this JSON structure. All fields must be present, even if empty (use empty strings or arrays as placeholders).
- Do not include any extraneous text or explanations outside the JSON object.
`;

  return prompt;
};
