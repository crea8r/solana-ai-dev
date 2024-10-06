import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Container,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import YouTube from 'react-youtube';

const LandingPage: React.FC = () => {
  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 0,
    },
  };

  return (
    <Box minHeight='100vh' py={16}>
      <Container maxW='container.xl'>
        <VStack spacing={8} align='center'>
          <VStack spacing={4} textAlign='center'>
            <Heading as='h1' size='2xl'>
              Welcome to Solana IDE
            </Heading>
            <Text fontSize='xl'>
              Design, Code, and Document your Solana dApps
            </Text>
          </VStack>

          <Box boxShadow='xl' borderRadius='lg' overflow='hidden'>
            <YouTube videoId='FK5WILag95s' opts={opts} />
          </Box>

          <Text fontSize='lg' textAlign='center' maxW='container.md'>
            Watch our tutorial video to learn how to use Solana IDE effectively.
            This video will guide you through the process of designing, coding,
            and documenting your Solana dApps.
          </Text>

          <HStack spacing={4}>
            <Button as={RouterLink} to='/register' colorScheme='blue' size='lg'>
              Sign Up
            </Button>
            <Button as={RouterLink} to='/login' colorScheme='green' size='lg'>
              Log In
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default LandingPage;
