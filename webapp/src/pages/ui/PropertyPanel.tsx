import { Flex, Text } from "@chakra-ui/react";

const PropertyPanel = () => {
    return (
        <Flex
          width={{ base: "100%", md: "20%" }}
          bg="gray.100"
          p={4}
          direction="column"
          gap={4}
          overflowY="auto"
        >
            {/* Placeholder for component properties 
          <Text fontWeight="normal" color="gray.600" fontSize="md" mb={2}>Component Properties</Text>
          <Text fontWeight="normal" color="gray.600" fontSize="sm" borderTop="1px solid" borderBottom="1px solid" borderColor="gray.300" pt={2} pb={2}>Width:</Text>
          <Text fontWeight="normal" color="gray.600" fontSize="sm" borderBottom="1px solid" borderColor="gray.300" pb={2}>Height:</Text>
          <Text fontWeight="normal" color="gray.600" fontSize="sm" borderBottom="1px solid" borderColor="gray.300" pb={2}>Color:</Text>
          <Text fontWeight="normal" color="gray.600" fontSize="sm" borderBottom="1px solid" borderColor="gray.300" pb={2}>Functionality:</Text>
          */}
        </Flex>
    );
};

export default PropertyPanel;   