import { fileApi } from "../api/file";
import { projectApi } from "../api/project";
import { taskApi } from "../api/task";
import { FileTreeItemType } from "../interfaces/file";
import { debounce } from "lodash";
import { Project } from "../interfaces/project";
import { CodeFile } from "../contexts/CodeFileContext";

// -------------------
// Task Polling Utils
// -------------------

export const startPollingTaskStatus = (
  taskId: string, setIsPolling: React.Dispatch<React.SetStateAction<boolean>>, 
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>, 
  addLog: (setTerminalLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>, 
  message: string, type: LogEntry['type']) => void, 
  setTerminalLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>,
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
          addLog(setTerminalLogs, taskResponse.task.result || '', 'warning');
        } else {
          addLog(setTerminalLogs, 'Task completed successfully', 'success');
        }
        if (onComplete && taskResponse.task.result) onComplete(taskResponse.task.result);
      } else if (status === 'failed') {
        clearInterval(intervalId);
        setIsPolling(false);
        setIsLoading(false);
        addLog(setTerminalLogs, `Task failed: ${taskResponse.task.result}`, 'error');
      }
    } catch (error) {
      clearInterval(intervalId);
      setIsPolling(false);
      setIsLoading(false);
      addLog(setTerminalLogs, `Polling error: ${error}`, 'error');
    }
  }, 5000);
};

// -------------------
// File Tree Utils  
// -------------------
export const ignoreFiles = [
  'node_modules', '.git', '.gitignore', 'yarn.lock', '.vscode', '.idea', '.DS_Store',
  '.env', '.env.local', '.env.development.local', '.env.test.local', '.env.production.local',
  '.prettierignore', 'app'
];

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

export const filterFiles =
  (projectContextRootPath: string) =>
  (item: FileTreeItemType): boolean => {
    return (
      !ignoreFiles.includes(item.name) &&
      !(item.path && item.path.includes(`${projectContextRootPath}`))
    );
  };

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
  projectContextName: string,
  setProjectContext: React.Dispatch<React.SetStateAction<Project>>,
  setIsPolling: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addLog: (setTerminalLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>, message: string, type: LogEntry['type']) => void,
  setTerminalLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
) => {
  try {
    //console.log('Preloading file contents...');

    const allFiles: FileTreeItemType[] = [];
    const gatherFiles = (node: FileTreeItemType) => {
      if (node.type === 'file') allFiles.push(node);
      if (node.children) node.children.forEach(gatherFiles);
    };
    mappedFiles.forEach(gatherFiles);

    const fileContents = await Promise.all(
      allFiles.map(async (file) => {
        try {
          const response = await fileApi.getFileContent(projectContextName, file.path || '');

          if (response.taskId) {
            return new Promise((resolve) => {
              startPollingTaskStatus(
                response.taskId,
                setIsPolling,
                setIsLoading,
                addLog,
                setTerminalLogs,
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

    //console.log('Prefetching complete.');
  } catch (error) { console.error('Error prefetching file contents:', error); }
};

export const fetchDirectoryStructure = async (
  projectContextName: string,
  projectContextRootPath: string,
  mapFileTreeNodeToItemType: (node: any) => FileTreeItemType,
  filterFiles: (file: FileTreeItemType) => boolean,
  setFiles: (files: FileTreeItemType) => void,
  setProjectContext: React.Dispatch<React.SetStateAction<Project>>,
  setIsPolling: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addLog: (setTerminalLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>, message: string, type: LogEntry['type']) => void,
  setTerminalLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>,
  handleSelectFile: (file: FileTreeItemType) => void
) => {
  try {
    console.log("fetching directory structure...");
    const directoryStructure = await fileApi.getDirectoryStructure(projectContextName,projectContextRootPath);
    const mappedFiles = directoryStructure.map(mapFileTreeNodeToItemType).filter(filterFiles);
    console.log("mappedFiles", mappedFiles);

    const rootNode: FileTreeItemType = {
      name: projectContextName,
      path: '',
      type: 'directory',
      children: mappedFiles,
    };
    setFiles(rootNode);

    console.log("rootNode", rootNode);

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
      projectContextName, 
      setProjectContext, 
      setIsPolling, 
      setIsLoading, 
      addLog, 
      setTerminalLogs
    );

    if (mappedFiles.length > 0) {
      const firstFile = findFirstFile(mappedFiles);
      if (firstFile) {
        handleSelectFile(firstFile);
      }
    }
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
    sessionStorage.setItem('selectedFile', JSON.stringify(file));
    setSelectedFile(file);

    if (projectContext?.details?.codes) {
      const projectContextContent = projectContext?.details?.codes.find((child: any) => child.name === file.name);
      setFileContent(projectContextContent.content);

    } else { console.error('No file content found in projectContext'); return; }
  } catch (error) { console.error('Error handling selected file:', error); }
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

export const MAX_LOG_ENTRIES = 100;

export type LogEntry = {
  message: string;
  type: 'start' | 'success' | 'warning' | 'error' | 'info';
};

export const addLog = (
  setTerminalLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>, 
  message: string, 
  type: LogEntry['type'] = 'info'
) => {
  setTerminalLogs((prevLogs) => {
    const newLogs = [...prevLogs, { message, type }]; 
    if (newLogs.length > MAX_LOG_ENTRIES) {
      newLogs.shift(); 
    }
    return newLogs; 
  });
};

export const clearLogs = (setTerminalLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>) => {
  setTerminalLogs([]);
};

// -------------------
// Anchor Task Utils
// -------------------

export const handleSave = async (
  selectedFile: FileTreeItemType,
  projectContextId: string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setTerminalLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>,
  fileContent: string
) => {
  if (!selectedFile || !selectedFile.path || !projectContextId) {
    addLog(setTerminalLogs, 'No file selected or project context missing', 'error');
    return;
  }

  setIsLoading(true);
  const projectId = projectContextId;
  const filePath = selectedFile.path;
  const content = fileContent;

  try {
    await fileApi.updateFile(projectId, filePath, content);
    addLog(setTerminalLogs, `File saved successfully: ${filePath}`, 'success');
  } catch (error) {
    addLog(setTerminalLogs, `Error saving file: ${error}`, 'error');
  } finally {
    setIsLoading(false);
  }
};

export const handleBuildProject = async (
  projectContextId: string,
  setIsPolling: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addLog: (setTerminalLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>, message: string, type: LogEntry['type']) => void,
  setTerminalLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
) => {
  try {
    const projectId = projectContextId;
    const response = await projectApi.buildProject(projectId);

    if (response.taskId) {
      addLog(setTerminalLogs, 'Building project...', 'start');
      startPollingTaskStatus(response.taskId, setIsPolling, setIsLoading, addLog, setTerminalLogs);
    } else {
      addLog(setTerminalLogs, 'Build initiation failed.', 'error');
    }
  } catch (error) {
    addLog(setTerminalLogs, `Error during project build: ${error}`, 'error');
  }
};

export const handleTestProject = async (
  projectContextId: string,
  setIsPolling: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addLog: (setTerminalLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>, message: string, type: LogEntry['type']) => void,
  setTerminalLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
) => {
  try {
    const projectId = projectContextId;
    addLog(setTerminalLogs, `Starting tests for project ID: ${projectId}`, 'start');

    const response = await projectApi.testProject(projectId);

    if (response.taskId) {
      addLog(setTerminalLogs, `Test process initiated. Task ID: ${response.taskId}`, 'start');
      startPollingTaskStatus(response.taskId, setIsPolling, setIsLoading, addLog, setTerminalLogs);
    } else {
      addLog(setTerminalLogs, 'Test initiation failed.', 'error');
    }
  } catch (error) {
    addLog(setTerminalLogs, `Error during project test: ${error}`, 'error');
  } finally {
    setIsLoading(false);
  }
};

export const handleRunCommand = async (
  projectContextId: string,
  setIsPolling: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  addLog: (setTerminalLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>, message: string, type: LogEntry['type']) => void,
  setTerminalLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>,
  commandType: 'anchor clean' | 'cargo clean'
) => {
  try {
    const projectId = projectContextId;
    addLog(setTerminalLogs, `Running command: ${commandType} for project ID: ${projectId}`, 'start');

    const response = await projectApi.runProjectCommand(projectId, commandType);

    if (response.taskId) {
      addLog(setTerminalLogs, `Command process initiated. Task ID: ${response.taskId}`, 'start');
      startPollingTaskStatus(response.taskId, setIsPolling, setIsLoading, addLog, setTerminalLogs);
    } else {
      addLog(setTerminalLogs, 'Command initiation failed.', 'error');
    }
  } catch (error) {
    addLog(setTerminalLogs, `Error running command: ${error}`, 'error');
  } finally {
    setIsLoading(false);
  }
};