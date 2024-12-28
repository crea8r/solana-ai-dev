import express from 'express';
import { generateAIResponse, handleAIChat, initializeSAK } from '../controllers/aiController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/prompt', authMiddleware, generateAIResponse);
router.post('/chat', authMiddleware, handleAIChat);
router.post('/init-agent', initializeSAK);

export default router;
