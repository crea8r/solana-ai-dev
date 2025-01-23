import { Node } from 'react-flow-renderer';
import { projectApi } from '../api/project';
import { SaveProjectResponse, Project, ProjectDetails } from '../interfaces/project';
import { transformToProjectInfoToSave } from '../contexts/ProjectContext'; 
import { fileApi } from '../api/file';
import { FileTreeItemType } from '../interfaces/file';
import { filterFiles } from './codePageUtils';
import { mapFileTreeNodeToItemType } from './codePageUtils';
import { taskApi } from '../api/task';
import { createItem } from './itemFactory';
import { extractFilePathsAndNames, fetchFileInfo } from './fileUtils';
import { CodeFile } from '../contexts/CodeFileContext';

export const pollTaskStatus = (taskId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
          try {
              const { task } = await taskApi.getTask(taskId);
              //console.log('task', task);

              if (task.status === 'succeed' || task.status === 'warning') {
                  //console.log(`${pollDesc} succeeded.`);
                  clearInterval(interval);
                  if (task.result) {
                    resolve(task.result);
                  } else {
                    reject(new Error('Task result is undefined'));
                  }

              } else if (task.status === 'failed') {
                  clearInterval(interval);
                  reject(new Error('Task failed'));
              }
          } catch (error) {
              console.error('Error fetching task status:', error);
              clearInterval(interval);
              reject(error);
          }
      }, 2000);
  });
};

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

        console.log('saveProject - response', response);
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
        console.log('Updated project on database', response);
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

export const fetchDirectoryStructure = async (
  projectId: string,
  rootPath: string,
  projectName: string,
  mapFileTreeNodeToItemType: (node: any) => FileTreeItemType,
  filterFiles: (file: FileTreeItemType) => boolean,
): Promise<{ _rootNode: FileTreeItemType; _mappedFiles: FileTreeItemType[] } | null> => {
  try {
    if (!rootPath || !projectId) throw new Error('No project context root path or project ID found');

    const directoryStructure = await fileApi.getDirectoryStructure(rootPath);
    const mappedFiles = directoryStructure.map(mapFileTreeNodeToItemType).filter(filterFiles);

    const rootNode: FileTreeItemType = {
      name: projectName,
      path: '',
      type: 'directory',
      children: mappedFiles,
    };

    if (!mappedFiles.length || !rootNode) return null;

    return { _rootNode: rootNode, _mappedFiles: mappedFiles };

  } catch (error) {
    console.error('Failed to fetch directory structure', error);
    return null;
  }
};

export const getCodes = async (
  projectId: string,
  files: FileTreeItemType
): Promise<CodeFile[] | null> => {
  try {
    console.log('getCodes() - files', files);

    // Extract file paths and names
    const { filePaths, fileNames } = extractFilePathsAndNames(files);
    console.log('filePaths', filePaths);
    console.log('fileNames', fileNames);

    // Fetch content for each file path and return an array of CodeFile objects
    const codes: CodeFile[] = await Promise.all(
      Array.from(filePaths).map(async (filePath: string, index: number) => {
        console.log('projectId', projectId);
        console.log('filePath', filePath);

        // Get file content from the API
        const response = await fileApi.getFileContent(projectId, filePath);
        console.log('response from fileApi.getFileContent()', response);

        if (!response) {
          throw new Error(`Failed to get file content for ${filePath}`);
        }

        // Poll the task status to fetch the actual file content
        const codeContent = await pollTaskStatus(response.taskId);

        // Match the file name with its path
        const fileName = Array.from(fileNames)[index] || 'unknown';
        // Return a CodeFile object for the current file
        return {
          name: fileName,
          path: filePath,
          content: codeContent,
        };
      })
    );

    return codes;
  } catch (error) {
    console.error('Failed to get codes (inside getCodes())', error);
    return null; // Return null in case of any failure
  }
};

export const fetchProject = async (projectId: string, projectName: string) => {
  try {
    const fetchedProject = await projectApi.getProjectDetails(projectId);
    return fetchedProject;
  } catch (error) {
    console.error('Failed to load project', error);
    return null;
  }
}

export const createProjectContext = (fetchedProject: any): Project => {
  const nodesWithTypedItems: Node[] = fetchedProject.details.nodes.map((node: Node) => ({
    ...node,
    data: {
      ...node.data,
      item: createItem(node.data.item.type, node.data.item),
    },
  }));

  const newProjectDetails: ProjectDetails = {
    nodes: nodesWithTypedItems || [],
    edges: fetchedProject.details.edges || [],
    designIdl: fetchedProject.details.designIdl || {},
    uiStructure: fetchedProject.details.uiStructure || {},
    files: fetchedProject.details.files || { name: '', children: [] },
    codes: fetchedProject.details.codes || [],
    docs: fetchedProject.details.docs || [],
    isAnchorInit: fetchedProject.details.isAnchorInit || false,
    isCode: fetchedProject.details.isCode || false,
    filePaths: fetchedProject.details.filePaths || [],
    fileTree: fetchedProject.details.fileTree || { name: '', children: [] },
    stateContent: fetchedProject.details.stateContent || undefined,
    uiResults: fetchedProject.details.uiResults || [],
    aiInstructions: fetchedProject.details.aiInstructions || [],
    sdkFunctions: fetchedProject.details.sdkFunctions || [],
    buildStatus: fetchedProject.details.buildStatus || false,
    deployStatus: fetchedProject.details.deployStatus || false,
    isSdk: fetchedProject.details.isSdk || false,
    isUi: fetchedProject.details.isUi || false,
    genUiClicked: fetchedProject.details.genUiClicked || false,
    idl: fetchedProject.details.idl || null,
    sdk: fetchedProject.details.sdk || { fileName: '', content: '' },
    programId: fetchedProject.details.programId || null,
    pdas: fetchedProject.details.pdas || [],
    keyFeatures: fetchedProject.details.keyFeatures || [],
    userInteractions: fetchedProject.details.userInteractions || [],
    sectorContext: fetchedProject.details.sectorContext || '',
    optimizationGoals: fetchedProject.details.optimizationGoals || [],
    uiHints: fetchedProject.details.uiHints || [],
  };

  return {
    id: fetchedProject.id,
    name: fetchedProject.name,
    description: fetchedProject.description,
    rootPath: fetchedProject.rootPath,
    details: newProjectDetails,
  };
};

export const logProjectContext = (projectContext: Project) => {
  const {
    id: projectId,
    rootPath,
    details: {
      isCode,
      codes,
      files,
    }
  } = projectContext;

  console.group('Project Context State');
  console.log('Project ID:', projectId);
  console.log('Root Path:', rootPath || 'Not set');
  console.log('Is Code Generated:', isCode);
  
  console.group('Files:');
  if (files) {
    console.log('File Tree:', files);
  } else {
    console.log('No files available');
  }
  console.groupEnd();

  console.group('Codes:');
  if (codes?.length) {
    console.log('Number of Code Files:', codes.length);
    console.log('Code Files:', codes);
  } else {
    console.log('No code files generated');
  }
  console.groupEnd();

  console.groupEnd(); // End of main group
};


