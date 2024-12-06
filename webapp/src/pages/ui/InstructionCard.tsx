import React, { useEffect, useState } from "react";
import { Box, Text, Input, Button, Flex, VStack } from "@chakra-ui/react";
import { Instruction } from "../../types/uiTypes";
import { useProjectContext } from "../../contexts/ProjectContext";
import { uiApi } from "../../api/ui";

interface InstructionCardProps {
  instruction: Instruction;
  isSimpleMode: boolean;
}

const InstructionCard: React.FC<InstructionCardProps> = ({
  instruction,
  isSimpleMode,
}) => {
  const { projectContext } = useProjectContext();
  const [params, setParams] = useState<{ [key: string]: string }>({});
  const [CounterProgramSDK, setCounterProgramSDK] = useState<any>(null);

  const handleInputChange = (paramName: string, value: string) => {
    setParams((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const handleExecuteInstruction = async () => {
    console.log(`Executing ${instruction.name}`);
    const response = await uiApi.executeSdkInstruction(projectContext.id, instruction.name, params);
    console.log(response.data.status);
  };

  useEffect(() => {
    console.log("instruction:", instruction);
  }, [instruction]);

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="md"
      bg="white"
      shadow="md"
      width="320px"
      color="gray.800"
      border="2px solid"
      borderColor="transparent"
      cursor={isSimpleMode ? "pointer" : "default"}
      onClick={isSimpleMode ? handleExecuteInstruction : undefined}
      _hover={isSimpleMode ? { borderColor: "#a9b7ff" } : undefined}
    >
      <VStack spacing={4} align="stretch">
        <Flex align="center" gap={2}>
          <Text fontSize="lg" fontWeight="bold" >
            {instruction.name}
          </Text>
        </Flex>
        {!isSimpleMode && (
          <Text fontSize="sm">
            {instruction.description}
          </Text>
        )}
        {!isSimpleMode &&
          instruction.params.map((param, idx) => {
            const paramType =
              typeof param.type === "object" && "name" in param.type
                ? param.type.name
                : String(param.type);
            return (
              <Box key={idx}>
                <Text fontSize="sm" fontWeight="medium" color="gray.800">
                  {param.name} ({paramType})
                </Text>
                <Input
                  placeholder={`Enter ${param.name} (${paramType})`}
                  size="sm"
                  mt={1}
                  width="75%"
                  onChange={(e) => handleInputChange(param.name, e.target.value)}
                />
              </Box>
            );
          })}
        {!isSimpleMode && (
          <Button
            bg="#a9b7ff"
            color="white"
            size="xs"
            width="75%"
            onClick={handleExecuteInstruction}
          >
            Call {instruction.name}
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default InstructionCard;
