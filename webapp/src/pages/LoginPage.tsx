import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  HStack,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Link as RouterLink } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/design');
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'Login failed',
        description: 'Please check your username and password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      height='100vh'
      display='flex'
      alignItems='center'
      justifyContent='center'
    >
      <VStack as='form' onSubmit={handleSubmit} spacing={4} width='300px'>
        <Heading as='h1' size='xl'>
          Login
        </Heading>
        <FormControl>
          <FormLabel>Username</FormLabel>
          <Input
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        <HStack spacing={4} width='100%'>
          <IconButton
            as={RouterLink}
            to='/'
            colorScheme='blue'
            icon={<FaChevronLeft />}
            aria-label='back'
          />
          <Button type='submit' colorScheme='blue' width='100%'>
            Login
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default LoginPage;
