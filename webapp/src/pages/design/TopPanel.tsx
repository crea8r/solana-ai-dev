import React, { useEffect, useState } from 'react';
import {
  Flex,
  Button,
  Avatar,
  Box,
  Text,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { Pencil, WalletIcon, Check } from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { promptAI } from '../../services/prompt';

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
    <Flex as="header" bg="white" borderBottom="1px solid" borderColor="gray.200" p={1} justifyContent="space-evenly" alignItems="center">
      <Flex flex={1} alignItems="center" justifyContent="space-evenly" px={8} gap={10}>
        <Flex alignItems="center" gap={2}>
          <Button variant="ghost" size="xs" colorScheme="gray" onClick={onClickOpen}>Open</Button>
          <Button variant="ghost" size="xs" colorScheme="gray" onClick={onClickSave}>Save</Button>
          <Button variant="ghost" size="xs" colorScheme="gray" onClick={onClickNew}>New</Button>
          <Menu>
            <MenuButton as={Button} variant="ghost" size="xs" colorScheme="blue">
              <Text fontSize="xs" color="#5688e8" fontWeight="medium">Select AI Model</Text>
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => {onSelectModel('codestral-latest', ''); setSelectedModel('codestral-latest')}}>codestral-latest</MenuItem>
              <MenuItem onClick={() => {onSelectModel('gpt-4o', apiKey); setSelectedModel('gpt-4o')}}>gpt-4o</MenuItem>
            </MenuList>
          </Menu>
          {selectedModel === 'gpt-4o' && (
            <Box>
              <input
                type="text"
                placeholder="Enter API Key"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                }}
                style={{ marginLeft: '10px', padding: '5px', fontSize: '12px' }}
              />
              <Button
                variant="ghost"
                size="xs"
                colorScheme="blue"
                onClick={() => {
                  setProjectContext({ ...projectContext, apiKey });
                }}
                style={{ marginLeft: '5px' }}
                leftIcon={<Check size={16} />}
              >
              </Button>
            </Box>
          )}
          <Button variant="ghost" size="xs" colorScheme="blue" onClick={generatePrompt}>
            <Text fontSize="xs" color="#5688e8" fontWeight="medium">Generate Code</Text>
          </Button>
        </Flex>
        <Flex justifyContent="space-between" alignItems="center" gap={2} flexGrow={1}>
          <Flex flex={1} alignItems="center" justifyContent="space-evenly" gap={8}>
            <Box
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              p={2}
              gap={2}
              borderRadius="md"
              position="relative"
              fontSize="xs"
              fontWeight="medium"
              color="gray.700"
            >
              {projectContext.name || 'Untitled Project'}
              {hover && (
                <Box
                  bg="gray.100"
                  p={2}
                  borderRadius="md"
                  position="absolute"
                  top="100%"
                  mt={2}
                  width="250px"
                  maxWidth="300px"
                  zIndex="tooltip"
                  boxShadow="md"
                >
                  {projectContext.description && <Text fontSize="xs">{projectContext.description}</Text>}
                </Box>
              )}
              <Button variant="ghost" size="xs" colorScheme="gray" onClick={onClickInput}><Pencil className="h-3 w-3" /></Button>
            </Box>
          </Flex>
        </Flex>
        <Button variant="ghost" size="xs" colorScheme="blue" onClick={onToggleWallet} leftIcon={<WalletIcon size={16} />}>Wallet</Button>
        <Flex alignItems="center" gap={1} padding={1}>
          <Flex alignItems="center" gap={4}>
            <Avatar size="xs" src="/placeholder.svg" />
            <Button variant="ghost" size="xs" colorScheme="red" onClick={onLogout}>Logout</Button>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default TopPanel;
