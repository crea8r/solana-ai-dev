import { projectApi } from '../api/project';
import { SaveProjectResponse } from '../interfaces/project';

export const saveProject = async (
  projectContext: any,
  setProjectContext: any
): Promise<SaveProjectResponse | null> => {
  if (projectContext && !projectContext.id && !projectContext.rootPath) {
    if (!projectContext.name || !projectContext.description) {
      console.log('Project name and description are required.');
      return null;
    }
    try {
      const response: SaveProjectResponse = await projectApi.createProject(
        projectContext
      );

      if (response.projectId && response.rootPath) {
        setProjectContext((prev: any) => ({
          ...prev,
          id: response.projectId,
          rootPath: response.rootPath,
        }));

        console.log(
          'Created new project on database',
          response.projectId,
          response.rootPath
        );
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
  // else update existing project
  if (projectContext && projectContext.id && projectContext.rootPath) {
    try {
      const response = await projectApi.updateProject(
        projectContext.id,
        projectContext
      );
      if (response.message === 'Project updated successfully') {
        setProjectContext((prev: any) => ({
          ...prev,
          details: {
            ...prev.details,
            isSaved: true,
          },
        }));
        console.log(
          'Updated project on database',
          response.projectId,
          response.rootPath
        );
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
