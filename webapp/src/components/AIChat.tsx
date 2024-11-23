import { Box, Button, Flex, Textarea, VStack, Text, IconButton, Menu, MenuButton, MenuList, MenuItem, useToast, Select, Tooltip, Divider, Portal } from '@chakra-ui/react';
import { Copy } from 'lucide-react';
import { BsPaperclip } from "react-icons/bs";
import { ChevronUp, Plus, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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
  onSelectFile: (file: FileTreeItemType) => Promise<void>;
  files: FileTreeItemType[]; 
}

const CodeBlock = ({ children }: { children: string }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
  };

  return (
    <Flex direction="column" height="100% !important" zIndex={10} position="relative" p={4} bg="gray.100" color="black" borderRadius="md" fontSize="sm" fontFamily="Red Hat Display" border="1px" borderColor="red.200">
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

  /*
  useEffect(() => {
    console.log('projectContext: ', projectContext);
  }, [projectContext]);
  */

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setLocalSelectedFile(selectedFile);
  }, [selectedFile]);

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
    <Flex direction="column" minHeight="100%" maxHeight="100%" w="100%" p={2} pt={4} gap={2} fontSize="xs" justifyContent="space-between">
      <Box
        flex="1"
        flexGrow={1}
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

      <Flex w="100%" direction="row" justifyContent="space-between" alignItems="center" >
        <Flex direction="row" justifyContent="flex-start" alignItems="center" width="100%">
          <Box shadow="md">
            <Menu placement="auto">
              <MenuButton
                as={Button}
                size="xs"
                leftIcon={<Plus size={13} />}
                variant="ghost"
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
          </Box>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleCustomFileUpload}
          />
          <Box shadow="md" ml={2}>
            <Menu placement="auto">
              <MenuButton
                as={Button}
                size="xs"
                variant="ghost"
                leftIcon={<ChevronUp size={13} />}
              >
                <Text fontSize="xs" fontWeight="400">
                  {selectedModel}
                </Text>
              </MenuButton>
              <Portal>
                <MenuList zIndex={9999}>
                  <MenuItem
                    onClick={() => setSelectedModel('Codestral')}
                    sx={{
                      _hover: {
                        bg: 'blue.50',
                      },
                    }}
                  >
                    codestral
                  </MenuItem>

                  <Divider my={2} />

                  <Tooltip
                    label="Coming Soon"
                    fontSize="xs"
                    fontWeight="medium"
                    placement="top"
                    sx={{
                      bg: 'white',
                      color: '#5688e8',
                      mt: '4px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    <Box>
                      <MenuItem isDisabled _disabled={{ cursor: 'default', color: 'gray.500' }}>
                        gpt-4o
                      </MenuItem>
                      <MenuItem isDisabled _disabled={{ cursor: 'default', color: 'gray.500' }}>
                        claude 3.5 sonnet
                      </MenuItem>
                      <MenuItem isDisabled _disabled={{ cursor: 'default', color: 'gray.500' }}>
                        gpt-4o mini
                      </MenuItem>
                      <MenuItem isDisabled _disabled={{ cursor: 'default', color: 'gray.500' }}>
                        o1 mini
                      </MenuItem>
                      <MenuItem isDisabled _disabled={{ cursor: 'default', color: 'gray.500' }}>
                        o1 preview
                      </MenuItem>
                      <MenuItem isDisabled _disabled={{ cursor: 'default', color: 'gray.500' }}>
                        cursor small
                      </MenuItem>
                    </Box>
                  </Tooltip>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default AIChat;
