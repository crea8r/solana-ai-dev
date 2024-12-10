import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const createTask = async (
  name: string,
  creatorId: string,
  projectId: string
): Promise<string> => {
  const client = await pool.connect();
  try {
    const taskId = uuidv4();
    console.log(`Creating task with ID: ${taskId}`);
    await client.query(
      'INSERT INTO Task (id, name, created_at, creator_id, status, project_id) VALUES ($1, $2, NOW(), $3, $4, $5)',
      [taskId, name, creatorId, 'doing', projectId]
    );
    console.log(`Task created with ID: ${taskId}`);
    return taskId;
  } finally {
    client.release();
  }
};

export async function updateTaskStatus(
  taskId: string,
  status: 'queued' | 'doing' | 'finished' | 'failed' | 'succeed' | 'warning',
  result?: string
): Promise<void> {
  const client = await pool.connect();
  const sanitizedTaskId = taskId.trim().replace(/,$/, '');
  console.log(`Updating task status to ${status} for taskId: ${sanitizedTaskId}`);
  try {
    await client.query(
      'UPDATE Task SET status = $1, result = $2 WHERE id = $3',
      [status, result, sanitizedTaskId]
    );
    console.log(`Task status updated to ${status} for taskId: ${sanitizedTaskId}`);
  } catch (error) {
    console.error('Error updating task status:', error);
  } finally {
    client.release();
  }
}
