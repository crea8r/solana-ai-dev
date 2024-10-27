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
  const { projectContext, setProjectContext } = useProjectContext();
  const [selectedFile, setSelectedFile] = useState<FileTreeItemType | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileTreeItemType | undefined>(undefined);
  const [fileContent, setFileContent] = useState<string>(''); 
  const toast = useToast();

  const ignoreFiles = ['node_modules', '.git', '.gitignore', 'yarn.lock', '.vscode', '.idea', '.DS_Store', '.env', '.env.local', '.env.development.local', '.env.test.local', '.env.production.local', '.prettierignore', 'app'];

  useEffect(() => {
    const log = `-- [CodePage] - useEffect --
    projectContext updated: 
    Project Id: ${projectContext.id}
    Root Path: ${projectContext.rootPath}
    Name: ${projectContext.name}
    Description: ${projectContext.description}  
    nodes: ${projectContext.details.nodes.length}
    edges: ${projectContext.details.edges.length}
    anchorInitCompleted: ${projectContext.details.isAnchorInit}
    filesAndCodesGenerated: ${projectContext.details.isCode}`;
    
    //console.log(log);
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

      console.log(`Fetching content for file path: ${filePath}`);

      const response = await fileApi.getFileContent(projectId, filePath);
      const taskId = response.taskId;

      const pollTaskCompletion = async (taskId: string) => {
        try {
          const taskResponse = await taskApi.getTask(taskId);
          const task = taskResponse.task;
          console.log('Task status:', task.status);

          if (task.status === 'finished' || task.status === 'succeed') {
            console.log('Task finished successfully');
            toast({
              title: 'Task completed',
              description: `The task has completed successfully. - ${task.result}`,
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            setIsLoading(false);
          } else if (task.status === 'failed') {
            console.error('Task failed:', task.result);
            toast({
              title: 'Task failed',
              description: task.result || 'An error occurred during the task.', 
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            setIsLoading(false);
          } else {

            setTimeout(() => pollTaskCompletion(taskId), 2000);
          }
        } catch (error) {
          console.error('Error polling task status:', error);
          setIsLoading(false);
        }
      };

      pollTaskCompletion(taskId);
    } catch (error) {
      console.error('Error starting file content retrieval task:', error);
      setIsLoading(false);
    }
  };

  const selectedContent = selectedFile ? fileContent : 'Empty file';

  console.log('Selected content:', selectedContent);

  const startPollingTaskStatus = (taskId: string) => {
    const intervalId = setInterval(async () => {
      try {
        const taskResponse = await taskApi.getTask(taskId);
        const status = taskResponse.task.status;

        if (status === 'finished' || status === 'succeed') {
          clearInterval(intervalId);
          toast({
            title: 'Build complete',
            description: `The Anchor build process has finished successfully. - ${taskResponse.task.result}`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          console.log('Build complete:', taskResponse.task.result);
        } else if (status === 'failed') {
          clearInterval(intervalId);
          toast({
            title: 'Build failed',
            description: `The Anchor build process encountered an error. - ${taskResponse.task.result}`,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          console.error('Build failed:', taskResponse.task.result);
        }
      } catch (error) {
        clearInterval(intervalId);
        console.error('Error polling task status:', error);
        toast({
          title: 'Polling error',
          description: `An error occurred while checking the build status. - ${error}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        console.error('Polling error:', error);
      }
    }, 5000); // Poll every 5 seconds
  };

  const handleBuildProject = async () => {
    setIsLoading(true);
    try {
      const projectId = projectContext.id || '';
      console.log(`Starting build for project ID: ${projectId}`);

      const response = await projectApi.buildProject(projectId);

      if (response.taskId) {
        console.log('Build process initiated. Task ID:', response.taskId);
        toast({
          title: 'Build started',
          description: 'The Anchor build process has started.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        startPollingTaskStatus(response.taskId);
      } else {
        console.error('Build initiation failed.');
        toast({
          title: 'Build failed',
          description: 'Failed to start the Anchor build process.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error during project build:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while starting the build process.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex direction='column' height='100vh'>
      <TopPanel onBuild={handleBuildProject} />
      <Flex h='100vh'>
        <Box w='20%' borderRight='1px' borderColor='gray.200'>
          <FileTree
            onSelectFile={handleSelectFile}
            files={files}
            selectedItem={selectedFile}
          />
        </Box>
        <Box flex={1}>
          <CodeEditor
            content={selectedContent}
            selectedFile={selectedFile}
            language={getLanguage(selectedFile?.name || '')}
          />
        </Box>
        <Box w={'400px'} borderLeft='1px' borderColor='gray.200'>
          <AIChat />
        </Box>
      </Flex>
      <LoadingModal isOpen={isLoading} onClose={() => setIsLoading(false)} />
    </Flex>
  );
};

export default CodePage;
