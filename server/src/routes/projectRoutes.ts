import express from 'express';
import {
  createProject,
  deleteProject,
  editProject,
  getProjectDetails,
  anchorInitProject,
  runProjectCommand,
} from '../controllers/projectController';
import { authMiddleware } from '../middleware/authMiddleware';
import { buildProject, testProject } from '../controllers/projectController';

const router = express.Router();

router.post('/create', authMiddleware, createProject);
router.put('/update/:id', authMiddleware, editProject);
router.get('/details/:id', authMiddleware, getProjectDetails);
router.delete('/:id', authMiddleware, deleteProject);
router.post('/init', authMiddleware, anchorInitProject);
router.post('/:id/build', authMiddleware, buildProject);
router.post('/:id/test', authMiddleware, testProject);
router.post('/:id/run-command', authMiddleware, runProjectCommand);

export default router;
