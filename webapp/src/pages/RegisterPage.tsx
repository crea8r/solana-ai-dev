import React, { useState, useEffect, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Text,
  Button,
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormLabel,
  Input,
  Flex,
  Heading,
  useToast
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useAuthContext } from '../contexts/AuthContext';
import ParticlesContainer from './ParticlesContainer';


const RegisterPage: React.FC = () => {
  const { setUser } = useAuthContext();
  const toast = useToast();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [codeError, setCodeError] = useState(''); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [code, setCode] = useState('');
  const [openAiApiKey, setOpenAiApiKey] = useState('');
  const [openAiApiKeyError, setOpenAiApiKeyError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCodeError('');
    setOpenAiApiKeyError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const response = await register(orgName, username, password, code, openAiApiKey);

      if (response.success === false) {
        if (response.message === 'Invalid registration code') {
          setCodeError('Invalid registration code');
          toast({
            title: 'Invalid Registration Code',
            description: 'The registration code you entered is invalid. Please check and try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else if (response.message === 'Registration code is required') {
          setCodeError('Registration code is required');
          toast({
            title: 'Registration Code Required',
            description: 'Please enter a registration code to create an account.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else {
          setError(response.message || 'Failed to create an account. Please try again.');
        }
        return;
      }

      setUser((prev) => {
        if (!prev) {
          return {
            id: response.user.id,
            username: response.user.username,
            org_id: '',
            orgName: orgName,
            walletCreated: false,
            hasViewedWalletModal: false,
            openAiApiKey: openAiApiKey,
          };
        }
    
        return {
          ...prev,
          id: response.user.id,
        };
      });
      navigate('/login');
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Failed to create an account. Please try again.');
    }
  };

  return (
    <Flex 
      h="100vh" w="100vw"
      bgGradient="linear(to-b, blue.900, #80a3ff)"
      justifyContent="center"
      alignItems="center"
    >
        <ParticlesContainer isDarkMode={isDarkMode} />  
        <Card
          w="full"
          maxW="lg"
          h="lg"
          mx="auto"
          bg="whiteAlpha.900"
          backdropFilter="blur(10px)"
          rounded="lg"
          shadow="2xl"
          p="5"
          zIndex="10"
        >
          <CardHeader textAlign="center" pt="6" position="relative">
            <Link to="/landing" className="absolute left-0 top-0 p-5">
              <ArrowBackIcon className="h-5 w-5 text-gray-600 hover:text-gray-800" />
            </Link>
            <Flex direction="column" justifyContent="center" alignItems="center" gap="2">
              <Heading as="h1" size="md" color="gray.700" fontWeight="400">Create an account</Heading>
              <Text size="md" color="gray.500">Enter your details to create an account</Text>
            </Flex>
          </CardHeader>
          <Box overflowY="auto" maxHeight="60vh" p="4">
            <CardBody fontWeight="300">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Box className="space-y-2">
                  <FormLabel htmlFor="username" fontSize="md">Username</FormLabel>
                  <Input 
                    id="username" 
                    type="text" 
                    required 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                  />
                </Box>
                <Box className="space-y-2">
                  <FormLabel htmlFor="orgName" fontSize="md">Organization Name</FormLabel>
                  <Input 
                    id="orgName" 
                    type="text" 
                    required 
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    autoComplete="off"
                  />
                </Box>
                <Box className="space-y-2">
                  <FormLabel htmlFor="password" fontSize="md">Password</FormLabel>
                  <Box className="relative flex flex-row items-center gap-2">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="off"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      fontWeight="300"
                    >
                      {showPassword ? (
                        <ViewOffIcon className="h-8 w-8" color="blue.500"/>
                      ) : (
                        <ViewIcon className="h-8 w-8" color="blue.500"/>
                      )}
                    </Button>
                  </Box>
                </Box>
                <Box className="space-y-2">
                  <FormLabel htmlFor="confirm-password" fontSize="md">Confirm Password</FormLabel>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="off"
                  />
                </Box>
                <Box className="space-y-2">
                  <FormLabel htmlFor="code" fontSize="md">Beta Registration Code</FormLabel>
                  <Input
                    id="code"
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    isInvalid={!!codeError}
                    errorBorderColor="red.500"
                    autoComplete="off"
                  />
                  {codeError && <Text color="red.500" fontSize="sm">{codeError}</Text>}
                </Box>
                <Box className="space-y-2">
                  <FormLabel htmlFor="openAiApiKey" fontSize="md">OpenAI API Key</FormLabel>
                  <Input
                    id="openAiApiKey"
                    type="text"
                    required
                    value={openAiApiKey}
                    onChange={(e) => setOpenAiApiKey(e.target.value)}
                    isInvalid={!!openAiApiKeyError}
                    errorBorderColor="red.500"
                    autoComplete="off"
                  />
                  {openAiApiKeyError && <Text color="red.500" fontSize="sm">{openAiApiKeyError}</Text>}
                </Box>
                {error && <Text color="red.500">{error}</Text>}
                <Button
                  type="submit"
                  w="full"
                  py="5"
                  bg="blue.300"
                  color="white"
                  _hover={{ bg: 'blue.400' }}
                >
                  Create account
                </Button>
              </form>
            </CardBody>
          </Box>
          <CardFooter>
            <Text className="text-center text-muted-foreground w-full" fontSize="sm" letterSpacing="0.05em">
              Already have an account?{' '}
              <Link to='/login' className="hover:text-primary underline underline-offset-4">Sign in</Link>
            </Text>
          </CardFooter>
        </Card>
    </Flex>
  );
};

export default RegisterPage;