import { api } from '../utils/apiHelper';
import {
  ProjectDetail,
  ProjectInfoToSave,
  SaveProjectResponse,
  ListProjectsResponse,
} from '../interfaces/project';
import { TaskResponse } from '../interfaces/task';

export const projectApi = {
  // List projects
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

  // Get project details
  getProjectDetails: async (projectId: string): Promise<ProjectDetail> => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return response.data.project;
    } catch (error) {
      console.error('Error getting project details:', error);
      throw error;
    }
  },

  // Create a new project
  createProject: async (
    projectInfo: ProjectInfoToSave
  ): Promise<SaveProjectResponse> => {
    try {
      const response = await api.post('/projects', projectInfo);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Update an existing project
  updateProject: async (
    projectId: string,
    projectInfo: ProjectInfoToSave
  ): Promise<SaveProjectResponse> => {
    try {
      const response = await api.put(`/projects/${projectId}`, projectInfo);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Delete a project
  deleteProject: async (projectId: string): Promise<TaskResponse> => {
    try {
      const response = await api.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // Build a project
  buildProject: async (projectId: string): Promise<TaskResponse> => {
    try {
      const response = await api.post(`/projects/${projectId}/build`);
      return response.data;
    } catch (error) {
      console.error('Error building project:', error);
      throw error;
    }
  },

  // Test a project
  testProject: async (projectId: string): Promise<TaskResponse> => {
    try {
      const response = await api.post(`/projects/${projectId}/test`);
      return response.data;
    } catch (error) {
      console.error('Error testing project:', error);
      throw error;
    }
  },
};