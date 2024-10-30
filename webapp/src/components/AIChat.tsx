import { Box, Button, Flex, Textarea, VStack, Text, IconButton, Menu, MenuButton, MenuList, MenuItem, useToast, Select } from '@chakra-ui/react';
import { Copy } from 'lucide-react';
import { BsPaperclip } from "react-icons/bs";
import { ChevronUp, Plus, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useProjectContext } from '../contexts/ProjectContext';
import { useCodeFiles } from '../contexts/CodeFileContext';
import { FileTreeItemType } from '../components/FileTree';
import { chatAI } from '../services/prompt'; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface AIMessageType {
  text: string;
  sender: 'ai' | 'user';
}

interface AIChatProps {
  selectedFile?: FileTreeItemType;
  fileContent: string;
  onSelectFile: (file: FileTreeItemType) => Promise<void>;
  files: FileTreeItemType[]; 
}

const CodeBlock = ({ children }: { children: string }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
  };

  return (
    <Box position="relative" p={4} bg="gray.100" color="black" borderRadius="md" fontSize="sm" fontFamily="monospace">
      <Button
        size="xs"
        position="absolute"
        top="4px"
        right="4px"
        onClick={handleCopy}
        leftIcon={<Copy size={12} />}
        colorScheme="blue"
        variant="ghost"
      >
        Copy
      </Button>
      <Text as="pre" fontSize="xs" whiteSpace="pre-wrap" overflowWrap="break-word">
        {children}
      </Text>
    </Box>
  );
};

const AIChat: React.FC<AIChatProps> = ({ selectedFile, fileContent, onSelectFile, files }) => {
  const [messages, setMessages] = useState<AIMessageType[]>([]);
  const [input, setInput] = useState('');
  const [localSelectedFile, setLocalSelectedFile] = useState<FileTreeItemType | undefined>(selectedFile);
  const [additionalFiles, setAdditionalFiles] = useState<FileTreeItemType[]>([]);
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const { projectContext } = useProjectContext();
  const { codeFiles } = useCodeFiles();
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setLocalSelectedFile(selectedFile);
  }, [selectedFile]);

  const sendMessage = async () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');

      try {
        const messageWithContext = `User's Question: ${input}`;
        
        const fileContexts = [
          { path: localSelectedFile?.path || '', content: fileContent },
          ...additionalFiles.map((file) => ({
            path: file.path || '',
            content: 'Content not loaded',
          }))
        ];

        const response = await chatAI(messageWithContext, fileContexts, selectedModel);
        const responseText = await response;

        setMessages((messages) => [
          ...messages,
          {
            text: responseText,
            sender: 'ai',
          },
        ]);
      } catch (error) {
        console.error('Failed to send message to AI:', error);
        setMessages((messages) => [
          ...messages,
          { text: 'Failed to get a response from AI.', sender: 'ai' },
        ]);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      sendMessage();
      event.preventDefault(); 
    }
  };

  const handleFileSelect = (file: FileTreeItemType) => {
    if (!additionalFiles.find(f => f.path === file.path)) {
      setAdditionalFiles([...additionalFiles, file]);
    }
  };

  const removeFile = (path: string) => {
    setAdditionalFiles((prevFiles) => prevFiles.filter((file) => file.path !== path));
  };

  const getAllFiles = (nodes: FileTreeItemType[], basePath = ''): FileTreeItemType[] => {
    let allFiles: FileTreeItemType[] = [];
    nodes.forEach(node => {
      const currentPath = `${basePath}/${node.name}`;
      if (node.type === 'file') {
        allFiles.push({ ...node, path: currentPath });
      } else if (node.type === 'directory' && node.children) {
        allFiles = allFiles.concat(getAllFiles(node.children, currentPath));
      }
    });
    return allFiles;
  };

  const allFiles = getAllFiles(files);

  const handleCustomFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newFile: FileTreeItemType = {
        name: file.name,
        path: `custom/${file.name}`,
        type: 'file',
      };
      setAdditionalFiles([...additionalFiles, newFile]);
      toast({
        title: "File added",
        description: `${file.name} has been added to the chat context.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex direction="column" maxHeight="100%" w="100%" p={2} pt={4} gap={6} fontSize="xs" justifyContent="space-between">
      <Box
        flex="1"
        flexGrow={1}
        flexShrink={0}
        minHeight="60vh !important"
        maxHeight="60vh !important"
        w="100%"
        overflowY="auto"
        p={4}
        borderRadius="md"
        sx={{
          '::-webkit-scrollbar': { width: '8px' },
          '::-webkit-scrollbar-thumb': { backgroundColor: '#888', borderRadius: '10px' },
          '::-webkit-scrollbar-thumb:hover': { backgroundColor: '#555' },
          '::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1', borderRadius: '10px' },
        }}
      >
        {messages.map((message, index) => (
          <Flex 
            flex="1"
            key={index} 
            justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
            mb={2}
          >
            <Box 
              bg={message.sender === 'user' ? 'blue.100' : 'gray.50'} 
              p={2} 
              borderRadius="md" 
              display="inline-block"
              maxWidth="80%"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const isInline = !className;
                    return isInline ? (
                      <Text as="code" bg="gray.200" p={1} borderRadius="md" {...props}>
                        {children}
                      </Text>
                    ) : (
                      <CodeBlock>{String(children).trim()}</CodeBlock>
                    );
                  },
                }}
              >
                {message.text}
              </ReactMarkdown>
            </Box>
          </Flex>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Flex w="100%" direction="column" gap={2} mt={4}>
        <Flex direction="row" wrap="wrap" gap={2} alignItems="center">
          {localSelectedFile && (
            <Flex alignItems="center" bg="gray.50" p={1} borderRadius="sm">
              <Text fontSize="xs" fontWeight="500">{localSelectedFile.name}</Text>
              <IconButton
                size="xs"
                aria-label="Remove default file"
                icon={<X size={10} />}
                onClick={() => setLocalSelectedFile(undefined)}
                variant="ghost"
              />
            </Flex>
          )}
          {additionalFiles.map((file) => (
            <Flex key={file.path} alignItems="center" bg="gray.50" p={1} borderRadius="sm">
              <Text fontSize="xs" fontWeight="500">{file.name}</Text>
              <IconButton
                size="xs"
                aria-label="Remove additional file"
                icon={<X size={10} />}
                onClick={() => removeFile(file.path ?? '')}
                variant="ghost"
              />
            </Flex>
          ))}
        </Flex>
        <Textarea 
          fontSize="xs" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Message AI" 
          onKeyPress={handleKeyPress}
          resize="none"
        />
      </Flex>

      <Flex w="100%" direction="row" justifyContent="space-between" alignItems="center" gap={2} px={4}>
        <Flex direction="row" justifyContent="flex-start" alignItems="center" gap={2} width="100%">
          <Menu>
            <MenuButton as={Button} size="xs" leftIcon={<Plus size={12} />} />
            <MenuList>
              <MenuItem icon={<BsPaperclip />} onClick={() => fileInputRef.current?.click()}>
                Upload Custom File
              </MenuItem>
              {allFiles.map((file) => (
                <MenuItem key={file.path} onClick={() => handleFileSelect(file)}>
                  <Flex justify="space-between" w="100%">
                    <Text fontWeight="bold" fontSize="sm">{file.name}</Text>
                    <Text fontSize="xs" color="gray.500">{file.path}</Text>
                  </Flex>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleCustomFileUpload}
          />

          <Select
              size="sm"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              mb={2}
            >
              <option value="GPT-4o">GPT-4o</option>
              <option value="Codestral">Codestral</option>
          </Select>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default AIChat;
