import { fileApi } from "../api/file";
import { projectApi } from "../api/project";
import { taskApi } from "../api/task";
import { FileTreeItemType } from "../interfaces/file";
import { debounce } from "lodash";
import { Project } from "../interfaces/project";
import { CodeFile } from "../contexts/CodeFileContext";
import { LogEntry } from "../hooks/useTerminalLogs";

// -------------------
// Task Polling Utils
// -------------------

export const startPollingTaskStatus = (
  taskId: string, setIsPolling: React.Dispatch<React.SetStateAction<boolean>>, 
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>, 
  addLog: (message: string, type: LogEntry['type']) => void, 
  onComplete?: (taskResult: string) => void
) => {
  setIsPolling(true);
  const intervalId = setInterval(async () => {
    try {
      const taskResponse = await taskApi.getTask(taskId);
      const status = taskResponse.task.status;

      if (status === 'finished' || status === 'succeed' || status === 'warning') {
        clearInterval(intervalId);
        setIsPolling(false);
        setIsLoading(false);

        if (status === 'warning') {
          addLog(taskResponse.task.result || '', 'warning');
        } else {
          addLog('Task completed successfully', 'success');
        }
        if (onComplete && taskResponse.task.result) onComplete(taskResponse.task.result);
      } else if (status === 'failed') {
        clearInterval(intervalId);
        setIsPolling(false);
        setIsLoading(false);
        addLog(`Task failed: ${taskResponse.task.result}`, 'error');
      }
    } catch (error) {
      clearInterval(intervalId);
      setIsPolling(false);
      setIsLoading(false);
      addLog(`Polling error: ${error}`, 'error');
    }
  }, 5000);
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
  addLog: (message: string, type: LogEntry['type']) => void
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
                }
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
      },
    }));

  } catch (error) { console.error('Error prefetching file contents:', error); }
};

export const fetchDirectoryStructure = async (
  projectContextId: string,
  projectContextRootPath: string,
  mapFileTreeNodeToItemType: (node: any) => FileTreeItemType,
  filterFiles: (file: FileTreeItemType) => boolean,
  setFiles: (files: FileTreeItemType) => void,
  setProjectContext: React.Dispatch<React.SetStateAction<Project>>,
  setIsPolling: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addLog: (message: string, type: LogEntry['type']) => void,
  handleSelectFile: (file: FileTreeItemType) => void
) => {
  try {
    setIsLoading(true);
    if (!projectContextRootPath) { console.error('No project context root path found'); return; }
    const directoryStructure = await fileApi.getDirectoryStructure(projectContextRootPath);
    const mappedFiles = directoryStructure.map(mapFileTreeNodeToItemType).filter(filterFiles);

    const rootNode: FileTreeItemType = {
      name: projectContextId,
      path: '',
      type: 'directory',
      children: mappedFiles,
    };
    setFiles(rootNode);

    setProjectContext((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        files: rootNode,
      },
    }));

    console.log("prefetching file contents...");
    await prefetchFileContents(
      mappedFiles, 
      projectContextId, 
      setProjectContext, 
      setIsPolling, 
      setIsLoading, 
      addLog
    );

    if (mappedFiles.length > 0) {
      const firstFile = findFirstFile(mappedFiles);
      if (firstFile) {
        handleSelectFile(firstFile);
      }
    }
    setIsLoading(false);
  } catch (error) {
    console.error('Failed to fetch directory structure', error);
  }
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
    sessionStorage.setItem('selectedFile', JSON.stringify(file));
    setSelectedFile(file);

    if (projectContext?.details?.codes) {
      const projectContextContent = projectContext?.details?.codes.find((child: any) => child.name === file.name);
      setFileContent(projectContextContent?.content);
      setIsLoading(false);
    } else { console.error('No file content found in projectContext'); return; }
  } catch (error) { console.error('Error handling selected file:', error); }
};

export const handleSave = async (
  selectedFile: FileTreeItemType,
  projectContextId: string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addLog: (message: string, type: LogEntry['type']) => void,
  fileContent: string
) => {
  if (!selectedFile || !selectedFile.path || !projectContextId) {
    addLog( 'No file selected or project context missing', 'error');
    return;
  }

  setIsLoading(true);
  const projectId = projectContextId;
  const filePath = selectedFile.path;
  const content = fileContent;

  try {
    await fileApi.updateFile(projectId, filePath, content);
    addLog(`File saved successfully: ${filePath}`, 'success');
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
  addLog: (message: string, type: LogEntry['type']) => void
) => {
  try {
    const projectId = projectContextId;
    const response = await projectApi.buildProject(projectId);

    if (response.taskId) {
      addLog('Building project...', 'start');
      startPollingTaskStatus(response.taskId, setIsPolling, setIsLoading, addLog);
    } else {
      addLog('Build initiation failed.', 'error');
    }
  } catch (error) {
    addLog(`Error during project build: ${error}`, 'error');
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