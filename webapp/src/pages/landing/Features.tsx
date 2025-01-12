import React, { useRef } from 'react';
import { Box, SimpleGrid, Heading, Flex, Text } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { BiNetworkChart } from 'react-icons/bi';
import { TbSparkles } from 'react-icons/tb';
import { LuCodesandbox } from 'react-icons/lu';

interface Feature {
  title: string;
  description: string;
  icon: JSX.Element;
}

const features: Feature[] = [
  { 
    title: "AI-Powered Code Generation", 
    description: "Idea to code in minutes - no coding skills required.",
    icon: <motion.div whileHover={{ scale: 1.2 }}><TbSparkles size="40px" color="white" /></motion.div>,
  },
  { 
    title: "Drag-and-Drop Interface", 
    description: "Visualize and intuitively design your dApp.",
    icon: <motion.div whileHover={{ scale: 1.2 }}><BiNetworkChart size="40px" color="white" /></motion.div>,
  },
  { 
    title: "Pre-Built Templates", 
    description: "Get started faster with pre-made Solana program templates.",
    icon: <motion.div whileHover={{ scale: 1.2 }}><LuCodesandbox size="40px" color="white" /></motion.div>,
  }
];

const Features: React.FC = () => {
  const controls = useAnimation();

  React.useEffect(() => {
    controls.start('visible');
  }, [controls]);

  const variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <Box h="auto" color="white" textAlign="center" p={8} py="200px" zIndex={10}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
        {features.map((feature, index) => (
          <motion.div key={index} initial="hidden" animate={controls} variants={variants}>
            <Flex
              p={6}
              direction="column"
              bg="rgba(255, 255, 255, 0.3)"
              borderRadius="md"
              boxShadow="xl"
              justifyContent="center"
              alignItems="center"
              h="300px"
              w="100%"
            >
              <Box bg="transparent" color="white" mb={4} alignSelf="center">
                {feature.icon}
              </Box>
              <Box bg="transparent" color="white">
                <Heading fontSize="2xl" mb={4}>{feature.title}</Heading>
                <Text fontSize="lg">{feature.description}</Text>
              </Box>
            </Flex>
          </motion.div>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Features;
