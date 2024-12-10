import {
    Modal,
    ModalContent,
    ModalOverlay,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
  } from '@chakra-ui/react';
  import React from 'react';
  
  interface FeedbackFormProps {
    isOpen: boolean;
    onClose: () => void;
  }
  
  const FeedbackForm: React.FC<FeedbackFormProps> = ({ isOpen, onClose }) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent
          maxW="40%"
          maxH="70vh"
          minH="70vh"
          borderRadius="lg"
          overflowY="hidden"
          display="flex"
          flexDirection="column"
        >
          <ModalCloseButton />
          <ModalBody py={6} flex="1" overflowY="auto">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSf5k3OPCzaaZMd758hiTd_u_8_FIPV_6dxjf5UPFYLTLjV_Pg/viewform?embedded=true"
              style={{
                width: '100%',
                height: '1080px',
                border: 'none',
                overflow: 'hidden',
              }}
              scrolling="no"
              title="Feedback Form"
            >
              Loading…
            </iframe>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };
  
  export default FeedbackForm;
  