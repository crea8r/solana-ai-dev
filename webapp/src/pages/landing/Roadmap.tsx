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
import { CheckCircleIcon } from "@chakra-ui/icons";
import { TbProgress } from "react-icons/tb";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import landingPageTheme from "../../theme";
import ParticlesContainer from "../ParticlesContainer";

const bgGradient = landingPageTheme.colors.brand.landingPageBgGradient;


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
    ]
  },
  {
    title: "Train a team of AI agents",
    description: "Increase the expertise and improve the output quality of AI agents.",
    status: "in-progress",
    details: [
      { text: "Train on-chain developer agent/s", status: "in-progress" },
      { text: "Train frontend developer agent/s", status: "in-progress" },
      { text: "Train documentation writer agent/s", status: "in-progress" }
    ]
  },
  {
    title: "Customizable dApp UI Builder",
    description: "A space for designing user-friendly dApp interfaces, powered by AI.",
    status: "in-progress"
  },
  {
    title: "Solana Learning Center",
    description: "Comprehensive and interactive tutorials, with a personalized AI tutor agent.",
    status: "in-progress"
  },

];

const RoadmapItem: React.FC<{ item: RoadmapItem; index: number }> = ({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasDetails = item.details && item.details.length > 0;

  return (
    <Flex
      direction={{ base: "column", md: index % 2 === 0 ? "row" : "row-reverse" }}
      align="center"
      mb={{ base: 8, md: 16 }}
      w="full"
      maxW="800px"
      mx="auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        <Flex justify="space-between" align="center" mb={2}>
          <Heading 
            fontSize="xl" 
            fontWeight="bold" 
            mb={2} 
            color="#e2eaff" 
            fontFamily="IBM Plex Mono"
          >
            {item.title}
          </Heading>
        </Flex>
        <Flex direction="column" justify="flex-start" align="flex-start" textAlign="left">
          <Text color={completedColor}>{item.description}</Text>
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

        {hasDetails && (
          <Collapse in={isHovered} animateOpacity>
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
                {item.details?.map((detail, idx) => (
                  <ListItem key={idx} color={completedColor} display="flex" justifyContent="space-between" alignItems="center">
                    <span>• {detail.text}</span>
                    <Icon as={detail.status === "completed" ? IoIosCheckmarkCircleOutline : TbProgress} color={completedColor} />
                  </ListItem>
                ))}
              </List>
            </Flex>
          </Collapse>
        )}
      </Box>
    </Flex>
  );
};

const Roadmap = () => {
  return (
    <Box id="roadmap" bg={pageBgColor} color="white">
      <ParticlesContainer isDarkMode={false} />

      <Flex direction="column" align="center" textAlign="center" py={20} px={8} bg={bgGradient}>
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