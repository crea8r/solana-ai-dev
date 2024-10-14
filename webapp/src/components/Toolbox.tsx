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
    <div className='w-full h-1/6 border border-gray-100 shadow-sm flex flex-col justify-center items-center'>
      <div className='flex flex-row gap-4 justify-center items-center'>
        {toolboxItems.map((item) => (
          <Tooltip key={item.id} label={item.getName()} placement='right'>
            <div
              draggable
              onDragStart={(e: any) =>
                e.dataTransfer.setData('text/plain', item.getType())
              }
              className='h-16 w-16 p-2 rounded-md border border-gray-300 hover:bg-gray-200 flex flex-col items-center justify-center'
            >
              <div className='h-12 w-12 mb-2'>
                {React.createElement(item.getIcon())}
              </div>
              <div className='text-xs'>
                {item.getName()}
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default Toolbox;
