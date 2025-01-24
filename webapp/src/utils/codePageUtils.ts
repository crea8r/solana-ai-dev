import { fileApi } from "../api/file";
import { projectApi } from "../api/project";
import { taskApi } from "../api/task";
import { FileTreeItemType } from "../interfaces/file";
import { debounce } from "lodash";
import { Project } from "../interfaces/project";
import { CodeFile } from "../contexts/CodeFileContext";
import { LogEntry } from "../hooks/useTerminalLogs";
import { transformToProjectInfoToSave } from "../contexts/ProjectContext";
import { fetchDirectoryStructure } from "./projectUtils";

export const normalizePath1 = (path: string) => path.replace(/\\/g, "/").trim();

export const updateProjectInDatabase = async (projectContext: Project) => {
  try {
      const projectInfoToSave = transformToProjectInfoToSave(projectContext);
      console.log('projectInfoToSave', projectInfoToSave);
      await projectApi.updateProject(projectContext.id, projectInfoToSave);
      console.log('Project updated successfully in the database.');
  } catch (error) { console.error('Error updating project in the database:', error); }
};

// -------------------
// Task Polling Utils
// -------------------

export const startPollingTaskStatus = (
  taskId: string, 
  setIsPolling: React.Dispatch<React.SetStateAction<boolean>>, 
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>, 
  addLog: (message: string, type: LogEntry['type']) => void, 
  onComplete?: (taskResult: string) => void,
  silent?: boolean
): Promise<{ status: string; fileContent?: string }> => {
  return new Promise((resolve, reject) => {
    setIsPolling(true);
    const intervalId = setInterval(async () => {
      try {
        const taskResponse = await taskApi.getTask(taskId);
        const status = taskResponse.task.status;

        if (status === 'finished' || status === 'succeed' || status === 'warning') {
          clearInterval(intervalId);
          setIsPolling(false);
          setIsLoading(false);

          if (status === 'warning') if (!silent) addLog(taskResponse.task.result || '', 'warning');
          else if (!silent) addLog('Task completed successfully', 'success');

          if (onComplete && taskResponse.task.result) onComplete(taskResponse.task.result);
          
          resolve({ status, fileContent: taskResponse.task.result });
        } else if (status === 'failed') {
          clearInterval(intervalId);
          setIsPolling(false);
          setIsLoading(false);

          if (!silent) addLog(`Task failed: ${taskResponse.task.result}`, 'error');
          reject(new Error('Task failed'));
        }
      } catch (error) {
        clearInterval(intervalId);
        setIsPolling(false);
        setIsLoading(false);

        if (!silent) addLog(`Polling error: ${error}`, 'error');
        reject(error);
      }
    }, 5000);
  });
};

// -------------------
// File Tree Utils  
// -------------------
export const ignoreFiles = [
  'node_modules',
  '.git',
  '.gitignore',
  'yarn.lock',
  '.vscode',
  '.idea',
  '.DS_Store',
  '.env',
  '.env.local',
  '.env.development.local',
  '.env.test.local',
  '.env.production.local',
  '.prettierignore',
  'app',
  'deploy',
  'release',
  '.fingerprint',
  'build',
  'deps',
  'incremental',
  'target',
  '__pycache__',
  '.cache',
  '.log',
  'Cargo.lock',
];
const binaryExtensions = [
  '.rlib',
  '.so',
  '.o',
  '.exe',
  '.dll',
  '.a',
  '.dylib',
  '.class',
  '.jar',
  '.bin',
  '.dat',
  '.tar',
  '.zip',
  '.7z',
  '.gz',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
];

export const filterFiles = (projectContextRootPath: string) => (item: FileTreeItemType): boolean => {
  const ignoredDirs = ignoreFiles.some((dir) => item?.path?.includes(dir));
  const isBinaryFile = binaryExtensions.some((ext) => item.name.endsWith(ext));

  if (ignoredDirs) console.warn(`Skipping directory: ${item.path}`);
  else if (isBinaryFile) console.warn(`Skipping binary file: ${item.name}`);

  if (item?.path?.includes('/target/') || item?.path?.includes('/deploy/')) {
    console.warn(`Skipping directory: ${item.path}`);
    return false;
  }

  const isIndexJs = item?.name?.endsWith('sdk/index.js') || item?.name === 'index.js';
  if (isIndexJs)  return false; 
  if (item.name === 'sdk' || item.path?.includes('/sdk/')) return true;

  return (
    !ignoreFiles.includes(item.name) &&
    !ignoredDirs &&
    !isBinaryFile &&
    !(item.path && item.path.includes(`${projectContextRootPath}`))
  );
};

export function findFirstFile(files: FileTreeItemType[]): FileTreeItemType | undefined {
  for (const file of files) {
    if (file.type === 'file') {
      return file;
    }
    if (file.children) {
      const found = findFirstFile(file.children);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

export function mapFileTreeNodeToItemType(node: any): FileTreeItemType {
  const mappedChildren = node.children
    ? node.children.map(mapFileTreeNodeToItemType).filter(filterFiles)
    : undefined;

  return {
    name: node.name,
    path: node.path,
    type: node.type === 'directory' ? 'directory' : 'file',
    ext: node.type === 'directory' ? undefined : node.name.split('.').pop(),
    children: mappedChildren,
  };
}

export const prefetchFileContents = async (
  mappedFiles: FileTreeItemType[],
  projectContextId: string,
  setProjectContext: React.Dispatch<React.SetStateAction<Project>>,
  setIsPolling: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addLog: (message: string, type: LogEntry['type']) => void,
) => {
  try {
    const allFiles: FileTreeItemType[] = [];
    const gatherFiles = (node: FileTreeItemType) => {
      if (node.type === 'file') allFiles.push(node);
      if (node.children) node.children.forEach(gatherFiles);
    };
    mappedFiles.forEach(gatherFiles);

    const fileContents = await Promise.all(
      allFiles.map(async (file) => {
        try {
          if (!projectContextId) { console.error('No project context ID found'); return; }
          if (!file.path) { console.error('No file path found'); return; }
          //console.log(`projectContextId: ${projectContextId} fetching file content for ${file.path}`);
          const response = await fileApi.getFileContent(projectContextId, file.path);

          if (response.taskId) {
            //console.log(`taskId: ${response.taskId} polling for file content for ${file.name}`);
            return new Promise((resolve) => {
              startPollingTaskStatus(
                response.taskId,
                setIsPolling,
                setIsLoading,
                addLog,
                (taskResult) => {
                  resolve({
                    name: file.name,
                    path: file.path,
                    content: taskResult,
                  });
                },
                true
              );
            });
          } else { console.error(`No task ID returned for file: ${file.name}`); return; }
          
        } catch (error) {
          console.error(`Error fetching content for ${file.name}:`, error);
          return { name: file.name, path: file.path, content: '' };
        }
      })
    );

    setProjectContext((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        codes: fileContents as CodeFile[],
        isCode: true,
        isSaved: true,
      },
    }));

  } catch (error) { console.error('Error prefetching file contents:', error); }
};

const normalizePath = (path: string): string => {
  return path
    .replace(/\\/g, '/') // Convert backslashes to forward slashes
    .replace(/\/+$/, '') // Remove trailing slashes
    .replace(/^\//, '') // Remove leading slashes (optional, depending on your use case)
    .trim(); // Remove extra whitespace
};

export const handleSelectFileUtil = async (
  file: FileTreeItemType,
  projectContext: any,
  setSelectedFile: React.Dispatch<React.SetStateAction<FileTreeItemType | undefined>>,
  setFileContent: React.Dispatch<React.SetStateAction<string>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  try {
    setIsLoading(true);
    setSelectedFile(file);
    sessionStorage.setItem('selectedFile', JSON.stringify(file));

    console.log("file", file);

    if (projectContext?.details?.codes) {
      const projectContextContent = projectContext.details.codes.find(
        (child: any) => normalizePath(child.path || '') === normalizePath(file.path || '')
      );
      if (projectContextContent?.content) {
        setFileContent(projectContextContent.content);
        setIsLoading(false);
      } else {
        console.warn(`No content found for file: ${file.name}`);
        setFileContent('');
      }
    } else {
      console.error('No file content found in projectContext');
      return;
    }
  } catch (error) {
    console.error('Error handling selected file:', error);
  }
};

export const handleSave = async (
  setProjectContext: React.Dispatch<React.SetStateAction<Project>>,
  selectedFile: FileTreeItemType,
  projectContextId: string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setIsPolling: React.Dispatch<React.SetStateAction<boolean>>,
  addLog: (message: string, type: LogEntry['type']) => void,
  fileContent: string
) => {
  if (!selectedFile || !selectedFile.path || !projectContextId) {
    addLog('No file selected or project context missing', 'error');
    return;
  }

  console.log("selectedFile", selectedFile);

  setIsLoading(true);
  const projectId = projectContextId;
  const filePath = selectedFile.path;
  const content = fileContent;

  console.log("projectId", projectId);
  console.log("filePath", filePath);
  console.log("content", content);

  try {
    const response = await fileApi.updateFile(projectId, filePath, content);
    const taskId = response.taskId;
    startPollingTaskStatus(taskId, setIsPolling, setIsLoading, addLog);

    setProjectContext((prev) => {
      if (!prev) return prev;
      const updatedCodes = prev.details.codes.map((code) => {
        if (code.path === selectedFile.path) {
          return { ...code, content: fileContent };
        }
        return code;
      });
      return { ...prev, details: { ...prev.details, codes: updatedCodes } };
    });

  } catch (error) {
    addLog(`Error saving file: ${error}`, 'error');
  } finally {
    setIsLoading(false);
  }
};

// -------------------
// Code Editor Utils  
// -------------------
export function getLanguage(fileName: string) {
  const ext = fileName.split('.').pop();
  if (ext === 'ts') return 'typescript';
  if (ext === 'js') return 'javascript';
  if (ext === 'rs') return 'rust';
  return 'md';
}

// -------------------
// Terminal Utils  
// -------------------

export const extractWarnings = (log: string): { message: string; file: string; line: string; help?: string }[] => {
  const warningRegex = /warning: (.+?)\n\s+--> (.+?):(\d+:\d+)\n\s+\|\n.+?\n\s+\|\s+(.+?)(?=\n\s+warning:|\Z)/gs;
  const matches = [];
  let match;

  while ((match = warningRegex.exec(log)) !== null) {
    matches.push({
      message: match[1].trim(), // Extracted warning message
      file: match[2].trim(), // File path
      line: match[3].trim(), // Line and column numbers
      help: match[4].trim(), // Optional help message
    });
  }

  return matches;
};

// -------------------
// Anchor Task Utils
// -------------------

export const handleBuildProject = async (
  projectContextId: string,
  setIsPolling: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addLog: (message: string, type: LogEntry['type']) => void,
  projectContext: Project,
  setProjectContext: React.Dispatch<React.SetStateAction<Project>>
) => {
  try {
    const projectId = projectContextId;
    const response = await projectApi.buildProject(projectId);

    if (response.taskId) {
      addLog('Building project. This may take a few minutes...', 'start');
      const { status, fileContent } = await startPollingTaskStatus(response.taskId, setIsPolling, setIsLoading, addLog);
      console.log('status', status);
      console.log('fileContent', fileContent);
      if (status === 'finished' || status === 'succeed' || status === 'warning') {
        setProjectContext((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          buildStatus: true,
          },
        }));
        updateProjectInDatabase(projectContext);
      } else addLog('Build initiation failed.', 'error');
      if (status === 'succeed') addLog('Program built successfully.', 'success');
      if (status === 'warning') addLog('Warnings detected during build.', 'warning');
      if (status === 'failed') addLog('Build initiation failed.', 'error');
    } else addLog('Build initiation failed.', 'error');

  } catch (error) {
    addLog(`Error during project build: ${error}`, 'error');
  }
};

export const handleDeployProject = async (
  projectId: string,
  setIsPolling: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addLog: (log: string) => void,
  projectContext: Project,
  setProjectContext: React.Dispatch<React.SetStateAction<Project>>
): Promise<void> => {
  try {
    setIsLoading(true);
    addLog('Starting deployment process...');

    const response = await projectApi.deployProject(projectId);
    const taskId = response.taskId;
    console.log(`Task ID: ${taskId.toString()}`);

    const sanitizedTaskId = taskId.toString().trim().replace(/,$/, '');

    const { status, fileContent } = await startPollingTaskStatus(sanitizedTaskId, setIsPolling, setIsLoading, addLog);

    if (status === 'succeed') {
      addLog(`Program was successfully deployed. Program ID: ${projectContext.details.programId}`);

      setProjectContext((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          deployStatus: true,
        },
      }));
      
    } else if (status === 'failed') { 
      if (fileContent) addLog(`Deployment failed. ${fileContent}`);
      else addLog('Deployment failed.'); 
    }
  } catch (error) {
    console.error('Error during deployment:', error);
    addLog(`Error during deployment: ${error}`);
  } finally {
    setIsLoading(false);
  }
};


export const handleTestProject = async (
  projectContextId: string,
  setIsPolling: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addLog: (message: string, type: LogEntry['type']) => void
) => {
  try {
    const projectId = projectContextId;
    addLog(`Starting tests for project ID: ${projectId}`, 'start');

    const response = await projectApi.testProject(projectId);

    if (response.taskId) {
      addLog(`Test process initiated. Task ID: ${response.taskId}`, 'start');
      startPollingTaskStatus(response.taskId, setIsPolling, setIsLoading, addLog);
    } else {
      addLog('Test initiation failed.', 'error');
    }
  } catch (error) {
    addLog(`Error during project test: ${error}`, 'error');
  } finally {
    setIsLoading(false);
  }
};

export const handleRunCommand = async (
  projectContextId: string,
  setIsPolling: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addLog: (message: string, type: LogEntry['type']) => void,
  commandType: 'anchor clean' | 'cargo clean'
) => {
  try {
    const projectId = projectContextId;
    addLog(`Running command: ${commandType} for project ID: ${projectId}`, 'start');

    const response = await projectApi.runProjectCommand(projectId, commandType);

    if (response.taskId) {
      addLog(`Command process initiated. Task ID: ${response.taskId}`, 'start');
      startPollingTaskStatus(response.taskId, setIsPolling, setIsLoading, addLog);
    } else {
      addLog('Command initiation failed.', 'error');
    }
  } catch (error) {
    addLog(`Error running command: ${error}`, 'error');
  } finally {
    setIsLoading(false);
  }
};


// -------------------
// UseEffect Utils
// -------------------

export const selectFileAfterLoad = (
  projectContext: Project,
  selectedFile: FileTreeItemType,
  setSelectedFile: React.Dispatch<React.SetStateAction<FileTreeItemType | undefined>>,
  setFileContent: React.Dispatch<React.SetStateAction<string>>,
  files: FileTreeItemType
) => {
  try {
    if (selectedFile && projectContext?.details?.codes) {
      setSelectedFile(selectedFile);

      const cachedContent = projectContext.details.codes.find(
        (code) => code.name === selectedFile.name
      );

      if (cachedContent?.content) {
        setFileContent(cachedContent.content);
        //console.log(`Restored file content for ${selectedFile.name} from session storage.`);
      } else {
        console.warn(
          `File content for ${selectedFile.name} not found in projectContext after mount.`
        );
      }
    } else if (files?.children?.length && projectContext?.details?.codes?.length) {
      const firstFile = findFirstFile(files.children);
      if (firstFile) {
        setSelectedFile(firstFile);

        const firstFileContent = projectContext.details.codes.find(
          (code) => code.name === firstFile.name
        )?.content;

        if (firstFileContent) {
          setFileContent(firstFileContent);
          console.log(`Loaded content for the first file: ${firstFile.name}.`);
        } else {
          console.warn(
            `File content for ${firstFile.name} not found in projectContext after load.`
          );
        }

        setSelectedFile(firstFile);
      } else {
        console.warn("No files found to select after load.");
      }
    }
  } catch (error) {
    console.error("Error selecting file after context update:", error);
  }
};

// not used
export const fetchFilesIfNeeded = async (
  projectContext: Project,
  setFiles: React.Dispatch<React.SetStateAction<FileTreeItemType>>,
  setProjectContext: React.Dispatch<React.SetStateAction<Project>>,
  setIsPolling: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addLog: (message: string, type: LogEntry['type']) => void,
  handleSelectFile: (file: FileTreeItemType) => void
) => {
  try {
    if (!projectContext?.details?.files?.children) throw new Error('No files found in project context');
    if (projectContext?.details?.files?.children?.length > 0) {
      setFiles(projectContext.details.files);
    } else {
      await fetchDirectoryStructure(
        projectContext?.id,
        projectContext?.rootPath,
        projectContext?.name,
        mapFileTreeNodeToItemType,
        filterFiles(projectContext?.rootPath),
      );
    }
  } catch (error: any) { 
    console.error("Error fetching files or updating project context:", error); 
    addLog(`Error fetching files: ${error.message}`, 'error');
  }
};

