import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { AppError } from '../middleware/errorHandler';
import { getProjectRootPath } from 'src/utils/fileUtils';
import { APP_CONFIG } from 'src/config/appConfig';
import { createTask, updateTaskStatus } from 'src/utils/taskUtils';
import { runCommand } from 'src/utils/projectUtils';

export const executeSdkInstruction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { projectId, instructionName, params } = req.body;

  try {
    const projectRootPath = await getProjectRootPath(projectId);
    const sdkPath = path.join(
      APP_CONFIG.ROOT_FOLDER,
      projectRootPath,
      'sdk/index.js'
    );
    console.log('sdkPath', sdkPath);

    const { CounterProgramSDK, setupCounterProgram } = require(sdkPath);
    console.log('CounterProgramSDK', CounterProgramSDK);
    console.log('setupCounterProgram', setupCounterProgram);

    const sdk = setupCounterProgram();
    console.log('sdk', sdk);

    if (typeof sdk[instructionName] !== 'function') {
      throw new AppError(`Instruction ${instructionName} is not valid`, 400);
    }

    const result = await sdk[instructionName](...Object.values(params));
    console.log('result', result);

    res.status(200).json({
      success: true,
      message: `Instruction ${instructionName} executed successfully`,
      data: result,
    });
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
