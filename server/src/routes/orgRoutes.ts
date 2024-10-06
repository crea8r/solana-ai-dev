import express from 'express';
import { listOrganizationProjects } from 'src/controllers/orgController';
import { authMiddleware } from 'src/middleware/authMiddleware';

const router = express.Router();

router.get('/projects', authMiddleware, listOrganizationProjects);

export default router;
