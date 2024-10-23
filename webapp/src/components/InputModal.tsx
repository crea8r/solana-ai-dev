import React, { useState, useEffect, useContext } from 'react';
import { useProjectContext } from '../contexts/ProjectContext';
import { Flex, Input, Modal, ModalContent, ModalOverlay, Text, Textarea } from '@chakra-ui/react';

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
        <Flex direction='column' gap={4} p={4}>
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
      </ModalContent>
    </Modal>
  );
};

export default InputModal;