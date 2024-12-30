import React, { useState } from "react";
import { ChakraProvider, Box, Flex, Text, extendTheme } from "@chakra-ui/react";
import MenuPanel from "./MenuPanel";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "gray.700",
        color: "gray.50",
      },
    },
  },
});

const LearnPage: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <ChakraProvider theme={theme}>
      <Box as="html" lang="en">
        <Flex as="main" h="100vh">
          <MenuPanel isCollapsed={isCollapsed} onToggle={handleToggle} />

          <Flex flex="1" direction="column" p={4}>
            <Flex border="1px solid red" mb={4}>
              <Text fontSize="2xl" fontWeight="bold">
                Sections
              </Text>
            </Flex>
            <Flex border="1px solid red" flex="1">
              <Text fontSize="2xl" fontWeight="bold">
                Content
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </ChakraProvider>
  );
};

export default LearnPage;