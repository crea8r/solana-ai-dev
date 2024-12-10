import fs from 'fs';
import { APP_CONFIG } from '../config/appConfig';
import { createTask, updateTaskStatus } from './taskUtils';
import { exec } from 'child_process';
import path from 'path';
import { AppError } from '../middleware/errorHandler';
import { getProjectRootPath } from './fileUtils';
import { v4 as uuidv4 } from 'uuid';
import { normalizeProjectName } from './stringUtils';

export const runCommand = async (
  command: string,
  cwd: string,
  taskId: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const sanitizedTaskId = taskId.trim().replace(/,$/, '');
    console.log(`Running command: ${command} in directory: ${cwd}`);
    
    exec(command, { cwd }, async (error, stdout, stderr) => {
      let result = '';

      console.log(`Command completed. Checking result for taskId: ${sanitizedTaskId}`);

      if (error) {
        result = `Error: ${error.message}\n\nStdout: ${stdout}\n\nStderr: ${stderr}`;
        console.log(`Error occurred for taskId: ${sanitizedTaskId}: ${result}`);
        await updateTaskStatus(sanitizedTaskId, 'failed', result);
        //reject(new Error(result)); // Explicit rejection to handle stuck tasks
        resolve(result);
      } else {
        if (stderr) {
          // Non-fatal warnings
          result = `Warning: ${stderr}\n\nStdout: ${stdout}`;
          console.log(`Warnings occurred for taskId: ${sanitizedTaskId}: ${stderr}`);
          await updateTaskStatus(sanitizedTaskId, 'warning', result);
        } else {
          // Success
          result = `Stdout: ${stdout}`;
          console.log(`Success for taskId: ${sanitizedTaskId}: ${stdout}`);
          await updateTaskStatus(sanitizedTaskId, 'succeed', result);
        }
      }

      resolve(stdout.trim()); // Mark task as done, whether it succeeded or failed
      console.log(`Task ${sanitizedTaskId} resolved`);
    });
  });
};

// deprecated
export const createProjectFolder = (rootPath: string): void => {
  const projectPath = path.join(APP_CONFIG.ROOT_FOLDER, rootPath);

  if (fs.existsSync(projectPath)) {
    throw new AppError('Project folder already exists', 400);
  }

  try {
    fs.mkdirSync(projectPath, { recursive: true });
  } catch (error) {
    console.error('Error creating project folder:', error);
    throw new AppError('Failed to create project folder', 500);
  }
};

export const startAnchorInitTask = async (
  projectId: string,
  rootPath: string,
  projectName: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Anchor Init', creatorId, projectId);
  setImmediate(async () => {
    const result = await runCommand(`anchor init ${rootPath}`, APP_CONFIG.ROOT_FOLDER, taskId);
    console.log('result', result);
  });
  return taskId;
};

export const startAnchorBuildTask = async (
  projectId: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Anchor Build', creatorId, projectId);
  const sanitizedTaskId = taskId.trim().replace(/,$/, '');

  setImmediate(async () => {
    try {
      const rootPath = await getProjectRootPath(projectId);
      const projectPath = path.join(APP_CONFIG.ROOT_FOLDER, rootPath);
      await runCommand('anchor build', projectPath, taskId).catch(async (error) => {
          await updateTaskStatus(
            sanitizedTaskId,
            'failed',
            `Error: ${error.message || 'Unknown error occurred'}`
          );
        });
    } catch (error: any) {
      await updateTaskStatus(sanitizedTaskId, 'failed', `Error: ${error.message}`);
    }
  });

  return taskId;
};

export const startAnchorDeployTask = async (
  projectId: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Anchor Deploy', creatorId, projectId);
  let programId: string | null = null;
  const sanitizedTaskId = taskId.trim().replace(/,$/, '');

  setImmediate(async () => {
    try {
      const rootPath = await getProjectRootPath(projectId);
      const projectPath = path.join(APP_CONFIG.ROOT_FOLDER, rootPath);

      await runCommand(`solana config set --url https://api.devnet.solana.com`, projectPath, sanitizedTaskId);

      const result = await runCommand('anchor deploy', projectPath, sanitizedTaskId).catch(async (error: any) => {
        console.error('Error during deployment:', sanitizedTaskId, error);
        await updateTaskStatus(sanitizedTaskId, 'failed', `Error: ${error.message}`);
      });

      if (result && result.startsWith('Error:')) {
        console.error(`Deployment failed for Task ID: ${sanitizedTaskId}. Reason: ${result}`);
        await updateTaskStatus(sanitizedTaskId, 'failed', result);
        return;
      }

      console.log(`Result: ${result}`);

      const programIdMatch = result?.match(/Program Id:\s+([a-zA-Z0-9]+)/);
      console.log(`Program ID match: ${programIdMatch}`);
      if (!programIdMatch) throw new Error('Program ID not found in deploy output. Deployment may have failed.');

      programId = programIdMatch[1];
      console.log(`Program ID: ${programId}`);
      if (programId) console.log(`Program successfully deployed with ID: ${programId}`);
      
      await updateTaskStatus(
        sanitizedTaskId,
        'succeed',
        programId
      );
    } catch (error: any) {
      console.error('Error during deployment:', sanitizedTaskId, error);
      return [sanitizedTaskId, null];
    }
  });

  return sanitizedTaskId;
};

export const startAnchorTestTask = async (
  projectId: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Anchor Test', creatorId, projectId);
  const sanitizedTaskId = taskId.trim().replace(/,$/, '');

  setImmediate(async () => {
    try {
      const rootPath = await getProjectRootPath(projectId);
      const projectPath = path.join(APP_CONFIG.ROOT_FOLDER, rootPath);
      await runCommand('anchor test', projectPath, taskId);
    } catch (error: any) {
      await updateTaskStatus(sanitizedTaskId, 'failed', `Error: ${error.message}`);
    }
  });

  return taskId;
};

export const startCustomCommandTask = async (
  projectId: string,
  creatorId: string,
  commandType: 'anchor clean' | 'cargo clean'
): Promise<string> => {
  const taskId = await createTask(commandType, creatorId, projectId);

  setImmediate(async () => {
    try {
      const rootPath = await getProjectRootPath(projectId);
      const projectPath = path.join(APP_CONFIG.ROOT_FOLDER, rootPath);
      await runCommand(commandType, projectPath, taskId);
    } catch (error: any) {
      await updateTaskStatus(taskId, 'failed', `Error: ${error.message}`);
    }
  });

  return taskId;
};

export const startInstallPackagesTask = async (
  projectId: string,
  creatorId: string,
  _packages?: string[]
): Promise<string> => {
  const taskId = await createTask('Install NPM Packages', creatorId, projectId);

  setImmediate(async () => {
    try {
      const rootPath = await getProjectRootPath(projectId);
      const projectPath = path.join(APP_CONFIG.ROOT_FOLDER, rootPath);

      await runCommand('npm install @coral-xyz/anchor', projectPath, taskId);
      await runCommand('npm install @solana/web3.js', projectPath, taskId);
      await runCommand('npm install @solana/spl-token', projectPath, taskId);
      await runCommand('npm install fs', projectPath, taskId);

      if (_packages) {
        _packages.forEach(async (_package: string) => {
          await runCommand(`npm install ${_package}`, projectPath, taskId);
        });
      }
    } catch (error: any) {
      await updateTaskStatus(taskId, 'failed', `Error: ${error.message}`);
    }
  });

  return taskId;
};
