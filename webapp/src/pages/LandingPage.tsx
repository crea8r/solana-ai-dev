import React from 'react';
import { Button, Box, Heading, Text, VStack, HStack, Container } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import YouTube from 'react-youtube';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const opts = {
    height: '370',
    width: '620',
    playerVars: {
      autoplay: 0,
    },
  };

  return (
    <Box className="min-h-screen bg-white text-gray-800 flex flex-col items-center justify-center">
       <Heading className="w-full flex justify-end space-x-2 pr-6">
        <Button as={RouterLink} to='/login' className="px-4 py-2 rounded inline-block text-center">
            Log In
        </Button>
        <Button as={RouterLink} to='/register' className="px-4 py-2 rounded inline-block text-center">
            Sign Up
        </Button>
        </Heading>
        <Box className="w-full max-w-3xl mx-auto text-center space-y-4">
          <Heading className="text-xl md:text-2xl font-bold text-[#7292d3]/90">
            Welcome to Solana AI IDE
          </Heading>
          <Text className="text-md md:text-lg text-gray-600">
            Design, Code, and Document your Solana dApps.
          </Text>

          <Box className="bg-gray-50 rounded-lg p-4 shadow-md">
            <Box className="aspect-video bg-gray-200 rounded flex items-center justify-center mb-3">
              <YouTube videoId='FK5WILag95s' opts={opts} />
            </Box>
            <Text className="text-sm text-gray-600">
              Watch our tutorial video to learn how to use Solana IDE effectively.
              This video will guide you through the process of designing, coding,
              and documenting your Solana dApps.
            </Text>
          </Box>
        </Box>
    </Box>
  );
};

export default LandingPage;
