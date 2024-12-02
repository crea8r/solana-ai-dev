import React, { useEffect, useState } from "react";
import { Box, Text, Input, Button } from "@chakra-ui/react";
import { Instruction } from "../../types/uiTypes";
import { useProjectContext } from "../../contexts/ProjectContext";

interface InstructionCardProps {
  instruction: Instruction;
}

const InstructionCard: React.FC<InstructionCardProps> = ({ instruction }) => {
  const { projectContext } = useProjectContext();
  const [params, setParams] = useState<{ [key: string]: string }>({});
  const [CounterProgramSDK, setCounterProgramSDK] = useState<any>(null);

  const handleInputChange = (paramName: string, value: string) => {
    setParams((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  useEffect(() => {
    console.log("instruction:", instruction);
  }, []);

  /*
  useEffect(() => {
    const importSDK = async () => {
      const sdk = await import(`../../../../projects/${projectContext.rootPath}/sdk`);
      setCounterProgramSDK(sdk.CounterProgramSDK);
    };

    importSDK().catch((error) => console.error("Error loading SDK:", error));
  }, [projectContext.details.sdk.content]);
  */

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" width="300px" bg="white" shadow="md">
      <Text fontSize="lg" fontWeight="bold" color="#7f7de8">
        {instruction.name}
      </Text>
      <Text mt={2} fontSize="sm" color="gray.600">
        {instruction.description}
      </Text>
      {instruction.params.map((param, idx) => {
        //console.log("param:", param);
        const paramType = 
          typeof param.type === "object" && "name" in param.type 
            ? param.type.name 
            : String(param.type);
        return (
          <Box key={idx} mt={2}>
            <Text fontSize="sm" fontWeight="medium" color="#7f7de8">
              {param.name} ({paramType})
            </Text>
            <Input
              placeholder={`Enter ${param.name} (${paramType})`}
              size="sm"
              mt={1}
            />
          </Box>
        );
      })}
      <Button
        mt={4}
        bg="#a9b7ff"
        color="white"
        size="sm"
        onClick={() => console.log(`Calling ${instruction.name}`)}
      >
        Call {instruction.name}
      </Button>
    </Box>
  );
};

export default InstructionCard;
