import React, { useState } from "react";
import { Input, Button, Flex, Box, Heading, Text, Link as ChakraLink, Img } from "@chakra-ui/react";
//import logo from '../assets/brand/solai_logo_png.png';
import { Link, Link as RouterLink } from 'react-router-dom';
import { FaXTwitter } from "react-icons/fa6";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ParticlesContainer from "../ParticlesContainer";
import landingPageTheme from "../../theme";

const bgGradient = landingPageTheme.colors.brand.landingPageBgGradient;

export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const logo = require('../../assets/brand/solai_logo3.png');

  return (
      <Flex 
        h="100vh" w="100vw"
        direction="column"
        justifyContent="center"
        alignItems="center"
        bgGradient={bgGradient}
        
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
            fontFamily="IBM Plex Mono"
          >
             <Link to="/" className="absolute left-0 top-0 p-5">
              <ArrowBackIcon className="h-5 w-5 text-gray-600 hover:text-gray-800" />
            </Link>
            <Flex direction="row" justifyContent="center" alignItems="center" gap="0">
            <Img src={logo} alt="Solai Logo" h="60px" />
            <Flex direction="column" justifyContent="flex-start" alignItems="center" textAlign="left" height="100%" pt="2" fontFamily="IBM Plex Mono">
                <Box bg="gray.100" rounded="md" px="1">
                  <Text fontSize="0.6rem" fontWeight="300" letterSpacing="0.09em" fontFamily="IBM Plex Mono" color="gray.670" px="1" py="0">
                    BETA 
                  </Text>
                </Box>
              </Flex>
            </Flex>

            <Flex w="80%" direction="column" justifyContent="center" alignItems="center" fontFamily="IBM Plex Mono">
              <Flex justifyContent="space-between" alignItems="center" w="full" gap="2">
                <Button
                  fontSize="md" letterSpacing="0.05em"
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
                  fontSize="md" letterSpacing="0.05em"
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
                    w="full" size="lg" fontSize="md" fontWeight="400" letterSpacing="0.05em"
                    bg="blue.300" color="white" _hover={{ bg: "blue.400" }} alignItems="center"
                    py="5" mt="2"
                    as={RouterLink} to='/login'
                  >
                    Login to Continue
                  </Button>
                ) : (
                  <Button 
                    w="full" size="lg" fontSize="md" fontWeight="400" letterSpacing="0.05em"
                    bg="blue.300" color="white" _hover={{ bg: "blue.400" }} alignItems="center"
                    py="5" mt="2"
                    as={RouterLink} to='/register'
                  >
                    Create Account
                  </Button>
                )}
              </Box>
            </Flex>
          </Flex>
        </Flex>
  );
}