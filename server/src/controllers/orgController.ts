import { NextFunction, Request, Response } from 'express';
import pool from 'src/config/database';
import { AppError } from 'src/middleware/errorHandler';
import { PaginatedResponse } from 'src/types';

export const listOrganizationProjects = async (
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
    search,
  } = req.query as { page?: number; limit?: number; search?: string };

  try {
    let query = `
      SELECT id, name, description, root_path, created_at, last_updated
      FROM SolanaProject
      WHERE org_id = $1
    `;
    const queryParams: any[] = [orgId];

    if (search) {
      query += ` AND (name ILIKE $${
        queryParams.length + 1
      } OR description ILIKE $${queryParams.length + 1})`;
      queryParams.push(`%${search}%`);
    }

    // Count total projects
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM (${query}) AS count`,
      queryParams
    );
    const totalProjects = parseInt(countResult.rows[0].count);

    // Add pagination and ordering
    query += ` ORDER BY created_at DESC LIMIT $${
      queryParams.length + 1
    } OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, (page - 1) * limit);

    const result = await pool.query(query, queryParams);

    const paginatedResponse: PaginatedResponse<any> = {
      data: result.rows,
      total: totalProjects,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalProjects / limit),
    };

    res.status(200).json({
      message: 'Organization projects retrieved successfully',
      projects: paginatedResponse,
    });
  } catch (error) {
    next(error);
  }
};
