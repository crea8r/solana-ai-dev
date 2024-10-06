// src/components/Toolbox.tsx

import React from 'react';
import {
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

const toolboxItems = [
  new Account('account-template', 'Account', '', '{}'),
  new Instruction('instruction-template', 'Instruction', '', '', ''),
  new Program('program-template', 'Program', ''),
];

const Toolbox: React.FC = () => {
  return (
    <Box width='30%' maxWidth='200px' bg='gray.100' p={4}>
      <VStack spacing={2} align='stretch'>
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
