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
