import { Box, Text } from '@chakra-ui/react';
import MonacoEditor from 'react-monaco-editor';

type CodeEditorProps = {
  content: any;
};

const CodeEditor = ({ content }: CodeEditorProps) => {
  const options = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line' as 'line',
    automaticLayout: true,
  };

  return (
    <Box h='100%'>
      <MonacoEditor
        width='100%'
        height='80%'
        language='rust'
        theme='vs-dark'
        value={content}
        options={options}
      />
      <Box h='20%' bg='gray.700' color='white' p={2} overflowY='auto'>
        <Text>Terminal Output</Text>
      </Box>
    </Box>
  );
};

export default CodeEditor;
