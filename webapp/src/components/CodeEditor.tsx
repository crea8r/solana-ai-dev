import { useRef, useEffect } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { FileTreeItemType } from './FileTree';
import Terminal from './Terminal';

type CodeEditorProps = {
  content: string; 
  language?: string;
  selectedFile?: FileTreeItemType;
  terminalLogs: string[]; 
};

const CodeEditor = ({
  content,
  language = 'javascript',
  selectedFile,
  terminalLogs,
}: CodeEditorProps) => {
  const editorRef = useRef<any>(null);

  const options = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line' as const,
    automaticLayout: true,
  };

  const editorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

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
  };

  const determineLanguage = (path: string): string => {
    if (path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.rs')) return 'rust';
    if (path.endsWith('.toml')) return 'toml';
    return 'plaintext';
  };

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (editorRef.current && typeof editorRef.current.layout === 'function') {
          editorRef.current.layout();
        }
      }, 100); // Adjust the timeout as necessary
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

  useEffect(() => {
    if (selectedFile?.path && content) {
      const language = determineLanguage(selectedFile.path);
      let model = monaco.editor.getModel(monaco.Uri.parse(`file:///${selectedFile.path}`));
      
      if (!model) {
        model = monaco.editor.createModel(content, language);
        console.log(`Created new model with language: ${language}`);
      } else {
        model.setValue(content);
        console.log('Updated model for URI:', selectedFile.path);
      }
    }
  }, [selectedFile, content]);

  return (
    <Flex direction='column' height='100%' overflowY='hidden'>
      {selectedFile ? (
        <Box py={1} px={2} borderBottom={'1px solid #ccc'}>
          {selectedFile.path}
        </Box>
      ) : null}
      
      <Box maxHeight='100vh'>
        <MonacoEditor
          height='60vh'
          width='100%'
          key={selectedFile?.path || 'default'}
          language={language}
          theme="myCustomLightTheme"
          value={content}
          options={options}
          editorDidMount={editorDidMount}
        />
        <Terminal logs={terminalLogs} />
      </Box>
    </Flex>
  );
};

export default CodeEditor;
