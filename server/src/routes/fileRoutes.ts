import express from 'express';
import {
  createFile,
  deleteFile,
  getFileContent,
  getProjectFileTree,
  updateFile,
} from 'src/controllers/fileController';
import { authMiddleware } from 'src/middleware/authMiddleware';

const router = express.Router();

router.get('/tree/:id', authMiddleware, getProjectFileTree);
router.get('/:projectId/:filePath(*)', authMiddleware, getFileContent);
router.post('/:projectId/:filePath(*)', authMiddleware, createFile);
router.put('/:projectId/:filePath(*)', authMiddleware, updateFile);
router.delete('/:projectId/:filePath(*)', authMiddleware, deleteFile);

export default router;
