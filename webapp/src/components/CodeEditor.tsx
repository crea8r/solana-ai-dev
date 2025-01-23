import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Flex, MenuItem, Spinner } from '@chakra-ui/react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { FileTreeItemType } from '../interfaces/file';
import Terminal from './Terminal';
import { LogEntry } from '../hooks/useTerminalLogs';

type CodeEditorProps = {
  content: string; 
  selectedFile?: FileTreeItemType;
  terminalLogs: LogEntry[]; 
  clearLogs: () => void;
  onChange: (newContent: string) => void;
  onSave: () => void;
  onRunCommand: (commandType: 'anchor clean' | 'cargo clean') => void;
  isPolling: boolean;
  isLoadingCode: boolean;
};

const CodeEditor = ({
  content,
  selectedFile,
  terminalLogs,
  clearLogs,
  onChange,
  onSave,
  onRunCommand,
  isPolling,
  isLoadingCode,
}: CodeEditorProps) => {
  const editorRef = useRef<any>(null);
  const [language, setLanguage] = useState('plaintext');

  // Add a state to manage the selected file
  const [currentFile, setCurrentFile] = useState<FileTreeItemType | undefined>(selectedFile);

  // Define a set to keep track of defined themes
  const definedThemes = new Set<string>();

  const options = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line' as const,
    automaticLayout: true,
    wordWrap: 'on' as const,
    wordHighlight: false,
    wordHighlightStrong: false,
    occurrencesHighlight: 'off' as const,
    selectionHighlight: false,
    minimap: { enabled: false },
    fontSize: 14,
  };

  useEffect(() => {
    if (!definedThemes.has('wechatLightStyle')) {
      monaco.editor.defineTheme('wechatLightStyle', {
        base: 'vs', // Use 'vs' for light mode
        inherit: true,
        rules: [
          { token: 'comment', foreground: '#1cba70', fontStyle: 'italic' },  // Green
          { token: 'keyword', foreground: '#5688e8', fontStyle: 'normal' },     // Pink
          { token: 'variable', foreground: '#636674' },                      // Green
          { token: 'string', foreground: '#7d94e8' },                        // Light blue
          { token: 'number', foreground: '#FD9353' },                        // Orange
          { token: 'type', foreground: '#9e72ca' },                          // Purple // anchor macros,
          { token: 'function', foreground: '#AB9DF2', fontStyle: 'normal' },   // Purple
          { token: 'identifier', foreground: '#383838' },                    // Dark gray
        ],
        colors: {
          'editor.foreground': '#333333',                  // Dark gray text
          'editor.background': '#FFFFFF',                  // Pure white background
          'editorCursor.foreground': '#333333',            // Dark gray cursor
          'editor.lineHighlightBackground': '#f0f3ff',     // Very light gray for line highlight
          'editor.selectionBackground': '#ADD6FF',         // Light blue for selected text
          'editor.selectionHighlightBackground': '#DAECF7', // Slightly darker blue for highlights
          'editor.wordHighlightBackground': '#EAEAEA',     // Light gray for word highlights
          'editor.wordHighlightStrongBackground': '#E0E0E0',
          'editor.inactiveSelectionBackground': '#E0E0E0', // Light gray for inactive selection
          'editorIndentGuide.background': '#DDDDDD',       // Light gray indent guides
          'editorIndentGuide.activeBackground': '#BBBBBB', // Slightly darker active indent guide
        },
      });
      definedThemes.add('wechatLightStyle');
    }
    monaco.editor.setTheme('wechatLightStyle');
  }, []);

  const editorDidMount = (editor: any) => {
    editorRef.current = editor;
    monaco.editor.setTheme('wechatLightStyle');
  };

  const determineLanguage = (path: string): string => {
    if (path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.rs')) return 'rust';
    if (path.endsWith('.json')) return 'json';
    if (path.endsWith('.html')) return 'html';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.toml')) return 'toml';
    if (path.endsWith('.md')) return 'markdown';
    //console.log(`File path: ${path}, Language: plaintext (default)`);
    return 'plaintext';
  };

  useEffect(() => {
    if (selectedFile) {
      setCurrentFile(selectedFile);
     // console.log(`Selected file: ${selectedFile.path}`);
      if (selectedFile.path) {
        const language = determineLanguage(selectedFile.path);
        setLanguage(language);
        //console.log(`File path: ${selectedFile.path}, Language: ${language}`);
      }
    }
  }, [selectedFile]);

  useEffect(() => {
    if (currentFile?.path) {
      const uri = monaco.Uri.parse(`file:///${currentFile.path}`);
      let model = monaco.editor.getModel(uri);

      if (!model) {
        model = monaco.editor.createModel(content, language, uri);
      } else {
        if (model.getValue() !== content) {
          model.setValue(content);
        }
          monaco.editor.setModelLanguage(model, language);
      }

      if (editorRef.current?.getModel() !== model) {
        editorRef.current?.setModel(model);
      }
    }
  }, [currentFile, language, content]);

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (editorRef.current && typeof editorRef.current.layout === 'function') {
          editorRef.current.layout();
        }
      }, 200); // Debounce delay
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
    monaco.editor.setTheme('wechatLightStyle');
    editorRef.current?.layout();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        onSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSave]);

  useEffect(() => {
    // Register TOML language if not already registered
    monaco.languages.register({ id: 'toml' });

    // Define simple TOML syntax highlighting
    monaco.languages.setMonarchTokensProvider('toml', {
      tokenizer: {
        root: [
          [/^\s*\[.*?\]/, 'type'],  // Sections in TOML, e.g., [section]
          [/^\s*[a-zA-Z0-9_-]+\s*=\s*/, 'variable'],  // Keys in TOML, e.g., key =
          [/"[^"]*"/, 'string'],  // Double-quoted strings
          [/'[^']*'/, 'string'],  // Single-quoted strings
          [/\b\d+\b/, 'number'],  // Numbers
          [/(true|false)/, 'keyword'],  // Booleans
        ],
      },
    });
  }, []);

  return (
    <Flex direction="column" overflowY="hidden" height='83vh'>
      <Flex direction="row" justifyContent="center" alignItems="center" py={1} height="auto">
        {selectedFile ? (
          <Box flex="1" py={2} px={2} borderBottom="1px" borderColor="gray.300">
          {selectedFile.path}
        </Box>
      ) : null}
      <Button fontSize="xs" fontWeight="normal" onClick={onSave} mr={2} bg='#a9b7ff' color='white' variant="solid" size="xs">Save File</Button>
      </Flex>

      <Box overflow="hidden" height="auto">
        {isLoadingCode ? (
          <Flex height="75vh" width="100%" align="center" justify="center" bg="gray.100">
            <Spinner size="xl" color="gray.500" />
          </Flex>
        ) : (
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
        )}
      </Box>

      <Box mb={0} maxHeight="30vh !important" minHeight="30vh !important">
        <Terminal 
          logs={terminalLogs} 
          clearLogs={clearLogs} 
          onRunCommand={onRunCommand} 
          isPolling={isPolling}
        />
      </Box>
    </Flex>
  );
};

export default React.memo(CodeEditor);
