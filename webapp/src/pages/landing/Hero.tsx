import React from "react";
import { Box, Flex, Text, Button } from "@chakra-ui/react";

interface HeroSectionProps {
  words: string[];
}

const TypingEffect = ({ words }: { words: string[] }) => {
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [displayedText, setDisplayedText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const word = words[currentWordIndex];
    const typeSpeed = isDeleting ? 30 : 40;
    const delay = isDeleting && displayedText === "" ? 1000 : 200;

    if (!isDeleting && displayedText.length === word.length) {
      setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && displayedText.length === 0) {
      setIsDeleting(false);
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }

    const timer = setTimeout(() => {
      setDisplayedText((prev) =>
        isDeleting ? word.substring(0, prev.length - 1) : word.substring(0, prev.length + 1)
      );
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentWordIndex, words]);

  return (
    <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="bold" fontFamily="'IBM Plex Mono', monospace">
      {displayedText}|
    </Text>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({ words }) => {
  return (
    <Flex
      h="90vh"
      direction="column"
      align="center"
      justify="center"
      color="white"
      textAlign="center"
      p={8}
      gap={10}
      zIndex={10}
    >
      <Box mt="100px">
        <TypingEffect words={words} />
      </Box>
      <Flex gap={4} direction="row">
        <Button bg="white" size="md" color="black" shadow="xl">
          Get Started
        </Button>
        <Button bg="white" size="md" color="black" shadow="xl">
          See Demo
        </Button>
      </Flex>
    </Flex>
  );
};

export default HeroSection;
