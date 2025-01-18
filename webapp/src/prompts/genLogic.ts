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
    ${Array.from(fileSet).map((file) => `${file.name} - ${file.path}`).join('\n')}

    Tips for Writing Logic:
    - Access Accounts Efficiently: Use ctx.accounts to directly access validated accounts and arguments.
    - Minimize Compute Units: Write concise logic to reduce compute costs and avoid unnecessary operations.
    - Enforce Access Control: Verify that the correct signer (authority) is authorized before performing sensitive actions.
    - Handle Errors Gracefully: Use Anchor’s Error macro to define meaningful error codes and ensure robust error handling.
    - Validate Program-Derived Addresses (PDAs): Derive and verify PDAs using seeds and bumps securely within the function logic.

    Task:
    Based on the program's IDL and description, generate *only the logic inside the curly braces* for each instruction function. Do not include the function signature, imports, or other code – just the logic itself.
    Be very accurate and think carefully.
    `;
};
