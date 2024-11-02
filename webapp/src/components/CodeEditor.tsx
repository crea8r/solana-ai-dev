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
  clearLogs: () => void;
  onChange: (newContent: string) => void;
  onSave: () => void;
  onRunCommand: (commandType: 'anchor clean' | 'cargo clean') => void;
};

const CodeEditor = ({
  content,
  selectedFile,
  terminalLogs,
  clearLogs,
  onChange,
  onSave,
  onRunCommand,
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
    minimap: { enabled: false }
  };

  useEffect(() => {
    if (!definedThemes.has('materialLighterHighContrast')) {
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
      definedThemes.add('materialLighterHighContrast');
    }
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
    if (!currentFile && selectedFile) {
      setCurrentFile(selectedFile);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (currentFile?.path) {
      const uri = monaco.Uri.parse(`file:///${currentFile.path}`);
      let model = monaco.editor.getModel(uri);
      
      // Dispose of the old model if it exists
      if (editorRef.current?.getModel() !== model) {
        editorRef.current?.getModel()?.dispose();
      }

      if (!model) {
        model = monaco.editor.createModel(content, language, uri);
      } else if (model.getValue() !== content) {
        model.setValue(content);
      }

      editorRef.current?.setModel(model);
    }
  }, [currentFile]);

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
    monaco.editor.setTheme('materialLighterHighContrast');
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

  return (
    <Flex direction="column" height="100%" overflowY="hidden">
      {currentFile ? (
        <Box py={1} px={2} borderBottom="1px solid #ccc">
          {currentFile.path}
        </Box>
      ) : null}

      <Box flex="4" overflow="hidden">
        <MonacoEditor
          height="75vh"
          width="100%"
          language={language}
          theme="materialLighterHighContrast"
          value={content}
          options={options}  // Ensure options are correctly typed
          editorDidMount={editorDidMount}
          onChange={handleEditorChange}
        />
      </Box>

      <Box flex="1" mb={2}>
        <Terminal logs={terminalLogs} clearLogs={clearLogs} onRunCommand={onRunCommand} />
      </Box>
    </Flex>
  );
};

export default CodeEditor;
