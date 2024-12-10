import React, { useEffect, useState } from "react";
import { Box, Text, Input, Button, Flex, VStack } from "@chakra-ui/react";
import { Instruction } from "../../types/uiTypes";
import { useProjectContext } from "../../contexts/ProjectContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { toCamelCase } from "../../utils/uiUtils";
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
  const { user } = useAuthContext();
  const [params, setParams] = useState<{ [key: string]: string }>({});
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [autoFilledParams, setAutoFilledParams] = useState<Record<string, string>>({});

  const isInitializerInstruction = (instruction: any): boolean => {
    return instruction.context.accounts.some((account: any) => account.pda !== undefined);
  };

  const handleInputChange = (paramName: string, value: string) => {
    setParams((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const handleExecuteInstruction = async () => {
    const instructionName = toCamelCase(instruction.name);
    console.log(`Executing ${instructionName}`);
    console.log("params", params);

    if (!user) throw new Error("User not found");

    const response = await uiApi.executeSdkInstruction(user.id, projectContext.id, instructionName, params);
    console.log(response.data.status);
  };

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
          <Text fontSize="lg" fontWeight="bold">
            {instruction.name}
          </Text>
        </Flex>
        {!isSimpleMode && <Text fontSize="sm">{instruction.description}</Text>}
        {!isSimpleMode &&
          userInputs.map((param, idx) => (
            <Box key={idx}>
              <Text fontSize="sm" fontWeight="medium" color="gray.800">
                {param}
              </Text>
              <Input
                placeholder={`Enter ${param}`}
                size="sm"
                mt={1}
                width="75%"
                onChange={(e) => handleInputChange(param, e.target.value)}
              />
            </Box>
          ))}
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
