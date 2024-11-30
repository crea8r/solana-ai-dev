import sdkSchema from '../data/ai_schema/sdk_schema.json';

export const genSdkPrompt = (
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
    const sdkSchemaString = `${JSON.stringify(sdkSchema)}`;
    const sdkTemplate = `
    import { Program, AnchorProvider, Idl, web3, Transaction } from '@coral-xyz/anchor';

    /**
     * SDK for interacting with the GenericProgram program.
     */
    export class GenericProgramSDK {
      private program: Program;

      constructor(provider: AnchorProvider, idl: Idl, programId: string = "ProgramIDPlaceholder") {
        this.program = new Program(idl, programId, provider);
      }

      /**
       * Sends a transaction to the Solana blockchain.
       */
      async sendTransaction(tx: Transaction, signers: web3.Signer[] = []): Promise<string> {
        try {
          const connection = this.program.provider.connection;
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
          tx.recentBlockhash = blockhash;
          tx.lastValidBlockHeight = lastValidBlockHeight;
          tx.feePayer = this.program.provider.wallet.publicKey;

          const signedTx = await this.program.provider.wallet.signTransaction(tx);
          signers.forEach((signer) => signedTx.partialSign(signer));
          const serializedTx = signedTx.serialize();
          return await connection.sendRawTransaction(serializedTx, { skipPreflight: false });
        } catch (error) {
          console.error("Error sending transaction:", error);
          throw error;
        }
      }

      /**
       * Generic function for an instruction.
       */
      async functionOne(parameter_one: string, parameter_two: u64): Promise<Transaction> {
        try {
          const ix = await this.program.methods.functionOne(parameter_one, parameter_two).accounts({
            userAccount: { pubkey: "user_account", mut: true, signer: true },
            dataAccount: { pubkey: "data_account", mut: true },
          }).instruction();
          return ix;
        } catch (error) {
          console.error("Error executing instruction 'functionOne':", error);
          throw error;
        }
      }

      /**
       * Fetch all DataAccount accounts.
       */
      async fetchDataAccountAccounts(): Promise<{ field_one: string; field_two: number }[]> {
        try {
          const accounts = await this.program.account.dataAccount.all();
          return accounts.map(account => ({
            field_one: account.account.data.field_one,
            field_two: account.account.data.field_two,
          }));
        } catch (error) {
          console.error("Error fetching DataAccount accounts:", error);
          throw error;
        }
      }
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
  - **Logic**:
    \`\`\`
    ${instruction.logic}
    \`\`\`
  `).join('\n');

  const prompt = `
${generalInstruction}

--- File to Generate ---
- **File Name**: index.ts
- **Purpose**: Implement the SDK for interacting with the ${programName} program.

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
You will generate the SDK file \`index.ts\` providing high-level interfaces to interact with the program's instructions and accounts.

--- Output Requirements ---
- **ONLY PROVIDE THE JSON OBJECT**: Do not include any additional text or explanations.
- **JSON Schema**: Your output must strictly conform to the following JSON schema: ${sdkSchemaString}.
- **Template**: After your response, your json output will be inserted into the following template: ${sdkTemplate}.
`;

  return prompt;
};
