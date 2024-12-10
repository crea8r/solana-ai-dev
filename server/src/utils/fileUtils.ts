import fs, { Dirent } from 'fs';
import path from 'path';
import { APP_CONFIG } from '../config/appConfig';
import { AppError } from '../middleware/errorHandler';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { createTask, updateTaskStatus } from '../utils/taskUtils';

const SKIP_FOLDERS = ['.anchor', '.github', '.git', 'target', 'node_modules'];
const SKIP_FILES = [
  'Cargo.lock',
  'package-lock.json',
  'yarn.lock',
  '.DS_Store',
  '.gitignore',
  '.prettierignore',
];

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  ext?: string;
  path: string;
  children?: FileNode[];
}

export async function findFileRecursive(dir: string, fileName: string): Promise<string | null> {
  const files: Dirent[] = fs.readdirSync(dir, { withFileTypes: true }) as Dirent[];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      const result = await findFileRecursive(fullPath, fileName);
      if (result) return result;
    } else if (file.name === fileName) {
      return fullPath;
    }
  }

  return null;
}

export async function getProjectRootPath(projectId: string): Promise<string> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT root_path FROM SolanaProject WHERE id = $1',
      [projectId]
    );
    if (result.rows.length === 0) {
      throw new AppError('Project not found', 404);
    }
    return result.rows[0].root_path;
  } finally {
    client.release();
  }
}

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
      'succeed',
      'Project folder deleted successfully'
    );
  } catch (error) {
    console.error('Error deleting project folder:', error);
    await updateTaskStatus(taskId, 'failed', 'Failed to delete project folder');
  }
};

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

async function generateFileTree(
  dir: string,
  relativePath: string = ''
): Promise<FileNode[]> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const tree: FileNode[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    const entryRelativePath = path.join(relativePath, entry.name);

    if (entry.isDirectory() && !SKIP_FOLDERS.includes(entry.name)) {
      const children = await generateFileTree(entryPath, entryRelativePath);
      tree.push({
        name: entry.name,
        type: 'directory',
        path: entryRelativePath,
        children,
      });
    } else if (entry.isFile() && !SKIP_FILES.includes(entry.name)) {
      tree.push({
        name: entry.name,
        ext: entry.name.split('.').pop(),
        type: 'file',
        path: entryRelativePath,
      });
    }
  }

  return tree;
}

export const startGenerateFileTreeTask = async (
  projectId: string,
  rootPath: string,
  creatorId: string
): Promise<string> => {
  try {
    const taskId = await createTask('Generate File Tree', creatorId, projectId);
    // Start the file tree generation process in a separate thread
    setImmediate(async () => {
      try {
        const projectPath = path.join(APP_CONFIG.ROOT_FOLDER, rootPath);
        const fileTree = await generateFileTree(projectPath);
        const result = JSON.stringify(fileTree);
        await updateTaskStatus(taskId, 'succeed', result);
      } catch (error) {
        console.error('Error generating file tree:', error);
        await updateTaskStatus(
          taskId,
          'failed',
          'Failed to generate file tree'
        );
      }
    });

    return taskId;
  } catch (error) {
    console.error('Error starting generate file tree task:', error);
    throw new AppError('Failed to start generate file tree task', 500);
  }
};

export const startGetFileContentTask = async (
  projectId: string,
  filePath: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Get File Content', creatorId, projectId);

  setImmediate(async () => {
    try {
      const projectRootPath = await getProjectRootPath(projectId);
      const fullPath = path.join(
        APP_CONFIG.ROOT_FOLDER,
        projectRootPath,
        filePath
      );
      //console.log('Reading file:', fullPath);
      const content = await fs.promises.readFile(fullPath, 'utf-8');
      //console.log(`taskId: ${taskId} file content: ${content}`);
      await updateTaskStatus(taskId, 'succeed', content);
    } catch (error) {
      console.error('Error reading file:', error);
      await updateTaskStatus(taskId, 'failed', 'Failed to read file');
    }
  });

  return taskId;
};

export const startCreateFileTask = async (
  projectId: string,
  filePath: string,
  content: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Create File', creatorId, projectId);

  setImmediate(async () => {
    try {
      const projectRootPath = await getProjectRootPath(projectId);
      const fullPath = path.join(
        APP_CONFIG.ROOT_FOLDER,
        projectRootPath,
        filePath
      );
      await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.promises.writeFile(fullPath, content, 'utf-8');
      await updateTaskStatus(taskId, 'succeed', 'File created successfully');
    } catch (error) {
      console.error('Error creating file:', error);
      await updateTaskStatus(taskId, 'failed', 'Failed to create file');
    }
  });

  return taskId;
};

export const startUpdateFileTask = async (
  projectId: string,
  filePath: string,
  content: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Update File', creatorId, projectId);

  setImmediate(async () => {
    try {
      const projectRootPath = await getProjectRootPath(projectId);
      const fullPath = path.join(
        APP_CONFIG.ROOT_FOLDER,
        projectRootPath,
        filePath
      );
      console.log('Updating file:', fullPath);
      await fs.promises.writeFile(fullPath, content, 'utf-8');
      await updateTaskStatus(taskId, 'succeed', 'File updated successfully');
    } catch (error) {
      console.error('Error updating file:', error);
      await updateTaskStatus(taskId, 'failed', 'Failed to update file');
    }
  });

  return taskId;
};

export const startDeleteFileTask = async (
  projectId: string,
  filePath: string,
  creatorId: string
): Promise<string> => {
  const taskId = await createTask('Delete File', creatorId, projectId);

  setImmediate(async () => {
    try {
      const projectRootPath = await getProjectRootPath(projectId);
      const fullPath = path.join(
        APP_CONFIG.ROOT_FOLDER,
        projectRootPath,
        filePath
      );
      await fs.promises.unlink(fullPath);
      await updateTaskStatus(taskId, 'succeed', 'File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      await updateTaskStatus(taskId, 'failed', 'Failed to delete file');
    }
  });

  return taskId;
};
