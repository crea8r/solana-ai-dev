import React from 'react';
import {
  Text,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Avatar,
} from '@chakra-ui/react';
import { Wallet } from 'lucide-react';

interface TopPanelProps {
  onBuild: () => void;
  onSave: () => void;
  onTest: () => void;
  onDeploy: () => void;
  onToggleWallet: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({ onBuild, onSave, onTest, onDeploy, onToggleWallet }) => {
  return (
    <Flex
      borderBottom="1px solid"
      borderColor="gray.300"
      justifyContent="space-evenly"
      alignItems="center"
      bg="gray.50"
      p={4}
    >
      <Flex 
        flexDirection="row" 
        flex="1"
        justifyContent="flex-start" 
        gap={1}
        alignItems="center"
      >
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
      <Flex 
        flexDirection="row" 
        flex="1"
        justifyContent="flex-end"
        alignItems="center" 
        gap={4} 
        marginRight={4}
      >
        <Button 
            leftIcon={<Wallet size={12} />} 
            variant="outline" 
            size="xs" 
            onClick={onToggleWallet}
            bg="white"
            shadow="sm"
            marginRight={2}
          >
            <Text fontSize="xs">Wallet</Text>
          </Button>
          <Avatar size="xs" src="/placeholder.svg" />
      </Flex>
    </Flex>
  );
};

export default React.memo(TopPanel);
