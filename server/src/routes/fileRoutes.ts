import express from 'express';
import {
  createFile,
  deleteFile,
  getDirectoryStructure,
  getFileContent,
  getProjectFileTree,
  updateFileServer,
  deleteDirectory,
  renameDirectory,
} from '../controllers/fileController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/directory/:projectName/:rootPath', authMiddleware, getDirectoryStructure);
router.get('/tree/:id', authMiddleware, getProjectFileTree);
router.get('/:projectId/:filePath(*)', authMiddleware, getFileContent);
router.post('/:projectId/:filePath(*)', authMiddleware, createFile);
router.put('/update', authMiddleware, updateFileServer);
router.delete('/:projectId/:filePath(*)', authMiddleware, deleteFile);
router.delete('/:rootPath', authMiddleware, deleteDirectory);
router.post('/rename-directory', authMiddleware, renameDirectory);

export default router;
