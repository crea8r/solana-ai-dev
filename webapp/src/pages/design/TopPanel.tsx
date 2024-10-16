// src/components/TopPanel.tsx

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
import { GoPencil } from "react-icons/go";
import { useProject } from '../../contexts/ProjectContext';

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
  const [isEditing, setIsEditing] = React.useState(false);
  const [projectName, setProjectName] = React.useState('Project Name');
  const { project, savedProject, setProject, updateProject, updateSavedProject } = useProject();

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(event.target.value);
  };

  const handleInputBlur = () => {
    updateSavedProject({ name: projectName });
    setIsEditing(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      updateSavedProject({ name: projectName });
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (savedProject) {
      setProjectName(savedProject.name);
    }
  }, [savedProject]);

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
          onClick={handleEditClick}
          direction="row"
          alignItems="center"
          style={{ cursor: 'pointer' }}
          gap={4}
          ml={4}
        >
          {isEditing ? (
            <input
              type="text"
              value={projectName}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyPress={handleKeyPress}
              className="text-lg font-semibold"
              style={{ border: 'none', outline: 'none' }}
            />
          ) : (
            <>
              <h1 className="text-lg font-semibold">
                {projectName}
              </h1>
              <GoPencil className="h-5 w-5" />
            </>
          )}
        </Flex>
      </Flex>
      <Flex>
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
          onClick={() => {
            logEvent('Prompt', 'Generate', 'click');
            generatePrompt();
          }}
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
