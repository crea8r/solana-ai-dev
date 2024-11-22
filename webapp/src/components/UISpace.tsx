import React, { useEffect } from "react";
import { useProjectContext } from "../contexts/ProjectContext";
import { Box, VStack, Button, Input, Text, Flex } from "@chakra-ui/react";
import { Edge, Node } from "react-flow-renderer";

const RuntimeInteractor = () => {
  const { projectContext } = useProjectContext();
  const { nodes, edges } = projectContext.details;

  useEffect(() => {
    console.log("nodes", nodes);
    console.log("edges", edges);
  }, [nodes, edges]);

  const instructionNodes = nodes.filter((node) => node.type === "instruction");
  const accountNodes = nodes.filter((node) => node.type === "account");

  const getRelationships = (edges: Edge[], nodes: Node[]) => {
    return edges.map((edge: Edge) => {
      const sourceNode = nodes.find((node: Node) => node.id === edge.source);
      const targetNode = nodes.find((node: Node) => node.id === edge.target);
  
      return {
        source: sourceNode,
        target: targetNode,
      };
    });
  };
  
  const relationships = getRelationships(edges, nodes);

  const handleCallInstruction = async (sdkFunction: any, inputs: any) => {
    try {
      const result = await sdkFunction(...inputs);
      console.log("Instruction Result:", result);
    } catch (error) {
      console.error("Error calling instruction:", error);
    }
  };

  return (
    <Box>
      <VStack spacing={6}>
        {instructionNodes.map((node, idx) => {
          const instructionName = node.data.item.name || "Unnamed Instruction";
          const description = node.data.item.description || "No description available.";
          const parameters = node.data.item.parameters || "";

          return (
            <Flex
              direction="column"
              justifyContent="center"
              alignItems="center"
              gap={2}
              key={idx}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              w="100%"
              bg="gray.50"
            >
              <Text fontWeight="bold">{instructionName}</Text>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                {description}
              </Text>

              {/* Render input fields for parameters */}
              {parameters.split(",").map((param: string, inputIdx: number) => (
                <Input
                  key={inputIdx}
                  placeholder={`Enter ${param.trim()}`}
                  mb={2}
                  onChange={(e) => {
                    // Store user input back into node data
                    const inputs = node.data.item.inputs || [];
                    inputs[inputIdx] = e.target.value;
                    node.data.item.inputs = inputs;
                  }}
                />
              ))}

              <Button
                colorScheme="blue"
                onClick={() =>
                  handleCallInstruction(node.data.item.sdkFunction, node.data.item.inputs || [])
                }
              >
                Call {instructionName}
              </Button>
            </Flex>
          );
        })}

        {/* Render Account Nodes */}
        {accountNodes.map((node, idx) => (
          <Box
            key={idx}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            width="100%"
            bg="gray.50"
          >
            <Text fontWeight="bold">{node.data.item.name}</Text>
            {/* Show fields of the account */}
            {node.data.item.fields?.map((field: any, fieldIdx: any) => (
              <Text key={fieldIdx}>{field}</Text>
            ))}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default RuntimeInteractor;
