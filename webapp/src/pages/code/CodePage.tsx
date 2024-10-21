import React, { useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import CodeEditor from '../../components/CodeEditor';
import TopPanel from './TopPanel';
import FileTree, { FileTreeItemType } from '../../components/FileTree';
import { useProject } from '../../contexts/ProjectContext';
import genFile from '../../prompts/genFile';
import promptAI from '../../services/prompt';
import LoadingModal from '../../components/LoadingModal';
import AIChat from '../../components/AIChat';
import { CodeFile } from '../../contexts/CodeFileContext';

function getLanguage(fileName: string) {
  const ext = fileName.split('.').pop();
  if (ext === 'ts') return 'typescript';
  if (ext === 'js') return 'javascript';
  if (ext === 'rs') return 'rust';
  return 'md';
}

function extractCodeBlock(text: string): string {
  const lines = text.split('\n');
  let isInCodeBlock = false;
  const codeBlockLines: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (isInCodeBlock) {
        break; // End of code block
      } else {
        isInCodeBlock = true; // Start of code block
        continue; // Skip the opening ```
      }
    }

    if (isInCodeBlock) {
      codeBlockLines.push(line);
    }
  }

  return codeBlockLines.join('\n');
}

const CodePage = () => {
  const [selectedFile, setSelectedFile] = useState<
    FileTreeItemType | undefined
  >(undefined);
  const { project, setProject } = useProject();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectFile = async (file: FileTreeItemType) => {
    setSelectedFile(file);
    // Here you would typically load the file content
    // For now, we'll just set a placeholder
    const codes: any = project?.codes || [];
    const codeList = codes.map((code: any) => code.path);
    if (file.type === 'file' || file.type !== 'directory') {
      if (!codeList.includes(file.path || '')) {
        // generate code content and set Project
        setIsLoading(true);
        const { nodes, edges } = project || { nodes: [], edges: [] };
        const content = genFile(nodes, edges, file.name || '', file.path || '');
        console.log(
          'request: ',
          genFile(nodes, edges, file.name || '', file.path || '')
        );
        const choices = await promptAI(content);
        try {
          if (choices && choices.length > 0) {
            const content = choices[0].message?.content;
            codes[file.path || ''] = extractCodeBlock(content);
            console.log('content: ', content);
            if (project?.files) {
              setProject({
                nodes,
                edges,
                files: project?.files,
                codes: codes,
              });
            }
          }
        } catch (e) {
        } finally {
          setIsLoading(false);
        }
      }
    }
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
            files={project?.files || undefined}
            selectedItem={selectedFile}
          />
        </Box>
        <Box flex={1}>
          <CodeEditor
            content={selectedContent.toString()}
            selectedFile={selectedFile}
            language={getLanguage(selectedFile?.name || '')}
          />
          {/* <div>{selectedContent.toString()}</div> */}
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
