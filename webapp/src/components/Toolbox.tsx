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

      console.log('Selected Project Nodes:', selectedProject.details.nodes);

      const instantiatedNodes = selectedProject.details.nodes.map((node): ReactFlowNode | null => {
          if (!node.type || !node.data.item) { console.error('Invalid node:', node); return null; }
          const item = loadItem(node.type, node.data.item);
          if (!item) {
            console.error('Failed to load item for node:', node);
            return null;
          }
          console.log('Loaded Item:', item);
          return {
            ...node,
            data: {
              ...node.data,
              item,
            },
          } as ReactFlowNode;
        })
        .filter((node): node is ReactFlowNode => node !== null);

      console.log('Instantiated Nodes:', instantiatedNodes);

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
      width="20%"
      bg="white"
      py={4}
      px={6}      
      borderRight="1px solid"
      borderColor="gray.200"
      shadow="lg"
      fontFamily="Red Hat Display"
      letterSpacing="0.05em"
    >
      <VStack spacing={2} align="stretch">
        <Flex direction="column" alignItems="stretch" gap={4} mb={6} mt={4} ml={2} mr={2}>
          <Text fontWeight="300" textAlign="left" fontSize="sm" color="gray.400" >Select Example</Text>
          <Divider/>
          <Select
            placeholder="Select Example"
            value={selectedExample}
            onChange={handleExampleChange}
            size="sm"
            fontWeight="600"
            letterSpacing="0.05em"
            fontFamily="Red Hat Display"
            color="gray.600"
            mb={3}
          >
              <option value="Counter"><Text>Counter Program</Text></option>
              <option value="Voting"><Text>Voting Program</Text></option>
              <option value="Crowdfunding"><Text>Crowdfunding Program</Text></option>
              <option value="LoyaltyRewards"><Text>Loyalty Rewards Program</Text></option>
              <option value="TimeLockedSavings"><Text>Time Locked Savings Program</Text></option>
              <option value="EscrowPayment"><Text>Escrow Payment Program</Text></option>
          </Select>
        </Flex>
        <Text fontWeight="300" textAlign="left" fontSize="sm" color="gray.400">Drag items onto canvas</Text>
        <Divider mb={3}/>
        <SimpleGrid columns={2} spacing={4}>
          {toolboxItems.map((item) => (
            <Tooltip key={item.id} label={item.getName()} placement="right"
              bg='#a9b7ff'
              color='white'
              shadow='md'
              fontSize='xs' 
              hasArrow
              borderRadius='md'
              p={3}
            >
              <Box
                as="button"
                draggable
                onDragStart={(e: any) => e.dataTransfer.setData('text/plain', item.getType())}
                p={2}
                letterSpacing="0.05em"
                fontFamily="Red Hat Display"
                borderRadius="md"
                border= '2px solid #a9b7ff'
                _hover={{ shadow: 'md' }}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="auto"
              >
                <Text fontSize="sm" fontWeight="600" color="#909de0">{item.getName()}</Text>
              </Box>
            </Tooltip>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default Toolbox;
