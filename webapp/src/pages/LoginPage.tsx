import React, { useState, useEffect, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Text,
  Button,
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Heading,
  useToast
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useAuth } from '../hooks/useAuth';
import { login } from '../services/authApi';
import ParticlesContainer from './ParticlesContainer';
import landingPageTheme from '../theme';

const bgGradient = landingPageTheme.colors.brand.landingPageBgGradient;

const style: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  display: "block",
  borderWidth: "2px",
  borderColor: "white"
};

const VideoEmbed = ({ videoId }: { videoId: string }) => {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1`;

  return (
    <div style={style}>
      <iframe
        width="100%"
        height="100%"
        src={embedUrl}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
      />
    </div>
  );
};

const LoginPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password, setUser); // change
      navigate('/design');
    } catch (error) {
      console.error('Login failed:', error);
      
      toast({
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
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
              <Heading as="h1" size="md" mb="4" color="gray.700" fontWeight="400">Login</Heading>
            <Text fontSize="sm" color="gray.500" >Enter your details to login to your account</Text>
          </CardHeader>
          <CardBody fontWeight="300" fontSize="xs" fontFamily="IBM Plex Mono">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Box className="space-y-2" pb="2">
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
              <Box className="space-y-2" pb="2">
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
              <Flex justifyContent="center" alignItems="center" py="5" px="2">
                <Button 
                  type="submit" 
                  className="w-full text-white hover:opacity-90 px-4 py-2 rounded inline-block text-center"
                  fontSize="sm" letterSpacing="0.05em" fontFamily="IBM Plex Mono"
                  py="5"
                  width="100%"
                  bg="blue.300" color="white" _hover={{ bg: "blue.400" }}
                >
                  <Text fontSize="xs">Sign in</Text>
                </Button>
              </Flex>
            </form>
          </CardBody>
          <CardFooter className="flex flex-wrap items-center justify-between gap-2">
            <Flex width="full" direction="row" gap="2" justifyContent="space-between" alignItems="center" px="2">
              <Text className="text-sm text-muted-foreground" fontSize="xs">
                <a href="#" className="hover:text-primary underline underline-offset-4">Forgot password?</a>
              </Text>
              <Flex 
                direction="row" 
                alignItems="center" 
                justifyContent="flex-end" 
                wrap="nowrap" 
                whiteSpace="nowrap"
                gap="2"
              >
                <Text className="text-sm text-muted-foreground" fontSize="xs" display="inline">
                  Don't have an account?{' '}
                </Text>
                <Link to='/register' className="hover:text-primary underline underline-offset-4 ml-2" >
                  <Text fontSize="xs" color="blue.300">Sign up</Text>
                </Link>
              </Flex>
            </Flex>
          </CardFooter>
        </Card>
    </Flex>
  );
};

export default LoginPage;
