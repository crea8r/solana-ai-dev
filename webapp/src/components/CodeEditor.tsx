import { useEffect } from 'react';
import { Box, Text } from '@chakra-ui/react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { FileTreeItemType } from './FileTree';

(window as any).MonacoEnvironment = {
  getWorkerUrl: function (moduleId: string, label: string) {
    const cdnBaseUrl = 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs';
    if (label === 'json') return `${cdnBaseUrl}/language/json/json.worker.js`;
    if (label === 'css') return `${cdnBaseUrl}/language/css/css.worker.js`;
    if (label === 'html') return `${cdnBaseUrl}/language/html/html.worker.js`;
    if (label === 'typescript' || label === 'javascript') return `${cdnBaseUrl}/language/typescript/ts.worker.js`;
    return `${cdnBaseUrl}/editor/editor.worker.js`;
  },
};

type CodeEditorProps = {
  content: string; 
  language?: string;
  selectedFile?: FileTreeItemType;
  terminalLogs: string[]; 
};

const CodeEditor = ({
  content,
  language = 'md',
  selectedFile,
  terminalLogs,
}: CodeEditorProps) => {
  const options = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line' as 'line',
    automaticLayout: true,
  };

  useEffect(() => {
    monaco.editor.defineTheme('myCustomLightTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'keyword', foreground: '0000FF' },
        { token: 'string', foreground: 'A31515' },
        { token: 'variable', foreground: '001080' },
        { token: 'number', foreground: '09885A' },
        { token: 'identifier', foreground: '000000' },
      ],
      colors: {
        'editor.foreground': '#000000',
        'editor.background': '#FFFFFF',
        'editorCursor.foreground': '#000000',
        'editor.lineHighlightBackground': '#F0F0F0',
        'editorLineNumber.foreground': '#B0B0B0',
      },
    });
    monaco.editor.setTheme('myCustomLightTheme');
  }, []);

  const determineLanguage = (path: string): string => {
    if (path.endsWith('.ts')) return 'plaintext'; 
    if (path.endsWith('.rs')) return 'rust';
    if (path.endsWith('.toml')) return 'toml';
    return 'plaintext';
  };

  useEffect(() => {
    if (selectedFile?.path && content) {
      const language = determineLanguage(selectedFile.path);
      let model = monaco.editor.getModel(monaco.Uri.parse(`file:///${selectedFile.path}`));
      
      if (!model) {
        model = monaco.editor.createModel(
          content,
          language === 'typescript' ? 'plaintext' : language
        );
        console.log(`Created new model with language: ${language}`);
      } else {
        model.setValue(content);
        console.log('Updated model for URI:', selectedFile.path);
      }
    }
  }, [selectedFile, content]);

  return (
    <Box h='100%'>
      {selectedFile ? (
        <Box py={1} px={2} borderBottom={'1px solid #ccc'}>
          {selectedFile.path}
        </Box>
      ) : null}
      <MonacoEditor
        key={selectedFile?.path || 'default'}
        width="100%"
        height="500px" 
        language={language}
        theme="myCustomLightTheme"
        value={content}
        options={options}
      />
      <Box
        h='20%' 
        maxH='20%' 
        bg='white'
        color='gray.900'
        p={2}
        overflowY='auto' 
        borderTop='1px solid'
        borderColor='gray.200'
        shadow='md'
      >
        <Text fontSize="md" fontWeight="bold" mb={2}>
          Terminal Output
        </Text>
        {terminalLogs.map((log, index) => (
          <Text key={index} fontSize="sm" whiteSpace="pre-wrap">
            {log}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

export default CodeEditor;
