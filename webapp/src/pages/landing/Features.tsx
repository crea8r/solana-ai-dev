import React, { useEffect } from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import landingPageTheme from '../../theme';

const MotionFlex = motion(Flex);

const FeatureSection: React.FC<{
  refProp: React.Ref<HTMLDivElement>;
  controls: any;
  imageSrc: string;
  heading: string;
  text: string;
  bgColor: string;
  direction?: 'row' | 'row-reverse';
  imageStyle?: React.CSSProperties;
  textVariants: any;
}> = ({
  refProp,
  controls,
  imageSrc,
  heading,
  text,
  bgColor,
  direction = 'row',
  imageStyle,
  textVariants,
}) => (
  <MotionFlex
    zIndex={1}
    ref={refProp}
    h="60vh"
    bg={bgColor}
    justify="space-evenly"
    align="center"
    color="white"
    p={4}
    initial="hidden"
    animate={controls}
    variants={{
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
    }}
    direction={direction}
  >
    <motion.img
      src={imageSrc}
      alt={heading}
      style={{
        height: '300px',
        borderRadius: '10px',
        ...imageStyle,
      }}
    />
    <MotionFlex
      direction="column"
      justify="center"
      gap={6}
      maxW="40%"
      ml={direction === 'row' ? 8 : 0}
      mr={direction === 'row-reverse' ? 8 : 0}
      initial="hidden"
      animate={controls}
      variants={textVariants}
    >
      <Heading fontFamily="Major Mono Display" fontSize="4xl">
        {heading}
      </Heading>
      <Text fontFamily="IBM Plex Mono" fontSize="lg" color={landingPageTheme.colors.brand.textAccentColor3}>
        {text}
      </Text>
    </MotionFlex>
  </MotionFlex>
);

const Features: React.FC = () => {
  const feature1 = require('../../assets/features/feature1.png');
  const feature2 = require('../../assets/features/feature2.png');
  const feature3 = require('../../assets/features/feature3.png');

  const controls1 = useAnimation();
  const controls2 = useAnimation();
  const controls3 = useAnimation();

  const [ref1, inView1] = useInView({ threshold: 0.2 });
  const [ref2, inView2] = useInView({ threshold: 0.2 });
  const [ref3, inView3] = useInView({ threshold: 0.2 });

  useEffect(() => {
    if (inView1) controls1.start('visible');
    else controls1.start('hidden');

    if (inView2) controls2.start('visible');
    else controls2.start('hidden');

    if (inView3) controls3.start('visible');
    else controls3.start('hidden');
  }, [controls1, controls2, controls3, inView1, inView2, inView3]);

  const featureSections = [
    {
      refProp: ref1,
      controls: controls1,
      imageSrc: feature1,
      heading: 'drag-and-drop Visualization',
      text: 'Design dApps effortlessly with an AI-powered interface — turn ideas into smart contracts in a few clicks.',
      bgColor: 'rgba(88, 96, 183, 0.9)',
      direction: 'row' as 'row',
      imageStyle: {
        height: '350px',
        filter: 'brightness(1.2) contrast(1.1) saturate(1.5)',
      },
      textVariants: {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.3 } },
      },
    },
    {
      refProp: ref2,
      controls: controls2,
      imageSrc: feature2,
      heading: 'ai-powered code generation',
      text: 'From idea to complete Anchor project in minutes.',
      bgColor: 'rgba(75, 82, 159, 0.9)',
      direction: 'row-reverse' as 'row-reverse',
      imageStyle: {
        height: '300px',
        opacity: 0.8,
      },
      textVariants: {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.3 } },
      },
    },
    {
      refProp: ref3,
      controls: controls3,
      imageSrc: feature3,
      heading: 'solana ide',
      text: 'Edit, build, and deploy your Solana programs—all in one powerful IDE.',
      bgColor: 'rgba(63, 69, 135, 0.9)',
      direction: 'row' as 'row',
      imageStyle: {
        height: '250px',
        opacity: 0.9,
      },
      textVariants: {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.3 } },
      },
    },
  ];

  return (
    <Flex direction="column" w="100%" overflow="hidden">
      {featureSections.map((feature, index) => (
        <FeatureSection key={index} {...feature} />
      ))}
    </Flex>
  );
};

export default Features;