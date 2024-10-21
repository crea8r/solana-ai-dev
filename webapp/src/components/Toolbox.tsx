// src/components/Toolbox.tsx

import React, { useContext, useState } from 'react';
import {
  Flex,
  Textarea,
  Box,
  SimpleGrid,
  Icon,
  Tooltip,
  VStack,
  Divider,
  Text,
  Input,
} from '@chakra-ui/react';
import { Account } from '../items/Account';
import { Instruction } from '../items/Instruction';
import { Program } from '../items/Program';
import { useProject } from '../contexts/ProjectContext';


const toolboxItems = [
  new Account('account-template', 'Account', '', '{}', ''),
  new Instruction('instruction-template', 'Instruction', '', '', '', ''),
  new Program('program-template', 'Program', ''),
];

const Toolbox: React.FC = () => {
  const { savedProject, updateSavedProject } = useProject();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleSubmit = () => {
    updateSavedProject({ name: projectName, description: projectDescription });
  };

  return (
    <Box
      width='30%'
      maxWidth='200px'
      bg='white'
      p={2}
      borderRight='1px solid'
      borderColor='gray.200'
      borderRightWidth='1px'
      shadow='md'
    >
      <VStack spacing={2} align='stretch'>
      <Flex
          direction="column"
          alignItems="stretch"
          gap={4}
          mb={6}
          mt={4}
          ml={2}
          mr={2}
        >
          <Input
            placeholder='Project Name'
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            p={2}
          />
          <Textarea
            placeholder='Project Description'
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            p={2}
          />
          <Box as='button' onClick={handleSubmit} bg='blue.500' color='white' p={1} borderRadius='md' fontSize='sm'>
            Save Project
          </Box>
        </Flex>
        <Text fontWeight='light' textAlign='left'>
          Drag items into canvas
        </Text>
        <Divider />
        <SimpleGrid columns={2} spacing={4}>
          {toolboxItems.map((item) => (
            <Tooltip key={item.id} label={item.getName()} placement='right'>
              <Box
                as='button'
                draggable
                onDragStart={(e: any) =>
                  e.dataTransfer.setData('text/plain', item.getType())
                }
                p={2}
                borderRadius='md'
                border='1px solid'
                borderColor='gray.300'
                _hover={{ bg: 'gray.200' }}
                display='flex'
                flexDirection='column'
                alignItems='center'
                justifyContent='center'
                height='80px'
              >
                <Icon as={item.getIcon()} boxSize={6} mb={2} />
                <Text fontSize='sm'>{item.getName()}</Text>
              </Box>
            </Tooltip>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default Toolbox;
