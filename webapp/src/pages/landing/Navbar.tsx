import React from "react";
import { Flex, Link, Button, Image } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";

interface NavBarProps {
  logoSrc: string;
}

const NavBar: React.FC<NavBarProps> = ({ logoSrc }) => {
  const location = useLocation();

  const linkStyle = (path: string) => ({
    textDecoration: location.pathname === path ? "underline" : "none",
    textUnderlineOffset: location.pathname === path ? "14px" : "0px",
    textDecorationThickness: "1px",
  });

  return (
    <Flex align="center" justify="space-between" p={4} bg="transparent" color="white" px="10" py="4">
      <Flex align="center" bg="transparent">
        <Link as={RouterLink} to="/">
          <Image
            src={logoSrc}
            alt="Logo"
            boxSize="50px"
            mr={4}
          />
        </Link>
      </Flex>

      <Flex flex="1" justify="center">
        <Link as={RouterLink} to="/" mx={4} style={linkStyle("/")}>
          Home
        </Link>
        <Link as={RouterLink} to="/roadmap" mx={4} style={linkStyle("/roadmap")}>
          Roadmap
        </Link>

        <Link as={RouterLink} to="/contact" mx={4} style={linkStyle("/contact")}>
          Contact
        </Link>
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
