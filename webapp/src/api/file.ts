import { api } from '../utils/apiHelper';
import { TaskResponse } from '../interfaces/task';
import { FileTreeNode } from '../interfaces/file';

// interface FileContent {
//   content: string;
// }

export const fileApi = {
  // Get directory structure
  getDirectoryStructure: async (
    projectName: string,
    rootPath: string
  ): Promise<FileTreeNode[]> => {
    try {
      const response = await api.get(`/files/directory/${projectName}/${rootPath}`);
      return response.data.fileStructure;
    } catch (error) {
      console.error('Error getting directory structure:', error);
      throw error;
    }
  },

  // Get project file tree
  getProjectFileTree: async (projectId: string): Promise<FileTreeNode[]> => {
    try {
      const response = await api.get(`/files/tree/${projectId}`);
      return response.data.fileTree;
    } catch (error) {
      console.error('Error getting project file tree:', error);
      throw error;
    }
  },

  getFileContent: async (
    projectId: string,
    filePath: string
  ): Promise<TaskResponse> => {
    try {
      const response = await api.get(
        `/files/${projectId}/${encodeURIComponent(filePath)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting file content:', error);
      throw error;
    }
  },

  createFile: async (
    projectId: string,
    filePath: string,
    content: string
  ): Promise<TaskResponse> => {
    try {
      const response = await api.post(
        `/files/${projectId}/${encodeURIComponent(filePath)}`,
        { content }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    }
  },

  updateFile: async (
    rootPath: string,
    filePath: string,
    content: string
  ): Promise<TaskResponse> => {
    try {
      const response = await api.put(
        `/files/update`,
        { rootPath, filePath, content }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
  },

  // Delete file
  deleteFile: async (
    projectId: string,
    filePath: string
  ): Promise<TaskResponse> => {
    try {
      const response = await api.delete(
        `/files/${projectId}/${encodeURIComponent(filePath)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  deleteDirectory: async (
    rootPath: string
  ): Promise<TaskResponse> => {
    try {
      const response = await api.delete(
       `/files/${encodeURIComponent(rootPath)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting directory:', error);
      throw error;
    }
  },

  checkTaskStatus: async (taskId: string) => {
    try {
      const response = await api.get(`/tasks/${taskId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error checking task status:', error);
      throw error;
    }
  },

  renameDirectory: async (
    rootPath: string,
    newDirName: string
  ): Promise<TaskResponse> => {
    try {
      console.log('calling rename directory');
      const response = await api.post(`/files/rename-directory`, {rootPath, newDirName});
      return response.data;
    } catch (error) {
      console.error('Error renaming directory:', error);
      throw error;
    }
  },
};
