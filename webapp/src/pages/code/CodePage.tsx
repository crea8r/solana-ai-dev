import React, { useState, useEffect } from 'react';
import { Box, Flex, useToast } from '@chakra-ui/react';
import CodeEditor from '../../components/CodeEditor';
import TopPanel from './TopPanel';
import FileTree, { FileTreeItemType } from '../../components/FileTree';
import genFile from '../../prompts/genFile';
import promptAI from '../../services/prompt';
import LoadingModal from '../../components/LoadingModal';
import AIChat from '../../components/AIChat';
import { useProjectContext } from '../../contexts/ProjectContext';
import { extractCodeBlock } from '../../utils/genCodeUtils';
import { fileApi } from '../../api/file';
import { taskApi } from '../../api/task';
import { projectApi } from '../../api/project'; 

function getLanguage(fileName: string) {
  const ext = fileName.split('.').pop();
  if (ext === 'ts') return 'typescript';
  if (ext === 'js') return 'javascript';
  if (ext === 'rs') return 'rust';
  return 'md';
}

const CodePage = () => {
  const { projectContext } = useProjectContext();
  const [selectedFile, setSelectedFile] = useState<FileTreeItemType | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileTreeItemType | undefined>(undefined);
  const [fileContent, setFileContent] = useState<string>(''); 
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const ignoreFiles = ['node_modules', '.git', '.gitignore', 'yarn.lock', '.vscode', '.idea', '.DS_Store', '.env', '.env.local', '.env.development.local', '.env.test.local', '.env.production.local', '.prettierignore', 'app'];

  const addLog = (message: string, isBuildLog = false) => {
    if (isBuildLog) {
      setTerminalLogs(prevLogs => [...prevLogs, message]);
    }
   // console.log(message);
  };

  useEffect(() => {
    console.log(projectContext);
  }, [projectContext]);

  useEffect(() => {
    const fetchDirectoryStructure = async () => {
      if (projectContext.name) {
        try {
          const directoryStructure = await fileApi.getDirectoryStructure(projectContext.name || '', projectContext.rootPath || '');
          const mappedFiles = directoryStructure.map(mapFileTreeNodeToItemType).filter(filterFiles);
          const rootNode: FileTreeItemType = {
            name: projectContext.name || '',
            path: '',
            type: 'directory',
            children: mappedFiles,
          };
          setFiles(rootNode);
          console.log('Mapped Files:', rootNode);
        } catch (error) {
          console.error('Failed to fetch directory structure', error);
        }
      }
    };
    fetchDirectoryStructure();
  }, [projectContext.name]);

  function mapFileTreeNodeToItemType(node: any): FileTreeItemType {
    const mappedChildren = node.children
      ? node.children.map(mapFileTreeNodeToItemType).filter(filterFiles) 
      : undefined;

    return {
      name: node.name,
      path: node.path,
      type: node.isDirectory ? 'directory' : 'file',
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
    setFileContent(''); 
    setIsLoading(true);
    
    try {
      const projectId = projectContext.id || '';
      const filePath = file.path || '';
      console.log(`Fetching content for file: ${filePath}`);

      const response = await fileApi.getFileContent(projectId, filePath);
      const taskId = response.taskId;

      const pollTaskCompletion = async (taskId: string) => {
        try {
          const taskResponse = await taskApi.getTask(taskId);
          const task = taskResponse.task;

          if (task.status === 'finished' || task.status === 'succeed') {
            setFileContent(task.result || '');
            setIsLoading(false);
          } else if (task.status === 'failed') {
            setIsLoading(false);
          } else {
            setTimeout(() => pollTaskCompletion(taskId), 2000);
          }
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
    const intervalId = setInterval(async () => {
      try {
        const taskResponse = await taskApi.getTask(taskId);
        const status = taskResponse.task.status;

        if (status === 'finished' || status === 'succeed') {
          clearInterval(intervalId);
          addLog(`Build complete: ${taskResponse.task.result}`, true);
        } else if (status === 'failed') {
          clearInterval(intervalId);
          addLog(`Build failed: ${taskResponse.task.result}`, true);
        }
      } catch (error) {
        clearInterval(intervalId);
        addLog(`Polling error: ${error}`, true);
      }
    }, 5000);
  };

  const handleBuildProject = async () => {
    setIsLoading(true);
    try {
      const projectId = projectContext.id || '';
      addLog(`Starting build for project ID: ${projectId}`, true);

      const response = await projectApi.buildProject(projectId);

      if (response.taskId) {
        addLog(`Build process initiated. Task ID: ${response.taskId}`, true);
        startPollingTaskStatus(response.taskId);
      } else {
        addLog('Build initiation failed.', true);
      }
    } catch (error) {
      addLog(`Error during project build: ${error}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFile || !selectedFile.path || !projectContext.id) {
      addLog("No file selected or project context missing", true);
      return;
    }
  
    setIsLoading(true);
    const rootPath = projectContext.rootPath;
    const filePath = selectedFile.path;
    const content = fileContent; 
  
    try {
      const response = await fileApi.updateFile(rootPath, filePath, content);
      addLog(`File saved successfully: ${filePath}`, true);
    } catch (error) {
      addLog(`Error saving file: ${error}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setFileContent(newContent);
    console.log("New content:", newContent);
  };

  const handleTestProject = async () => {
    setIsLoading(true);
    try {
      const projectId = projectContext.id || '';
      addLog(`Starting tests for project ID: ${projectId}`, true);

      const response = await projectApi.testProject(projectId);

      if (response.taskId) {
        addLog(`Test process initiated. Task ID: ${response.taskId}`, true);
        startPollingTaskStatus(response.taskId);
      } else {
        addLog('Test initiation failed.', true);
      }
    } catch (error) {
      addLog(`Error during project test: ${error}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex direction='column' height='100vh'>
      <TopPanel 
        onBuild={handleBuildProject}
        onSave={handleSave}
        onTest={handleTestProject}
      />
      <Flex height='100%'>
        <Box w='20%' borderRight='1px' borderColor='gray.200'>
          <FileTree onSelectFile={handleSelectFile} files={files} selectedItem={selectedFile} />
        </Box>
        <Box flex={1} maxHeight='100vh' boxSizing='border-box' overflow='auto'>
          <CodeEditor
            content={selectedFile ? fileContent : 'Empty file'}
            selectedFile={selectedFile}
            language={getLanguage(selectedFile?.name || '')}
            terminalLogs={terminalLogs}
            onChange={handleContentChange}
          />
        </Box>
        {/* <Box w={'400px'} height='100vh' borderLeft='1px' borderColor='gray.200'>
          <AIChat />
        </Box> */}
      </Flex>
      <LoadingModal isOpen={isLoading} onClose={() => setIsLoading(false)} />
    </Flex>
  );
};

export default CodePage;
