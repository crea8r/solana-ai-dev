import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const logMessages = async (request: any, response: any) => {
  const client = await pool.connect();
  const response_str =
    typeof response === 'object' ? JSON.stringify(response) : response;
  const request_str =
    typeof request === 'object' ? JSON.stringify(request) : request;
  try {
    const taskId = uuidv4();
    await client.query(
      'INSERT INTO airequestlog (id, request, response, created_at) VALUES ($1, $2, $3, NOW())',
      [taskId, request_str, response_str]
    );
  } catch (error) {
  } finally {
    client.release();
  }
};
