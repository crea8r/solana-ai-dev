import React from 'react';
import { Box, Flex, Text, Icon, Button, Menu, MenuButton, MenuList, MenuItem, Divider } from '@chakra-ui/react';
import { ChevronRight, X, Minus, Square } from 'lucide-react';
import { keyframes } from '@emotion/react';

type TerminalProps = {
  logs: string[];
  clearLogs: () => void;
  onRunCommand: (commandType: 'anchor clean' | 'cargo clean') => void;
};

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
`;

const Terminal: React.FC<TerminalProps> = ({ logs, clearLogs, onRunCommand }) => {
  return (
    <Box
      flex="1"
      bg="gray.50"
      color="gray.800"
      fontFamily="mono"
      rounded="lg"
      shadow="lg"
      overflow="hidden"
      border="1px"
      borderColor="gray.200"
    >
      <Flex bg="gray.100" px={4} alignItems="center" justifyContent="flex-end">
        <Menu>
          <MenuButton as={Button} size="xs" colorScheme="gray" variant="ghost">
            <Text fontSize="xs" color="gray.600" fontWeight="normal">Commands</Text>
          </MenuButton>
          <MenuList fontSize="xs" p={0}>
            <MenuItem onClick={clearLogs}>clear</MenuItem>
            <MenuItem onClick={() => onRunCommand('cargo clean')}>cargo clean</MenuItem>
            <MenuItem onClick={() => onRunCommand('anchor clean')}>anchor clean</MenuItem>
            {/* <MenuItem onClick={() => onRunCommand('anchor build')}>anchor build</MenuItem>
            <MenuItem onClick={() => onRunCommand('anchor deploy')}>anchor deploy</MenuItem>
            <MenuItem onClick={() => onRunCommand('anchor test')}>anchor test</MenuItem> */}
          </MenuList>
        </Menu>
        <Flex alignItems="center" gap={2} p={2}>
          <Icon as={Minus} w={3} h={3} color="gray.500" />
          <Icon as={Square} w={3} h={3} color="gray.500" />
          <Icon as={X} w={3} h={3} color="gray.500" />
        </Flex>
      </Flex>
      <Box p={4} overflowY="auto" maxH="64">
        <Flex>
          <Box color="gray.400" mr={4} userSelect="none">
            {Array.from({ length: logs.length }, (_, i) => (
              <Text key={i} mb={3}>{i + 1}</Text>
            ))}
          </Box>
          <Box flex="1">
            {logs.map((log, index) => (
              <Box key={index} mb={3}>
                <Text
                  mb={1}
                  whiteSpace="pre-wrap"
                  fontSize="xs"
                  color={log.startsWith('>') ? 'blue.600' : 'gray.700'}
                  fontWeight={log.startsWith('>') ? 'bold' : 'normal'}
                >
                  {log}
                </Text>
                {index < logs.length - 1 && <Divider borderColor="gray.200" />}
              </Box>
            ))}
          </Box>
        </Flex>
        <Flex alignItems="center" mt={2} color="gray.600">
          <Icon as={ChevronRight} w={3} h={3} mr={1} />
          <Text fontSize="xs" animation={`${pulse} 0.8s infinite`} className="animate-pulse">_</Text>
        </Flex>
      </Box>
    </Box>
  );
};

export default Terminal;