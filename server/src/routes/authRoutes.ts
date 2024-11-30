import express from 'express';
import { register, login, createWallet, getWalletInfo, getPrivateKey, logout, getUser, airdropTokens } from '../controllers/authController';
import { authMiddleware } from 'src/middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/wallet/create', authMiddleware, createWallet);
router.post('/wallet/airdrop', authMiddleware, (req, res, next) => 
    airdropTokens(req.body.publicKey, req.body.amount).then(() => 
    res.status(200).json({ message: 'Tokens airdropped successfully' })).catch(next));
router.get('/wallet/info', authMiddleware, getWalletInfo);
router.get('/wallet/private-key', authMiddleware, getPrivateKey);
router.post('/login', login);
router.post('/logout', logout);
router.get('/user', authMiddleware, getUser);
export default router;
