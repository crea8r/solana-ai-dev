import React, { useState, useEffect } from 'react';
import {
  Text,
  Flex,
  Link,
  Tooltip,
  IconButton,
  Button,
} from '@chakra-ui/react';
import { RiExternalLinkLine } from "react-icons/ri";
import { GoCheckCircle, GoCode, GoCopy } from "react-icons/go";
import { IoCheckmark } from "react-icons/io5";
import { RxCrossCircled } from "react-icons/rx";
import { HiOutlineSparkles } from "react-icons/hi2";
import { useProjectContext } from '../../contexts/ProjectContext';

interface ProjectStatusProps {  
  onBuild: () => void;
  onDeploy: () => void;
  onGenerateUI: () => void;
  setIsTaskModalOpen: (isOpen: boolean) => void;
}

const ProjectStatus: React.FC<ProjectStatusProps> = ({ onBuild, onDeploy, onGenerateUI, setIsTaskModalOpen }) => {
    const { projectContext } = useProjectContext();
    const [buildStatus, setBuildStatus] = useState(projectContext?.details.buildStatus);
    const [deployStatus, setDeployStatus] = useState(projectContext?.details.deployStatus);
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => {
      navigator.clipboard.writeText(projectContext?.details?.programId || '');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };
  

    useEffect(() => {
        setBuildStatus(projectContext?.details.buildStatus);
        setDeployStatus(projectContext?.details.deployStatus);
    }, [projectContext]);

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="flex-start"
      gap={4}
      flex="1"
      p={4}
      borderLeft="none !important"
      borderTop="none !important"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="sm"
      height="100%"
      shadow="sm"
      fontWeight="medium"
    >
        
    {
      <Flex direction="column" gap={2} flexWrap="wrap">
        <Text fontSize="xs" fontWeight="semi-bold" color="gray.700">{projectContext?.name}</Text>
        {projectContext?.details.programId && (
          <Flex direction="row" gap={0} alignItems="center" justifyContent="center">
          <Text fontSize="0.7rem" fontWeight="semi-bold" color="gray.700" mr="2">Program ID:</Text>
          <Tooltip 
            label={projectContext?.details?.programId || ''} 
            placement="bottom" 
            hasArrow 
            bg="gray.100" 
            color="gray.700" 
            borderRadius="md" 
            fontSize="xs"
            fontWeight="normal"
          >
            <Text 
              fontSize="0.7rem"
              fontWeight="normal"
              color="gray.500"
              maxWidth="150px"
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              cursor="default"
            >
              {projectContext?.details.programId}
            </Text>
          </Tooltip>
          <Tooltip 
            label={isCopied ? "Copied!" : "Copy Program ID"} 
            placement="bottom" 
            hasArrow
            bg="gray.100"
            color="gray.700"
            borderRadius="md"
            fontSize="xs"
          >
            <IconButton
              aria-label="Copy Program ID"
              icon={isCopied ? <IoCheckmark color="green.500 !important"/> : <GoCopy/>}
              color="gray.500"
              size="xs"
              variant="ghost"
              onClick={handleCopy}
            />
          </Tooltip>
        </Flex>
        )}
      </Flex>
      }
      <Flex direction="row" gap={6} flexWrap="wrap" alignItems="center" justifyContent="flex-start" width="100%">
        <Flex 
        direction="row" 
        justifyContent="center" 
        alignItems="center" 
        gap={2} 
        letterSpacing={0.1} 
        shadow="sm" 
        borderRadius="md" 
        border="1px solid" 
        borderColor="gray.200" 
        p={2}
        >
          {!buildStatus && (
            <Tooltip 
              label="Build project" 
              placement="bottom" 
              hasArrow 
              bg="gray.100" 
              color="gray.700" 
              borderRadius="md" 
              fontSize="0.75rem"
              fontWeight="normal" 
              mt={2}
            >
              <Flex 
                direction="row" 
                gap={2} 
                alignItems="center" 
                justifyContent="center" 
                cursor="pointer"
                onClick={onBuild}
              >
                <Text fontSize="0.75rem" fontWeight="normal" color="#df5020">Build</Text>
                <RxCrossCircled size={14} color="#df5020" />
              </Flex>
            </Tooltip>
          )}
          {buildStatus && (
            <Flex direction="row" gap={2} alignItems="center" justifyContent="center" cursor="default">
              <Text fontSize="0.75rem" fontWeight="normal" color="#46af0e">Build</Text>
              <GoCheckCircle size={14} color="#46af0e" />
            </Flex>
          )}
        </Flex>
        <Flex 
        direction="row" 
        justifyContent="center" 
        alignItems="center" 
        gap={2} 
        letterSpacing={0.1} 
        shadow="sm" 
        borderRadius="md" 
        border="1px solid" 
        borderColor="gray.200" 
        p={2}
        >
          {!deployStatus && buildStatus && (
            <Tooltip 
              label="Deploy project" 
              placement="bottom" 
              hasArrow 
              bg="gray.100" 
              color="gray.700" 
              borderRadius="md" 
              fontSize="0.75rem"
              fontWeight="normal"
              mt={2}
            >
              <Flex 
                direction="row" 
                gap={2} 
                alignItems="center" 
                justifyContent="center" 
                cursor="pointer"
                onClick={onDeploy}
              >
                <Text fontSize="0.75rem" fontWeight="normal" color="#df5020">Deploy</Text>
                <RxCrossCircled size={14} color="#df5020" />
              </Flex>
            </Tooltip>
          )}
          {deployStatus && buildStatus && (
            <>
              <Flex direction="row" gap={2} alignItems="center" justifyContent="center" cursor="default">
                <Text fontSize="0.75rem" fontWeight="normal" color="#46af0e">Deploy</Text>
                <GoCheckCircle size={14} color="#46af0e" />
              </Flex>
            </>
          )}
          {!deployStatus && !buildStatus && (
            <>
            <Tooltip 
              label="Build project first" 
              placement="bottom" 
              hasArrow 
              bg="gray.100" 
              color="gray.700" 
              borderRadius="md" 
              fontSize="0.75rem"
              fontWeight="normal"
            >
              <Flex direction="row" gap={2} alignItems="center" justifyContent="center" cursor="default">
                <Text fontSize="0.75rem" fontWeight="normal" color="#df5020">Deploy</Text>
                <RxCrossCircled size={14} color="#df5020" />
              </Flex>
            </Tooltip>
            </>
          )}
          {deployStatus && projectContext?.details?.programId && (
            <Tooltip 
              label="View on Solana Explorer" 
              placement="bottom" 
              hasArrow 
              bg="gray.100" 
              color="gray.700" 
              borderRadius="md" 
              fontSize="0.75rem"
              fontWeight="normal" 
              mt={2}
            >
              <Link
                href={`https://explorer.solana.com/address/${projectContext.details.programId}?cluster=devnet`}
                isExternal
                color="gray.500"
                fontSize="xs"
                fontWeight="normal"
                _hover={{
                  color: '#a9b7ff'
                }}
              >
                <RiExternalLinkLine size={12} color="#636363"/>
              </Link>
            </Tooltip>
          )}
        </Flex>
      </Flex>
      {buildStatus && deployStatus && (
        <Flex direction="row" gap={2} alignItems="center" justifyContent="center" cursor="default">
          <Button 
            size="xs" 
            variant="outline" 
            colorScheme="gray" 
            leftIcon={<HiOutlineSparkles/>}
            onClick={() => {
              setIsTaskModalOpen(true);
              onGenerateUI();
            }}
          >
            <Text fontSize="0.75rem" fontWeight="normal">Generate SDK</Text>
          </Button>
        </Flex>
      )}
    </Flex>
  );
};

export default React.memo(ProjectStatus);
