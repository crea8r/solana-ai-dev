import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { generateToken } from '../utils/jwt';
import { APP_CONFIG } from '../config/appConfig';
import { WalletInfo } from 'src/types';
import { AppError } from 'src/middleware/errorHandler';
import path from 'path';
import fs from 'fs';
import { exec, execSync } from 'child_process';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getValidBetaCodes } from '../utils/betaCodes';

const connection = new Connection("https://api.devnet.solana.com");

export const airdropTokens = async (
  publicKey: string,
  amount: number = 1
): Promise<void> => {
  try {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const walletPublicKey = new PublicKey(publicKey);
    console.log(`Requesting airdrop of ${amount} SOL to wallet: ${walletPublicKey.toBase58()}`);

    const airdropSignature = await connection.requestAirdrop(walletPublicKey, amount * 1e9);
    console.log(`Airdrop signature: ${airdropSignature}`);

    await connection.confirmTransaction(airdropSignature, "confirmed");

    console.log(`Successfully airdropped ${amount} SOL to ${walletPublicKey.toBase58()}`);
  } catch (error: any) {
    console.error(`Failed to airdrop tokens: ${error}`);
    throw new AppError(`Failed to airdrop tokens: ${error.message}`, 500);
  }
};

export const createWallet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) return next(new AppError('User ID not found', 400));

  const client = await pool.connect();

  try {
    const result = await client.query('SELECT wallet_created FROM Creator WHERE id = $1', [userId]);
    const walletCreated = result.rows[0]?.wallet_created;
    if (walletCreated) return next(new AppError('Wallet already created for this user', 400));

    const walletPath = path.join(APP_CONFIG.WALLETS_FOLDER, `${userId}.json`);
    exec(`solana-keygen new --outfile ${walletPath} --no-bip39-passphrase`, async (error, stdout, stderr) => {
      if (error) { console.error(`Error generating wallet: ${stderr}`); return next(new AppError(`Error generating wallet: ${stderr}`, 500)); }

      try {
        execSync(`solana config set --keypair ${walletPath}`, { stdio: 'inherit' });
        execSync(`solana config set --url devnet`, { stdio: 'inherit' });

        const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));

        const privateKeyArray = Uint8Array.from(walletData);
        const keypair = Keypair.fromSecretKey(privateKeyArray);
        const publicKey = keypair.publicKey.toBase58();
        const privateKey = JSON.stringify(privateKeyArray);

        const walletInfo: WalletInfo = {
          publicKey,
          privateKey,
          balance: 0,
          creationDate: new Date().toISOString(),
        };

        /*
        try {
          await airdropTokens(publicKey, 2);
          walletInfo.balance = 2;
          console.log("Wallet Balance:", walletInfo.balance);
        } catch (airdropError) { console.error(`Failed to airdrop tokens: ${airdropError}`);  return next(new AppError("Failed to airdrop test tokens", 500)); }
        */

        try {
          await client.query('BEGIN');
          await client.query(
            'UPDATE Creator SET wallet_created = $1, wallet_public_key = $2, wallet_private_key = $3 WHERE id = $4', 
            [true, publicKey, privateKey, userId]
          );
          await client.query('COMMIT');
          console.log(`Wallet creation recorded for user ${userId}`);

          res.status(201).json(walletInfo);
        } catch (dbError) {
          await client.query('ROLLBACK');
          console.error(`Database error: ${dbError}`);
          return next(new AppError('Failed to update wallet creation status', 500));
        }
      } catch (err) {
        console.error(`Error reading wallet file: ${err}`);
        return next(new AppError('Failed to read wallet information', 500));
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return next(new AppError('Database error while checking wallet creation status', 500));
  } finally {
    client.release();
  }
};

export const getWalletInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) return next(new AppError('User ID not found', 400));

  const walletPath = path.join(APP_CONFIG.WALLETS_FOLDER, `${userId}.json`);

  try {
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));

    const privateKeyArray = Uint8Array.from(walletData);
    const keypair = Keypair.fromSecretKey(privateKeyArray);
    const publicKey = keypair.publicKey.toBase58(); 

    const balanceInLamports = await connection.getBalance(new PublicKey(publicKey));
    const balanceInSol = balanceInLamports / 1e9; // Convert from lamports to SOL
    //const balanceInSol = 0;

    const creationDate = fs.statSync(walletPath).birthtime.toISOString();

    const walletInfo: WalletInfo = {
      publicKey,
      balance: balanceInSol,
      creationDate,
    };

    res.status(200).json(walletInfo);
  } catch (error) {
    console.error(`Error retrieving wallet info for user ${userId}:`, error);
    return next(new AppError('Failed to retrieve wallet information', 500));
  }
};

export const getPrivateKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) return next(new AppError('User ID not found', 400));

  const client = await pool.connect();
  try {
    const result = await client.query('SELECT private_key_viewed FROM Creator WHERE id = $1', [userId]);
    const privateKeyViewed = result.rows[0]?.private_key_viewed;
    if (privateKeyViewed) return next(new AppError('Private key already retrieved for this user', 400));

    const walletPath = path.join(APP_CONFIG.WALLETS_FOLDER, `${userId}.json`);
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));

    // Update private_key_viewed to true to prevent further access
    await client.query('BEGIN');
    await client.query('UPDATE Creator SET private_key_viewed = $1 WHERE id = $2', [true, userId]);
    await client.query('COMMIT');

    res.status(200).json({
      privateKey: JSON.stringify(walletData),
      creationDate: fs.statSync(walletPath).birthtime.toISOString(),
    });
  } catch (error) {
    console.error('Error retrieving private key:', error);
    await client.query('ROLLBACK');
    next(new AppError('Failed to retrieve private key', 500));
  } finally {
    client.release();
  }
};

export const register = async (req: Request, res: Response) => {
  const { username, password, organisation, description, code, openAiApiKey } = req.body;

  if (!code) return res.status(200).json({ success: false, message: 'Registration code is required' });
  const validCodes = getValidBetaCodes();
  console.log("validCodes", validCodes);
  if (!validCodes.has(code)) return res.status(200).json({ success: false, message: 'Invalid registration code' });

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orgResult = await client.query(
        'SELECT * FROM Organisation WHERE name = $1',
        [organisation]
      );

      let orgId: string;

      if (orgResult.rows.length > 0) {
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
        orgId = uuidv4();
        await client.query(
          'INSERT INTO Organisation (id, name, description) VALUES ($1, $2, $3)',
          [orgId, organisation, description]
        );
      }

      const salt = await bcrypt.genSalt(APP_CONFIG.PASSWORD_SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userId = uuidv4();
      await client.query(
        'INSERT INTO Creator (id, username, password, org_id, role, wallet_created, private_key_viewed, openAiApiKey) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [userId, username, hashedPassword, orgId, 'admin', false, false, openAiApiKey]
      );

      await client.query('COMMIT');

      const token = generateToken({
        id: userId,
        org_id: orgId,
        name: username,
        org_name: organisation,
        wallet_created: false,
        private_key_viewed: false,
        wallet_public_key: '',
        wallet_private_key: '',
        openAiApiKey: openAiApiKey,
      });

      /*
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      */

      //console.log("registration success, cookie set", token);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        wallet_created: false,
        user: { 
          id: userId, 
          username, 
          org_id: orgId, 
          role: 'admin',
          wallet_public_key: '',
          wallet_private_key: '',
        },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT Creator.*, Organisation.name as org_name FROM Creator JOIN Organisation ON Creator.org_id = Organisation.id WHERE Creator.username = $1',
      [username]
    );

    if (result.rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken({
      id: user.id,
      org_id: user.org_id,
      name: user.username,
      org_name: user.org_name,
      wallet_created: user.wallet_created,
      private_key_viewed: user.private_key_viewed,
      wallet_public_key: user.wallet_public_key,
      wallet_private_key: user.wallet_private_key,
      openAiApiKey: user.openAiApiKey,
    });

    /*
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    */

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        org_id: user.org_id,
        role: user.role,
        wallet_created: user.wallet_created,
        private_key_viewed: user.private_key_viewed,
        wallet_public_key: user.wallet_public_key,
        wallet_private_key: user.wallet_private_key,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
};

export const getUser = (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user data' });
    }

    res.status(200).json({
      user: {
        id: req.user.id,
        username: req.user.name,
        org_id: req.user.org_id,
        org_name: req.user.org_name,
        wallet_created: req.user.wallet_created,
        private_key_viewed: req.user.private_key_viewed,
        wallet_public_key: req.user.wallet_public_key,  
        wallet_private_key: req.user.wallet_private_key,
        openAiApiKey: req.user.openAiApiKey,
      },
    });
  } catch (error) {
    console.error('Error retrieving user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
