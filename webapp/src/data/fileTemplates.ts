import { snakeToPascal, normalizeName, extractInstructionContext } from '../utils/genCodeUtils';
import { Instruction, Account } from '../types/uiTypes';


export const getModRsTemplate = (instructions: string[], additionalContext?: string): string => {
  const imports = instructions.map((name) => `pub mod ${name};`).join('\n');
  const exports = instructions.map((name) => `pub use ${name}::*;`).join('\n');

  return [
    additionalContext ? `// ${additionalContext}` : '',
    exports,
    '',
    imports
  ].filter(Boolean).join('\n');
};

export const getTestTemplate = (
  programName: string,
  programId: string,
  instructions: { name: string; description: string; params: string[] }[],
  accounts: { name: string; description: string; fields: { name: string; type: string }[] }[]
): string => {
  // Generate test cases for each instruction
  const instructionTests = instructions
    .map(({ name, description, params }) => {
      const paramsList = params.map((param) => `${param}: any`).join(", ");
      return `
  it("should execute ${name} instruction", async () => {
    // Arrange: Set up accounts and parameters
    const params = { ${params.map((param) => `${param}: "example_value"`).join(", ")} };
    const accounts = {
      // Add required account public keys here
    };

    // Act: Call the instruction
    const tx = await program.methods.${name}(${params.map((param) => `params.${param}`).join(", ")})
      .accounts(accounts)
      .rpc();

    // Assert: Verify the expected outcome
    console.log("Transaction signature", tx);
    // TODO: Add assertions to validate the program state
  });`;
    })
    .join("\n");

  // Generate helper functions for account initialization
  const accountHelpers = accounts
    .map(({ name, fields }) => {
      return `
  /**
   * Helper function to create and initialize a ${name} account.
   */
  const create${name}Account = async () => {
    const newAccount = web3.Keypair.generate();
    await program.methods.initialize${name.toLowerCase()}()
      .accounts({
        ${fields.map(({ name }) => `${name}: newAccount.publicKey`).join(",\n        ")}
      })
      .signers([newAccount])
      .rpc();
    return newAccount;
  };`;
    })
    .join("\n");

  return `
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { ${programName} } from '../target/types/${programName}';

describe("${programName} Tests", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.${programName} as Program<${programName}>;

  ${accountHelpers}

  ${instructionTests}
});
`;
};





  
