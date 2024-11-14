import { Instruction } from '../items/Instruction';

export const genIns = (instruction: Instruction) => {
  // Instruction template
  const instructionTemplate = `
use anchor_lang::prelude::*;
use crate::state::*; // Import state definitions (if needed)

/// Instruction: {INSTRUCTION_NAME}
pub fn {FUNCTION_NAME}(ctx: Context<{CONTEXT_STRUCT}>, params: {PARAMS_STRUCT}) -> Result<()> {
    let {PRIMARY_ACCOUNT_NAME} = &mut ctx.accounts.{PRIMARY_ACCOUNT_NAME};
    let {SECONDARY_ACCOUNT_NAME} = &mut ctx.accounts.{SECONDARY_ACCOUNT_NAME};

    // Business logic for the instruction
    if {CONDITION} {
        return err!(ErrorCode::{ERROR_CODE});
    }

    {PRIMARY_ACCOUNT_NAME}.{FIELD} += params.{PARAM_NAME};
    {SECONDARY_ACCOUNT_NAME}.{FIELD} -= params.{PARAM_NAME};

    Ok(())
}

/// Accounts struct: defines all accounts involved in this instruction
#[derive(Accounts)]
pub struct {CONTEXT_STRUCT}<'info> {
    #[account(mut)]
    pub {PRIMARY_ACCOUNT_NAME}: Account<'info, {PRIMARY_ACCOUNT_TYPE}>, // Example mutable account
    pub {SECONDARY_ACCOUNT_NAME}: Account<'info, {SECONDARY_ACCOUNT_TYPE}>, // Example readonly account
    pub system_program: Program<'info, System>, // System program if required
}

/// Params struct: defines parameters passed to the instruction
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct {PARAMS_STRUCT} {
    pub {PARAM_NAME}: u64, // Example parameter
}

/// Error codes: defines all errors specific to this instruction
#[error_code]
pub enum ErrorCode {
    #[msg("The provided value is too high.")]
    ValueTooHigh,
    #[msg("Not enough points.")]
    NotEnoughPoints,
}
`;

  // AI Prompt
  const prompt = `
I want to generate an instruction file for a Solana program using the Anchor framework.

Below is a predefined template for the instruction file. Replace all placeholders with appropriate values for the instruction: ${instruction.getName()}.

Template:
${instructionTemplate}

Instruction Details:
- Instruction Name: ${instruction.getName()}
- Business logic: Define the logic for this instruction.
- Accounts: Identify all required accounts and their roles in the instruction.
- Parameters: Define the parameters to be passed to the instruction.
- Conditions: Define any conditions or validations for the instruction.

Please ensure the output conforms strictly to the template structure and fills all placeholders correctly.
`;
  return prompt;
};
