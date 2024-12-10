import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { AppError } from '../middleware/errorHandler';
import { getProjectRootPath } from 'src/utils/fileUtils';
import { APP_CONFIG } from 'src/config/appConfig';
import { createTask, updateTaskStatus } from 'src/utils/taskUtils';
import { runCommand } from 'src/utils/projectUtils';
import { Keypair, PublicKey } from '@solana/web3.js';
import { Wallet } from '@coral-xyz/anchor';
import * as fs from 'fs';
import { loadWallet } from 'src/utils/uiUtils';
import { InstructionDetails } from 'src/types/uiTypes';

export const executeSdkInstruction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try { 
    const { userId, projectId, instructionName, parsedIdl } = req.body;
    if (!instructionName) throw new AppError('No instruction name provided', 400);
    console.log('instructionName', instructionName);
    if (!userId) throw new AppError('No user ID provided', 400);
    if (!projectId) throw new AppError('No project ID provided', 400);

    const instruction = parsedIdl.instructions.find( (inst: any) => inst.name === instructionName );
    if (!instruction) throw new AppError(`Instruction "${instructionName}" not found in the IDL`, 400 );

    const { context: { accounts: instructionAccounts } } = instruction;
  
    const projectRootPath = await getProjectRootPath(projectId);
    const sdkPath = path.join(APP_CONFIG.ROOT_FOLDER, projectRootPath, 'sdk/index.js');
    const { setupCounterProgram } = await import(sdkPath);

    const walletPath = path.join(APP_CONFIG.WALLETS_FOLDER, `${userId}.json`);
    const wallet = loadWallet(walletPath);
    const sdk = setupCounterProgram(wallet);
    console.log('sdk', sdk);

    const programName = Object.keys(sdk).find(key => {
      const program = sdk[key];
      return program && 
             typeof program === 'object' &&  
             program._idl && 
             program._programId && 
             program.rpc;
    });

    if (!programName) throw new AppError('No program found in the SDK', 400);

    const program = sdk[programName];
    if (!program) throw new AppError(`Program ${programName} does not exist in the SDK`, 400);

    const availableInstructions = Object.keys(program.methods);
    console.log('Available instructions:', availableInstructions);

    if (!program.methods[instructionName]) {
      throw new AppError(
        `Instruction "${instructionName}" does not exist in the program. Available instructions are: ${availableInstructions.join(', ')}`,
        400
      );
    }

    
    /*
    const result = await program.methods[instructionName](...Object.values(params)).rpc();
    console.log('Transaction result:', result);

    res.status(200).json({
      success: true,
      message: `Instruction ${instructionName} executed successfully`,
      data: result,
    });
    */

  } catch (error: any) {
    console.error('Error executing SDK instruction:', error);
    next(new AppError(`Failed to execute instruction: ${error.message}`, 500));
  }
};

export const compileTsFile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<string> => {
    const { projectId, userId } = req.body; 
    const taskId = await createTask("Compile TypeScript File", userId, projectId);
  
    setImmediate(async () => {
      try {
        const rootPath = await getProjectRootPath(projectId);
  
        const sdkFolderPath = path.join(APP_CONFIG.ROOT_FOLDER, rootPath, "sdk");
  
        await runCommand(`npx tsc index.ts`, sdkFolderPath, taskId);
  
        console.log("TypeScript file compiled successfully.");
      } catch (error: any) {
        console.error("Error compiling TypeScript file:", error);
        await updateTaskStatus(taskId, "failed", `Error: ${error.message}`);
      }
    });
  
    return taskId;
};