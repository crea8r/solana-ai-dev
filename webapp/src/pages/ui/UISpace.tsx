import React, { useEffect, useState, useMemo } from "react";
import { useProjectContext } from "../../contexts/ProjectContext";
import { Box, Button, Input, Text, Flex } from "@chakra-ui/react";
import { Edge, Node } from "react-flow-renderer";
import { matchInstruction, handleCallInstruction } from "../../utils/uiUtils";


const UISpace = () => {
  const { projectContext } = useProjectContext();
  const { aiInstructions } = projectContext;
  const { nodes, edges } = projectContext.details;

  const [instructionInputs, setInstructionInputs] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    console.log("AI Instructions:", aiInstructions);
    console.log("param fields:", aiInstructions.map((instruction) => instruction.params_fields));
    console.log("Nodes:", nodes);
    console.log("Edges:", edges);
  }, [projectContext, aiInstructions, nodes, edges]);

  const instructionNodes = useMemo(() => { return nodes.filter((node) => node.type === "instruction"); }, [nodes]);
  const accountNodes = useMemo(() => {return nodes.filter((node) => node.type === "account");}, [nodes]);

  useEffect(() => {
    const initialInputs: { [key: string]: string[] } = {};
    aiInstructions.forEach((instruction) => {initialInputs[instruction.function_name] = instruction.params_fields.map((param) => param.default_value || "");});
    setInstructionInputs(initialInputs);
  }, [aiInstructions]);

  const handleInputChange = (instructionKey: string, paramIdx: number, value: string) => {
    setInstructionInputs((prev) => {
      const prevInputs = prev[instructionKey] || [];
      const newInputs = [...prevInputs];
      newInputs[paramIdx] = value;
      return {
        ...prev,
        [instructionKey]: newInputs,
      };
    });
  };

  return (
    <Box width="100%" maxHeight="100%" overflowY="auto">
      <Flex
        direction="row"
        flexWrap="wrap"
        justifyContent="space-evenly"
        alignItems="flex-start"
        gap={4}
        p={4}
        width="100%"
        maxHeight="100%"
        overflowY="auto"
        bg="gray.50"
        shadow="md"
      >
        {instructionNodes.map((node, idx) => {
          const instructionName = node.data.item.name || "Unnamed Instruction";
          const description = node.data.item.description || "No description provided.";

          const aiInstruction = matchInstruction(instructionName, aiInstructions) || {
            function_name: "run_instruction",
            params_fields: [],
          };

          return (
            <Flex
              key={`${aiInstruction.function_name}-${idx}`}
              flex={1}
              height="100%"
              direction="column"
              justifyContent="center"
              alignItems="center"
              gap={2}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg="white"
              shadow="lg"
            >
              <Flex
                justifyContent="center"
                alignItems="center"
                width="90%"
                direction="column"
                gap={2}
              >
                <Text fontWeight="bold" fontSize="md" fontFamily="mono">
                  {instructionName}
                </Text>
                <Text
                  fontSize="xs"
                  color="gray.600"
                  fontFamily="mono"
                  textAlign="center"
                >
                  {aiInstruction.function_name}
                </Text>
                <Text
                  fontSize="xs"
                  color="gray.500"
                  fontFamily="mono"
                  textAlign="center"
                >
                  {description}
                </Text>
              </Flex>

              {aiInstruction.params_fields.map((param: any, paramIdx: number) => (
                <Input
                  key={param.name} 
                  placeholder={`Enter ${param.name}`}
                  size="xs"
                  fontFamily="mono"
                  mb={2}
                  value={
                    instructionInputs[aiInstruction.function_name]?.[paramIdx] ||
                    param.default_value ||
                    ""
                  }
                  onChange={(e) =>
                    handleInputChange(
                      aiInstruction.function_name,
                      paramIdx,
                      e.target.value
                    )
                  }
                />
              ))}
              <Button
                size="xs"
                boxSizing="border-box"
                overflow="hidden"
                fontFamily="mono"
                fontWeight="normal"
                colorScheme="blue"
                onClick={() =>
                  handleCallInstruction(
                    node.data.item.sdkFunction,
                    instructionInputs[aiInstruction.function_name] || []
                  )
                }
              >
                <Text>Call {instructionName}</Text>
              </Button>
            </Flex>
          );
        })}

        {accountNodes.map((node, idx) => (
          <Flex
            key={`account-${idx}`} // Improved key
            direction="column"
            alignItems="flex-start"
            p={4}
            borderWidth="1px"
            borderRadius="md"
            bg="white"
            shadow="md"
            gap={2}
            width={{ base: "100%", md: "45%", lg: "30%" }}
          >
            <Flex
              justifyContent="center"
              alignItems="center"
              width="90%"
              direction="column"
              gap={2}
            >
              <Text fontWeight="bold" fontSize="md" fontFamily="mono">
                {node.data.item.name || "Unnamed Account"}
              </Text>
              <Text
                fontSize="xs"
                color="gray.500"
                fontFamily="mono"
                textAlign="center"
              >
                {node.data.item.description || "No description available."}
              </Text>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};

export default UISpace;
