import React, { useEffect, useState } from 'react';
import {
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Avatar,
  Box,
  Text,
  IconButton,
} from '@chakra-ui/react';
import { FileText, Users, Settings, Sparkles, Pencil, PanelsTopLeft } from 'lucide-react';
import { logEvent } from '../../utils/analytics';
import InputModal from '../../components/InputModal';
import logo from '../../assets/logo/solai_logo_png.png';
import { useProjectContext } from '../../contexts/ProjectContext';

interface TopPanelProps {
  generatePrompt: () => void;
  onClickInput: () => void;
  onClickOpen: () => void;
  onClickSave: () => void;
  onClickNew: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({
  generatePrompt,
  onClickInput,
  onClickOpen,
  onClickSave,
  onClickNew,
}) => {
  const { projectContext } = useProjectContext();
  const [hover, setHover] = useState(false);

  const handleMouseEnter = () => setHover(true);
  const handleMouseLeave = () => setHover(false);

  return (
    <Box as="header" bg="white" borderBottom="1px solid" borderColor="gray.200" px={4} py={3}>
      <Flex alignItems="center" justifyContent="space-between" width="100%" px={4}>
        <Flex alignItems="center" gap={2}>
          <Menu>
              <MenuButton as={Button} variant="ghost" colorScheme="gray" fontSize="sm">
                <Text fontSize="sm" fontWeight="medium">File</Text>
              </MenuButton>
              <MenuList fontSize="xs">
                <MenuItem onClick={onClickOpen}>Open</MenuItem>
                <MenuItem onClick={onClickSave}>Save</MenuItem>
                <MenuItem onClick={onClickNew}>New</MenuItem>
              </MenuList>
            </Menu>
          <Button variant="ghost" colorScheme="gray"><Text fontSize="sm" fontWeight="medium">Team</Text></Button>
        </Flex>
        <Flex justifyContent="space-evenly" alignItems="center" width="100%" pl="20" pr="20">
          <Flex width="100%" alignItems="center" justifyContent="flex-start">
            <Box
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              p={2}
              borderRadius="md"
              position="relative"
              fontSize="sm"
              fontWeight="semibold"
              color="blue.600"
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
            </Box>
          <Button variant="ghost" size="xs" colorScheme="blue" onClick={onClickInput}><Pencil className="h-3 w-3" /></Button>
          </Flex>
          <Box></Box>
        </Flex>
        <Flex alignItems="center" gap={1}>
          <Button variant="ghost" size="sm" colorScheme="blue" onClick={generatePrompt}>
            <Sparkles className="h-3 w-3 mr-1 text-blue-600"/>
            <Text fontSize="sm" color="blue.600">Generate Code</Text>
          </Button>
          <Flex alignItems="center" gap={4}>
           <Button variant="ghost" size="sm" colorScheme="gray">
              <IconButton
                aria-label="Settings"
                icon={<Settings className="h-3 w-3" />}
                variant="ghost"
                size="xs"
                colorScheme="gray"
              />
              <Text fontSize="sm" fontWeight="medium">Settings</Text>
           </Button>
            <Avatar size="xs" src="/placeholder.svg" />
          </Flex>
        </Flex>
        
      </Flex>
    </Box>
  );
};

export default TopPanel;
