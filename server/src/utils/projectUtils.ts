import fs from 'fs';
import { APP_CONFIG } from 'src/config/appConfig';
import { createTask, updateTaskStatus } from './taskUtils';
import { exec } from 'child_process';
import path from 'path';
import { AppError } from 'src/middleware/errorHandler';
import { getProjectRootPath } from './fileUtils';

const runCommand = async (
  command: string,
  cwd: string,
  taskId: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, async (error, stdout, stderr) => {
      let result = '';
      if (error) {
        result = `Error: ${error.message}\n\nStdout: ${stdout}\n\nStderr: ${stderr}`;
      } else {
        result = `Stdout: ${stdout}\n\nStderr: ${stderr}`;
      }
      await updateTaskStatus(taskId, 'finished', result);
      resolve();
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
    await runCommand(`anchor init ${rootPath}`, APP_CONFIG.ROOT_FOLDER, taskId);
  });

  return taskId;
};

export const startAnchorBuildTask = async (
  projectId: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Anchor Build', creatorId, projectId);

  setImmediate(async () => {
    try {
      const rootPath = await getProjectRootPath(projectId);
      const projectPath = path.join(APP_CONFIG.ROOT_FOLDER, rootPath);
      await runCommand('anchor build', projectPath, taskId);
    } catch (error: any) {
      await updateTaskStatus(taskId, 'finished', `Error: ${error.message}`);
    }
  });

  return taskId;
};

export const startAnchorTestTask = async (
  projectId: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Anchor Test', creatorId, projectId);

  setImmediate(async () => {
    try {
      const rootPath = await getProjectRootPath(projectId);
      const projectPath = path.join(APP_CONFIG.ROOT_FOLDER, rootPath);
      await runCommand('anchor test', projectPath, taskId);
    } catch (error: any) {
      await updateTaskStatus(taskId, 'finished', `Error: ${error.message}`);
    }
  });

  return taskId;
};
