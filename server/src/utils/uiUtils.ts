
import { APP_CONFIG } from "src/config/appConfig";
import { AppError } from "src/middleware/errorHandler";
import * as fs from 'fs';
import path from "path";
import { Keypair } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import { getProjectRootPath } from "./fileUtils";
import { ParsedIdl, InstructionDetails, IdlInstruction, IdlArgument, IdlAccount } from "src/types/uiTypes";

export const loadWallet = (walletPath: string): Wallet => {
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    const privateKeyArray = Uint8Array.from(walletData);
    const keypair = Keypair.fromSecretKey(privateKeyArray);
    return new Wallet(keypair);
};