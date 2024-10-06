import express from 'express';
import {
  createProject,
  deleteProject,
  editProject,
  getProjectDetails,
} from 'src/controllers/projectController';
import { authMiddleware } from 'src/middleware/authMiddleware';
import { buildProject, testProject } from 'src/controllers/projectController';

const router = express.Router();

router.post('/', authMiddleware, createProject);
router.put('/:id', authMiddleware, editProject);
router.get('/:id', authMiddleware, getProjectDetails);
router.delete('/:id', authMiddleware, deleteProject);
router.post('/:id/build', authMiddleware, buildProject);
router.post('/:id/test', authMiddleware, testProject);

export default router;
