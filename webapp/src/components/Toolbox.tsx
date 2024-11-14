import React, { useState } from 'react';
import {
  Flex,
  Box,
  SimpleGrid,
  Icon,
  Tooltip,
  VStack,
  Divider,
  Text,
  Select,
} from '@chakra-ui/react';
import { useProjectContext } from '../contexts/ProjectContext';
import { predefinedProjects } from '../interfaces/example';
import { loadItem } from '../utils/itemFactory';
import { Account } from '../items/Account';
import { Instruction } from '../items/Instruction';
import { Program } from '../items/Program';
import { Node as ReactFlowNode } from 'react-flow-renderer';

const toolboxItems = [
  new Account('account-template', 'Account', '', '{}', ''),
  new Instruction('instruction-template', 'Instruction', '', '', '', ''),
  new Program('program-template', 'Program', ''),
];

const Toolbox: React.FC<{ onExampleChange: (exampleName: string) => void }> = ({ onExampleChange }) => {
  const { setProjectContext } = useProjectContext();
  const [selectedExample, setSelectedExample] = useState('');

  const handleExampleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const exampleName = event.target.value;
    setSelectedExample(exampleName);
    onExampleChange(exampleName);

    if (exampleName && predefinedProjects[exampleName]) {
      const selectedProject = predefinedProjects[exampleName];
      if (!selectedProject) return;

      const instantiatedNodes = selectedProject.details.nodes
        .map((node): ReactFlowNode | null => {
          if (!node.type || !node.data.item) return null;
          const item = loadItem(node.type, node.data.item);
          return {
            ...node,
            data: {
              ...node.data,
              item,
            },
          } as ReactFlowNode;
        })
        .filter((node): node is ReactFlowNode => node !== null);

      setProjectContext((prev) => ({
        ...prev,
        id: selectedProject.id,
        name: selectedProject.name,
        description: selectedProject.description,
        details: {
          ...prev.details,
          nodes: instantiatedNodes,
          edges: selectedProject.details.edges,
        },
      }));
    }
  };

  return (
    <Box
      width="30%"
      maxWidth="200px"
      bg="white"
      p={2}
      borderRight="1px solid"
      borderColor="gray.200"
      shadow="md"
    >
      <VStack spacing={2} align="stretch">
        <Flex direction="column" alignItems="stretch" gap={4} mb={6} mt={4} ml={2} mr={2}>
          <Select
            placeholder="Select Example"
            value={selectedExample}
            onChange={handleExampleChange}
            size="sm"
            mb={4}
          >
            <option value="Counter">Counter Program</option>
            <option value="Voting">Voting Program</option>
            <option value="Crowdfunding">Crowdfunding Program</option>
            <option value="LoyaltyRewards">Loyalty Rewards Program</option>
            <option value="TimeLockedSavings">Time Locked Savings Program</option>
          </Select>
        </Flex>
        <Text fontWeight="400" textAlign="left" fontSize="xs">
          Drag items onto canvas
        </Text>
        <Divider />
        <SimpleGrid columns={2} spacing={4}>
          {toolboxItems.map((item) => (
            <Tooltip key={item.id} label={item.getName()} placement="right">
              <Box
                as="button"
                draggable
                onDragStart={(e: any) => e.dataTransfer.setData('text/plain', item.getType())}
                p={2}
                borderRadius="md"
                border="1px solid"
                borderColor="gray.300"
                _hover={{ bg: 'gray.200' }}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="80px"
              >
                <Icon as={item.getIcon()} boxSize={4} mb={2} />
                <Text fontSize="xs">{item.getName()}</Text>
              </Box>
            </Tooltip>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default Toolbox;
