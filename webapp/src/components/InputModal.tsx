import React, { useState, useEffect, useContext } from 'react';
import { useProjectContext } from '../contexts/ProjectContext';
import { Button, Flex, Input, Modal, ModalContent, ModalHeader, ModalOverlay, Text, Textarea } from '@chakra-ui/react';
import { X } from 'lucide-react';



type InputModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const InputModal : React.FC<InputModalProps> = ({ isOpen, onClose }) => {
  const { projectContext, setProjectContext } = useProjectContext();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
       <Flex flexDirection="row" justify="space-between">
          <Flex direction='column' gap={4} p={4} w="100%">
            <Flex direction='column' gap={4} p={4} w="100%">
              <Text fontSize='sm' fontWeight='medium'>Project Name</Text>
              <Input type="text" value={projectContext.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                {
                  console.log(`[InputModal] - name: ${e.target.value}`);
                  setProjectContext((prev) => ({ ...prev, name: e.target.value }));
                }} />
            </Flex>
            <Flex direction='column' gap={4} p={4}>
              <Text fontSize='sm' fontWeight='medium'>Project Description</Text>
              <Textarea value={projectContext.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                console.log(`[InputModal] - description: ${e.target.value}`);
                setProjectContext((prev) => ({ ...prev, description: e.target.value }));
              }} />
            </Flex>
          </Flex>
          <Button variant="ghost" size="sm" colorScheme="gray" onClick={onClose} p={2} mr={1} mt={1} position="absolute" right="0" top="0">
            <X className="h-5 w-5 text-gray-500" />
          </Button>
       </Flex>
      </ModalContent>
    </Modal>
  );
};

export default InputModal;