export const genLogicPrompt = (
    idl: any, 
    description: string, 
    fileSet: Set<{ name: string; path: string; content: string }>
) => {
    return `
    You are an expert Solana developer using the Anchor framework.

    Below is the IDL (Interface Description Language) of a Solana program:
    ${JSON.stringify(idl, null, 2)}

    Program Description:
    ${description}

    Here is the code that has already been generated for extra context:
    ${Array.from(fileSet).map((file) => `${file.name} - ${file.path} \n${file.content}`)
        .join('\n')}

    Tips for Writing Logic:
    - Use Params: Always utilize values from the 'params' struct where available instead of directly referencing accounts or arguments from the context.
    - Access Accounts Efficiently: Use \`ctx.accounts\` for validated account access, but prioritize parameters in the logic when both are available.
    - SPL Token Types: Use SPL types, such as \`TokenAccount\`, \`Token\`, and \`Mint\`, wherever possible to ensure type safety and compatibility with the SPL ecosystem. For example:
      - **TokenAccount**: Represents a token account with an associated balance and owner.
      - **Mint**: Represents the token mint, which defines the token's supply and authority.
      - **Token**: Used for program instructions related to tokens (e.g., transfers or approvals).
    - Example:
      \`\`\`rust
      let token_account = &ctx.accounts.token_account;
      let mint = &ctx.accounts.mint;
      let token_program = &ctx.accounts.token_program;

      // Use SPL Token instructions when interacting with token accounts
      let ix = spl_token::instruction::transfer(
          token_program.key,
          token_account.key,
          ctx.accounts.destination.key,
          ctx.accounts.authority.key,
          &[],
          params.amount,
      )?;
      \`\`\`
    - PDA Payer Name: The account paying for the PDA initialization is referred to as \`authority\`. Be consistent with this naming convention in the logic.
    - Minimize Compute Units: Write concise logic to reduce compute costs and avoid unnecessary operations.
    - Enforce Access Control: Verify that the correct signer (authority) is authorized before performing sensitive actions.
    - Handle Errors Gracefully:
      - Use Anchor's \`Error\` macro to define meaningful error codes.
      - When formatting error messages, **always use string literals** in macros like \`format!\`, \`panic!\`, \`assert_eq!\`, and \`assert!\`.
        - Example: \`format!("{}", ErrorCode::SomeErrorCode)\`.
        - Avoid passing values directly without a string literal placeholder.
    - Validate Program-Derived Addresses (PDAs): Derive and verify PDAs using seeds and bumps securely within the function logic.
    - **Always Return Values Explicitly**: 
      - Ensure every instruction's logic concludes with the appropriate return statement, such as \`Ok(())\`, \`return Ok(())\`, or the specified return type in the function signature.
      - This ensures compliance with Rust's type system and avoids implicit return mismatches.

    Task:
    Based on the program's IDL and description, generate the following:
    1. *Logic*: Only the logic inside the curly braces for each instruction function. Do not include the function signature, imports, or other code – just the logic itself. 
        - References values from \`params\` wherever appropriate.
        - Uses \`ctx.accounts\` for validated account access when \`params\` is not applicable.
        - Adheres to the naming convention of using \`authority\` for the PDA payer.
        - Uses SPL types such as \`TokenAccount\`, \`Mint\`, and \`Token\` wherever possible for compatibility and best practices.
        - Replaces any references to \`global_assert!\` and \`global_assert_eq!\` with \`assert!\` and \`assert_eq!\`.
        - Ensures all formatting in macros like \`format!\`, \`panic!\`, and \`assert_eq!\` includes a string literal with placeholders where necessary.
    2. *Imports*: A list of any additional imports for each instruction file, necessary for the generated logic to function correctly. 
        - **Do not include pre-existing imports** (\`use anchor_lang::prelude::*;\` and \`use crate::state::*;\`).
        - These additional imports should include modules, crates, or macros relevant to the logic, such as:
            - \`use spl_token::instruction::*;\` for token-related operations in the SPL Token program.
            - \`use spl_associated_token_account::instruction::*;\` for associated token account management.
            - \`use anchor_spl::token::{Token, TokenAccount, Mint};\` for type-safe utilities in Anchor.
            - \`use anchor_lang::system_program;\` for system-level operations like creating accounts or transferring SOL.
            - \`use anchor_lang::solana_program::sysvar::rent::Rent;\` for checking rent-exemption requirements.
            - \`use solana_program::pubkey::Pubkey;\` for working with public keys or program-derived addresses.

        Ensure all additional imports specific to the SPL Token program are included when relevant for the generated logic.

    Be precise, accurate, and clear in your implementation of the logic and identification of required imports. Think carefully before outputting the response.
    `;
};
