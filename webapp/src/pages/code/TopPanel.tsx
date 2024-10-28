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

interface TopPanelProps {
  onBuild: () => void;
  onSave: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({ onBuild, onSave }) => {
  return (
    <Flex
      height='10vh'
      as="header"
      borderBottom="1px solid"
      borderColor="gray.200"
      justifyContent="space-between"
      alignItems="center"
      px={4}
      py={2}
      shadow="sm"
    >
      <Flex flexDirection="row" justifyContent="space-evenly" alignItems="center">
        <Menu>
          <MenuButton as={Button} variant="ghost" size="sm" mr={2}>File</MenuButton>
          <MenuList>
            <MenuItem onClick={() => {}}>Open</MenuItem>
            <MenuItem onClick={onSave}>Save</MenuItem>
            <MenuItem onClick={() => {}}>New</MenuItem>
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton as={Button} variant="ghost" size="sm" mr={2}>Team</MenuButton>
          <MenuList>
            <MenuItem onClick={() => console.log('Manage')} isDisabled={true}>Manage</MenuItem>
            <MenuItem onClick={() => console.log('Invite')} isDisabled={true}>Invite</MenuItem>
          </MenuList>
        </Menu>
        <Button variant="ghost" size="sm" mr={2} onClick={onBuild}>Build</Button>
        <Button variant="ghost" size="sm">Test</Button>
      </Flex>
      <Avatar size="xs" src="/placeholder.svg" />
    </Flex>
  );
};

export default TopPanel;
