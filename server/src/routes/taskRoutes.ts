import express from 'express';
import {
  listProjectTasks,
  getTaskStatus,
} from 'src/controllers/taskController';
import { authMiddleware } from 'src/middleware/authMiddleware';

const router = express.Router();

router.get('/', authMiddleware, listProjectTasks);
router.get('/:taskId', authMiddleware, getTaskStatus);

export default router;
