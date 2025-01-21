import React, { useEffect, useState } from 'react';
import {
  Flex,
  Button,
  Avatar,
  Box,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Divider,
  Tooltip,
  Input,
} from '@chakra-ui/react';
import { ChevronDownIcon, EditIcon } from '@chakra-ui/icons';
import { Check, FolderOpen, Wallet, Plus, Code, Save } from 'lucide-react';
import { HiOutlineSparkles } from "react-icons/hi";
import { useProjectContext } from '../../contexts/ProjectContext';
import { useAuthContext, User } from '../../contexts/AuthContext';

interface TopPanelProps {
  generatePrompt: () => void;
  onClickInput: () => void;
  onClickOpen: () => void;
  onClickSave: () => void;
  onClickNew: () => void;
  onLogout: () => void;
  onToggleWallet: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({
  generatePrompt,
  onClickInput,
  onClickOpen,
  onClickSave,
  onClickNew,
  onLogout,
  onToggleWallet,
}) => {
  const { projectContext, setProjectContext } = useProjectContext();
  const { user } = useAuthContext();
  const [hover, setHover] = useState(false);

  const handleMouseEnter = () => setHover(true);
  const handleMouseLeave = () => setHover(false);

  useEffect(() => {
    console.log('apiKey:', user?.openAiApiKey);
  }, [user?.openAiApiKey]);

  return (
    <Flex as="header" h="14" align="center" gap={4} borderBottomWidth="1px" bg="gray.50" px={6} height='8vh'>
      <Flex align="center" gap={4} bg="white" shadow="sm" border="1px solid" borderColor="gray.300" borderRadius="md" px={5} py={1}>
        <Tooltip label="Open Project" mt={2} bg="gray.100" size="xs" shadow="md" color="gray.700" fontSize="xs" fontWeight="normal">
          <IconButton 
            aria-label="Open" 
            icon={<FolderOpen size={14} />} 
            variant="ghost" 
            size="1rem" 
            onClick={onClickOpen} 
          />
        </Tooltip>
        <Tooltip label="Save Project" mt={2} bg="gray.100" size="xs" shadow="md" color="gray.700" fontSize="xs" fontWeight="normal">
          <IconButton 
            aria-label="Save" 
            icon={<Save size={14} />} 
            variant="ghost" 
            size="1rem" 
            onClick={onClickSave} 
          />
        </Tooltip>
        <Tooltip label="New Project" mt={2} bg="gray.100" size="xs" shadow="md" color="gray.700" fontSize="xs" fontWeight="normal">
          <IconButton 
            aria-label="New" 
            icon={<Plus size={14} />} 
            variant="ghost" 
            size="1rem" 
            onClick={onClickNew} 
          />
        </Tooltip>
      </Flex>
      <Divider orientation="vertical" />
      <Flex align="center" gap={4}>
        <Button 
          leftIcon={<Code size={12} />} 
          onClick={generatePrompt} 
          size="xs" 
          px={3}
          py={3}
          bg="white" 
          border="1px solid" 
          borderColor="gray.300"
          shadow="sm"
        > Generate Code </Button>
      </Flex>
      <Flex flex="1" justify="center" align="center">
        <Button 
          variant="ghost" 
          size="xs" 
          onClick={onClickInput}
          px={3}
          py={3}
          bg="white"
          border="1px solid"
          borderColor="gray.300"
          borderRadius="md"
          shadow="sm"
        >
          {projectContext.name || 'Untitled Project'}
          <EditIcon ml={2} />
        </Button>
      </Flex>
      <Flex align="center" gap={4}>
        <Button 
          leftIcon={<Wallet size={12} />} 
          variant="outline" 
          size="xs" 
          onClick={onToggleWallet}
          bg="white"
          border="1px solid"
          borderColor="gray.300"
          borderRadius="md"
          shadow="sm"
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

export default TopPanel;
