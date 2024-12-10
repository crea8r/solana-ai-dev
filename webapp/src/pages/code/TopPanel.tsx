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
  onToggleWallet: () => void;
  onLogout: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({ 
  onToggleWallet,
  onLogout
}) => {
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
          <MenuList>
            <MenuItem onClick={() => console.log('Manage')} isDisabled={true}>Manage</MenuItem>
            <MenuItem onClick={() => console.log('Invite')} isDisabled={true}>Invite</MenuItem>
          </MenuList>
        </Menu>
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
          <Menu>
          <MenuButton as={Button} variant="ghost" size="xs" rounded="full">
            <Avatar size="xs" src="/placeholder.svg" />
          </MenuButton>
          <MenuList w="auto">
            <MenuItem onClick={onLogout} p={0} pl={2}>
              <Text fontSize="xs">Logout</Text>
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default React.memo(TopPanel);
