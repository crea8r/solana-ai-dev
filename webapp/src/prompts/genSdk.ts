import sdkSchema from '../data/ai_schema/sdk_schema.json';

export const genSdk = () => {
    const sdkPrompt = `
    --- SDK Template ---
    Here is the template for generating the sdk.ts file for interacting with the program:

    \`\`\`typescript
    import { Program, AnchorProvider, Idl, web3, Transaction } from '@coral-xyz/anchor';

    /**
     * SDK for interacting with the \${program_name} program.
     */
    export class \${program_name}SDK {
      private program: Program;

      constructor(provider: AnchorProvider, idl: Idl, programId: string = "\${program_id}") {
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

      ${'${instruction_functions}'}

      ${'${account_fetchers}'}
    }

    /**
     * Types for program accounts.
     */
    ${'${account_types}'}
    \`\`\`

    Notes:
    Instruction Functions:

    For each program instruction:
    Create a TypeScript async function using the instruction's camelCase name.
    Include a detailed JSDoc comment describing the purpose of the instruction and its parameters.
    The function should accept parameters as arguments, properly typed based on the schema.
    Use this.program.methods to call the instruction method.
    Map required accounts using the accounts object, where:
    Each account is identified by its name.
    Include additional properties such as pubkey, is_mut (for mutable accounts), and is_signer (for signer accounts).
    Ensure all accounts specified in the schema are included in the mapping.
    Return a Promise<Transaction> representing the generated transaction.
    Account Fetchers:

    Provide two utilities for each program account:
    A method to fetch all accounts of a given type:
    The function should be named fetch<AccountName>Accounts (e.g., fetchUserAccounts).
    Fetch all accounts using this.program.account.<account_name>.all().
    Map account data to a TypeScript interface, ensuring all fields from the schema are included.
    Include detailed JSDoc comments for the function.
    A method to fetch a single account by its public key:
    The function should be named fetch<AccountName>Account (e.g., fetchUserAccount).
    Use this.program.account.<account_name>.fetchNullable(publicKey) to fetch the account data.
    Return the account data mapped to its TypeScript interface, or null if the account does not exist.
    Include error handling to ensure robustness.
    Account Types:

    Define a TypeScript interface for each program account to ensure type safety.
    The interface name should match the account's PascalCase name (e.g., UserAccount).
    Include all fields specified in the schema, using the correct Solana-compatible types.
    Use clear and consistent naming conventions for fields to match on-chain definitions.
    Include comments for each field to describe its purpose and usage.
    Ensure compatibility with Solana's Anchor framework by accurately reflecting the account structure.
    Error Handling:

    Ensure all SDK functions include robust error handling:
    Wrap all asynchronous operations (e.g., fetch, instruction) in try-catch blocks.
    Log meaningful error messages with context for debugging purposes.
    Re-throw errors to allow callers to handle them appropriately.
    General Structure:

    The SDK should use ES6+ and TypeScript best practices.
    Include a constructor for initializing the SDK with AnchorProvider, Idl, and programId.
    Use descriptive, camelCase function names throughout the SDK.
    Ensure proper use of imports, including Solana's web3 and Anchor's Program.
    Maintain clear separation between instruction functions, account fetchers, and utility methods.
    Additional Requirements:

    For parameters of type PublicKey or Transaction, use Solana's web3 library for type definitions.
    Follow the Solana Anchor framework's conventions for naming and structure.
    Ensure that all generated functions and types adhere strictly to the schema provided, and avoid adding extra properties or elements not defined in the schema.
    `;
    return sdkPrompt;
};
