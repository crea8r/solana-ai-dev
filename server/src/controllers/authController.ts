import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { generateToken } from '../utils/jwt';
import { APP_CONFIG } from '../config/appConfig';

export const register = async (req: Request, res: Response) => {
  const { username, password, organisation, description } = req.body;

  try {
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if the organisation already exists
      const orgResult = await client.query(
        'SELECT * FROM Organisation WHERE name = $1',
        [organisation]
      );

      let orgId: string;

      if (orgResult.rows.length > 0) {
        // Organisation exists, check if the username is unique within the org
        const userResult = await client.query(
          'SELECT * FROM Creator WHERE username = $1 AND org_id = $2',
          [username, orgResult.rows[0].id]
        );

        if (userResult.rows.length > 0) {
          return res
            .status(400)
            .json({ message: 'Username already exists in this organisation' });
        }

        orgId = orgResult.rows[0].id;
      } else {
        // Create new organisation
        orgId = uuidv4();
        await client.query(
          'INSERT INTO Organisation (id, name, description) VALUES ($1, $2, $3)',
          [orgId, organisation, description]
        );
      }

      // Hash the password
      const salt = await bcrypt.genSalt(APP_CONFIG.PASSWORD_SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const userId = uuidv4();
      await client.query(
        'INSERT INTO Creator (id, username, password, org_id, role) VALUES ($1, $2, $3, $4, $5)',
        [userId, username, hashedPassword, orgId, 'admin']
      );

      // Commit the transaction
      await client.query('COMMIT');

      // Generate JWT token
      const token = generateToken({
        id: userId,
        org_id: orgId,
        name: username,
        org_name: organisation,
      });

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: userId, username, org_id: orgId, role: 'admin' },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Get user from database
    const result = await pool.query(
      'SELECT Creator.*, Organisation.name as org_name FROM Creator JOIN Organisation ON Creator.org_id = Organisation.id WHERE Creator.username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      org_id: user.org_id,
      name: user.username,
      org_name: user.org_name,
    });

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        org_id: user.org_id,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
