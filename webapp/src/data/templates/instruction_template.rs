use anchor_lang::prelude::*;
use crate::state::*; // Import state definitions (if needed)

/// Instruction: {INSTRUCTION_NAME}
pub fn {FUNCTION_NAME}(ctx: Context<{CONTEXT_STRUCT}>, params: {PARAMS_STRUCT}) -> Result<()> {
    let {ACCOUNT_NAME} = &mut ctx.accounts.{ACCOUNT_NAME};
    let {OTHER_ACCOUNT_NAME} = &mut ctx.accounts.{OTHER_ACCOUNT_NAME};

    // Business logic for the instruction
    if {CONDITION} {
        return err!(ErrorCode::{ERROR_CODE});
    }

    {ACCOUNT_NAME}.{FIELD} += params.{PARAM_NAME};
    {OTHER_ACCOUNT_NAME}.{FIELD} -= params.{PARAM_NAME};

    Ok(())
}

/// Accounts struct: defines all accounts involved in this instruction
#[derive(Accounts)]
pub struct {CONTEXT_STRUCT}<'info> {
    #[account(mut)]
    pub {ACCOUNT_NAME}: Account<'info, {ACCOUNT_TYPE}>, // Example mutable account
    pub {OTHER_ACCOUNT_NAME}: Account<'info, {OTHER_ACCOUNT_TYPE}>, // Example readonly account
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
