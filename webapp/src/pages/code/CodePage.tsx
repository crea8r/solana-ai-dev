import React, { useState, useEffect } from 'react';
import { Box, Flex, useToast, Button, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import CodeEditor from '../../components/CodeEditor';
import TopPanel from './TopPanel';
import FileTree from '../../components/FileTree';
import { FileTreeItemType } from '../../interfaces/file';
import LoadingModal from '../../components/LoadingModal';
import AIChat from '../../components/AIChat';
import { useProjectContext } from '../../contexts/ProjectContext';
import { extractCodeBlock } from '../../utils/genCodeUtils';
import { fileApi } from '../../api/file';
import { taskApi } from '../../api/task';
import { projectApi } from '../../api/project';
import chalk from 'chalk';
import { extractWarnings } from '../../utils/codePageUtils';
import { Project } from '../../interfaces/project';

function getLanguage(fileName: string) {
  const ext = fileName.split('.').pop();
  if (ext === 'ts') return 'typescript';
  if (ext === 'js') return 'javascript';
  if (ext === 'rs') return 'rust';
  return 'md';
}

export type LogEntry = {
  message: string;
  type: 'start' | 'success' | 'warning' | 'error' | 'info';
};

const CodePage = () => {
  const { projectContext, setProjectContext } = useProjectContext();
  const [selectedFile, setSelectedFile] = useState<FileTreeItemType | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [files, setFiles] = useState<FileTreeItemType | undefined>(undefined);
  const [fileContent, setFileContent] = useState<string>(''); 
  const [terminalLogs, setTerminalLogs] = useState<LogEntry[]>([]);

  const ignoreFiles = ['node_modules', '.git', '.gitignore', 'yarn.lock', '.vscode', '.idea', '.DS_Store', '.env', '.env.local', '.env.development.local', '.env.test.local', '.env.production.local', '.prettierignore', 'app'];

  const formatWarnings = (warnings: { message: string; file: string; line: string; help?: string }[]): string => {
    return warnings
      .map((warning, index) => {
        return `Warning ${index + 1}:
        Message: ${warning.message}
        File: ${warning.file}
        Line: ${warning.line}
        ${warning.help ? `Help: ${warning.help}` : ''}
        `;
      })
      .join('\n');
  };

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    if (type !== 'warning') {
      setTerminalLogs((prevLogs) => {
        const updatedLogs: LogEntry[] = [...prevLogs, { message, type }]; // Ensure the type matches LogEntry
        sessionStorage.setItem('terminalLogs', JSON.stringify(updatedLogs));
        return updatedLogs;
      });
    } else {
      setTerminalLogs((prevLogs) => {
        const updatedLogs: LogEntry[] = [
          ...prevLogs,
          { message: 'Project build completed with warnings', type: 'success' }, // Ensure type is "success"
        ];
  
        const warnings = extractWarnings(message);
        warnings.forEach((warning, index) => {
          updatedLogs.push({
            message: `Warning ${index + 1}:
            Message: ${warning.message}
            File: ${warning.file}
            Line: ${warning.line}
            ${warning.help ? `Help: ${warning.help}` : ''}`,
            type: 'warning', // Ensure type is "warning"
          });
        });
  
        sessionStorage.setItem('terminalLogs', JSON.stringify(updatedLogs));
        return updatedLogs;
      });
    }
  };
  
  const clearLogs = () => {
    setTerminalLogs([]);
    sessionStorage.removeItem('terminalLogs');
  };

  useEffect(() => {
    console.log(projectContext);
  }, [projectContext]);

  const findFileByPath = (file: FileTreeItemType, path: string): FileTreeItemType | undefined => {
    if (file.path === path) {
      return file;
    }
    if (file.children) {
      for (const child of file.children) {
        const result = findFileByPath(child, path);
        if (result) return result;
      }
    }
    return undefined;
  };

  useEffect(() => {
    const fetchDirectoryStructure = async () => {
      if (!projectContext.name) return;
  
      let rootNode: FileTreeItemType = {
        name: '',
        path: '',
        type: 'directory',
        children: [],
      };
  
      if (
        projectContext.details.files &&
        projectContext.details.files.children &&
        projectContext.details.files.children.length > 0
      ) {
        try {
          const mappedCachedFiles = mapFileTreeNodeToItemType(projectContext.details.files);
          setFiles(mappedCachedFiles);
          rootNode = mappedCachedFiles;
        } catch (error) {
          console.error('Failed to use cached directory structure', error);
          throw error;
        }
      } else {
        try {
          const directoryStructure = await fileApi.getDirectoryStructure(
            projectContext.name || '',
            projectContext.rootPath || ''
          );
          const mappedDirectoryStructure = directoryStructure.map(mapFileTreeNodeToItemType);
  
          rootNode = {
            name: projectContext.name || '',
            path: '',
            type: 'directory',
            children: mappedDirectoryStructure,
          };
          setFiles(rootNode);
  
          setProjectContext((prev: Project) => ({
            ...prev,
            details: {
              ...prev.details,
              files: rootNode,
            },
          }));
        } catch (error) {
          console.error('Failed to fetch directory structure', error);
        }
      }
  
      if (rootNode) {
        let fileToSelect: FileTreeItemType | undefined;
        const selectedFilePath = sessionStorage.getItem('selectedFilePath');
  
        if (selectedFilePath) {
          fileToSelect = findFileByPath(rootNode, selectedFilePath);
        }
  
        if (!fileToSelect) {
          fileToSelect = findFirstFile(rootNode.children || []);
        }
  
        if (fileToSelect) {
          handleSelectFile(fileToSelect);
        }
      }
    };
  
    fetchDirectoryStructure();
  }, []);
  

  const findFirstFile = (files: FileTreeItemType[]): FileTreeItemType | undefined => {
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
  };

  function mapFileTreeNodeToItemType(node: any): FileTreeItemType {
    const isDirectory = typeof node.isDirectory !== 'undefined' ? node.isDirectory : node.type === 'directory';

    const mappedChildren = node.children
      ? node.children.map(mapFileTreeNodeToItemType).filter(filterFiles) 
      : undefined;

    return {
      name: node.name,
      path: node.path,
      type: isDirectory ? 'directory' : 'file',
      ext: node.isDirectory ? undefined : node.name.split('.').pop(),
      children: mappedChildren,
    };
  }

  function filterFiles(item: FileTreeItemType): boolean {
    return (
      !ignoreFiles.includes(item.name) &&
      !(item.path && item.path.includes(`${projectContext.rootPath}`))
    );
  }

  const handleSelectFile = async (file: FileTreeItemType) => {
    setSelectedFile(file);
    sessionStorage.setItem('selectedFilePath', file.path || '');
    setFileContent(''); 
    setIsLoading(true);
    
    try {
      const codes = projectContext.details.codes || [];
      const existingCode = codes.find((code) => code.path === file.path);

      if (existingCode) {
        setFileContent(existingCode.content || '');
        setIsLoading(false);
        return;
      }

      const projectId = projectContext.id || '';
      const filePath = file.path || '';

      const response = await fileApi.getFileContent(projectId, filePath);
      const taskId = response.taskId;

      const pollTaskCompletion = async (taskId: string) => {
        try {
          const taskResponse = await taskApi.getTask(taskId);
          const task = taskResponse.task;

          if (task.status === 'finished' || task.status === 'succeed') {
            const content = task.result || '';
            setFileContent(content);
    
            setProjectContext((prev) => ({
              ...prev,
              details: {
                ...prev.details,
                codes: [
                  ...prev.details.codes,
                  {
                    path: file.path || '',
                    content,
                    name: file.name || 'unknown',
                    type: 'file',
                  },
                ],
              },
            }));

            setIsLoading(false);
          } else if (task.status === 'failed') setIsLoading(false);
          else setTimeout(() => pollTaskCompletion(taskId), 2000);

        } catch (error) {
          setIsLoading(false);
        }
      };

      pollTaskCompletion(taskId);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const startPollingTaskStatus = (taskId: string) => {
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
            addLog('Project build completed successfully', 'success');
          }
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

  const handleBuildProject = async () => {
    setIsLoading(true);
    try {
      const projectId = projectContext.id || '';
      const response = await projectApi.buildProject(projectId);

      if (response.taskId) {
        addLog('Building project...', 'start');
        startPollingTaskStatus(response.taskId);
      } else {
        addLog('Build initiation failed.', 'error');
      }
    } catch (error) {
      addLog(`Error during project build: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFile || !selectedFile.path || !projectContext.id) {
      addLog("No file selected or project context missing", 'error');
      return;
    }
  
    setIsLoading(true);
    const projectId = projectContext.id;
    const filePath = selectedFile.path;
    const content = fileContent; 
  
    try {
      const response = await fileApi.updateFile(projectId, filePath, content);
      //console.log('File saved successfully:', response);
      addLog(`File saved successfully: ${filePath}`, 'success');

      setProjectContext((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          codes: prev.details.codes.map((code) =>
            code.path === filePath ? { ...code, content } : code
          ),
        },
      }));
    } catch (error) {
      addLog(`Error saving file: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setFileContent(newContent);
    //console.log("New content:", newContent);
  };

  const handleTestProject = async () => {
    setIsLoading(true);
    try {
      const projectId = projectContext.id || '';
      addLog(`Starting tests for project ID: ${projectId}`, 'start');

      const response = await projectApi.testProject(projectId);

      if (response.taskId) {
        addLog(`Test process initiated. Task ID: ${response.taskId}`, 'start');
        startPollingTaskStatus(response.taskId);
      } else {
        addLog('Test initiation failed.', 'error');
      }
    } catch (error) {
      addLog(`Error during project test: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const closeFileContext = () => {
    setSelectedFile(undefined);
    setFileContent('');
  };

  const handleRunCommand = async (commandType: 'anchor clean' | 'cargo clean') => {
    setIsLoading(true);
    try {
      const projectId = projectContext.id || '';
      addLog(`Running command: ${commandType} for project ID: ${projectId}`, 'start');

      const response = await projectApi.runProjectCommand(projectId, commandType);

      if (response.taskId) {
        addLog(`Command process initiated. Task ID: ${response.taskId}`, 'start');
        startPollingTaskStatus(response.taskId);
      } else {
        addLog('Command initiation failed.', 'error');
      }
    } catch (error) {
      addLog(`Error running command: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedLogs = sessionStorage.getItem('terminalLogs');
    if (savedLogs) {
      setTerminalLogs(JSON.parse(savedLogs));
    }
  }, []);

  return (
    <Flex direction="column" maxHeight="100vh !important" overflow="auto" justifyContent="space-between">
      <Flex flexDirection="column" flex="1" flexShrink={0} height="60px">
        <TopPanel 
          onBuild={handleBuildProject}
          onSave={handleSave}
          onTest={handleTestProject}
        /> 
      </Flex>
      
      <Flex flex="1" overflow="hidden">
        <Box w="auto" borderRight="1px" borderColor="gray.200" overflowY="auto">
          <FileTree onSelectFile={handleSelectFile} files={files} selectedItem={selectedFile} />
        </Box>
        <Box flex={1} minHeight="100%" maxHeight="100%" boxSizing="border-box" overflow="auto">
          <CodeEditor
            content={selectedFile ? fileContent : 'Empty file'}
            selectedFile={selectedFile}
            terminalLogs={terminalLogs}
            clearLogs={clearLogs}
            onChange={handleContentChange}
            onSave={handleSave}
            onRunCommand={handleRunCommand}
            isPolling={isPolling}
          />  
        </Box>
        <Box w="400px" maxHeight="100% !important" borderLeft="1px" borderColor="gray.300" pb="2">
          <AIChat 
            selectedFile={selectedFile} 
            fileContent={fileContent} 
            onSelectFile={handleSelectFile} 
            files={files?.children || []}
          />
        </Box>
      </Flex>
      <LoadingModal isOpen={isLoading} onClose={() => setIsLoading(false)} />
    </Flex>
  );
};

export default CodePage;
