import React, { useState, useEffect } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import CodeEditor from '../../components/CodeEditor';
import TopPanel from './TopPanel';
import FileTree, { FileTreeItemType } from '../../components/FileTree';
import genFile from '../../prompts/genFile';
import promptAI from '../../services/prompt';
import LoadingModal from '../../components/LoadingModal';
import AIChat from '../../components/AIChat';
import { CodeFile } from '../../contexts/CodeFileContext';
import { useProject } from '../../contexts/ProjectContext';
import { extractCodeBlock } from '../../utils/genCodeUtils';
import { fileApi } from '../../api/file';

function getLanguage(fileName: string) {
  const ext = fileName.split('.').pop();
  if (ext === 'ts') return 'typescript';
  if (ext === 'js') return 'javascript';
  if (ext === 'rs') return 'rust';
  return 'md';
}

const CodePage = () => {
  const [selectedFile, setSelectedFile] = useState<FileTreeItemType | undefined>(undefined);
  const { project, setProject } = useProject();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileTreeItemType | undefined>(undefined);

  useEffect(() => {
    const fetchDirectoryStructure = async () => {
      if (project?.name) {
        try {
          const directoryStructure = await fileApi.getDirectoryStructure(project.name, '');
          const mappedFiles = directoryStructure.map(mapFileTreeNodeToItemType);
          const rootNode: FileTreeItemType = {
            name: project.name,
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
  }, [project?.name]);

  function mapFileTreeNodeToItemType(node: any): FileTreeItemType {
    return {
      name: node.name,
      path: node.path,
      type: node.type,
      ext: node.type === 'file' ? node.name.split('.').pop() : undefined,
      children: node.children
        ? node.children.map(mapFileTreeNodeToItemType)
        : undefined,
    };
  }

  const handleSelectFile = async (file: FileTreeItemType) => {
    setSelectedFile(file);
    // Your existing logic for handling file selection
  };

  const selectedContent = selectedFile
    ? project?.codes
      ? [
          project?.codes.find((item: CodeFile) => {
            return item.path === selectedFile.path;
          })?.content || '',
        ]
      : 'Empty file'
    : 'Empty file';

  return (
    <Flex direction='column' height='100vh'>
      <TopPanel />
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
            content={selectedContent.toString()}
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
