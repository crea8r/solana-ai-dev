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
  'Build Faster, Smarter, and More Secure Solana Programs',
  'Unlock the Power of AI for Solana Innovation',
  'Simplifying Blockchain Development for Everyone',
  'Turn Concepts into Fully Functional dApps Seamlessly',
  'Your Gateway to Hassle-Free Solana dApp Creation',
  'Accelerate Web3 Innovation with Smart Tools',
  'Empowering Builders to Shape the Future of Solana',
  'Streamline Solana Development with AI-Driven Automation',
  'Smarter Solana Development, Unleashing Your Creativity',
  'No Limits, Just dApps: Simplified Development for All',
  'Lowering Barriers to Entry for Web3 Developers',
  'AI Meets Web3: Build the Future with Solai',
  'Maximize Productivity with AI-Enhanced dApp Creation',
  'Intuitive dApp Building for Solana Innovators',
  'Let AI Handle the Complexity – Focus on Your Vision',
  'Democratizing Solana Development with Smart Automation',
  'Craft Your dApp Vision, Leave the Code to Solai'
];


const TypingEffect = ({ words }: { words: string[] }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWordIndex];

    const typeSpeed = isDeleting ? 30 : 40;
    const delay = isDeleting && displayedText === "" ? 1000 : 200;

    if (!isDeleting && displayedText.length === word.length) {
      setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && displayedText.length === 0) {
      setIsDeleting(false);
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }

    const timer = setTimeout(() => {
      setDisplayedText((prev) =>
        isDeleting ? word.substring(0, prev.length - 1) : word.substring(0, prev.length + 1)
      );
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentWordIndex, words]);

  return <Text
    fontSize={{ base: "2xl", md: "4xl" }}
    fontWeight="bold"
    fontFamily="'IBM Plex Mono', monospace"
  >
    {displayedText}|
  </Text>;
};

const LandingPage1 = () => {
  const logo = require('../../assets/brand/solai_logo.png');

  return (
    <Box w="100vw" h="100vh" overflowY="scroll" bgGradient={bgGradient} position="relative" zIndex={10}>
      <ParticlesContainer isDarkMode={false} />
      <NavBar logoSrc={logo} />
      <HeroSection words={words} />
      <Features />
      <DemoVideoSection videoId="NbO50Rm8u6Q" />
    </Box>
  );
};

export default LandingPage1;