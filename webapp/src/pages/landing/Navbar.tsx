import React from "react";
import { Flex, Link, Button, Image } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

interface NavBarProps {
  logoSrc: string;
  refs: {
    heroRef: React.RefObject<HTMLDivElement>;
    featuresRef: React.RefObject<HTMLDivElement>;
    demoRef: React.RefObject<HTMLDivElement>;
    roadmapRef: React.RefObject<HTMLDivElement>;
    contactRef: React.RefObject<HTMLDivElement>;
  };
}

const NavBar: React.FC<NavBarProps> = ({ logoSrc, refs }) => {
  const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Flex align="center" justify="space-between" p={4} bg="transparent" color="white" px="10" py="4">
      <Flex align="center" bg="transparent">
        <Link onClick={() => scrollToRef(refs.heroRef)}>
          <Image src={logoSrc} alt="Logo" boxSize="50px" mr={4} />
        </Link>
      </Flex>

      <Flex flex="1" justify="center">
        <Link onClick={() => scrollToRef(refs.featuresRef)} mx={4} color="white" cursor="pointer">
          Features
        </Link>
        <Link onClick={() => scrollToRef(refs.demoRef)} mx={4} color="white" cursor="pointer">
          Demo
        </Link>
        <Link onClick={() => scrollToRef(refs.roadmapRef)} mx={4} color="white" cursor="pointer">
          Roadmap
        </Link>
        <Link onClick={() => scrollToRef(refs.contactRef)} mx={4} color="white" cursor="pointer">
          Contact
        </Link>
      </Flex>

      <Button as={RouterLink} to="/landing" outline="white" size="md" color="black" ml={4}>
        Go to App
      </Button>
    </Flex>
  );
};

export default NavBar;
