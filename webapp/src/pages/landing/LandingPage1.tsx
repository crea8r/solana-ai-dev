import { useRef } from "react";
import { Box } from "@chakra-ui/react";
import ParticlesContainer from "../ParticlesContainer";
import Roadmap from "./Roadmap";
import NavBar from "./Navbar";
import HeroSection from "./Hero";
import DemoVideoSection from "./DemoVid";
import landingPageTheme from "../../theme";
import Features from "./Features";
import Contact from "./Contact";

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

  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  return (
    <Box w="100vw" bgGradient={bgGradient} position="relative" zIndex={10}>
      <ParticlesContainer isDarkMode={false} />
      <NavBar logoSrc={logo} refs={{ heroRef, featuresRef, demoRef, roadmapRef, contactRef }} />
      <Box ref={heroRef}>
        <HeroSection words={words} />
      </Box>
      <Box ref={featuresRef}>
        <Features />
      </Box>
      <Box ref={demoRef}>
        <DemoVideoSection videoId="NbO50Rm8u6Q" />
      </Box>
      <Box ref={roadmapRef}>
        <Roadmap />
      </Box>
      <Box ref={contactRef}>
        <Contact />
      </Box>
    </Box>
  );
};

export default LandingPage1;