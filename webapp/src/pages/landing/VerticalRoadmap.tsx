import React from "react";
import { Box, Flex, Text, Heading, Divider, Icon, useBreakpointValue } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";

interface RoadmapItem {
  title: string;
  description: string;
  status: "completed" | "in-progress" | "upcoming";
}

const roadmapItems: RoadmapItem[] = [
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

export default function VerticalRoadmap() {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box px={4} py={12} maxW="4xl" mx="auto" position="relative">
      <Heading as="h1" size="xl" textAlign="center" mb={16}>
        Project Roadmap
      </Heading>

      {/* Vertical line */}
      <Box
        position="absolute"
        left="50%"
        transform="translateX(-50%)"
        height="100%"
        width="2px"
        bg="gray.300"
        top={0}
        zIndex={-1}
      />

      <Flex direction="column" position="relative">
        {roadmapItems.map((item, index) => (
          <Flex key={index} mb={12} position="relative" align="center">
            {/* Timeline Node */}
            <Box
              position="absolute"
              left="50%"
              transform="translateX(-50%) translateY(-50%)"
              w={6}
              h={6}
              borderRadius="full"
              borderWidth="2px"
              bg="white"
              borderColor={item.status === "completed" ? "green.400" : "blue.400"}
            />

            {/* Content Box */}
            <Box
              flex="1"
              borderWidth="1px"
              borderRadius="lg"
              p={6}
              bg="white"
              shadow="md"
              ml={index % 2 === 0 ? "auto" : undefined}
              mr={index % 2 !== 0 ? "auto" : undefined}
              width={{ base: "full", md: "45%" }}
            >
              <Heading as="h3" size="md" mb={2} fontWeight="semibold">
                {item.title}
              </Heading>
              <Text color="gray.600" mb={4}>
                {item.description}
              </Text>
              <Flex align="center" gap={2}>
                {item.status === "completed" ? (
                  <Flex
                    align="center"
                    bg="green.50"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                    color="green.700"
                    fontWeight="medium"
                  >
                    <Icon as={CheckIcon} mr={2} />
                    Completed
                  </Flex>
                ) : (
                  <Flex
                    align="center"
                    bg="blue.50"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                    color="blue.700"
                    fontWeight="medium"
                  >
                    Upcoming
                  </Flex>
                )}
              </Flex>
            </Box>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
} 