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
import { LiaTelegram } from "react-icons/lia";
import { FaXTwitter } from "react-icons/fa6";
import { RiArrowDropLeftFill, RiArrowDropRightFill } from "react-icons/ri";
import { IoIosCheckmark } from "react-icons/io";
import Emoji from 'react-emoji-render';

import img1 from '../assets/walkthrough/img1.png';
import img2 from '../assets/walkthrough/img2.png';
import img3 from '../assets/walkthrough/img3.png';
import img4 from '../assets/walkthrough/img4.png';
import img5 from '../assets/walkthrough/img5.png';

const steps = [
  {
    image: img1,
    caption:
      'Everything in Solana starts with a Program, drag a Program node from the left-hand toolbox to create a new program. You can name the program and add a description, adding as much context as possible will help facilitate the AI to generate better code. Click Save.',
  },
  {
    image: img2,
    caption:
      'Next, drag an Account node from the toolbox. a name, description and data structure is required. Remember to connect the Account to the Program. Then, click Save',
  },
  {
    image: img3,
    caption:
      'Drag an Instruction node from the toolbox. If Accounts represent the storage of the Program, the instructions define the functionality. Add the function name, description, its parameters, then a step-by-step overview of the logic. Click Save.',
  },
  {
    image: img4,
    caption:
      'The final design will look like this. You have the Accounts and Instructions connected to the Program.',
  },
  {
    image: img5,
    caption:
      `Finally, select the AI model (GPT-4o), enter your api key, then click 'Generate Code'`,
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
          <Flex direction='row' color='blue.500' fontSize='xl' alignSelf='center' py={5} gap={1}><Text pt={1}>Welcome!</Text><Emoji text=":tada:" /></Flex>
          <ModalBody>
          <Flex direction='column' align='center' gap={1} mb={2}>
            <Flex direction='row' align='center' gap={2} mb={2}>
            <Text mb={1}> For support, contact either: </Text>
            <Flex align='center' gap={1}>
              <LiaTelegram />
              <Text  p={0} borderRadius='md'> 
                <Link 
                  href='https://t.me/hfox8' 
                  target='_blank'
                  color='blue.500'
                >@hfox8</Link> 
              </Text>
              <Text  p={0} borderRadius='md'> 
                <Link 
                href='https://t.me/hieubt88' 
                target='_blank'
                  color='blue.500'
                >@hieubt88</Link> 
              </Text>
            </Flex>
            <Flex align='center' gap={1}>
              <FaXTwitter />
              <Text p={0} borderRadius='md'> 
                <Link 
                  href='https://x.com/_sol_f0x' 
                  target='_blank'
                  color='blue.500'
                >@sol_f0x</Link> 
              </Text>  
              <Text p={0} borderRadius='md'> 
                <Link 
                  href='https://x.com/0xk2_' 
                  target='_blank'
                  color='blue.500'
                >@0xk2_</Link> 
              </Text>
            </Flex>
            </Flex>
            <Flex align='center' gap={1}>
            <Text mb={1}> Watch our 
            <Link
              href='https://www.youtube.com/watch?v=NbO50Rm8u6Q'
              isExternal
              color='blue.500'
              target='_blank'
              style={{
                textDecorationLine: 'none',
                textDecorationColor: '#a9b7ff',
                userSelect: 'none',
                boxShadow: 'none',
              }}
            > video tutorial </Link> to get started. </Text>
            </Flex>
            
          </Flex>
          <Image
            src={steps[currentStep].image}
            alt={`Step ${currentStep + 1}`}
            mb={4}
            border={1}
            borderColor='gray.500'
            borderStyle='solid'
          />
          <Text fontSize='xs'>{steps[currentStep].caption}</Text>
        </ModalBody>
        <ModalFooter>
          <Button size='xs' mr={3} onClick={handlePrev} isDisabled={currentStep === 0} leftIcon={<RiArrowDropLeftFill />}>
          <Text fontSize='xs' fontWeight='normal'>Previous</Text>
          </Button>
          <Button
              size='xs'
              colorScheme='blue'
              onClick={handleNext}
              rightIcon={
                currentStep === steps.length - 1 ? <IoIosCheckmark /> : <RiArrowDropRightFill />
              }
            >
            <Text fontSize='xs' fontWeight='normal'>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WalkthroughDialog;
