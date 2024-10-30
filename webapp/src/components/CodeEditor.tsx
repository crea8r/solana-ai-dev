import { useRef, useEffect, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { FileTreeItemType } from './FileTree';
import Terminal from './Terminal';

type CodeEditorProps = {
  content: string; 
  selectedFile?: FileTreeItemType;
  terminalLogs: string[]; 
  onChange: (newContent: string) => void;
};

const CodeEditor = ({
  content,
  selectedFile,
  terminalLogs,
  onChange,
}: CodeEditorProps) => {
  const editorRef = useRef<any>(null);
  const [language, setLanguage] = useState('plaintext');

  const options = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line' as const,
    automaticLayout: true,
  };

  useEffect(() => {
    monaco.editor.defineTheme('materialLighterHighContrast', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '4CAF50', fontStyle: 'italic' },
        { token: 'keyword', foreground: '#ca3bf7', fontStyle: 'bold' },
        { token: 'variable', foreground: '#BABABA', fontStyle: 'bold' },
        { token: 'string', foreground: '#795548' },
        { token: 'number', foreground: '#E91E63' },
        { token: 'type', foreground: '#673AB7' },
        { token: 'function', foreground: '#00796B', fontStyle: 'bold' },
        { token: 'identifier', foreground: '#212121' },
      ],
      colors: {
        'editor.foreground': '#000000',
        'editor.background': '#FFFFFF',
        'editorCursor.foreground': '#000000',
        'editor.lineHighlightBackground': '#f7f7f7',
        'editor.lineHighlightBorder': '#f7f7f7',
        'editor.selectionBackground': '#A0C4FF',
        'editor.selectionHighlightBackground': '#D0EBFF80',
        // word highlight
        'editor.wordHighlightBackground': '#ccffc2',
        //'editor.wordHighlightBorder': '#FFD700',

        'editor.wordHighlightStrongBackground': '#FFF176',
        'editor.wordHighlightStrongBorder': '#FFEB3B',

        'editor.inactiveSelectionBackground': '#B0BEC5',
        'editorIndentGuide.background': '#E0E0E0',
        'editorIndentGuide.activeBackground': '#B0BEC5',
      },
    });
    monaco.editor.setTheme('materialLighterHighContrast');
  }, []);

  const editorDidMount = (editor: any) => {
    editorRef.current = editor;
    monaco.editor.setTheme('materialLighterHighContrast');
  };

  const determineLanguage = (path: string): string => {
    if (path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.rs')) return 'rust';
    if (path.endsWith('.toml')) return 'toml';
    return 'plaintext';
  };

  useEffect(() => {
    if (selectedFile?.path) {
      const fileLanguage = determineLanguage(selectedFile.path);
      setLanguage(fileLanguage);
      
      let model = monaco.editor.getModel(monaco.Uri.parse(`file:///${selectedFile.path}`));
      
      if (!model) {
        model = monaco.editor.createModel(content, fileLanguage, monaco.Uri.parse(`file:///${selectedFile.path}`));
        console.log(`Created new model with language: ${fileLanguage}`);
      } else {
        model.setValue(content);
        console.log('Updated model for URI:', selectedFile.path);
      }
      editorRef.current?.setModel(model);
    }
  }, [selectedFile, content]);

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (editorRef.current && typeof editorRef.current.layout === 'function') {
          editorRef.current.layout();
        }
      }, 100);
    };

    const observer = new ResizeObserver(handleResize);

    const editorContainer = editorRef.current?.domNode?.parentNode;
    if (editorContainer) {
      observer.observe(editorContainer);
    }

    return () => {
      clearTimeout(resizeTimeout);
      observer.disconnect();
    };
  }, []);

  const handleEditorChange = (newValue: string) => {
    onChange(newValue);
  };

  useEffect(() => {
    monaco.editor.setTheme('materialLighterHighContrast');
    editorRef.current?.layout();
  }, []);

  return (
    <Flex direction="column" height="100%" overflowY="hidden">
      {selectedFile ? (
        <Box py={1} px={2} borderBottom="1px solid #ccc">
          {selectedFile.path}
        </Box>
      ) : null}

      <Box
        flex="4"
        overflow="hidden"
        sx={{
          '::-webkit-scrollbar': { width: '8px' },
          '::-webkit-scrollbar-thumb': { backgroundColor: '#888', borderRadius: '10px' },
          '::-webkit-scrollbar-thumb:hover': { backgroundColor: '#555' },
          '::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1', borderRadius: '10px' },
        }}
      >
        <MonacoEditor
          height="75vh"
          width="100%"
          language={language}
          theme="materialLighterHighContrast"
          value={content}
          options={options}
          editorDidMount={editorDidMount}
          onChange={handleEditorChange}
        />
      </Box>

      <Box flex="1" mb={2}>
        <Terminal logs={terminalLogs} />
      </Box>
    </Flex>
  );
};

export default CodeEditor;
