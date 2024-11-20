import React, { useCallback, useEffect, useState, memo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container, Engine } from "@tsparticles/engine";
import { Input, Button, Flex, Box, Heading, Text, Link as ChakraLink, Img } from "@chakra-ui/react";
//import logo from '../assets/brand/solai_logo_png.png';
import { Link as RouterLink } from 'react-router-dom';
import { FaXTwitter } from "react-icons/fa6";
import { IoSunnyOutline, IoMoonOutline, IoMoon } from "react-icons/io5"; 
import solai_name from '../assets/brand/solai_name.png';

const style: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  display: "block",
  borderWidth: "2px",
  borderColor: "white"
};

const iframeStyle: React.CSSProperties = {
  position: "absolute",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

// VideoEmbed Component
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

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      
      <Flex h="100vh" w="100vw">
        <Flex
          w="50%"
          justifyContent="center"
          alignItems="center"
          p="4"
          bg={isDarkMode ? "#232734" : "#aac9fc"}
        >
          <ParticlesContainer isDarkMode={isDarkMode} />
          <Flex
            direction="column"
            justifyContent="space-evenly"
            alignItems="center"
            gap="4"
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
            <Flex direction="row" justifyContent="center" alignItems="center" gap="0">
            <Img src={solai_name} alt="Solai" w="auto" h="4.6rem" />
            <Flex direction="column" justifyContent="flex-start" alignItems="center" textAlign="left" height="100%" pt="2">
                <Box bg="gray.100" rounded="md" px="1">
                  <Text fontSize="xs" fontWeight="300" letterSpacing="0.05em" fontFamily="Red Hat Display" color="gray.500" px="1" py="0">
                    BETA 
                  </Text>
                </Box>
              </Flex>
            </Flex>

            <Flex w="80%" direction="column" justifyContent="center" alignItems="center">
              <Flex justifyContent="space-between" alignItems="center" w="full" gap="2">
                <Button
                  fontSize="md" letterSpacing="0.05em" fontFamily="Red Hat Display"
                  borderColor="gray.200"
                  borderWidth="1px"
                  onClick={() => setActiveTab("login")}
                  w="50%"
                  bg={activeTab === "login" ? "#ffffff" : "transparent"}
                  color="gray.700"
                  _hover={{ bg: "#ffffff" }}
                >
                  Login
                </Button>
                <Button
                  fontSize="md" letterSpacing="0.05em" fontFamily="Red Hat Display"
                  borderColor="gray.200"
                  borderWidth="1px"
                  onClick={() => setActiveTab("register")}
                  w="50%"
                  bg={activeTab === "register" ? "#ffffff" : "transparent"}
                  color="gray.700"
                  _hover={{ bg: "#ffffff" }}
                >
                  Register
                </Button>
              </Flex>
              <Box mt="2" textAlign="center" w="full">
                {activeTab === "login" ? (
                  <Button 
                    w="full" size="lg" fontSize="md" fontWeight="400" letterSpacing="0.05em" fontFamily="Red Hat Display"
                    bg="blue.300" color="white" _hover={{ bg: "blue.400" }} alignItems="center"
                    py="5" mt="2"
                    as={RouterLink} to='/login'
                  >
                    Login to Continue
                  </Button>
                ) : (
                  <Button 
                    w="full" size="lg" fontSize="md" fontWeight="400" letterSpacing="0.05em" fontFamily="Red Hat Display"
                    bg="blue.300" color="white" _hover={{ bg: "blue.400" }} alignItems="center"
                    py="5" mt="2"
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
        <Flex w="50%" bg="white" zIndex="10" direction="column" justifyContent="center" alignItems="center">
          <Flex borderWidth="1px" borderColor="gray.200" w="80%" h="50%" bg="whiteAlpha.900" backdropFilter="blur(10px)" shadow="md" direction="column" justifyContent="center" alignItems="center">
            <VideoEmbed videoId="NbO50Rm8u6Q" />
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
}