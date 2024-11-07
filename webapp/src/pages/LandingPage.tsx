import React, { useCallback, useEffect, useState, memo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container, Engine } from "@tsparticles/engine";
import { Input, Button, Flex, Box, Heading, Text, Link as ChakraLink } from "@chakra-ui/react";
//import logo from '../assets/brand/solai_logo_png.png';
import { Link as RouterLink } from 'react-router-dom';
import { FaXTwitter } from "react-icons/fa6";
import { IoSunnyOutline, IoMoonOutline, IoMoon } from "react-icons/io5"; 


const ParticlesContainer = memo(({ isDarkMode }: { isDarkMode: boolean }) => {
  const [ init, setInit ] = useState(false);

  useEffect(() => {
      initParticlesEngine(async (engine) => {
          await loadSlim(engine);
      }).then(() => {
          setInit(true);
      });
  }, []);

  const particlesLoaded = (container: any) => {
      console.log(container);
  };

  return (
    <div>  
      { init && <Particles
          id="tsparticles"
          particlesLoaded={async (container?: Container) => {
              console.log(container);
          }}
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
                      //resize: true,
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
                          //area: 800,
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
      />
      }
    </div>
  );
});



export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <ParticlesContainer isDarkMode={isDarkMode} />
      <Flex h="100vh" w="100vw" justifyContent="center" alignItems="center" p="4">
        <Flex
          direction="column" justifyContent="space-between"
          w="full" maxW="lg" h="lg" mx="auto" bg="whiteAlpha.800" backdropFilter="blur(10px)"
          rounded="lg" shadow="2xl" p="5" zIndex="10"
        >
          <Box textAlign="center" pt="6">
            <Heading as="h1" size="xl" mb="2" color="#7aa0ff" fontFamily="Oxanium" fontWeight="200" letterSpacing="0.2em">SOLAI</Heading>
            <Text color="gray.500">Solana development made easy</Text>
          </Box>

          <Flex w="full" direction="column" justifyContent="center" alignItems="center">
            <Flex justifyContent="center" w="full">
              <Button
                fontSize="sm"
                fontFamily="Oxanium"
                variant={activeTab === 'login' ? 'solid' : 'outline'}
                onClick={() => setActiveTab('login')}
                w="50%"
                bg={activeTab === 'login' ? "#ffffff" : "transparent"}
                color="gray.700"
                _hover={{ bg: "#ffffff" }}
              >
                Login
              </Button>
              <Button
                fontSize="sm"
                fontFamily="Oxanium"
                variant={activeTab === 'register' ? 'solid' : 'outline'}
                onClick={() => setActiveTab('register')}
                w="50%"
                bg={activeTab === 'register' ? "#ffffff" : "transparent"}
                color="gray.700"
                _hover={{ bg: "#ffffff" }}
              >
                Register
              </Button>
            </Flex>
            <Box mt="2" textAlign="center" w="full">
              {activeTab === 'login' ? (
                <Button 
                  w="full" size="md" fontSize="sm" fontFamily="Oxanium" fontWeight="300"
                  bg="#7292d3" color="white" _hover={{ bg: "#6690ff" }} alignItems="center"
                  p="4" 
                  as={RouterLink} to='/login'
                >
                  Login to Continue
                </Button>
              ) : (
                <Button 
                  w="full" size="md" fontSize="sm" fontFamily="Oxanium" fontWeight="300"
                  bg="#7292d3" color="white" _hover={{ bg: "#6690ff" }} alignItems="center"
                  p="4"
                  as={RouterLink} to='/register'
                >
                  Create Account
                </Button>
              )}
            </Box>
          </Flex>
          <Flex justifyContent="center" mt="4">
            <ChakraLink
              href="https://x.com/usesolai"
              color="gray.500"
              _hover={{ color: "#7292d3" }}
              display="flex"
              alignItems="center"
              gap="1"
            >
              <FaXTwitter className="text-sm" />
              <Text fontSize="sm" pb="1">@usesolai</Text>
            </ChakraLink>
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
}