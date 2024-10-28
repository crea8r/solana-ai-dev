import { Box, Button, Flex, Input, VStack, Text, IconButton } from '@chakra-ui/react';
import { BsPaperclip } from "react-icons/bs";
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useProjectContext } from '../contexts/ProjectContext';
import { useCodeFiles } from '../contexts/CodeFileContext';
import { FileTreeItemType } from '../components/FileTree';
import { chatAI } from '../services/prompt'; 

export interface AIMessageType {
  text: string;
  sender: 'ai' | 'user';
}

interface AIChatProps {
  selectedFile?: FileTreeItemType;
  fileContent: string;
  onClearSelectedFile: () => void;
  onSelectFile: () => void; 
}

const AIChat: React.FC<AIChatProps> = ({ selectedFile, fileContent, onClearSelectedFile, onSelectFile }) => {
  const [messages, setMessages] = useState<AIMessageType[]>([]);
  const [input, setInput] = useState('');
  const { projectContext } = useProjectContext();
  const { codeFiles } = useCodeFiles();

  const sendMessage = async () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');

      try {
        const messageWithContext = `User's Question: ${input}`;
        
        const fileContext = selectedFile && selectedFile.path !== undefined
          ? { path: selectedFile.path, content: fileContent }
          : undefined;

        const response = await chatAI(messageWithContext, fileContext);

        setMessages((messages) => [
          ...messages,
          {
            text: response,
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

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <VStack h="90vh" spacing={4} fontSize='xs' p={2}>
      <Box flex={1} h="100%" w="100%" overflowY="auto" bg="gray.50" p={4} borderRadius="md" >
        {messages.map((message, index) => (
          <Flex 
            key={index} 
            justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
            mb={2}
          >
            <Box 
              bg={message.sender === 'user' ? 'blue.100' : 'green.100'} 
              p={2} 
              borderRadius="md" 
              display="inline-block"
              maxWidth="80%"
            >
              {message.text}
            </Box>
          </Flex>
        ))}
      </Box>

      <Flex direction="row" justifyContent="flex-start" alignItems="center" gap={2} width='100%'>
        <Button
          size="sm"
          variant="ghost"
          onClick={onSelectFile}
          m={0}
          p={1}
          borderRadius="sm"
          border="1px"
          borderColor="gray.200"
        >
          <Plus size={14} />
        </Button>

        {selectedFile && (
          <Flex alignItems="center" bg="gray.100" p={1} borderRadius="sm" justifyContent="space-between" mb={1}>
            <Text fontSize="xs" color="gray.700" fontWeight="500" p={0} m={0}>
              {selectedFile.name}
            </Text>
            <IconButton
              size="xs"
              aria-label="Clear selected file"
              icon={<X size={12} />}
              onClick={onClearSelectedFile}
              variant="ghost"
              m={0}
              p={0}
            />
          </Flex>
        )}
      </Flex>

      <Flex w="100%" justifyContent="space-between" alignItems="center" gap={2}>
        <BsPaperclip size={26} />
        <Input 
          fontSize='xs' 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Message AI" 
          onKeyPress={handleKeyPress}
        />
        <Button onClick={sendMessage} ml={2} fontSize='xs'>
          Send
        </Button>
      </Flex>
    </VStack>
  );
};

export default AIChat;
