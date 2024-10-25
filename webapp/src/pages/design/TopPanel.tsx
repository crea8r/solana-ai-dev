import React, { useEffect } from 'react';
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
import { FileText, Users, Settings, SquareCode, Pencil, PanelsTopLeft } from 'lucide-react';
import { logEvent } from '../../utils/analytics';
import InputModal from '../../components/InputModal';
import logo from '../../assets/logo/solai_logo_png.png';
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
  return (
    <Box as="header" bg="white" borderBottom="1px solid" borderColor="gray.200" px={4} py={3}>
      <Flex maxW="7xl" mx="auto" alignItems="center" justifyContent="space-between" width="100%">
        <Flex alignItems="center" gap={4}>
          <Button as="a" href="/" variant="link" display="flex" alignItems="center" gap={2}>
            <img src={logo} alt="Logo" className="h-12 w-12" />
            <Text fontSize="xl" fontWeight="semibold" color="#5688e8">SolAI</Text>
          </Button>
        </Flex>

        <Flex as="nav" justifyContent="space-evenly" alignItems="center" gap={1} width="100%">
          <Flex alignItems="center" gap={1}>
            <Button variant="ghost" size="sm" colorScheme="blue" onClick={onClickInput}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Project Info
            </Button>
            <Button variant="ghost" size="sm" colorScheme="gray" onClick={generatePrompt}>
              <SquareCode className="h-4 w-4 mr-2" />
              Generate Code
            </Button>
          </Flex>
          <Flex alignItems="center" gap={1}>
            <Menu>
              <MenuButton as={Button} variant="ghost" size="sm" colorScheme="gray">
                <Flex alignItems="center" gap={0}>
                  <PanelsTopLeft className="h-4 w-4 mr-2" />
                  Project
                </Flex>
              </MenuButton>
              <MenuList>
                <MenuItem onClick={onClickOpen}>Open</MenuItem>
                <MenuItem onClick={onClickSave}>Save</MenuItem>
                <MenuItem onClick={onClickNew}>New</MenuItem>
              </MenuList>
            </Menu>
            <Button variant="ghost" size="sm" colorScheme="gray">
              <FileText className="h-4 w-4 mr-2" />
              Files
            </Button>
            <Button variant="ghost" size="sm" colorScheme="gray">
              <Users className="h-4 w-4 mr-2" />
              Team
            </Button>
          </Flex>
        </Flex>

        <Flex alignItems="center" gap={4}>
          <IconButton
            aria-label="Settings"
            icon={<Settings className="h-5 w-5" />}
            variant="ghost"
            size="sm"
            colorScheme="gray"
          />
          <Avatar size="sm" src="/placeholder.svg" />
        </Flex>
      </Flex>
    </Box>
  );
};

export default TopPanel;
