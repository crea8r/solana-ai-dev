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
        <Flex justifyContent="center" alignItems="center" gap={1}>
          <Box
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            p={2}
            borderRadius="md"
            position="relative"
          >
            {projectContext.name}
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
                <Text fontSize="sm">{projectContext.description}</Text>
              </Box>
            )}
          </Box>
          <Button variant="ghost" size="sm" colorScheme="blue" onClick={onClickInput}>
            <Pencil className="h-4 w-4" />
          </Button>
        </Flex>
        <Flex alignItems="center" gap={1}>
          <Flex alignItems="center" gap={1}>
              <Button variant="ghost" size="sm" colorScheme="gray" onClick={generatePrompt}>
                <Sparkles className="h-4 w-4 mr-1" />
                <Text fontSize="xs">Generate Code</Text>
              </Button>
              <Menu>
                <MenuButton as={Button} variant="ghost" size="xs" colorScheme="gray">
                  <Flex alignItems="center" gap={0}>
                    <PanelsTopLeft className="h-4 w-4 mr-2" />
                    <Text fontSize="xs">Project</Text>
                  </Flex>
                </MenuButton>
                <MenuList fontSize="xs">
                  <MenuItem onClick={onClickOpen}>Open</MenuItem>
                  <MenuItem onClick={onClickSave}>Save</MenuItem>
                  <MenuItem onClick={onClickNew}>New</MenuItem>
                </MenuList>
              </Menu>
              <Button variant="ghost" size="sm" colorScheme="gray">
                <FileText className="h-4 w-4 mr-2" />
                <Text fontSize="xs">Files</Text>
              </Button>
              <Button variant="ghost" size="sm" colorScheme="gray">
                <Users className="h-4 w-4 mr-2" />
                <Text fontSize="xs">Team</Text>
              </Button>
          </Flex>
          <Flex alignItems="center" gap={4}>
           <Button variant="ghost" size="sm" colorScheme="gray">
              <IconButton
                aria-label="Settings"
                icon={<Settings className="h-4 w-4" />}
                variant="ghost"
                size="sm"
                colorScheme="gray"
              />
              <Text fontSize="xs" fontWeight="semibold">Settings</Text>
           </Button>
            <Avatar size="sm" src="/placeholder.svg" />
          </Flex>
        </Flex>
        
      </Flex>
    </Box>
  );
};

export default TopPanel;
