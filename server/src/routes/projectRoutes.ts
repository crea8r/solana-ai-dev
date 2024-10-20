import express from 'express';
import {
  createProject,
  deleteProject,
  editProject,
  getProjectDetails,
  anchorInitProject,
} from 'src/controllers/projectController';
import { authMiddleware } from 'src/middleware/authMiddleware';
import { buildProject, testProject } from 'src/controllers/projectController';

const router = express.Router();

router.post('/create', authMiddleware, createProject);
router.put('/:id', authMiddleware, editProject);
router.get('/:id', authMiddleware, getProjectDetails);
router.delete('/:id', authMiddleware, deleteProject);
router.post('/init', authMiddleware, anchorInitProject);
router.post('/:id/build', authMiddleware, buildProject);
router.post('/:id/test', authMiddleware, testProject);

export default router;
