import React, { useState, useEffect } from "react";
import { Box, Flex, Heading, Text, Button, Link, Image, SimpleGrid } from "@chakra-ui/react";
import ParticlesContainer from "../ParticlesContainer";
import { TbSparkles } from "react-icons/tb";
import { BiNetworkChart } from "react-icons/bi";
import { LuCodesandbox } from "react-icons/lu";
import YouTube from 'react-youtube';
import { Link as RouterLink } from 'react-router-dom';
import Team from "./Team";
import Roadmap from "./Roadmap";
import NavBar from "./Navbar";
import HeroSection from "./Hero";
import DemoVideoSection from "./DemoVid";
import landingPageTheme from "../../theme";
import Features from "./Features";

const bgGradient = landingPageTheme.colors.brand.landingPageBgGradient;

const words = [
  'Revolutionizing Solana dApp Development with AI',
  'From Ideas to Smart Contracts in Minutes',
  'Your AI-Powered Solana Development Companion',
  'Let AI Handle the Complexity – Focus on Your Vision',
  'Turn Concepts into Fully Functional dApps Seamlessly',
  'Empowering Builders to Shape the Future of Solana'
];

const LandingPage1 = () => {
  const logo = require('../../assets/brand/solai_logo.png');

  return (
    <Box w="100vw" h="100vh" overflowY="scroll" overflowX="hidden" bgGradient={bgGradient} position="relative" zIndex={10}>
      <ParticlesContainer isDarkMode={false} />
      <NavBar logoSrc={logo} />
      <HeroSection words={words} />
      <Features />
      <DemoVideoSection videoId="NbO50Rm8u6Q" />
    </Box>
  );
};

export default LandingPage1;