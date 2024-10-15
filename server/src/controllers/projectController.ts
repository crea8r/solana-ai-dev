import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from 'src/config/database';
import { AppError } from 'src/middleware/errorHandler';
import { startDeleteProjectFolderTask } from 'src/utils/fileUtils';
import { normalizeProjectName } from 'src/utils/stringUtils';
import {
  startAnchorBuildTask,
  startAnchorInitTask,
  startAnchorTestTask,
} from 'src/utils/projectUtils';

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, description, details } = req.body;
  const org_id = req.user?.org_id;
  const userId = req.user?.id;

  if (!org_id || !userId) {
    return next(new AppError('User organization not found', 400));
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const normalizedName = normalizeProjectName(name);
    const randomSuffix = uuidv4().slice(0, 8);
    const root_path = `${normalizedName}-${randomSuffix}`;

    const result = await client.query(
      'INSERT INTO SolanaProject (id, name, description, org_id, root_path, details, last_updated, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $7) RETURNING *',
      [uuidv4(), name, description, org_id, root_path, JSON.stringify(details), new Date()]
    );

    const newProject = result.rows[0];

    await client.query('COMMIT');
    // Start the Anchor init task
    const taskId = await startAnchorInitTask(
      newProject.id,
      root_path,
      name,
      userId
    );

    res.status(201).json({
      message: 'Project creation process started',
      project: newProject,
      taskId: taskId,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const editProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { name, description, details } = req.body;
  const org_id = req.user?.org_id;

  if (!org_id) {
    return next(new AppError('User organization not found', 400));
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if the project exists and belongs to the user's organization
    const projectCheck = await client.query(
      'SELECT * FROM SolanaProject WHERE id = $1 AND org_id = $2',
      [id, org_id]
    );

    if (projectCheck.rows.length === 0) {
      throw new AppError(
        'Project not found or you do not have permission to edit it',
        404
      );
    }

    // Prepare the update query
    let updateQuery = 'UPDATE SolanaProject SET last_updated = NOW()';
    const updateValues = [];
    let valueIndex = 1;

    if (name !== undefined) {
      updateQuery += `, name = $${valueIndex}`;
      updateValues.push(name);
      valueIndex++;
    }

    if (description !== undefined) {
      updateQuery += `, description = $${valueIndex}`;
      updateValues.push(description);
      valueIndex++;
    }

    if (details !== undefined) {
      updateQuery += `, details = $${valueIndex}`;
      updateValues.push(JSON.stringify(details));
      valueIndex++;
    }

    updateQuery += ` WHERE id = $${valueIndex} AND org_id = $${
      valueIndex + 1
    } RETURNING *`;
    updateValues.push(id, org_id);

    const result = await client.query(updateQuery, updateValues);

    await client.query('COMMIT');

    const updatedProject = result.rows[0];
    res.status(200).json({
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in editProject:', error);
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Failed to update project', 500));
    }
  } finally {
    client.release();
  }
};

export const deleteProject = async (
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
    await client.query('BEGIN');

    // Check if the user is an admin
    const userCheck = await client.query(
      'SELECT role FROM Creator WHERE id = $1 AND org_id = $2',
      [userId, orgId]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'admin') {
      throw new AppError('Only admin users can delete projects', 403);
    }

    // Check if the project exists and belongs to the user's organization
    const projectCheck = await client.query(
      'SELECT * FROM SolanaProject WHERE id = $1 AND org_id = $2',
      [id, orgId]
    );

    if (projectCheck.rows.length === 0) {
      throw new AppError(
        'Project not found or you do not have permission to delete it',
        404
      );
    }

    const project = projectCheck.rows[0];

    // Delete the project from the database
    await client.query('DELETE FROM SolanaProject WHERE id = $1', [id]);

    // Start the asynchronous task to delete the project folder
    const taskId = await startDeleteProjectFolderTask(
      project.root_path,
      userId
    );

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Project deletion process started',
      taskId: taskId,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in deleteProject:', error);
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Failed to delete project', 500));
    }
  } finally {
    client.release();
  }
};

export const buildProject = async (
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
  try {
    // Check if the project exists and belongs to the user's organization
    const projectCheck = await pool.query(
      'SELECT * FROM SolanaProject WHERE id = $1 AND org_id = $2',
      [id, orgId]
    );

    if (projectCheck.rows.length === 0) {
      return next(
        new AppError(
          'Project not found or you do not have permission to access it',
          404
        )
      );
    }

    const taskId = await startAnchorBuildTask(id, userId);

    res.status(200).json({
      message: 'Anchor build process started',
      taskId: taskId,
    });
  } catch (error) {
    next(error);
  }
};

export const testProject = async (
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

  try {
    // Check if the project exists and belongs to the user's organization
    const projectCheck = await pool.query(
      'SELECT * FROM SolanaProject WHERE id = $1 AND org_id = $2',
      [id, orgId]
    );

    if (projectCheck.rows.length === 0) {
      return next(
        new AppError(
          'Project not found or you do not have permission to access it',
          404
        )
      );
    }

    const taskId = await startAnchorTestTask(id, userId);

    res.status(200).json({
      message: 'Anchor test process started',
      taskId: taskId,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectDetails = async (
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

  try {
    // Get project details
    const projectResult = await pool.query(
      `
      SELECT id, name, description, org_id, root_path, details, last_updated, created_at
      FROM SolanaProject
      WHERE id = $1 AND org_id = $2
    `,
      [id, orgId]
    );

    if (projectResult.rows.length === 0) {
      return next(
        new AppError(
          'Project not found or you do not have permission to access it',
          404
        )
      );
    }

    const project = projectResult.rows[0];

    // Get recent tasks (e.g., last 5 tasks)
    const tasksResult = await pool.query(
      `
      SELECT id, name, status, created_at, last_updated
      FROM Task
      WHERE project_id = $1
      ORDER BY last_updated DESC
      LIMIT 5
    `,
      [id]
    );

    // Get file tree (assuming you have a function to generate this)
    const fileTreeResult = await pool.query(
      `
      SELECT result
      FROM Task
      WHERE project_id = $1 AND name = 'Generate File Tree'
      ORDER BY last_updated DESC
      LIMIT 1
    `,
      [id]
    );

    const fileTree =
      fileTreeResult.rows.length > 0
        ? JSON.parse(fileTreeResult.rows[0].result)
        : null;

    // Combine all information
    const projectDetails = {
      ...project,
      recentTasks: tasksResult.rows,
      fileTree: fileTree,
    };

    res.status(200).json({
      message: 'Project details retrieved successfully',
      project: projectDetails,
    });
  } catch (error) {
    next(error);
  }
};
