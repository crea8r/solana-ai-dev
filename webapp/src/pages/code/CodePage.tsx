import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import CodeEditor from '../../components/CodeEditor';
import TopPanel from './TopPanel';
import FileTree from '../../components/FileTree';
import { FileTreeItemType } from '../../interfaces/file';
import LoadingModal from '../../components/LoadingModal';
import AIChat from '../../components/AIChat';
import { useProjectContext } from '../../contexts/ProjectContext';
import {
  extractWarnings, 
  ignoreFiles,
  fetchDirectoryStructure, 
  LogEntry, 
  MAX_LOG_ENTRIES,
  addLog,
  clearLogs,
  filterFiles,
  mapFileTreeNodeToItemType,
  startPollingTaskStatus,
  handleBuildProject,
  handleSave,
  handleTestProject,
  handleRunCommand,
  handleSelectFileUtil
} from '../../utils/codePageUtils';

const CodePage = () => {
  const { projectContext, setProjectContext } = useProjectContext();
  const [selectedFile, setSelectedFile] = useState<FileTreeItemType | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);  
  const [files, setFiles] = useState<FileTreeItemType | undefined>(undefined);
  const [fileContent, setFileContent] = useState<string>('');
  const [terminalLogs, setTerminalLogs] = useState<LogEntry[]>([]);
  const savedFileRef = useRef(sessionStorage.getItem('selectedFile'));

  useEffect(() => {
    console.log("projectContext", projectContext);
  }, [projectContext]);

  useEffect(() => {
    if (!projectContext || !projectContext.details.files.children) return;
    try {
      if (projectContext.details.files.children.length > 0) {
        console.log("setting files from projectContext");
        setFiles(projectContext.details.files);
      }
      else {
        fetchDirectoryStructure(
          projectContext?.name, 
          projectContext?.rootPath, 
          mapFileTreeNodeToItemType, 
          filterFiles(projectContext?.rootPath), 
          setFiles,
          setProjectContext,
          setIsPolling,
          setIsLoading,
          addLog,
          setTerminalLogs,
          handleSelectFile
        );
      }
    } catch (error) { throw error; }
  }, []);

  // selectedFile rehydration
  useEffect(() => {
    if (savedFileRef.current && projectContext?.details?.codes) {
      try {
        const parsedFile: FileTreeItemType = JSON.parse(savedFileRef.current);
        setSelectedFile(parsedFile);
  
        const cachedContent = projectContext?.details?.codes?.find((code) => code.name === parsedFile.name);
  
        if (cachedContent?.content) setFileContent(cachedContent.content);
        else console.warn(`File content for ${parsedFile.name} not found in context after mount.`);
      } catch (error) {
        console.error("Error rehydrating selected file:", error);
      }
    }
  }, []);

  const handleSelectFile = useCallback(
    (file: FileTreeItemType) => {
      handleSelectFileUtil(
        file,
        projectContext,
        setSelectedFile,
        setFileContent,
        setIsLoading,
      );
    },
    [projectContext, setSelectedFile, setFileContent, setIsLoading]
  );

  const _handleSave = async () => { if (selectedFile) handleSave(selectedFile, projectContext?.id || '', setIsLoading, setTerminalLogs, fileContent); };
  const _handleBuildProject = () => { handleBuildProject(projectContext?.id || '', setIsPolling, setIsLoading, addLog, setTerminalLogs); };
  const _handleTestProject = () => { handleTestProject(projectContext?.id || '', setIsPolling, setIsLoading, addLog, setTerminalLogs); };
  const _handleRunCommand = (commandType: 'anchor clean' | 'cargo clean') => { handleRunCommand(projectContext?.id || '', setIsPolling, setIsLoading, addLog, setTerminalLogs, commandType); };
  const handleContentChange = (newContent: string) => { setFileContent(newContent); };

  return (
    <Flex
      direction="column"
      maxHeight="100vh !important"
      overflow="auto"
      justifyContent="space-between"
    >
      <Flex flexDirection="column" flex="1" flexShrink={0} height="60px">
        <TopPanel onBuild={_handleBuildProject} onSave={_handleSave} onTest={_handleTestProject} />
      </Flex>

      <Flex flex="1" overflow="hidden">
        <Box w="auto" borderRight="1px" borderColor="gray.200" overflowY="auto">
          <FileTree onSelectFile={handleSelectFile} files={files} selectedItem={selectedFile} />
        </Box>
        <Box
          flex={1}
          minHeight="100%"
          maxHeight="100%"
          boxSizing="border-box"
          overflow="auto"
        >
          <CodeEditor
            content={fileContent}
            selectedFile={selectedFile}
            terminalLogs={terminalLogs}
            clearLogs={() => clearLogs(setTerminalLogs)}
            onChange={handleContentChange}
            onSave={_handleSave}
            onRunCommand={_handleRunCommand}
            isPolling={isPolling}
          />
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
