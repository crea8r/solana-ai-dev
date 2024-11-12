import express from 'express';
import { register, login, createWallet, getWalletInfo, getPrivateKey } from '../controllers/authController';
import { authMiddleware } from 'src/middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/wallet/create', authMiddleware, createWallet);
router.get('/wallet/info', authMiddleware, getWalletInfo);
router.get('/wallet/private-key', authMiddleware, getPrivateKey);
router.post('/login', login);

export default router;
