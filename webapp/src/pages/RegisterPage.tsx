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

const RegisterPage: React.FC = () => {
  const [orgName, setOrgName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(orgName, username, password);
      toast({
        title: 'Registration successful',
        description: 'Please log in with your new account',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: 'Registration failed',
        description: 'Please try again',
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
          Register
        </Heading>
        <FormControl>
          <FormLabel>Organization Name</FormLabel>
          <Input
            type='text'
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
        </FormControl>
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
            Register
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default RegisterPage;
