import { useEffect } from 'react';
import { Box, Text } from '@chakra-ui/react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { FileTreeItemType } from './FileTree';

// Configure Monaco's environment for worker paths
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
  content: string; // Ensure content is a string
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

  useEffect(() => {
    monaco.editor.defineTheme('myCustomLightTheme', {
      base: 'vs', // Use 'vs' for a light theme
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
        'editor.background': '#FFFFFF', // Editor background color
        'editorCursor.foreground': '#000000',
        'editor.lineHighlightBackground': '#F0F0F0',
        'editorLineNumber.foreground': '#B0B0B0',
      },
    });
    monaco.editor.setTheme('myCustomLightTheme');
  }, []);

  const determineLanguage = (path: string): string => {
    if (path.endsWith('.ts')) return 'plaintext'; // Temporarily use 'plaintext' for testing
    if (path.endsWith('.rs')) return 'rust';
    if (path.endsWith('.toml')) return 'toml';
    return 'plaintext'; // Default fallback language
  };

  useEffect(() => {
    if (selectedFile?.path && content) {
      const language = determineLanguage(selectedFile.path);
      let model = monaco.editor.getModel(monaco.Uri.parse(`file:///${selectedFile.path}`));
      
      if (!model) {
        // Use a language-based model without URI for .ts files to avoid issues with TypeScript workers
        model = monaco.editor.createModel(
          content,
          language === 'typescript' ? 'plaintext' : language
        );
        console.log(`Created new model with language: ${language}`);
      } else {
        model.setValue(content); // Update existing model
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
        height="80%"
        language={determineLanguage(selectedFile?.path || '')}
        theme="myCustomLightTheme"
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
        shadow='md'
      >
        <Text>Terminal Output</Text>
      </Box>
    </Box>
  );
};

export default CodeEditor;
