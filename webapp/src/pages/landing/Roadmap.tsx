import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Link,
  Button,
  Circle,
  Icon,
  List,
  ListItem,
  Collapse,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import ParticlesContainer from "../ParticlesContainer";
import { GradientType } from "@tsparticles/engine";

interface RoadmapItem {
  title: string;
  description: string;
  status: "completed" | "in-progress" | "upcoming";
  details?: string[]; // Additional bullet points to reveal on hover
}

const roadmapData: RoadmapItem[] = [
  {
    title: "Layed the foundations",
    description: "Developed the basic technical infrastructure.",
    status: "completed",
    details: [
      "Drag-and-drop design interface", 
      "AI-powered code generation", 
      "Basic Integrated Development Environment"
    ],
  },
  {
    title: "Layed the foundations",
    description: "Developed the basic technical infrastructure.",
    status: "completed",
  },
  {
    title: "Advisory and Team Build Out",
    description: "Onboarded key advisors and built the core team.",
    status: "in-progress",
  },
  {
    title: "Infrastructure and Technical Setup",
    description: "Laid the technical foundations of the application.",
    status: "completed",
  },
  {
    title: "Design Phase",
    description: "Created a drag and drop interface for Solana program visualization.",
    status: "completed",
  },
  {
    title: "AI-Powered Code Generation",
    description: "Introduced AI-driven code generation to simplify development.",
    status: "completed",
  },
  {
    title: "Code Editor Integration",
    description: "Introduced a basic IDE to build, edit, and deploy programs with ease.",
    status: "completed",
  },
  {
    title: "Testing",
    description: "Running tests and ironing out any remaining bugs.",
    status: "upcoming",
  },
];

const RoadmapItem: React.FC<{ item: RoadmapItem; index: number }> = ({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  const bgColor =
    item.status === "completed"
      ? "green.300"
      : item.status === "in-progress"
      ? "yellow.400"
      : "gray.300";

  return (
    <Flex
      direction={{ base: "column", md: index % 2 === 0 ? "row" : "row-reverse" }}
      align="center"
      mb={{ base: 8, md: 16 }}
      w="full"
      maxW="800px"
      mx="auto"
    >
      <Circle
        size="40px"
        bg={bgColor}
        color="white"
        fontWeight="bold"
        fontSize="lg"
        mr={4}
      >
        {index + 1}
      </Circle>

      <Box
        borderWidth="1px"
        borderColor="gray.500"
        borderRadius="md"
        bg="whiteAlpha.600"
        p={6}
        w="full"
        boxShadow="md"
        position="relative"
        fontFamily="IBM Plex Mono"
      >
        <Flex justify="space-between" align="center">
          <Heading 
            fontSize="xl" 
            fontWeight="bold" 
            mb={2} 
            color="gray.800" 
            fontFamily="IBM Plex Mono"
          >
            {item.title}
          </Heading>
          <Icon
            as={isHovered ? ChevronUpIcon : ChevronDownIcon}
            w={6}
            h={6}
            color="gray.800"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            cursor="pointer"
          />
        </Flex>
        <Flex direction="column" justify="flex-start" align="flex-start">
          <Text color="gray.800">{item.description}</Text>
          {item.status === "completed" && (
            <Flex align="center" mt={4}>
              <CheckCircleIcon color="green.600" mr={2} />
              <Text color="green.600" fontWeight="medium" fontFamily="IBM Plex Mono">
                Completed
              </Text>
            </Flex>
          )}
        </Flex>

        <Collapse in={isHovered} animateOpacity>
          {item.details && (
            <Flex
              mt={4} 
              borderTop="1px solid" 
              borderColor="gray.600" 
              pt={4}
              direction="column"
              align="flex-start"
            >
              <List spacing={2}>
                {item.details.map((detail, idx) => (
                  <ListItem key={idx} color="gray.800">
                    • {detail}
                  </ListItem>
                ))}
              </List>
            </Flex>
          )}
        </Collapse>
      </Box>
    </Flex>
  );
};

const Roadmap = () => {
  const logo = require("../../assets/brand/solai_logo.png");
  return (
    <Box height="100vh" overflowY="auto" bgGradient="linear(to-b, blue.900, #80a3ff)" color="white">
      <ParticlesContainer isDarkMode={false} />

      {/* Navigation Bar */}
      <Flex align="center" justify="space-between" px={10} py={6} bg="transparent" color="white">
        <Flex align="center">
          <Image src={logo} alt="Logo" boxSize="50px" mr={6} />
        </Flex>

        <Flex flex="1" justify="center" mt="5px">
          <Link as={RouterLink} to="/" mx={6}> Home </Link>
          <Link as={RouterLink} to="#tokenomics" mx={6}> Tokenomics </Link>
          <Link 
            as={RouterLink} 
            to="/roadmap" 
            mx={6} 
            pb="8px"
            borderBottom="1px" 
            borderColor="white"
          > 
            Roadmap 
          </Link>
          <Link as={RouterLink} to="#changelog" mx={6}> Changelog </Link>
          <Link as={RouterLink} to="#contact" mx={6}> Contact </Link>
        </Flex>

        <Button outline="white" size="md" color="black" ml={6}>Go to App</Button>
      </Flex>

      {/* Roadmap Section */}
      <Flex direction="column" align="center" textAlign="center" py={16} px={8}>
        {/*<Heading fontSize={{ base: "3xl", md: "5xl" }} fontFamily="IBM Plex Mono" mb={10}>
          Project Roadmap
        </Heading>*/}
        <Box maxW="1100px" w="full">
          {roadmapData.map((item, index) => (
            <RoadmapItem key={index} item={item} index={index} />
          ))}
        </Box>
      </Flex>
    </Box>
  );
};

export default Roadmap;