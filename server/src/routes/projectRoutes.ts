import express from 'express';
import {
  createProject,
  deleteProject,
  editProject,
} from 'src/controllers/projectController';
import { authMiddleware } from 'src/middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createProject);
router.put('/:id', authMiddleware, editProject);
router.delete('/:id', authMiddleware, deleteProject);

export default router;
