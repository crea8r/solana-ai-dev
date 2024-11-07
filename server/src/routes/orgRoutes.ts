import express from 'express';
import { listOrganizationProjects } from '../controllers/orgController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/projects', authMiddleware, listOrganizationProjects);

export default router;
