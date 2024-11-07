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
    if (!definedThemes.has('wechatLightStyle')) {
      monaco.editor.defineTheme('wechatLightStyle', {
        base: 'vs', // Use 'vs' for light mode
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },  // Green for comments
          { token: 'keyword', foreground: 'FF6188', fontStyle: 'bold' },     // Pink for keywords
          { token: 'variable', foreground: 'FF9E64' },                      // Orange for variables
          { token: 'string', foreground: 'A9DC76' },                        // Light green for strings
          { token: 'number', foreground: 'FD9353' },                        // Orange for numbers
          { token: 'type', foreground: '78DCE8' },                          // Cyan for types
          { token: 'function', foreground: 'AB9DF2', fontStyle: 'bold' },   // Purple for functions
          { token: 'identifier', foreground: '333333' },                    // Dark gray for identifiers
        ],
        colors: {
          'editor.foreground': '#333333',                  // Dark gray text
          'editor.background': '#FFFFFF',                  // Pure white background
          'editorCursor.foreground': '#333333',            // Dark gray cursor
          'editor.lineHighlightBackground': '#F3F3F3',     // Very light gray for line highlight
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
    monaco.editor.setTheme('monokaiProLight');
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
    console.log(`File path: ${path}, Language: plaintext (default)`);
    return 'plaintext';
  };

  useEffect(() => {
    if (selectedFile) {
      setCurrentFile(selectedFile);
      console.log(`Selected file: ${selectedFile.path}`);
      if (selectedFile.path) {
        const language = determineLanguage(selectedFile.path);
        setLanguage(language);
        console.log(`File path: ${selectedFile.path}, Language: ${language}`);
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
    <Flex direction="column" height="100%" overflowY="hidden">
      {selectedFile ? (
        <Box py={1} px={2} borderBottom="1px solid #ccc">
          {selectedFile.path}
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
