import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from '@chakra-ui/react';
import { FC, useRef } from 'react';
interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

const PromptModal: FC<PromptModalProps> = ({ isOpen, onClose, content }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleCopy = () => {
    if (textareaRef.current) {
      navigator.clipboard
        .writeText(textareaRef.current.value)
        .then(() => {
          alert('Text copied to clipboard');
        })
        .catch((err) => {
          alert('Failed to copy text: ');
        });
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent style={{ height: '500px' }}>
        <ModalHeader>Prompt for AI</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Textarea
            style={{ height: '100%' }}
            defaultValue={content}
            ref={textareaRef}
          ></Textarea>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme='teal' mr={3} onClick={handleCopy}>
            Copy to Clipboard
          </Button>
          <Button colorScheme='blue' mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default PromptModal;
