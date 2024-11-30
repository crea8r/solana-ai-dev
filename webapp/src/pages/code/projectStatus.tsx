import React, { useState, useEffect } from 'react';
import {
  Text,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Avatar,
  Center,
} from '@chakra-ui/react';
import { Wallet } from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { Check, X } from 'lucide-react';

const ProjectStatus: React.FC = () => {
    const { projectContext } = useProjectContext();
    const [buildStatus, setBuildStatus] = useState(projectContext?.details.buildStatus);
    const [deployStatus, setDeployStatus] = useState(projectContext?.details.deployStatus);

    useEffect(() => {
        setBuildStatus(projectContext?.details.buildStatus);
        setDeployStatus(projectContext?.details.deployStatus);
    }, [projectContext]);

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      flex="1"
      px={1}
      py={1}
      border="1px solid"
      borderColor="gray.200"
      borderRadius="sm"
      height="100%"
      pl={4}
      shadow="sm"
      fontWeight="medium"
    >
        
    {/*
      <Flex direction="row" gap={2} letterSpacing={0.1}>
        <Text fontSize="xs" fontWeight="semi-bold">Project Name: </Text>
        <Text fontSize="xs" fontWeight="bold">{projectContext?.name}</Text>
      </Flex>
      */}
      <Flex direction="row" justifyContent="center" alignItems="center" gap={2} letterSpacing={0.1}>
        <Text fontSize="xs" fontWeight="semi-bold" color={buildStatus ? '#1cba70' : '#ec3232'}>Built</Text>
        {buildStatus ? <Check size={14} color="#1cba70" /> : <X size={14} color="#ec3232" />}
      </Flex>
      <Flex direction="row" justifyContent="center" alignItems="center" gap={2} letterSpacing={0.1}>
        <Text fontSize="xs" fontWeight="semi-bold" color={deployStatus ? '#1cba70' : '#ec3232'}>Deployed</Text>
        {deployStatus ? <Check size={14} color="#1cba70" /> : <X size={14} color="#ec3232" />}
      </Flex>
    </Flex>
  );
};

export default React.memo(ProjectStatus);
