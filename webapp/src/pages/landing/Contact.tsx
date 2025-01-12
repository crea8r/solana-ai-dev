import React from "react";
import {
  Box,
  Flex,
  Text,
  Link,
  Icon,
} from "@chakra-ui/react";
import ParticlesContainer from "../ParticlesContainer";
import NavBar from "./Navbar";
import Team from "./Team";
import { CgMail } from "react-icons/cg";
import { FaTelegram, FaXTwitter } from "react-icons/fa6";
import landingPageTheme from "../../theme";

const cardBgColor = landingPageTheme.colors.brand.boxBgColor;
const textColor = "#e2eaff";
const pageBgColor = landingPageTheme.colors.brand.pageBgColor;

const Contact = () => {
  const logo = require("../../assets/brand/solai_logo.png");

  return (
    <Box height="100vh" overflowY="auto" bg={pageBgColor} color="white">
      <ParticlesContainer isDarkMode={false} />
      <NavBar logoSrc={logo} />

      <Flex direction="column" align="center" textAlign="center" py={20} px={8}>
        <Flex
          direction="column"
          align="center"
          p={4}
          py={16}
          w="80%"
          h="auto"
          gap={8}
        >
          <Team />

         
        </Flex>
      </Flex>
    </Box>
  );
};

export default Contact;