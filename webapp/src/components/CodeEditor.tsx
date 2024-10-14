import { Box, Text } from '@chakra-ui/react';
import MonacoEditor from 'react-monaco-editor';
import { FileTreeItemType } from './FileTree';

type CodeEditorProps = {
  content: any;
  language?: string;
  selectedFile?: FileTreeItemType;
};

const CodeEditor = ({
  content,
  language = 'md',
  selectedFile,
}: CodeEditorProps) => {
  const options = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line' as 'line',
    automaticLayout: true,
  };
  // for content, only keep the content between the two line that start with '```'

  return (
    <Box h='100%'>
      {selectedFile ? (
        <Box py={1} px={2} borderBottom={'1px solid #ccc'}>
          {selectedFile.path}
        </Box>
      ) : null}
      <MonacoEditor
        width='100%'
        height='80%'
        language={language || 'md'}
        theme='vs-light'
        value={content}
        options={options}
      />
      <Box 
        h='20%' 
        bg='white' 
        color='black' 
        p={2} 
        overflowY='auto' 
        borderTop='1px solid' 
        borderColor='gray.200' 
        shadow='md'>
        <Text>Terminal Output</Text>
      </Box>
    </Box>
  );
};

export default CodeEditor;
