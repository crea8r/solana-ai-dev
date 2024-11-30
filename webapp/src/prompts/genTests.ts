import testSchema from '../data/ai_schema/test_schema.json';  

export const genTestsPrompt = (
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
  stateContent: string,
  generalInstruction: string
): string => {
  const testSchemaString = `${JSON.stringify(testSchema)}`;
  const testTemplate = `
    import * as anchor from '@coral-xyz/anchor';
    import { Program } from '@coral-xyz/anchor';
    import { GenericProgram } from '../target/types/generic_program';

    describe("GenericProgram Tests", () => {
      anchor.setProvider(anchor.AnchorProvider.env());
      const program = anchor.workspace.GenericProgram as Program<GenericProgram>;

      it("should execute function_one instruction", async () => {
        const userAccount = web3.Keypair.generate();
        const dataAccount = web3.Keypair.generate();

        const tx = await program.methods
          .functionOne("example_value", 100)
          .accounts({
            userAccount: userAccount.publicKey,
            dataAccount: dataAccount.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([userAccount, dataAccount])
          .rpc();

        console.log("Transaction signature:", tx);
        // Add assertions here
      });

      it("should execute function_two instruction", async () => {
        // Add logic for function_two
      });

      it("should fetch accounts", async () => {
        // Add logic for fetching accounts
      });
    });
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
  - **Logic**:
    \`\`\`
    ${instruction.logic}
    \`\`\`
  `).join('\n');

  const prompt = `
${generalInstruction}

--- File to Generate ---
- **File Name**: ${programName}.test.ts
- **Purpose**: Implement the test cases for the ${programName} program.

--- Instructions ---
${instructionsInfo}

--- Accounts ---
${accountsInfo}

--- State Content ---
Include the following state definitions in your context:
\`\`\`rust
${stateContent}
\`\`\`

--- Instructions ---
You will generate the test file \`${programName}.test.ts\` containing test cases for the program's instructions.

--- Output Requirements ---
- **ONLY PROVIDE THE JSON OBJECT**: Do not include any additional text or explanations.
- **JSON Schema**: Your output must strictly conform to the following JSON schema: ${testSchemaString}.
- **Template**: After your response, your json output will be inserted into the following template: ${testTemplate}.
`;

  return prompt;
};
