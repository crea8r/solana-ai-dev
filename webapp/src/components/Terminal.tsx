import React from 'react';
import { Box, Flex, Text, Icon, Button, Menu, MenuButton, MenuList, MenuItem, Divider } from '@chakra-ui/react';
import { ChevronRight, Check } from 'lucide-react';
import { keyframes } from '@emotion/react';
import { Spinner } from './Spinner';
import { LogEntry } from '../pages/code/CodePage';
import { CloseIcon, WarningIcon } from '@chakra-ui/icons';

type TerminalProps = {
  logs: LogEntry[];
  clearLogs: () => void;
  onRunCommand: (commandType: 'anchor clean' | 'cargo clean') => void;
  isPolling: boolean;
};

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
`;

const Terminal: React.FC<TerminalProps> = ({ logs, clearLogs, onRunCommand, isPolling }) => {
  return (
    <Flex
      direction="column"
      flex="1"
      minHeight="100% !important"
      height="100% !important"
      boxSizing="border-box"
      bg="gray.50"
      color="gray.800"
      fontFamily="mono"
      rounded="lg"
      shadow="lg"
      overflow="hidden"
      border="1px"
      borderColor="gray.300"
    >
      <Flex bg="gray.200" px={6} py={1} alignItems="center" justifyContent="space-between" borderBottom="1px" borderColor="gray.300">
        <Flex direction="row" alignItems="center">
          {isPolling && (
            <Flex alignItems="center" color="gray.600" mr={4}>
              <Spinner />
            </Flex>
          )}
        </Flex>
        <Menu>
          <MenuButton as={Button} size="xs" colorScheme="gray" variant="ghost">
            <Text fontSize="xs" color="gray.700" fontWeight="normal">Commands</Text>
          </MenuButton>
          <MenuList fontSize="xs" p={0}>
            <MenuItem onClick={clearLogs}>clear</MenuItem>
            <MenuItem onClick={() => onRunCommand('cargo clean')}>cargo clean</MenuItem>
            <MenuItem onClick={() => onRunCommand('anchor clean')}>anchor clean</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      <Box p={4} overflowY="auto">
        <Flex>
          <Flex flexDirection="column" flex="1">
            {logs.map((log, index) => (
              <Flex key={index} direction="row" alignItems="flex-start" justifyContent="flex-start" width="100% !important">
                <Icon as={ChevronRight} w={3} h={3} mr={2} mt={1} color="gray.500" />

                {log.type === 'success' ? (
                  <Icon as={Check} w={3} h={3} mr={2} mt={1} color="green.500" />
                ) : log.type === 'error' ? (
                  <Icon as={CloseIcon} w={3} h={3} mr={2} mt={1} color="red.500" />
                ) : log.type === 'warning' ? (
                  <Icon as={WarningIcon} w={3} h={3} mr={2} mt={1} color="yellow.500" />
                ) : null}

                <Text
                  width="100% !important"
                  mb={4}
                  whiteSpace="pre-wrap"
                  fontSize="xs"
                  fontWeight="bold"
                  color={
                    log.type === 'start'
                      ? '#5688e8' // Blue
                      : log.type === 'success'
                      ? '#30b814' // Green
                      : log.type === 'warning'
                      ? '#ddbf27' // Yellow
                      : log.type === 'error'
                      ? '#ec3232' // Red
                      : 'gray.700' // Default
                  }
                >
                  {log.message}
                </Text>
                {index < logs.length - 1 && <Divider borderColor="gray.200" />}
              </Flex>
            ))}
          </Flex>
        </Flex>
        <Flex alignItems="center" mt={2} color="gray.600">
          <Icon as={ChevronRight} w={3} h={3} mr={1} />
          <Text fontSize="xs" animation={`${pulse} 0.8s infinite`}>_</Text>
        </Flex>
      </Box>
    </Flex>
  );
};

export default Terminal;