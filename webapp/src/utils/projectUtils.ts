import { projectApi } from '../api/project';
import { SaveProjectResponse, Project } from '../interfaces/project';
import { transformToProjectInfoToSave } from '../contexts/ProjectContext'; // Import the transformation function

export const saveProject = async (
  projectContext: Project,
  setProjectContext: React.Dispatch<React.SetStateAction<Project>>
): Promise<SaveProjectResponse | null> => {
  const projectInfoToSave = transformToProjectInfoToSave(projectContext);

  // Create new project if ID and rootPath are not set
  if (!projectContext.id && !projectContext.rootPath) {
    if (!projectContext.name || !projectContext.description) {
      console.log('Project name and description are required.');
      return null;
    }
    try {
      const response: SaveProjectResponse = await projectApi.createProject(projectInfoToSave);

      if (response.projectId && response.rootPath) {
        setProjectContext((prev) => ({
          ...prev,
          id: response.projectId,
          rootPath: response.rootPath,
        }));

        console.log('Created new project on database', response.projectId, response.rootPath);
        return response;
      } else {
        console.error('Something went wrong');
        return null;
      }
    } catch (error) {
      console.error('Error saving project:', error);
      return null;
    }
  }

  // Update existing project
  if (projectContext.id && projectContext.rootPath) {
    try {
      const response = await projectApi.updateProject(projectContext.id, projectInfoToSave);

      if (response.message === 'Project updated successfully') {
        setProjectContext((prev) => ({
          ...prev,
          details: {
            ...prev.details,
            isSaved: true,
          },
        }));
        console.log('Updated project on database', response.projectId, response.rootPath);
        return response;
      } else {
        console.error('Something went wrong');
        return null;
      }
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  }

  return null;
};
