import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Spinner,
  Text,
} from '@chakra-ui/react';
import React from 'react';
type LoadingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
};
const LoadingModal = ({
  isOpen,
  onClose,
  message = 'Loading...',
}: LoadingModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalBody
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          p={6}
        >
          <Spinner size='xl' color='blue.500' thickness='4px' speed='0.65s' />
          <Text mt={4}>{message}</Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LoadingModal;
