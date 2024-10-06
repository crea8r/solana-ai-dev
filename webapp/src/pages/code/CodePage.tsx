import React, { useState } from 'react';
import { Box, Flex, VStack, Text, Input, Button } from '@chakra-ui/react';
import { FaFolder, FaFile } from 'react-icons/fa';
import CodeEditor from '../../components/CodeEditor';
import TopPanel from './TopPanel';
import FileTree from '../../components/FileTree';
import AIChat from '../../components/AIChat';

const CodePage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  console.log('in CodePage');

  const handleSelectFile = (fileName: any) => {
    setSelectedFile(fileName);
    // Here you would typically load the file content
    // For now, we'll just set a placeholder
    console.log(`Selected file: ${fileName}`);
  };

  return (
    <Flex direction='column' height='100vh'>
      <TopPanel />
      <Flex h='100vh'>
        <Box w='20%' borderRight='1px' borderColor='gray.200'>
          <FileTree onSelectFile={handleSelectFile} />
        </Box>
        <Box flex={1}>
          <CodeEditor
            content={
              selectedFile
                ? `// Content of ${selectedFile}`
                : '// Select a file to edit'
            }
          />
        </Box>
        <Box w='20%' borderLeft='1px' borderColor='gray.200'>
          <AIChat />
        </Box>
      </Flex>
    </Flex>
  );
};

export default CodePage;
