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
  onTest: () => void;
  onDeploy: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({ onBuild, onSave, onTest, onDeploy }) => {
  return (
    <Flex
      borderBottom="1px solid"
      borderColor="gray.300"
      justifyContent="space-between"
      alignItems="center"
      bg="gray.50"
      p={4}
    >
      <Flex flexDirection="row" justifyContent="space-evenly" alignItems="center">
        <Menu>
          <MenuButton as={Button} variant="ghost" size="xs" mr={2}>File</MenuButton>
          <MenuList>
            <MenuItem fontSize="xs" onClick={() => {}}>Open</MenuItem>
            <MenuItem fontSize="xs" onClick={onSave}>Save</MenuItem>
            <MenuItem fontSize="xs" onClick={() => {}}>New</MenuItem>
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton as={Button} variant="ghost" size="xs" mr={2}>Team</MenuButton>
          <MenuList>
            <MenuItem onClick={() => console.log('Manage')} isDisabled={true}>Manage</MenuItem>
            <MenuItem onClick={() => console.log('Invite')} isDisabled={true}>Invite</MenuItem>
          </MenuList>
        </Menu>
        <Button variant="ghost" size="xs" mr={2} onClick={onBuild}>Build</Button>
        <Button variant="ghost" size="xs" mr={2} onClick={onDeploy}>Deploy</Button>
        <Button variant="ghost" size="xs" onClick={onTest}>Test</Button>
      </Flex>
      <Avatar size="xs" src="/placeholder.svg" />
    </Flex>
  );
};

export default React.memo(TopPanel);
