import { Flex, Text, Divider, Box } from "@chakra-ui/react";

const Toolbox = () => {
  return (
    <Flex
      width={{ base: "100%", md: "20%" }}
      bg="gray.50"
      p={4}
      gap={4}
      direction="column"
      shadow="md"
      overflowY="auto"
    >
        {/* Placeholder for draggable components 
        <Flex direction="column" gap={2}> 
            <Text fontSize="lg" fontWeight="normal" mb={4} color="gray.600">Toolbox</Text>
            <Text fontSize="sm" color="gray.500">Drag and drop components to the canvas</Text>
            <Divider borderColor="gray.400" my={4}/>
        </Flex>
        
        <Flex direction="row" gap={4} flexWrap="wrap" width="100%" align="flex-start">
            <Box p={4} border="1px solid" borderColor="gray.300" textAlign="center" bg="white" flex="1 1 30%">
                <Text>Button</Text>
            </Box>
            <Box p={4} border="1px solid" borderColor="gray.300" textAlign="center" bg="white" flex="1 1 30%">
                <Text>Form</Text>
            </Box>
            <Box p={4} border="1px solid" borderColor="gray.300" textAlign="center" bg="white" flex="1 1 30%">
                <Text>Table</Text>
            </Box>
        </Flex>
        */}
    </Flex>
  );
};

export default Toolbox;
