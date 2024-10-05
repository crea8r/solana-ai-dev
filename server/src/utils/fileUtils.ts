import fs from 'fs';
import path from 'path';
import { APP_CONFIG } from 'src/config/appConfig';
import { AppError } from 'src/middleware/errorHandler';
import pool from 'src/config/database';
import { v4 as uuidv4 } from 'uuid';

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

export const deleteProjectFolder = async (
  rootPath: string,
  taskId: string
): Promise<void> => {
  const projectPath = path.join(APP_CONFIG.ROOT_FOLDER, rootPath);

  if (!fs.existsSync(projectPath)) {
    await updateTaskStatus(taskId, 'finished', 'Project folder does not exist');
    return;
  }

  try {
    await fs.promises.rm(projectPath, { recursive: true, force: true });
    await updateTaskStatus(
      taskId,
      'finished',
      'Project folder deleted successfully'
    );
  } catch (error) {
    console.error('Error deleting project folder:', error);
    await updateTaskStatus(
      taskId,
      'finished',
      'Failed to delete project folder'
    );
  }
};

async function updateTaskStatus(
  taskId: string,
  status: 'queued' | 'doing' | 'finished',
  result?: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE Task SET status = $1, result = $2 WHERE id = $3',
      [status, result, taskId]
    );
  } catch (error) {
    console.error('Error updating task status:', error);
  } finally {
    client.release();
  }
}

export const startDeleteProjectFolderTask = async (
  rootPath: string,
  creatorId: string
): Promise<string> => {
  const client = await pool.connect();
  try {
    const taskId = uuidv4();
    await client.query(
      'INSERT INTO Task (id, name, created_at, creator_id, status) VALUES ($1, $2, NOW(), $3, $4)',
      [taskId, 'Delete Project Folder', creatorId, 'doing']
    );

    // Start the deletion process in a separate thread
    setImmediate(() => deleteProjectFolder(rootPath, taskId));

    return taskId;
  } catch (error) {
    console.error('Error starting delete project folder task:', error);
    throw new AppError('Failed to start delete project folder task', 500);
  } finally {
    client.release();
  }
};
