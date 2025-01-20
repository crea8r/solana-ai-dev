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
import landingPageTheme from "../theme";

const bgGradient = landingPageTheme.colors.brand.landingPageBgGradient;



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
      direction="column"
      justifyContent="center"
      alignItems="center"
      fontFamily="IBM Plex Mono"
      bgGradient={bgGradient}
    >
        <ParticlesContainer isDarkMode={isDarkMode} />  
        <Card
          w="full" maxW="lg" h="lg" mx="auto" bg="rgba(255, 255, 255, 0.9)"
          rounded="lg" shadow="2xl" p="5" zIndex="10"
          fontFamily="IBM Plex Mono"
        >
          <CardHeader textAlign="center" pt="6" position="relative" fontFamily="IBM Plex Mono">
            <Flex justifyContent="flex-start" alignItems="center" px="5">
              <Link to="/landing" className="absolute left-0 top-0 p-5">
                <ArrowBackIcon color="gray.800" className="h-7 w-7"/>
              </Link>
            </Flex>
            <Heading as="h1" size="md" mb="4" color="gray.700" fontWeight="400">Create an account</Heading>
            <Text fontSize="sm" color="gray.500">Enter your details to create an account</Text>
          </CardHeader>
          <Box overflowY="auto" maxHeight="60vh" p="4">
            <CardBody fontWeight="300" fontSize="xs" fontFamily="IBM Plex Mono" w="full">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Box className="space-y-2" mb="2">
                  <FormLabel htmlFor="username" fontSize="sm" fontWeight="normal">Username</FormLabel>
                  <Input 
                    id="username" 
                    type="text" 
                    required 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                  />
                </Box>
                <Box className="space-y-2" mb="2">
                  <FormLabel htmlFor="orgName" fontSize="sm" fontWeight="normal">Organization Name</FormLabel>
                  <Input 
                    id="orgName" 
                    type="text" 
                    required 
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    autoComplete="off"
                  />
                </Box>
                <Box className="space-y-2" mb="2">
                  <FormLabel htmlFor="password" fontSize="sm" fontWeight="normal">Password</FormLabel>
                  <Flex direction="row" gap="2" alignItems="center">
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
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center border-none shadow-none bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <ViewOffIcon className="h-5 w-5" />
                      ) : (
                        <ViewIcon className="h-5 w-5" />
                      )}
                    </Button>
                  </Flex>
                </Box>
                <Box className="space-y-2" mb="2">
                  <FormLabel htmlFor="confirm-password" fontSize="sm" fontWeight="normal">Confirm Password</FormLabel>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="off"
                  />
                </Box>
                <Box className="space-y-2" mb="2">
                  <FormLabel htmlFor="code" fontSize="sm" fontWeight="normal">Beta Registration Code</FormLabel>
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
                <Box className="space-y-2" mb="2">
                  <FormLabel htmlFor="openAiApiKey" fontSize="sm" fontWeight="normal">OpenAI API Key</FormLabel>
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
                <Flex justifyContent="center" alignItems="center" py="5" px="2">
                  <Button
                    type="submit"
                    className="w-full text-white hover:opacity-90 px-4 py-2 rounded inline-block text-center"
                    fontSize="sm" letterSpacing="0.05em" fontFamily="IBM Plex Mono"
                    py="5"
                    width="100%"
                    bg="blue.300" color="white" _hover={{ bg: "blue.400" }}
                  >
                    <Text fontSize="xs">Create account</Text>
                  </Button>
                </Flex>
              </form>
            </CardBody>
          </Box>
          <CardFooter className="flex flex-wrap items-center justify-center gap-2" w="full" p="6">
            <Text className="text-center text-muted-foreground w-full" fontSize="xs" letterSpacing="0.05em">
              Already have an account?{' '}
              <Link to='/login' className="hover:text-primary underline underline-offset-4">
                <Text fontSize="xs" fontWeight="normal" color="blue.300" display="inline">Sign in</Text>
              </Link>
            </Text>
          </CardFooter>
        </Card>
    </Flex>
  );
};

export default RegisterPage;