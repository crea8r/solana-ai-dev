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

interface TopPanelProps {}

const TopPanel: React.FC<TopPanelProps> = () => {
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
          <MenuButton as={Button} mr={2}>
            Team
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => console.log('Manage')} isDisabled={true}>
              Manage
            </MenuItem>
            <MenuItem onClick={() => console.log('Invite')} isDisabled={true}>
              Invite
            </MenuItem>
          </MenuList>
        </Menu>
        <Button mr={2}>Save</Button>
        <Button mr={2}>Build</Button>
        <Button>Test</Button>

        {/* <MenuItem onClick={() => console.log('Build')}>Build</MenuItem> */}
      </Flex>
      <Avatar size='sm' />
    </Flex>
  );
};

export default TopPanel;
