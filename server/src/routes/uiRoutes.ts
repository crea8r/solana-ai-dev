import express from 'express';
import { compileTsFile, executeSdkInstruction } from '../controllers/uiController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/execute-instruction', authMiddleware, executeSdkInstruction);
router.post('/compile-ts-file', authMiddleware, compileTsFile);
        
export default router;
