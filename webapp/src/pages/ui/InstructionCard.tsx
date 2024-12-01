import React from "react";
import { Box, Flex, Text, Input, Button } from "@chakra-ui/react";
import { InstructionCardParamField } from "../../types/uiTypes";

const InstructionCard = ({ instructions }: { instructions: any[] }) => {
  return (
    <Flex wrap="wrap" gap={4}>
      {instructions.map((instruction, idx) => (
        <Box
          key={idx}
          borderWidth="1px"
          borderRadius="md"
          p={4}
          bg="white"
          shadow="md"
          minWidth="300px"
          maxWidth="350px"
        >
          <Text fontWeight="bold" fontSize="lg" color="purple.500">
            {instruction.name}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {instruction.description}
          </Text>
          {instruction.params.map((param: InstructionCardParamField, idx: number) => (
            <Input
              key={idx}
              placeholder={`Enter ${param.name} (${param.type})`}
              size="sm"
              mt={2}
            />
          ))}
          <Button
            mt={4}
            colorScheme="purple"
            size="sm"
            onClick={() => console.log(`Calling ${instruction.name}`)}
          >
            Call {instruction.name}
          </Button>
        </Box>
      ))}
    </Flex>
  );
};

export default InstructionCard;
