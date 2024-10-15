import React, { useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import CodeEditor from '../../components/CodeEditor';
import TopPanel from './TopPanel';
import FileTree, { FileTreeItemType } from '../../components/FileTree';
import genFile from '../../prompts/genFile';
import promptAI from '../../services/prompt';
import LoadingModal from '../../components/LoadingModal';
import { extractCodeBlock } from '../../utils/text';
import { useProject } from '../../contexts/ProjectContext';


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
    const codes: any = project?.codes || {};
    const codeList = window.Object.keys(codes);
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
                name: project?.name || '',
                description: project?.description || '',
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
      ? [project?.codes[selectedFile.path as keyof typeof project.codes] || '']
      : 'Empty file'
    : 'Empty file';
  // TODO: need to figure out when to enable the save button
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
          />
          {/* <div>{selectedContent.toString()}</div> */}
        </Box>
      </Flex>
      <LoadingModal isOpen={isLoading} onClose={() => setIsLoading(false)} />
    </Flex>
  );
};

export default CodePage;
