import express from 'express';
import { generateAIResponse } from 'src/controllers/aiController';
import { authMiddleware } from 'src/middleware/authMiddleware';

const router = express.Router();

router.post('/prompt', authMiddleware, generateAIResponse);

export default router;
