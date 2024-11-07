import { NextFunction, Request, Response } from 'express';
import pool from '../config/database';
import { AppError } from '../middleware/errorHandler';

import { PaginatedResponse, TaskQueryParams } from 'src/types';

export const listProjectTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  const orgId = req.user?.org_id;

  if (!userId || !orgId) {
    return next(new AppError('User information not found', 400));
  }

  const {
    page = 1,
    limit = 10,
    status,
    projectId,
  } = req.query as TaskQueryParams;

  try {
    let query = `
      SELECT t.id, t.name, t.created_at, t.last_updated, t.status, t.project_id, 
             sp.name as project_name
      FROM Task t
      JOIN SolanaProject sp ON t.project_id = sp.id
      WHERE sp.org_id = $1
    `;
    const queryParams: any[] = [orgId];

    if (projectId) {
      query += ` AND t.project_id = $${queryParams.length + 1}`;
      queryParams.push(projectId);
    }

    if (status) {
      query += ` AND t.status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }

    // Count total tasks
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM (${query}) AS count`,
      queryParams
    );
    const totalTasks = parseInt(countResult.rows[0].count);

    // Add pagination and ordering
    query += ` ORDER BY t.last_updated DESC LIMIT $${
      queryParams.length + 1
    } OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, (page - 1) * limit);

    const result = await pool.query(query, queryParams);

    const paginatedResponse: PaginatedResponse<any> = {
      data: result.rows,
      total: totalTasks,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalTasks / limit),
    };

    res.status(200).json({
      message: 'Project tasks retrieved successfully',
      tasks: paginatedResponse,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { taskId } = req.params;
  const userId = req.user?.id;
  const orgId = req.user?.org_id;

  if (!userId || !orgId) {
    return next(new AppError('User information not found', 400));
  }
  try {
    const result = await pool.query(
      `
      SELECT t.id, t.name, t.created_at, t.last_updated, t.status, t.result, t.project_id, 
             sp.name as project_name
      FROM Task t
      JOIN SolanaProject sp ON t.project_id = sp.id
      WHERE t.id = $1 AND sp.org_id = $2
    `,
      [taskId, orgId]
    );

    if (result.rows.length === 0) {
      return next(
        new AppError(
          'Task not found or you do not have permission to access it',
          404
        )
      );
    }

    res.status(200).json({
      message: 'Task retrieved successfully',
      task: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
