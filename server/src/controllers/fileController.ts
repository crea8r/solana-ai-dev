import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import pool from 'src/config/database';
import { AppError } from 'src/middleware/errorHandler';
import {
  startCreateFileTask,
  startDeleteFileTask,
  startGenerateFileTreeTask,
  startGetFileContentTask,
  startUpdateFileTask,
} from 'src/utils/fileUtils';

dotenv.config();

interface FileStructure {
  name: string;
  isDirectory: boolean;
  path: string; // Added path property
  children?: FileStructure[];
}

const getFullDirectoryStructure = async (
  directoryPath: string,
  relativePath: string = ''
): Promise<FileStructure[]> => {
  const files = await fs.readdir(directoryPath, { withFileTypes: true });

  const fileStructure: FileStructure[] = await Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(directoryPath, file.name);
      const fileRelativePath = path.join(relativePath, file.name); 

      if (file.isDirectory()) {
        return {
          name: file.name,
          isDirectory: true,
          path: fileRelativePath,
          children: await getFullDirectoryStructure(fullPath, fileRelativePath),
        };
      } else {
        return {
          name: file.name,
          isDirectory: false,
          path: fileRelativePath,
        };
      }
    })
  );

  return fileStructure;
};

export const getDirectoryStructure = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  const orgId = req.user?.org_id;

  if (!userId || !orgId) {
    return next(new AppError('User information not found', 400));
  }

  const { projectName, rootPath } = req.params;
  const directoryName = `${rootPath}`;
  const rootFolder = process.env.ROOT_FOLDER;

  if (!rootFolder) {
    return next(new AppError('Root folder not configured', 500));
  }

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

  if (!userId || !orgId) return next(new AppError('User information not found', 400));

  try {
    const projectCheck = await pool.query(
      'SELECT * FROM SolanaProject WHERE id = $1 AND org_id = $2',
      [projectId, orgId]
    );

    if (projectCheck.rows.length === 0) {
      next(
        new AppError(
          'Project not found or you do not have permission to access it',
          404
        )
      );
    } else {
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

  const oldPath = path.join(rootFolder, rootPath, 'programs', rootPath);
  const newPath = path.join(rootFolder, rootPath, 'programs', newDirName);

  try {
    await fs.access(newPath).catch((err) => { if (err.code !== 'ENOENT') throw err; });

    await fs.rename(oldPath, newPath);

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
