import { Box, Button, Flex, Input, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { useProjectContext } from '../contexts/ProjectContext';
import { useCodeFiles } from '../contexts/CodeFileContext';

export interface AIMessageType {
  text: string;
  sender: 'ai' | 'user';
}

const AIChat = () => {
  const [messages, setMessages] = useState<AIMessageType[]>([]);
  const [input, setInput] = useState('');
  const { projectContext } = useProjectContext();
  const { codeFiles } = useCodeFiles();
  //console.log('project: ', projectContext);
  //console.log('codeFiles: ', codeFiles);

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
      // Here you would typically send the message to an AI service and get a response
      // For now, we'll just mock a response
      setTimeout(() => {
        setMessages((messages) => [
          ...messages,
          {
            text: "I'm an AI assistant. How can I help you with your code?",
            sender: 'ai',
          },
        ]);
      }, 1000);
    }
  };

  return (
    <VStack h='100vh' spacing={4}>
      <Box
        flex={1}
        w='100%'
        overflowY='auto'
        bg='gray.100'
        p={4}
        borderRadius='md'
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            bg={message.sender === 'user' ? 'blue.100' : 'green.100'}
            p={2}
            borderRadius='md'
            mb={2}
          >
            {message.text}
          </Box>
        ))}
      </Box>
      <Flex w='100%'>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Ask AI for help...'
        />
        <Button onClick={sendMessage} ml={2}>
          Send
        </Button>
      </Flex>
    </VStack>
  );
};

export default AIChat;
