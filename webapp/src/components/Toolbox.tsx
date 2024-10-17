// src/components/Toolbox.tsx

import React, { useEffect } from 'react';
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
} from '@chakra-ui/react';
import { Account } from '../items/Account';
import { Instruction } from '../items/Instruction';
import { Program } from '../items/Program';
import { GoPencil } from 'react-icons/go';
import { useProject } from '../contexts/ProjectContext';


const toolboxItems = [
  new Account('account-template', 'Account', '', '{}'),
  new Instruction('instruction-template', 'Instruction', '', '', ''),
  new Program('program-template', 'Program', ''),
];

const Toolbox: React.FC = () => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [projectDesc, setProjectDesc] = React.useState('Project Description');
  const { project, savedProject, updateProject, updateSavedProject } = useProject();

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProjectDesc(event.target.value);
  };

  const handleInputBlur = () => {
    updateSavedProject({ description: projectDesc });
    setIsEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      updateSavedProject({ description: projectDesc });
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (savedProject) {
      setProjectDesc(savedProject.description);
    }
  }, [savedProject]);

  return (
    <Box
      width="30%"
      maxWidth="200px"
      bg="white"
      p={2}
      borderRight="1px solid"
      borderColor="gray.200"
      borderRightWidth="1px"
      shadow="md"
    >
      <VStack spacing={2} align='stretch'>
      <Flex
          onClick={handleEditClick}
          direction="row"
          alignItems="center"
          gap={4}
          mb={6}
          mt={4}
          ml={2}
          mr={2}
        >
          <h1 className="text-sm">
            {projectDesc}
          </h1>
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
