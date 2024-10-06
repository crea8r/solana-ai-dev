// src/components/WalkthroughDialog.tsx

import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Image,
  Text,
  Link,
  Flex,
} from '@chakra-ui/react';
import img1 from '../assets/walkthrough/1.png';
import img2 from '../assets/walkthrough/2.png';
import img3 from '../assets/walkthrough/3.png';
import img4 from '../assets/walkthrough/4.png';
import img5 from '../assets/walkthrough/5.png';
import img6 from '../assets/walkthrough/6.png';
import img7 from '../assets/walkthrough/7.png';

const steps = [
  {
    image: img1,
    caption:
      'Everything in Solana starts with a Program, drag it from the left-hand toolbox to create a new program. You name the program and add description to it, usually: who you Program serve and roughly how it works. Hit Save.',
  },
  {
    image: img2,
    caption:
      'You drag the Account from the toolbox. You name the Account and add description to it, usually how it is used. The detail of its structure is defined in the Data Struct textarea. Remember to connect the Account to the Program. Then, hit Save',
  },
  {
    image: img3,
    caption:
      'You click on the edge connecting the Account and Program and define the seed. The seed is the unique identifier of the Account. Think of seed as table name mix with primary key to identify your record with the Program. It is used to locate the Account in the Solana blockchain. Hit Save',
  },
  {
    image: img4,
    caption:
      'You will see something like this image. Note that they AI will extract the meaning from the text, feel free to write it in a descriptive way.',
  },
  {
    image: img5,
    caption:
      'You drag the Instruction from the toolbox. As Account represent the storage of the Program, instruction is the functionality of the Progran. You define the function name, the parameters and step by step instructions to the AI. Hit Save',
  },
  {
    image: img6,
    caption:
      'The final design usually looks like this. You have the Account and Instruction neatly connected to the Program, with a seed on the path of the edge from Program to Accounts. Now, hit the Build button to generate the prompt for the AI to generate the code.',
  },
  {
    image: img7,
    caption:
      'Finally, click Copy to Clipboard and paste the text into your favourite AI to get the final code. This prompt will generate not only Anchor rust code but typescript SDK and testcode for your convenience.',
  },
];

interface WalkthroughDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalkthroughDialog: React.FC<WalkthroughDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Welcome to Solana IDE</ModalHeader>
        <ModalBody>
          <Flex direction='column' align='left' gap={1} mb={2}>
            <Text mb={1}>
              Watch our tutorial video to get started. Contact @0xk2_ for
              support
            </Text>
            <Link
              href='https://youtu.be/FK5WILag95s'
              isExternal
              color='blue.500'
              target='_blank'
              style={{
                textDecoration: 'underline',
                userSelect: 'none',
                boxShadow: 'none',
              }}
            >
              Tutorial Video
            </Link>
          </Flex>
          <Image
            src={steps[currentStep].image}
            alt={`Step ${currentStep + 1}`}
            mb={4}
            border={1}
            borderColor='gray.500'
            borderStyle='solid'
          />
          <Text>{steps[currentStep].caption}</Text>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={handlePrev} isDisabled={currentStep === 0}>
            Previous
          </Button>
          <Button colorScheme='blue' onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WalkthroughDialog;
