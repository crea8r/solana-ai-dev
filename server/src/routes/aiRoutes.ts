import express from 'express';
import { generateAIResponse, handleAIChat } from 'src/controllers/aiController';
import { authMiddleware } from 'src/middleware/authMiddleware';

const router = express.Router();

router.post('/prompt', authMiddleware, generateAIResponse);
router.post('/chat', authMiddleware, handleAIChat);

export default router;
