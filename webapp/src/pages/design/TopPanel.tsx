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
import { Check, FolderOpen, Wallet, Plus, Code, Save, Sparkles } from 'lucide-react';
import { HiOutlineSparkles } from "react-icons/hi";
import { useProjectContext } from '../../contexts/ProjectContext';

interface TopPanelProps {
  generatePrompt: () => void;
  onClickInput: () => void;
  onClickOpen: () => void;
  onClickSave: () => void;
  onClickNew: () => void;
  onLogout: () => void;
  onToggleWallet: () => void;
  onSelectModel: (model: string, apiKey: string) => void;
}

const TopPanel: React.FC<TopPanelProps> = ({
  generatePrompt,
  onClickInput,
  onClickOpen,
  onClickSave,
  onClickNew,
  onLogout,
  onToggleWallet,
  onSelectModel,
}) => {
  const { projectContext, setProjectContext } = useProjectContext();
  const [hover, setHover] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Codestral');
  const [apiKey, setApiKey] = useState('');

  const handleMouseEnter = () => setHover(true);
  const handleMouseLeave = () => setHover(false);

  useEffect(() => {
    console.log('apiKey:', apiKey);
  }, [apiKey]);

  return (
    <Flex as="header" h="14" align="center" gap={4} borderBottomWidth="1px" bg="gray.50" px={6}>
      <Flex align="center" gap={4}>
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
        <Menu>
          <MenuButton p={3} as={Button} leftIcon={<HiOutlineSparkles size={14} />} rightIcon={<ChevronDownIcon />} variant="outline" size="xs">
            <Text fontSize="xs">Select AI Model</Text>
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => { onSelectModel('codestral-latest', ''); setSelectedModel('codestral-latest'); }}><Text fontSize="xs">codestral-latest</Text></MenuItem>
            <MenuItem onClick={() => { onSelectModel('gpt-4o', apiKey); setSelectedModel('gpt-4o'); }}><Text fontSize="xs">gpt-4o</Text></MenuItem>
          </MenuList>
        </Menu>
        {selectedModel === 'gpt-4o' && (
          <Flex align="center" gap={1}>
            <Input
              placeholder="Enter API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              size="xs"
              width="200px"
            />
            <Tooltip label="Save API Key" mt={2} bg="gray.100" size="xs" shadow="md" color="gray.700" fontSize="xs" fontWeight="normal">
              <Button
                variant="ghost"
                size="xs"
                colorScheme="blue"
                onClick={() => {
                  setProjectContext({ ...projectContext, apiKey });
              }}
              leftIcon={<Check size={14} />}
              >
              </Button>
            </Tooltip>
          </Flex>
        )}
        <Button leftIcon={<Code size={12} />} onClick={generatePrompt} size="xs" p={3}>
          Generate Code
        </Button>
      </Flex>
      <Flex flex="1" justify="center" align="center">
        <Button variant="ghost" size="xs" onClick={onClickInput}>
          {projectContext.name || 'Untitled Project'}
          <EditIcon ml={2} />
        </Button>
      </Flex>
      <Flex align="center" gap={4}>
        <Button leftIcon={<Wallet size={12} />} variant="outline" size="xs" onClick={onToggleWallet}>
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
