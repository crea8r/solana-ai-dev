import express from 'express';
import { generateAIResponse, handleAIChat } from '../controllers/aiController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/prompt', authMiddleware, generateAIResponse);
router.post('/chat', authMiddleware, handleAIChat);

export default router;
