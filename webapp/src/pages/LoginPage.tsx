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
  FormControl,
  FormLabel,
  Input,
  Flex,
  Heading,
  useToast
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, ArrowBackIcon } from '@chakra-ui/icons';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container } from "@tsparticles/engine";

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

const ParticlesContainer = memo(({ isDarkMode }: { isDarkMode: boolean }) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  return (
    <div>
      {init && <Particles
        id="tsparticles"
        options={{
          background: {
            color: {
              value: isDarkMode ? "#232734" : "#aac9fc",
            },
          },
          fpsLimit: 130,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "repulse",
              },
              onHover: {
                enable: true,
                mode: ["grab"],
              },
            },
            modes: {
              grab: {
                distance: 250,
              },
              bubble: {
                color: "#ffffff",
                distance: 400,
                duration: 5,
                opacity: 0.8,
                size: 6,
              },
              attract: {
                enable: true,
                distance: 1000,
              },
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.3,
              },
            },
          },
          particles: {
            color: {
              value: "#ffffff",
            },
            links: {
              color: "#ffffff",
              distance: 280,
              enable: true,
              opacity: 0.4,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: true,
              speed: 3,
              straight: false,
            },
            number: {
              density: {
                enable: true,
              },
              value: 50,
            },
            opacity: {
              value: 0.6,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 4, max: 6 },
            },
          },
          detectRetina: true,
        }}
      />}
    </div>
  );
});

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
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
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex h="100vh" w="100vw">
        <Flex
          w="50%"
          justifyContent="center"
          alignItems="center"
          p="4"
          bg={isDarkMode ? "#232734" : "#aac9fc"}
        >
          <ParticlesContainer isDarkMode={isDarkMode} />
        <Card
          w="full" maxW="lg" h="lg" mx="auto" bg="whiteAlpha.900" backdropFilter="blur(10px)"
          rounded="lg" shadow="2xl" p="5" zIndex="10" fontFamily="Red Hat Display"
        >
          <CardHeader textAlign="center" pt="6" position="relative">
            <Link to="/" className="absolute left-0 top-0 p-5">
              <ArrowBackIcon className="h-5 w-5 text-gray-600 hover:text-gray-800" />
            </Link>
            <Heading as="h1" size="md" mb="4" color="gray.700" fontWeight="400">Login</Heading>
            <Text fontSize="md" color="gray.500" >Enter your details to login to your account</Text>
          </CardHeader>
          <CardBody fontWeight="300" fontSize="xs">
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
                <FormLabel htmlFor="password" fontSize="md">Password</FormLabel>
                <Box className="relative flex flex-row gap-2 items-center">
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
                </Box>
              </Box>
              <Button 
                type="submit" 
                className="w-full text-white hover:opacity-90 px-4 py-2 rounded inline-block text-center"
                fontSize="md" letterSpacing="0.05em" fontFamily="Red Hat Display"
                py="5"
                bg="blue.300" color="white" _hover={{ bg: "blue.400" }}
              >
                Sign in
              </Button>
            </form>
          </CardBody>
          <CardFooter className="flex flex-wrap items-center justify-between gap-2">
            <Text className="text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary underline underline-offset-4">Forgot password?</a>
            </Text>
            <Text className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to='/register' className="hover:text-primary underline underline-offset-4 ml-2">Sign up</Link>
            </Text>
          </CardFooter>
        </Card>
      </Flex>
      <Flex w="50%" bg="white" zIndex="10" direction="column" justifyContent="center" alignItems="center">
        <Flex borderWidth="1px" borderColor="gray.400" w="80%" h="50%" bg="whiteAlpha.900" backdropFilter="blur(10px)" shadow="md" direction="column" justifyContent="center" alignItems="center">
          <VideoEmbed videoId="NbO50Rm8u6Q" />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default LoginPage;
