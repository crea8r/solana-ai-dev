import React from "react";
import { Flex, Link, Button, Image } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

interface NavBarProps {
  logoSrc: string;
}

const NavBar: React.FC<NavBarProps> = ({ logoSrc }) => {
  return (
    <Flex align="center" justify="space-between" p={4} bg="transparent" color="white" px="10" py="4">
      <Flex align="center" bg="transparent">
        <Image
          src={logoSrc}
          alt="Logo"
          boxSize="50px"
          mr={4}
        />
      </Flex>

      <Flex flex="1" justify="center">
        <Link as={RouterLink} to="/roadmap" mx={4}>Roadmap</Link>
        <Link as={RouterLink} to="#changelog" mx={4}>Changelog</Link>
        <Link as={RouterLink} to="#contact" mx={4}>Contact</Link>
      </Flex>

      <Button
        as={RouterLink}
        to="/landing"
        outline="white"
        size="md"
        color="black"
        ml={4}
      >
        Go to App
      </Button>
    </Flex>
  );
};

export default NavBar;
