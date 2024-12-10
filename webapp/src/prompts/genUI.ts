import uiSchema from "../data/ai_schema/uiSchema.json";

export const uiPrompt = (instruction_output: any) => {
    const prompt_string = `
        Additional instruction context: ${instruction_output}

        You are a highly experienced Solana blockchain developer specializing in writing Anchor programs and analyzing instruction schemas. 
        Given the following information about a Solana instruction, identify the source of each parameter and provide a JSON output conforming to the provided schema.

        Instruction Name: ${instruction_output.function_name}

        Instruction Description:
        ${instruction_output.instruction_description}

        Parameters:
        ${instruction_output.params_fields}

        **JSON Output Format:**
        Please strictly follow this schema:
        ${uiSchema}

        **Rules for Determining 'expected_source':**
        1. Use 'walletPublicKey' if:
           - The parameter represents the user's wallet that will sign the transaction or pay for fees (e.g., 'initializer', 'payer', 'authority').
           - The parameter explicitly requires a Signer account or is expected to derive behavior based on the wallet's public key.
        2. Use 'linkedAccount' if:
           - The parameter references an on-chain account tied to the program logic (e.g., 'counter_account', 'data_account').
           - The parameter refers to an account that the instruction interacts with or modifies but does not require a wallet signature.
        3. Use 'systemProgram' if:
           - The parameter references the Solana system program or any other predefined program provided by the Solana runtime (e.g., 'system_program').
        4. Use 'none' if:
           - The parameter does not directly correspond to an account or program (e.g., scalar values like 'u64', 'String', or generic inputs).
           - The parameter requires manual user input (e.g., a user-defined value provided at runtime).

        **Additional Notes for Parameter Mapping:**
        - Ensure that any parameter of type 'Pubkey' is cross-referenced with the description to determine whether it represents a wallet or a linked account.
        - Prioritize descriptions containing words like 'payer', 'authority', or 'initializer' for 'walletPublicKey'.
        - Use context from the instruction description to resolve ambiguity in parameter naming.

        Output only the JSON object. Do not include additional explanations or comments.
    `;
    return prompt_string;
};
