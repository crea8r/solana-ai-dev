import { Box, Button, Flex, Textarea, VStack, Text, IconButton, Menu, MenuButton, MenuList, MenuItem, useToast, Select, Tooltip, Divider, Portal } from '@chakra-ui/react';
import { Copy } from 'lucide-react';
import { BsPaperclip } from "react-icons/bs";
import { ChevronUp, Plus, X } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useProjectContext } from '../contexts/ProjectContext';
import { useCodeFiles } from '../contexts/CodeFileContext';
import { FileTreeItemType } from '../interfaces/file';
import { chatAI } from '../services/prompt'; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fileApi } from '../api/file';
import { taskApi } from '../api/task';

export interface AIMessageType {
  text: string;
  sender: 'ai' | 'user';
  files?: FileTreeItemType[];
}

interface AIChatProps {
  selectedFile?: FileTreeItemType;
  fileContent: string;
  onSelectFile: (file: FileTreeItemType) => void;
  files?: FileTreeItemType; 
}

const CodeBlock = ({ children }: { children: string }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
  };

  return (
    <Flex 
      direction="column" 
      height="100% !important" 
      zIndex={10} 
      position="relative"
      p={4} 
      bg="gray.100" 
      color="black" 
      borderRadius="md" 
      fontSize="sm" 
      fontFamily="Roboto Mono" 
      border="1px" 
      borderColor="gray.200"
      my={4}
     >
      <Button
        size="xs"
        fontSize="10px"
        fontFamily="Roboto Mono" 
        fontWeight="medium"
        position="absolute"
        top="4px"
        right="4px"
        onClick={handleCopy}
        colorScheme="blue"
        variant="ghost"
      >
        <Copy size={10} />
        <Text ml={1}>Copy</Text>
      </Button>
      <Text as="pre" fontSize="xs" whiteSpace="pre-wrap" overflowWrap="break-word" color="gray.600" fontFamily="Roboto Mono">
        {children}
      </Text>
    </Flex>
  );
};

const AIChat: React.FC<AIChatProps> = ({ selectedFile, fileContent, onSelectFile, files }) => {
  const [messages, setMessages] = useState<AIMessageType[]>([]);
  const [input, setInput] = useState('');
  const [localSelectedFile, setLocalSelectedFile] = useState<FileTreeItemType | undefined>(selectedFile);
  const [additionalFiles, setAdditionalFiles] = useState<FileTreeItemType[]>([]);
  const [selectedModel, setSelectedModel] = useState('Codestral');
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

  useEffect(() => {
    const savedMessages = sessionStorage.getItem('chatMessages');
    if (savedMessages) setMessages(JSON.parse(savedMessages));
  }, []);

  useEffect(() => {
    if (messages.length > 0) sessionStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const fetchFileContent = async (projectId: string, filePath: string): Promise<string> => {
    try {
      const data = await fileApi.getFileContent(projectId, filePath);
      return data.message;
    } catch (error) {
      console.error(`Error fetching content for ${filePath}:`, error);
      return 'Error loading content.';
    }
  };

  const sendMessage = async () => {
    if (input.trim()) {
      const selectedFiles = [localSelectedFile, ...additionalFiles].filter(
        (file): file is FileTreeItemType => Boolean(file)
      );

      setMessages([...messages, { text: input, sender: 'user', files: selectedFiles }]);
      setInput('');

      try {
        const messageWithContext = `User's Question: ${input}`;

        const fileTasks = await Promise.all(
          selectedFiles.map(async (file) => {
            if (file.path) {
              const taskResponse = await fileApi.getFileContent(projectContext.id, file.path);
              return { filePath: file.path, taskId: taskResponse.taskId };
            }
            return null;
          })
        );

        const fetchContent = async (taskId: string): Promise<string> => {
          while (true) {
            const { task } = await taskApi.getTask(taskId);
            if (task.status === 'succeed') return task.result || 'No content available';
            if (task.status === 'failed') throw new Error('Failed to fetch file content');
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        };

        const fileContexts = await Promise.all(
          fileTasks.map(async (fileTask) => {
            if (fileTask) {
              const content = await fetchContent(fileTask.taskId);
              return {
                path: fileTask.filePath,
                content: content || 'No content available',
              };
            }
            return { path: 'Unknown path', content: 'No content available' };
          })
        );

        const response = await chatAI(messageWithContext, fileContexts);
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

  const allFiles = files ? getAllFiles([files]) : [];

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
    <Flex 
      direction="column" 
      flexGrow={1}
      height="100%" 
      width="100%" 
      overflow="hidden"
      gap={2} 
      fontSize="xs" 
      justifyContent="space-between"
      p={4}
    >
      <Box
        flex="1"
        flexGrow={1}
        w="100%"
        overflowY="auto"
        p={2}
        sx={{
          '::-webkit-scrollbar': { width: '8px' },
          '::-webkit-scrollbar-thumb': { backgroundColor: '#888', borderRadius: '10px' },
          '::-webkit-scrollbar-thumb:hover': { backgroundColor: '#555' },
          '::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1', borderRadius: '10px' },
        }}
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
      >
        {messages.map((message, index) => (
          <Flex 
            flex="1"
            key={index} 
            justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
            alignItems="center"
            mb={2}
          >
            <Box 
              bg={message.sender === 'user' ? 'rgba(114, 146, 211, 0.2)' : 'gray.50'} 
              color={message.sender === 'user' ? 'gray.600' : 'gray.700'}
              p={2}
              py={0}
              borderRadius="md" 
              display="inline-block"
              maxWidth="80%"
            >
              {message.sender === 'user' && message.files && (
                <Box mb={1}>
                  <Flex wrap="wrap" gap={1} mt={3}>
                    {message.files.map(file => (
                      <Box 
                        key={file.path}
                        px={2}
                        py={1}
                        mb={1}
                        bg="rgba(114, 146, 211, 0.4)" 
                        color="gray.600"
                        width="fit-content"
                        borderRadius="md" 
                        fontSize="0.75rem"
                        fontWeight="500"
                      >
                        {file.name}
                      </Box>
                    ))}
                  </Flex>
                </Box>
              )}
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
                  p: ({ node, ...props }) => (
                    <Box mb={4}>
                      <Text lineHeight="1.8" {...props} />
                    </Box>
                  ),
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
            <Flex alignItems="center" p={1} border="1px solid" borderColor="gray.200" bg="white" borderRadius="md">
              <Text fontSize="xs" fontWeight="500">{localSelectedFile.name}</Text>
              <IconButton
                size="xs"
                aria-label="Remove default file"
                icon={<X size={10} />}
                onClick={() => setLocalSelectedFile(undefined)}
                variant="ghost"
                bg="white"
              />
            </Flex>
          )}
          {additionalFiles.map((file) => (
            <Flex key={file.path} alignItems="center" p={1} borderRadius="sm" border="1px solid" borderColor="gray.200" bg="white">
              <Text fontSize="xs" fontWeight="500">{file.name}</Text>
              <IconButton
                size="xs"
                aria-label="Remove additional file"
                icon={<X size={10} />}
                onClick={() => removeFile(file.path ?? '')}
                variant="ghost"
                bg="white"
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
          bg="white"
        />
      </Flex>

      <Flex w="100%" direction="row" justifyContent="space-between" alignItems="center" >
        <Flex direction="row" justifyContent="flex-start" alignItems="center" width="100%">
            <Menu placement="auto">
              <MenuButton
                as={Button}
                size="xs"
                leftIcon={<Plus size={13} />}
                variant="ghost"
                bg="white"
              />
              <Portal>
                <MenuList
                  zIndex={9999}
                  maxHeight="70vh"
                  overflowY="auto"
                  shadow="2xl"
                  sx={{
                    maxWidth: '70vw',
                  }}
                >
                  <MenuItem
                    icon={<BsPaperclip />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      _hover: {
                        bg: 'blue.50',
                      },
                    }}
                  >
                    Upload Custom File
                  </MenuItem>
                  {allFiles.map((file) => (
                    <MenuItem
                      key={file.path}
                      onClick={() => handleFileSelect(file)}
                      sx={{
                        _hover: {
                          bg: 'blue.50',
                        },
                      }}
                    >
                      <Flex justify="space-between" w="100%">
                        <Text fontWeight="medium" fontSize="sm">
                          {file.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {file.path}
                        </Text>
                      </Flex>
                    </MenuItem>
                  ))}
                </MenuList>
              </Portal>
            </Menu>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleCustomFileUpload}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default React.memo(AIChat);
