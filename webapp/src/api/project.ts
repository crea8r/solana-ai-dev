import { api } from '../utils/apiHelper';
import {
  ProjectDetail,
  ProjectInfoToSave,
  SaveProjectResponse,
  ListProjectsResponse,
} from '../interfaces/project';
import { TaskResponse } from '../interfaces/task';
import { Project } from '../interfaces/project';

export const projectApi = {

  listProjects: async (
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<ListProjectsResponse> => {
    try {
      const response = await api.get('/org/projects', {
        params: { page, limit, search },
      });
      return response.data.projects;
    } catch (error) {
      console.error('Error listing projects:', error);
      throw error;
    }
  },

  getProjectDetails: async (projectId: string): Promise<ProjectDetail> => {
    try {
      const response = await api.get(`/projects/details/${projectId}`);
      return response.data.project;
    } catch (error) {
      console.error('Error getting project details:', error);
      throw error;
    }
  },

  createProject: async (
    projectInfo: ProjectInfoToSave
  ): Promise<SaveProjectResponse> => {
    try {
      const response = await api.post('/projects/create', projectInfo);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  updateProject: async (
    projectId: string,
    projectInfo: ProjectInfoToSave
  ): Promise<SaveProjectResponse> => {
    try {
      const response = await api.put(`/projects/update/${projectId}`, projectInfo);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  deleteProject: async (projectId: string): Promise<TaskResponse> => {
    try {
      const response = await api.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  initAnchorProject: async (
    projectId: string, 
    rootPath: string,
    projectName: string,
  ): Promise<TaskResponse> => {
    try {
      const response = await api.post(`/projects/init`, { projectId, rootPath, projectName });
      return response.data;
    } catch (error) {
      console.error('Error initializing Anchor project:', error);
      throw error;
    }
  },

  deployProject: async (projectId: string): Promise<TaskResponse> => {
    try {
      const response = await api.post(`/projects/${projectId}/deploy`);
      return response.data;
    } catch (error) {
      console.error('Error deploying project:', error);
      throw error;
    }
  },

  buildProject: async (projectId: string): Promise<TaskResponse> => {
    try {
      const response = await api.post(`/projects/${projectId}/build`);
      return response.data;
    } catch (error) {
      console.error('Error building project:', error);
      throw error;
    }
  },

  testProject: async (projectId: string): Promise<TaskResponse> => {
    try {
      const response = await api.post(`/projects/${projectId}/test`);
      return response.data;
    } catch (error) {
      console.error('Error testing project:', error);
      throw error;
    }
  },

  runProjectCommand: async (
    projectId: string,
    commandType: 'anchor clean' | 'cargo clean'
  ): Promise<{ message: string; taskId: string }> => {
    try {
      const response = await api.post(`/projects/${projectId}/run-command`, {
        commandType,
      });
      return response.data;
    } catch (error) {
      console.error('Error running project command:', error);
      throw error;
    }
  },
};
