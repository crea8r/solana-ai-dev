// src/components/TopPanel.tsx

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
import { FaCog } from 'react-icons/fa';
import { logEvent } from '../../utils/analytics';

interface TopPanelProps {
  generatePrompt: () => void;
  onClickOpen: () => void;
  onClickSave: () => void;
  onClickNew: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({
  generatePrompt,
  onClickOpen,
  onClickSave,
  onClickNew,
}) => {
  return (
    <Flex
      justifyContent='space-between'
      alignItems='center'
      p={2}
      bg='blue.100'
    >
      <Flex>
        <Menu>
          <MenuButton as={Button} mr={2}>
            Project
          </MenuButton>
          <MenuList>
            <MenuItem onClick={onClickOpen}>Open</MenuItem>
            <MenuItem onClick={onClickSave}>Save</MenuItem>
            <MenuItem onClick={onClickNew}>New</MenuItem>
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton as={Button}>Team</MenuButton>
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
          style={{
            marginLeft: '10px',
          }}
          onClick={() => {
            logEvent('Prompt', 'Generate', 'click');
            generatePrompt();
          }}
        >
          Prompt
        </Button>
        {/* <MenuItem onClick={() => console.log('Build')}>Build</MenuItem> */}
      </Flex>
      <Avatar size='sm' />
    </Flex>
  );
};

export default TopPanel;
