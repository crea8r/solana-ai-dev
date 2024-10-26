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
}

const TopPanel: React.FC<TopPanelProps> = ({ onBuild }) => {
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
      <Flex flexDirection="row" justifyContent="space-evenly" alignItems="center">
        <Menu>
          <MenuButton as={Button} variant="ghost" size="sm" mr={2}>File</MenuButton>
          <MenuList>
            <MenuItem onClick={() => {}}>Open</MenuItem>
            <MenuItem onClick={() => {}}>Save</MenuItem>
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
