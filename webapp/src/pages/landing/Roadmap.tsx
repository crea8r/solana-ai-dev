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
import { TbProgress } from "react-icons/tb";
import { MdFoundation } from "react-icons/md";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { HiOutlineSparkles } from "react-icons/hi2";
import { Link as RouterLink } from "react-router-dom";
import ParticlesContainer from "../ParticlesContainer";
import NavBar from "./Navbar";
import landingPageTheme from "../../theme";

const boxBgColor = landingPageTheme.colors.brand.boxBgColor;
const pageBgColor = landingPageTheme.colors.brand.pageBgColor;
const completedColor = landingPageTheme.colors.brand.roadMapStatusColor;
const inProgressColor = landingPageTheme.colors.brand.roadMapStatusColor;

interface DetailItem {
  text: string;
  status: "completed" | "in-progress";
}

interface RoadmapItem {
  title: string;
  description: string;
  status: "completed" | "in-progress";
  details?: DetailItem[]; // Updated to use DetailItem
  icon?: React.ElementType;
}

const roadmapData: RoadmapItem[] = [
  {
    title: "Layed the foundations",
    description: "Developed the basic technical infrastructure of the app.",
    status: "completed",
    details: [
      { text: "Drag-and-drop design interface", status: "completed" },
      { text: "AI-powered code generation", status: "completed" },
      { text: "Basic Integrated Development Environment", status: "completed" }
    ],
    icon: MdFoundation,
  },
  {
    title: "Train a team of AI agents",
    description: "Developed the basic technical infrastructure.",
    status: "in-progress",
    details: [
      { text: "Train on-chain developer agent/s", status: "in-progress" },
      { text: "Train frontend developer agent/s", status: "in-progress" },
      { text: "Train documentation writer agent/s", status: "in-progress" }
    ],
    icon: HiOutlineSparkles,
  },
  {
    title: "Create a Learning Center",
    description: "With comprehensive and interactive tutorials on a range of topics, including Solana, Anchor, Rust.",
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

];

const RoadmapItem: React.FC<{ item: RoadmapItem; index: number }> = ({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);

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
        zIndex={10}
        size="40px"
        bg={landingPageTheme.colors.brand.boxBgColor}
        boxShadow="xl"
        color="white"
        fontWeight="bold"
        fontSize="lg"
        mx={4}
      >
        {index + 1}
      </Circle>

      <Box
        borderRadius="md"
        bg={landingPageTheme.colors.brand.boxBgColor}
        p={6}
        w="full"
        boxShadow="xl"
        position="relative"
        fontFamily="IBM Plex Mono"
      >
       
        <Flex justify="space-between" align="center">
          <Heading 
            fontSize="xl" 
            fontWeight="bold" 
            mb={2} 
            color="#e2eaff" 
            fontFamily="IBM Plex Mono"
          >
            {item.title}
          </Heading>
          <Icon
            as={isHovered ? ChevronUpIcon : ChevronDownIcon}
            w={6}
            h={6}
            color="white"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            cursor="pointer"
          />
        </Flex>
        <Flex direction="column" justify="flex-start" align="flex-start">
          <Text color="#e2eaff">{item.description}</Text>
          {item.status === "completed" && (
            <Flex align="center" mt={4} bg="whiteAlpha.200" p={2} borderRadius="md" gap={2}>
              <CheckCircleIcon color={completedColor} style={{ marginRight: "2px" }} />
              <Text fontSize="xs" color={completedColor} fontWeight="normal" fontFamily="IBM Plex Mono">
                Completed
              </Text>
            </Flex>
          )}
          {item.status === "in-progress" && (
            <Flex align="center" mt={4} bg="whiteAlpha.200" p={2} borderRadius="md" gap={2}>
              <TbProgress color={inProgressColor} style={{ marginRight: "2px" }} />
              <Text fontSize="xs" color={inProgressColor} fontWeight="normal" fontFamily="IBM Plex Mono">
                In Progress
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
              align="left"
            >
              <List 
                spacing={2}
                fontFamily="IBM Plex Mono"
                textAlign="left"
              >
                {item.details.map((detail, idx) => (
                  <ListItem key={idx} color={completedColor} display="flex" justifyContent="space-between" alignItems="center">
                    <span>• {detail.text}</span>
                    <Icon as={detail.status === "completed" ? IoIosCheckmarkCircleOutline : TbProgress} color={completedColor} />
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
    <Box height="100vh" overflowY="auto" bg={pageBgColor} color="white">
      <ParticlesContainer isDarkMode={false} />

      <NavBar logoSrc={logo} />

      <Flex direction="column" align="center" textAlign="center" py={20} px={8}>

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