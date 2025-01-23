import React, { useState } from 'react';
import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  Tooltip,
  Button,
  Select,
  Text,
  VStack,
  Heading,
  Divider,
  Flex,
} from '@chakra-ui/react';
import { SettingsIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useProjectContext } from '../contexts/ProjectContext';
import { predefinedProjects } from '../interfaces/example';
import { loadItem } from '../utils/itemFactory';
import { Account } from '../items/Account';
import { Instruction } from '../items/Instruction';
import { Program } from '../items/Program';
import { Node as ReactFlowNode } from 'react-flow-renderer';
import { TokenAccount } from '../items/Account/TokenAccount';
import { MintAccount } from '../items/Account/MintAccount';
import { tabStyle } from '../styles/baseStyles';

const categorizedToolboxItems = {
  accounts: [
    new Account("", { snake: 'account', pascal: 'Account' }, 'Account', "", true, false, [{ name: 'field1', type: 'u64' }, { name: 'field2', type: 'u64' }]),
    new TokenAccount("", { snake: 'token_account', pascal: 'TokenAccount' }, 'Token Account', "", true, false, [{ name: 'field1', type: 'u64' }, { name: 'field2', type: 'u64' }]),
    new MintAccount("", { snake: 'mint_account', pascal: 'MintAccount' }, 'Mint Account', '11111111111111111111111111111111', true, false, [{ name: 'field1', type: 'u64' }, { name: 'field2', type: 'u64' }], 9, '11111111111111111111111111111111'),
  ],
  programs: [
    new Program("", { snake: 'program', pascal: 'Program' }, 'Program', '11111111111111111111111111111111'),
  ],
  instructions: [
    new Instruction("", { snake: 'instruction', pascal: 'Instruction' }, 'Instruction', [], [], [], []),
  ],
};

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
      //console.log('Selected Project:', selectedProject.details.nodes[0].data.item);
      //console.log('Project Context:', projectContext);
    }
  };

  const renderDraggableItems = (items: any[]) => (
    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
      {items.map((item) => (
        <Box
          key={item.getType()}
          as="button"
          draggable
          onDragStart={(e: React.DragEvent<HTMLDivElement>) => e.dataTransfer.setData('text/plain', item.getType())}
          p={2}
          borderWidth="1px"
          borderRadius="md"
          borderColor="gray.300"
          bg="white"
          _hover={{ shadow: 'md' }}
        >
          <Text fontWeight="medium" fontSize="xs" textAlign="center">
            {item.getNamePascal()}
          </Text>
        </Box>
      ))}
    </Grid>
  );

  return (
    <Flex 
      padding="15px"
      bg="gray.50" 
      borderRadius="md" 
      borderWidth="1px" 
      width='100%' 
      height='100%'
      direction="column"
      justifyContent="flex-start"
      alignItems="center"
    >
      <Tabs variant="enclosed" width='100%' >
        <TabList>
          <Tab {...tabStyle}>Programs</Tab>
          <Tab {...tabStyle}>Instructions</Tab>
          <Tab {...tabStyle}>Accounts</Tab>
        </TabList>

        <TabPanels>
           {/* Programs Tab */}
           <TabPanel>
            <VStack spacing={4} align="stretch">
              <Select
                placeholder="Select Program"
                value={selectedExample}
                onChange={handleExampleChange}
                fontSize="sm"
                bg="white"
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.300"
              >
                <option value="Counter">Counter Program</option>
                <option value="TokenTransfer">Token Transfer Program</option>
              </Select>
            </VStack>
            <Divider my={4} />
            {renderDraggableItems(categorizedToolboxItems.programs)}
          </TabPanel>

          {/* Instructions Tab */}
          <TabPanel>
            <Divider my={4} />
            {renderDraggableItems(categorizedToolboxItems.instructions)}
          </TabPanel>

          {/* Accounts Tab */}
          <TabPanel>
            <Divider my={4} />
            {renderDraggableItems(categorizedToolboxItems.accounts)}
          </TabPanel>

        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default Toolbox;
