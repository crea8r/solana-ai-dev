import React from 'react';
import { Box, Flex, Text, Icon } from '@chakra-ui/react';
import { ChevronRight, X, Minus, Square } from 'lucide-react';

type TerminalProps = {
  logs: string[];
};

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  return (
    <Box
      w="full"
      bg="gray.50"
      color="gray.800"
      fontFamily="mono"
      rounded="lg"
      shadow="lg"
      overflow="hidden"
      border="1px"
      borderColor="gray.200"
    >
      <Flex bg="gray.100" px={4} py={2} alignItems="center" justifyContent="flex-end">
        {/* <Text fontSize="xs" color="gray.500">/projects/subscription-service/build</Text> */}
        <Flex alignItems="center" gap={2}>
          <Icon as={Minus} w={3} h={3} color="gray.500" />
          <Icon as={Square} w={3} h={3} color="gray.500" />
          <Icon as={X} w={3} h={3} color="gray.500" />
        </Flex>
      </Flex>
      <Box p={4} overflowY="auto" maxH="64">
        <Flex>
          <Box color="gray.400" mr={4} userSelect="none">
            {Array.from({ length: logs.length }, (_, i) => (
              <Text key={i} mb={1}>{i + 1}</Text>
            ))}
          </Box>
          <Box flex="1">
            {logs.map((log, index) => (
              <Text key={index} mb={1} whiteSpace="pre-wrap" fontSize='xs'>
                {log}
              </Text>
            ))}
          </Box>
        </Flex>
        <Flex alignItems="center" mt={2} color="gray.600">
          <Icon as={ChevronRight} w={4} h={4} mr={2} />
          <Text className="animate-pulse">_</Text>
        </Flex>
      </Box>
    </Box>
  );
};

export default Terminal;