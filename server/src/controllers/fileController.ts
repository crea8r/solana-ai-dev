import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';
import {
  startCreateFileTask,
  startDeleteFileTask,
  startGenerateFileTreeTask,
  startGetFileContentTask,
  startUpdateFileTask,
  getProjectRootPath,
  findFileRecursive,
} from '../utils/fileUtils';
import { execSync } from 'child_process';

dotenv.config();

interface FileStructure {
  name: string;
  isDirectory: boolean;
  path: string; // Added path property
  children?: FileStructure[];
}

interface FileTreeItemType {
  name: string;
  type: 'directory' | 'file';
  path: string;
  ext?: string;
  children?: FileTreeItemType[];
}

export const getFilePath = async (req: Request, res: Response, next: NextFunction) => {
  const { projectId, fileName } = req.params;
  console.log('getFilePath projectId', projectId);
  console.log('getFilePath fileName', fileName);
  const userId = req.user?.id;
  const orgId = req.user?.org_id;
  if (!userId || !orgId) return next(new AppError('User information not found', 400));

  try {
    const rootPath = await getProjectRootPath(projectId);
    if (!rootPath) return next(new AppError('Root path not found for the project', 404));

    const projectPath = path.join(process.env.ROOT_FOLDER as string, rootPath);

    const filePath = await findFileRecursive(projectPath, fileName);

    if (!filePath) return next(new AppError('File not found', 404));

    res.status(200).json({
      message: 'File path retrieved successfully',
      filePath,
    });
  } catch (error) {
    console.error('Error retrieving file path:', error);
    next(new AppError('Failed to retrieve file path', 500));
  }
};

const getFullDirectoryStructure = async (
  directoryPath: string,
  relativePath: string = ''
): Promise<FileTreeItemType[]> => {
  try {
    const files = await fs.readdir(directoryPath, { withFileTypes: true });

    const fileStructure: FileTreeItemType[] = await Promise.all(
      files.map(async (file) => {
        const fullPath = path.join(directoryPath, file.name);
        const fileRelativePath = path.join(relativePath, file.name); 

        if (file.isDirectory()) {
          return {
            name: file.name,
            type: 'directory',
            path: fileRelativePath,
            ext: undefined,
            children: await getFullDirectoryStructure(fullPath, fileRelativePath),
          };
        } else {
          return {
            name: file.name,
            type: 'file',
            path: fileRelativePath,
            ext: file.name.split('.').pop(),
            children: undefined,
          };
        }
      })
    );
    return fileStructure;
  } catch (error) {
    console.error('Error in getFullDirectoryStructure:', error);
    throw error;
  }
};

export const getDirectoryStructure = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  const orgId = req.user?.org_id;

  if (!userId || !orgId) return next(new AppError('User information not found', 400));

  const { rootPath } = req.params;
  const directoryName = `${rootPath}`;
  const rootFolder = process.env.ROOT_FOLDER;

  if (!rootFolder) return next(new AppError('Root folder not configured', 500));

  const directoryPath = path.join(rootFolder, directoryName);

  try {
    const fileStructure = await getFullDirectoryStructure(directoryPath);

    res.status(200).json({
      message: 'Directory structure retrieved successfully',
      fileStructure,
    });
  } catch (error) {
    console.error('Error in getDirectoryStructure:', error);
    next(new AppError('Failed to retrieve directory structure', 500));
  }
};

export const getProjectFileTree = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const orgId = req.user?.org_id;

  if (!userId || !orgId) {
    return next(new AppError('User information not found', 400));
  }

  const client = await pool.connect();

  try {
    // Check if the project exists and belongs to the user's organization
    const projectCheck = await client.query(
      'SELECT * FROM SolanaProject WHERE id = $1 AND org_id = $2',
      [id, orgId]
    );

    if (projectCheck.rows.length === 0) {
      throw new AppError(
        'Project not found or you do not have permission to access it',
        404
      );
    }

    const project = projectCheck.rows[0];

    // Start the asynchronous task to generate the file tree
    const taskId = await startGenerateFileTreeTask(
      id,
      project.root_path,
      userId
    );

    res.status(200).json({
      message: 'File tree generation process started',
      taskId: taskId,
    });
  } catch (error) {
    console.error('Error in getProjectFileTree:', error);
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Failed to start file tree generation', 500));
    }
  } finally {
    client.release();
  }
};

export const getFileContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { projectId, filePath } = req.params;
  const userId = req.user?.id;
  const orgId = req.user?.org_id;

  if (!projectId || !filePath) return next(new AppError('Missing required parameters', 400));
  if (!userId || !orgId) return next(new AppError('User information not found', 400));

  try {
    const projectCheck = await pool.query(
      'SELECT * FROM SolanaProject WHERE id = $1 AND org_id = $2',
      [projectId, orgId]
    );

    if (projectCheck.rows.length === 0) next(new AppError('Project not found or you do not have permission to access it', 404));
    else {
      const taskId = await startGetFileContentTask(projectId, filePath, userId);

      res.status(200).json({
        message: 'File content retrieval process started',
        taskId: taskId,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const createFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { projectId, filePath } = req.params;
  const { content } = req.body;
  const userId = req.user?.id;
  const orgId = req.user?.org_id;

  if (!userId || !orgId) {
    return next(new AppError('User information not found', 400));
  }

  try {
    const projectCheck = await pool.query(
      'SELECT * FROM SolanaProject WHERE id = $1 AND org_id = $2',
      [projectId, orgId]
    );

    if (projectCheck.rows.length === 0) {
      return next(
        new AppError(
          'Project not found or you do not have permission to access it',
          404
        )
      );
    }

    const taskId = await startCreateFileTask(
      projectId,
      filePath,
      content,
      userId
    );

    res.status(200).json({
      message: 'File creation process started',
      taskId: taskId,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { projectId, filePath } = req.params;
  const { content } = req.body;
  const userId = req.user?.id;
  const orgId = req.user?.org_id;

  if (!userId || !orgId) return next(new AppError('User information not found', 400));

  try {
    const projectCheck = await pool.query(
      'SELECT * FROM SolanaProject WHERE id = $1 AND org_id = $2',
      [projectId, orgId]
    );

    if (projectCheck.rows.length === 0) {
      return next(
        new AppError(
          'Project not found or you do not have permission to access it',
          404
        )
      );
    }

    const taskId = await startUpdateFileTask(
      projectId,
      filePath,
      content,
      userId
    );

    res.status(200).json({
      message: 'File update process started',
      taskId: taskId,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFileServer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { rootPath, filePath, content } = req.body;
  const rootFolder = process.env.ROOT_FOLDER;

  if (!filePath || !content || !rootFolder) return next(new AppError('Missing required parameters', 400));

  const fullPath = path.join(rootFolder, rootPath, filePath);

  try {
    await fs.access(fullPath);
    await fs.writeFile(fullPath, content, 'utf8');

    res.status(200).json({message: 'File updated successfully'});
  } catch (error) {
    console.error('Error updating file:', error);
    next(new AppError('Failed to update file', 500));
  }
};

export const deleteFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { projectId, filePath } = req.params;
  const userId = req.user?.id;
  const orgId = req.user?.org_id;

  if (!userId || !orgId) {
    return next(new AppError('User information not found', 400));
  }

  try {
    // Check if the project exists and belongs to the user's organization
    const projectCheck = await pool.query(
      'SELECT * FROM SolanaProject WHERE id = $1 AND org_id = $2',
      [projectId, orgId]
    );

    if (projectCheck.rows.length === 0) {
      return next(
        new AppError(
          'Project not found or you do not have permission to access it',
          404
        )
      );
    }

    const taskId = await startDeleteFileTask(projectId, filePath, userId);

    res.status(200).json({
      message: 'File deletion process started',
      taskId: taskId,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDirectory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { projectId, rootPath } = req.params;
  const userId = req.user?.id;
  const orgId = req.user?.org_id;
  if (!userId || !orgId) { return next(new AppError('User information not found', 400)); }

  const rootFolder = process.env.ROOT_FOLDER;
  if (!rootFolder) { return next(new AppError('Root folder not configured', 500)); }

  const directoryPath = path.join(rootFolder, rootPath);
  console.log("[controller] directoryPath", directoryPath);

  try {
    await fs.access(directoryPath);
    await fs.rmdir(directoryPath, { recursive: true });

    res.status(200).json({ message: 'Directory deleted successfully' });
  } catch (error) {
    console.error('Error in deleteDirectory:', error);
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      next(new AppError('Directory not found', 404));
    } else {
      next(new AppError('Failed to delete directory', 500));
    }
  }
};

export const renameDirectory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  const orgId = req.user?.org_id;
  if (!userId || !orgId) { return next(new AppError('User information not found', 400)); }

  const { rootPath, newDirName } = req.body;
  if (!rootPath || !newDirName) return next(new AppError('Missing required parameters', 400));

  const rootFolder = process.env.ROOT_FOLDER;
  if (!rootFolder) return next(new AppError('Root folder not configured', 500));

  const programsDir = path.join(rootFolder, rootPath, 'programs');
  const oldPath = path.join(programsDir, rootPath);
  const newPath = path.join(programsDir, newDirName);

  try {
    try {
      await fs.access(newPath);
      // Directory exists, remove it
      await fs.rm(newPath, { recursive: true, force: true });
      console.log(`Removed existing directory: ${newPath}`);
    } catch (err) {
      if (err instanceof Error && 'code' in err && err.code !== 'ENOENT') {
        throw err;
      }
      // Directory does not exist, proceed
    }

    await fs.rename(oldPath, newPath);
    console.log(`Renamed directory from ${oldPath} to ${newPath}`);

    res.status(200).json({
      message: 'Directory renamed successfully',
      newDirName,
    });
  } catch (error) {
    console.error('Error renaming directory:', error);
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      next(new AppError('Directory not found', 404));
    } else {
      next(new AppError('Failed to rename directory', 500));
    }
  }
};

export const formatFiles = async (req: Request, res: Response, next: NextFunction) => {
  const { fileContents } = req.body;

  if (!Array.isArray(fileContents)) {
    return res.status(400).json({ error: 'fileContents must be an array of strings' });
  }

  try {
    const formattedContents = fileContents.map((codeContent, index) => {
      try {
        const formatted = execSync('rustfmt --emit stdout', {
          input: codeContent,
          encoding: 'utf8',
        });
        return formatted.trim(); // Ensure no extra whitespace
      } catch (error: any) {
        console.error(`Error formatting file at index ${index}:`, error.message);
        return codeContent; // Return original if formatting fails
      }
    });

    return res.status(200).json(formattedContents);
  } catch (error) {
    console.error('Error formatting files:', error);
    return next(new Error('Failed to format files'));
  }
};
