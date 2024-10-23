import React, { useEffect } from 'react';
import {
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Avatar,
} from '@chakra-ui/react';
import { FaCog } from 'react-icons/fa';
import { logEvent } from '../../utils/analytics';
import InputModal from '../../components/InputModal';

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
      <Flex alignItems="center" gap={6}>
        <Flex
          direction="row"
          alignItems="center"
          gap={4}
          ml={4}
        >
          <h1 className="text-lg font-semibold">
            {/* Removed {projectName} */}
          </h1>
        </Flex>
      </Flex>
      <Flex>
        <Button onClick={onClickInput}>Input</Button>
        <Menu>
          <MenuButton as={Button} variant="ghost" size="sm">
            Project
          </MenuButton>
          <MenuList>
            <MenuItem onClick={onClickOpen}>Open</MenuItem>
            <MenuItem onClick={onClickSave}>Save</MenuItem>
            <MenuItem onClick={onClickNew}>New</MenuItem>
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton as={Button} variant="ghost" size="sm">
            Team
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => console.log('Manage')} isDisabled={true}>
              Manage
            </MenuItem>
            <MenuItem onClick={() => console.log('Invite')} isDisabled={true}>
              Invite
            </MenuItem>
          </MenuList>
        </Menu>
        <Button
          leftIcon={React.createElement(FaCog)}
          variant="ghost"
          size="sm"
          onClick={generatePrompt}
        >
          Prompt
        </Button>
      </Flex>
      <Flex alignItems="center" gap={4}>
        <Button variant="ghost" size="sm">
          <FaCog className="h-5 w-5" />
        </Button>
        <Avatar size="sm" src="/placeholder.svg" />
      </Flex>
    </Flex>
  );
};

export default TopPanel;
