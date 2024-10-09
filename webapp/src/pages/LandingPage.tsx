import React from 'react';
import { Box, Heading, Text, VStack, HStack, Container } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import YouTube from 'react-youtube';
import { Button } from "../components/ui/button";
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
    <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center justify-center">
       <header className="w-full flex justify-end space-x-2 pr-6">
          <Link to='/login' className="text-purple-600 border border-purple-600 hover:bg-purple-50 px-4 py-2 rounded inline-block text-center">
            Log In
          </Link>
          <Link to='/register' className="bg-gradient-to-tr from-[#ca3bf7] via-[#7292d3] to-[#2fd6b7] text-white hover:opacity-90 px-4 py-2 rounded inline-block text-center">
            Sign Up
          </Link>
        </header>
      <div className="w-full max-w-3xl mx-auto">
                <main className="text-center space-y-4">
          <h1 className="text-2xl md:text-4xl font-bold text-[#7292d3]/90">
            Welcome to Solana AI IDE
          </h1>
          <p className="text-md md:text-lg text-gray-600">
            Design, Code, and Document your Solana dApps.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 shadow-md">
            <div className="aspect-video bg-gray-200 rounded flex items-center justify-center mb-3">
              <YouTube videoId='FK5WILag95s' opts={opts} />
            </div>
            <p className="text-sm text-gray-600">
              Watch our tutorial video to learn how to use Solana IDE effectively.
              This video will guide you through the process of designing, coding,
              and documenting your Solana dApps.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
