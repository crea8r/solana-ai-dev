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
  new Account("", {snake: 'account', pascal: 'Account'}, 'Account', true, false, [{name: 'field1', type: 'u64'}, {name: 'field2', type: 'u64'}]),
  new Instruction("", {snake: 'instruction', pascal: 'Instruction'}, 'Instruction', [], [], [], []),
  new Program("", {snake: 'program', pascal: 'Program'}, 'Program', '11111111111111111111111111111111'),
];

const Toolbox: React.FC<{ onExampleChange: (exampleName: string) => void }> = ({ onExampleChange }) => {
  const { setProjectContext, projectContext } = useProjectContext();
  const [selectedExample, setSelectedExample] = useState('');

  const handleExampleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const exampleName = event.target.value;
    setSelectedExample(exampleName);
    onExampleChange(exampleName);

    if (exampleName && predefinedProjects[exampleName]) {
      const selectedProject = predefinedProjects[exampleName];
      if (!selectedProject) return;

      //console.log('Selected Project:', selectedProject);

      const instantiatedNodes = selectedProject.details.nodes.map((node): ReactFlowNode | null => {
          if (!node.type || !node.data.item) { console.error('Invalid node:', node); return null; }
          const item = loadItem(node.type, node.data.item);
          if (!item) {
            console.error('Failed to load item for node:', node);
            return null;
          }
          return {
            ...node,
            data: {
              ...node.data,
              item,
            },
          } as ReactFlowNode;
        })
        .filter((node): node is ReactFlowNode => node !== null);

      //console.log('Selected Project:', selectedProject);

      setProjectContext((prev) => ({
        ...prev,
        id: selectedProject.id,
        name: selectedProject.name,
        description: selectedProject.description,
        details: {
          ...prev.details,
          nodes: instantiatedNodes,
          edges: selectedProject.details.edges,
          uiStructure: selectedProject.details.uiStructure,
        },
      }));
      console.log('Selected Project:', selectedProject.details.nodes[0].data.item);
      console.log('Project Context:', projectContext);
    }
  };

  return (
    <Box
      width="20w"
      bg="gray.50"
      py={4}
      px={6}      
      borderRight="1px solid"
      borderColor="gray.200"
      fontFamily="IBM Plex Mono"
      letterSpacing="0.05em"
    >
      <VStack spacing={2} align="stretch">
        <Flex direction="column" alignItems="stretch" gap={4} mb={6} mt={4} ml={2} mr={2}>
          <Select
            placeholder="Select Example"
            value={selectedExample}
            onChange={handleExampleChange}
            size="sm"
            fontWeight="normal"
            letterSpacing="0.05em"
            fontFamily="IBM Plex Mono"
            bg="white"
            color="gray.700"
            mb={3}
            shadow="sm"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.300"
          >
              <option value="Counter"><Text>Counter Program</Text></option>
              <option value="TransferToken"><Text>Transfer Token Program</Text></option>
              <option value="StakingRewards"><Text>Staking Rewards Program</Text></option>
          </Select>
        </Flex>
        <Text fontWeight="normal" textAlign="left" fontSize="sm" color="gray.600">Drag items onto canvas</Text>
        <Divider mb={3} borderColor="gray.500"/>
        <SimpleGrid columns={2} spacing={4}>
          {toolboxItems.map((item) => (
            <Tooltip key={item.identifier} label={item.getNamePascal()} placement="right"
              bg='#a9b7ff'
              color='white'
              shadow='sm'
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
                fontFamily="IBM Plex Mono"
                borderRadius="md"
                border= '2px solid #a9b7ff'
                bg="white"
                _hover={{ shadow: 'md' }}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="auto"
                shadow="sm"
              >
                <Text fontSize="sm" fontWeight="600" color="#909de0">{item.getNamePascal()}</Text>
              </Box>
            </Tooltip>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default Toolbox;
