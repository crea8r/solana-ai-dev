import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Button, Flex } from '@chakra-ui/react';
import CodeEditor from '../../components/CodeEditor';
import TopPanel from './TopPanel';
import FileTree from '../../components/FileTree';
import { FileTreeItemType } from '../../interfaces/file';
import LoadingModal from '../../components/LoadingModal';
import AIChat from '../../components/AIChat';
import { useProjectContext } from '../../contexts/ProjectContext';
import {
  fetchDirectoryStructure, 
  filterFiles,
  mapFileTreeNodeToItemType,
  handleBuildProject,
  handleSave,
  handleTestProject,
  handleRunCommand,
  handleSelectFileUtil,
  findFirstFile,
  handleDeployProject
} from '../../utils/codePageUtils';
import { saveProject } from '../../utils/projectUtils';
import { useTerminalLogs } from '../../hooks/useTerminalLogs';
import { Wallet } from '../../components/Wallet';
import ProjectStatus from './projectStatus';

const CodePage = () => {
  const { projectContext, setProjectContext } = useProjectContext();
  const { logs: terminalLogs, addLog, clearLogs } = useTerminalLogs();

  const [selectedFile, setSelectedFile] = useState<FileTreeItemType | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);  
  const [files, setFiles] = useState<FileTreeItemType | undefined>(undefined);
  const [fileContent, setFileContent] = useState<string>('');
  const [showWallet, setShowWallet] = useState(false);
  const [showProjectStatus, setShowProjectStatus] = useState(false);
  const savedFileRef = useRef(sessionStorage.getItem('selectedFile'));

  const _handleSelectFile = useCallback(
    (file: FileTreeItemType) => { handleSelectFileUtil( file, projectContext, setSelectedFile, setFileContent, setIsLoading ); },
    [projectContext, setSelectedFile, setFileContent, setIsLoading]
  );

  useEffect(() => {
    console.log("projectContext", projectContext);
  }, [projectContext]);

  useEffect(() => {
    const fetchFilesIfNeeded = async () => {
      try {
        if (projectContext?.details?.files?.children?.length &&projectContext?.details?.files?.children?.length > 0) setFiles(projectContext.details.files);
        else {
          await fetchDirectoryStructure(
            projectContext?.id,
            projectContext?.rootPath,
            mapFileTreeNodeToItemType,
            filterFiles(projectContext?.rootPath),
            setFiles,
            setProjectContext,
            setIsPolling,
            setIsLoading,
            addLog,
            _handleSelectFile
          );
        }
       
      } catch (error) { console.error("Error fetching files or updating project context:", error); }
    };
  
    if (projectContext) {
      fetchFilesIfNeeded();
    }
  }, [
    projectContext,          
    setFiles, 
    setSelectedFile,               
    setProjectContext,       
    setIsPolling,            
    setIsLoading,            
    addLog,                  
    _handleSelectFile,  
    projectContext?.details?.sdk?.content     
  ]);
  

  useEffect(() => {
    const selectFileAfterLoad = () => {
      try {
        if (savedFileRef.current && projectContext?.details?.codes) {
          const parsedFile: FileTreeItemType = JSON.parse(savedFileRef.current);
          setSelectedFile(parsedFile);
  
          const cachedContent = projectContext?.details?.codes?.find(
            (code) => code.name === parsedFile.name
          );
  
          if (cachedContent?.content) {
            setFileContent(cachedContent.content);
            console.log(`Restored file content for ${parsedFile.name} from session storage.`);
          } else {
            console.warn(
              `File content for ${parsedFile.name} not found in projectContext after mount.`
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
          } else {
            console.warn("No files found to select after load.");
          }
        }
      } catch (error) {
        console.error("Error selecting file after context update:", error);
      }
    };
  
    selectFileAfterLoad();
  }, [files, projectContext?.details?.codes]);
  

  const _handleSave = async () => { if (selectedFile) handleSave(selectedFile, projectContext?.id || '', setIsLoading, setIsPolling, addLog, fileContent); };
  const _handleBuildProject = () => { handleBuildProject(projectContext?.id || '', setIsPolling, setIsLoading, addLog, projectContext, setProjectContext); };
  const _handleDeployProject = () => { handleDeployProject(projectContext?.id || '', setIsPolling, setIsLoading, addLog, projectContext, setProjectContext); };
  const _handleTestProject = () => { handleTestProject(projectContext?.id || '', setIsPolling, setIsLoading, addLog); };
  const _handleRunCommand = (commandType: 'anchor clean' | 'cargo clean') => { handleRunCommand(projectContext?.id || '', setIsPolling, setIsLoading, addLog, commandType); };
  const handleContentChange = (newContent: string) => { setFileContent(newContent); };
  const handleToggleWallet = () => { setShowWallet((prev) => !prev); };

  return (
    <Flex
      direction="column"
      maxHeight="100vh !important"
      overflow="auto"
      justifyContent="space-between"
    >
      <Flex flexDirection="column" flex="1" flexShrink={0} height="60px">
        <TopPanel onBuild={_handleBuildProject} onSave={_handleSave} onTest={_handleTestProject} onDeploy={_handleDeployProject} onToggleWallet={handleToggleWallet} />
      </Flex>

      <Flex flex="1" overflow="hidden" borderLeft="1px" borderColor="gray.200">
        <Flex flexDirection="column" py={2} >
          <Button 
            onClick={() => setShowProjectStatus((prev) => !prev)}
            variant="outline"
            size="xs"
            width="50%"
            mx={0}
            mb={2}
          >
            {showProjectStatus ? 'Hide Project Status' : 'Show Project Status'}
          </Button>
          {showProjectStatus && (
            <Box flex="1">  
              <ProjectStatus />
            </Box>
          )}
          <Box flex="5" borderRight="1px" borderColor="gray.200" overflowY="auto">
            <FileTree onSelectFile={_handleSelectFile} files={files} selectedItem={selectedFile} />
          </Box>
        </Flex> 
        <Box
          flex={1}
          minHeight="100%"
          maxHeight="100%"
          boxSizing="border-box"
          overflow="auto"
          zIndex={100}
        >
          <CodeEditor
            content={fileContent || ''}
            selectedFile={selectedFile}
            terminalLogs={terminalLogs}
            clearLogs={clearLogs}
            onChange={handleContentChange}
            onSave={_handleSave}
            onRunCommand={_handleRunCommand}
            isPolling={isPolling}
          />
        </Box>
        <Box flex={1} position="absolute" top={12} right={0}>
          {showWallet && <Wallet />}
        </Box>
        <Box
          w="400px"
          maxHeight="100% !important"
          borderLeft="1px"
          borderColor="gray.300"
          pb="2"
        >
          
          <AIChat
            selectedFile={selectedFile}
            fileContent={fileContent}
            onSelectFile={_handleSelectFile}
            files={files?.children || []}
          />
        </Box>
      </Flex>
      <LoadingModal isOpen={isLoading} onClose={() => setIsLoading(false)} />
    </Flex>
  );
};

export default CodePage;
