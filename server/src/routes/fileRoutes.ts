import express from 'express';
import {
  createFile,
  deleteFile,
  getDirectoryStructure,
  getFileContent,
  getProjectFileTree,
  updateFile,
  deleteDirectory,
} from 'src/controllers/fileController';
import { authMiddleware } from 'src/middleware/authMiddleware';

const router = express.Router();

router.get('/directory/:projectName/:rootPath', authMiddleware, getDirectoryStructure);
router.get('/tree/:id', authMiddleware, getProjectFileTree);
router.get('/:projectId/:filePath(*)', authMiddleware, getFileContent);
router.post('/:projectId/:filePath(*)', authMiddleware, createFile);
router.put('/:projectId/:filePath(*)', authMiddleware, updateFile);
router.delete('/:projectId/:filePath(*)', authMiddleware, deleteFile);
router.delete('/:rootPath', authMiddleware, deleteDirectory);

export default router;
