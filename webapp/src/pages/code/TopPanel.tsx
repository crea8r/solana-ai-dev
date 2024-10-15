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
      as="header"
      borderBottom="1px solid"
      borderColor="gray.200"
      justifyContent="space-between"
      alignItems="center"
      height="14"
      px={4}
      shadow="md"
    >
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center" gap={4}>
        <Menu>
          <MenuButton as={Button} variant="ghost" size="sm" mr={2}>
            Project
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => {}}>Open</MenuItem>
            <MenuItem onClick={() => {}}>Save</MenuItem>
            <MenuItem onClick={() => {}}>New</MenuItem>
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton as={Button} variant="ghost" size="sm" mr={2}>
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
        <Button variant="ghost" size="sm" mr={2}>Save</Button>
        <Button variant="ghost" size="sm" mr={2}>Build</Button>
        <Button variant="ghost" size="sm">Test</Button>
      </Flex>
      <Avatar size='sm' src="/placeholder.svg" />
    </Flex>
  );
};

export default TopPanel;
