// src/components/TopPanel.tsx

import React from 'react';
import {
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Avatar,
} from '@chakra-ui/react';
import { FaCog } from 'react-icons/fa';
import { logEvent } from '../../utils/analytics';

interface TopPanelProps {
  generatePrompt: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({ generatePrompt }) => {
  return (
    <Flex
      justifyContent='space-between'
      alignItems='center'
      p={2}
      bg='blue.100'
    >
      <Flex>
        <Menu>
          <MenuButton as={Button} mr={2}>
            Project
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => console.log('Load')}>Open</MenuItem>
            <MenuItem onClick={() => console.log('Save')}>Save</MenuItem>
            <MenuItem onClick={() => console.log('New project')}>New</MenuItem>
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton as={Button}>Team</MenuButton>
          <MenuList>
            <MenuItem onClick={() => console.log('Manage')} isDisabled={true}>
              Manage
            </MenuItem>
            <MenuItem onClick={() => console.log('Invite')} isDisabled={true}>
              Invite
            </MenuItem>
          </MenuList>
        </Menu>
        <Button
          leftIcon={React.createElement(FaCog)}
          style={{
            marginLeft: '10px',
          }}
          onClick={() => {
            logEvent('Prompt', 'Generate', 'click');
            generatePrompt();
          }}
        >
          Prompt
        </Button>
        {/* <MenuItem onClick={() => console.log('Build')}>Build</MenuItem> */}
      </Flex>
      <Avatar size='sm' />
    </Flex>
  );
};

export default TopPanel;
