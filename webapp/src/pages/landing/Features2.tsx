import React, { useEffect } from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const MotionFlex = motion(Flex);

const Features2: React.FC = () => {
    const feature1 = require('../../assets/features/feature1.png');
    const feature2 = require('../../assets/features/feature2.png');
    const feature3 = require('../../assets/features/feature3.png');
    const controls1 = useAnimation();
    const controls2 = useAnimation();
    const controls3 = useAnimation();
    const [ref1, inView1] = useInView({ threshold: 0.2 });
    const [ref2, inView2] = useInView({ threshold: 0.2 });
    const [ref3, inView3] = useInView({ threshold: 0.2 });

    const heading1 = "drag-and-drop Visualization";
    const heading2 = "ai-powered code generation";
    const heading3 = "solana ide";

    const text1 = "Solai makes building dApps intuitive and faster than ever. Our AI-driven platform transforms your ideas into working smart contracts with just a few clicks.";
    const text2 = "From idea to complete Anchor project in minutes.";
    const text3 = "View and edit your project code. Build and deploy your Solana programs.";

    useEffect(() => {
        if (inView1) controls1.start('visible');
        else controls1.start('hidden');

        if (inView2) controls2.start('visible');
        else controls2.start('hidden');

        if (inView3) controls3.start('visible');
        else controls3.start('hidden');
    }, [controls1, controls2, controls3, inView1, inView2, inView3]);

    const imageVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
    };

    const textVariants1 = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.3 } },
    };

    const textVariants2 = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.3 } },
    };

    const textVariants3 = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.3 } },
    };

    return (
        <Flex direction="column" w="100%" overflow="hidden">
            <MotionFlex
                zIndex={1}
                ref={ref1}
                h="60vh"
                bg="rgba(88, 96, 183, 0.8)"
                justify="space-evenly"
                align="center"
                color="white"
                p={4}
                initial="hidden"
                animate={controls1}
                variants={imageVariants}
            >
                <motion.img
                    src={feature1}
                    alt="Graph design"
                    style={{
                        height: '350px',
                        filter: 'brightness(1.2) contrast(1.1) saturate(1.5)',
                        transition: 'filter 0.3s ease-in-out',
                    }}
                    whileHover={{ filter: 'brightness(1.3) contrast(1.2) saturate(1.8)' }}
                />
                <MotionFlex
                    direction="column"
                    justify="center"
                    gap={6}
                    maxW="40%"
                    ml={8}
                    initial="hidden"
                    animate={controls1}
                    variants={textVariants1}
                >
                    <Heading 
                        fontFamily="Major Mono Display"
                        fontSize="4xl">
                        {heading1}
                    </Heading>
                    <Text 
                        fontFamily="IBM Plex Mono"
                        fontSize="lg">
                        {text1}
                    </Text>
                </MotionFlex>
            </MotionFlex>

            <MotionFlex
                zIndex={1}
                ref={ref2}
                h="60vh"
                bg="rgba(75, 82, 159, 0.8)"
                justify="space-evenly"
                align="center"
                color="white"
                p={4}
                initial="hidden"
                animate={controls2}
                variants={imageVariants}
                direction="row-reverse"
            >
                <motion.img
                    src={feature2}
                    alt="AI Code Generation"
                    style={{ height: '300px', opacity: 0.8, borderRadius: '10px' }}
                    whileHover={{ opacity: 1 }}
                />
                <MotionFlex
                    direction="column"
                    justify="center"
                    gap={6}
                    maxW="40%"
                    mr={8}
                    initial="hidden"
                    animate={controls2}
                    variants={textVariants2}
                >
                    <Heading 
                        fontFamily="Major Mono Display"
                        fontSize="4xl">
                        {heading2}
                    </Heading>
                    <Text 
                        fontFamily="IBM Plex Mono"
                        fontSize="lg">
                        {text2}
                    </Text>
                </MotionFlex>
            </MotionFlex>

            <MotionFlex
                zIndex={1}
                ref={ref3}
                h="60vh"
                bg="rgba(63, 69, 135, 0.8)"
                justify="space-evenly"
                align="center"
                color="white"
                p={4}
                initial="hidden"
                animate={controls3}
                variants={imageVariants}
                direction="row"
            >
                <motion.img
                    src={feature3}
                    alt="Smart Contract Testing"
                    style={{ height: '250px', opacity: 0.9, borderRadius: '10px' }}
                    whileHover={{ opacity: 1 }}
                />
                <MotionFlex
                    direction="column"
                    justify="center"
                    gap={6}
                    maxW="40%"
                    ml={8}
                    initial="hidden"
                    animate={controls3}
                    variants={textVariants3}
                >
                    <Heading 
                        fontFamily="Major Mono Display"
                        fontSize="4xl">
                        {heading3}
                    </Heading>
                    <Text 
                        fontFamily="IBM Plex Mono"
                        fontSize="lg">
                        {text3}
                    </Text>
                </MotionFlex>
            </MotionFlex>
        </Flex>
    );
};

export default Features2;
