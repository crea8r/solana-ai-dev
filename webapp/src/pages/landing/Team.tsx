import React from 'react';
import { Box, Image, Text, Link, Flex, Heading, SimpleGrid, extendTheme, Icon } from '@chakra-ui/react';
import { FaTelegram, FaTwitter } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

import foxImage from '../../assets/team/fox.png';
import degenImage from '../../assets/team/degen.png';
import k2Image from '../../assets/team/k2.png';
import landingPageTheme from '../../theme';
import { CgMail } from 'react-icons/cg';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  x: string;
  tg: string;
}

const agentColor = "#b7bfe5";

const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => {
  return (
    <Box
      bg={landingPageTheme.colors.brand.boxBgColor}
      borderRadius="lg"
      boxShadow="2xl"
      overflow="hidden"
      _hover={{ transform: 'scale(1.05)', transition: 'transform 0.3s ease-in-out' }}
    >
      <Flex justify="center" align="center" p={4}>
        <Image
          src={member.image}
          alt={member.name}
          objectFit="cover"
          w="150px"
          h="150px"
          borderRadius="50%"
          fallbackSrc="https://via.placeholder.com/150"
        />
      </Flex>
      <Box p={6}>
        <Text 
          color={landingPageTheme.colors.brand.textAccentColor1} 
          fontSize="lg" 
          fontWeight="extrabold"
          fontFamily="IBM Plex Mono"
          mb={2}
        >
          {member.name}
        </Text>
        <Text 
          color={landingPageTheme.colors.brand.textAccentColor2} 
          fontSize="md" 
          fontFamily="IBM Plex Mono"
          mb={4}
        >
          {member.role}
        </Text>
        <Flex direction="column" gap={3}>
          <Link href={`https://x.com/${member.x}`} color={landingPageTheme.colors.brand.textAccentColor3} isExternal>
            <Flex align="center" gap={2}>
              <FaXTwitter />
              <Text>{member.x}</Text>
            </Flex>
          </Link>
          <Link href={`https://t.me/${member.tg}`} color={landingPageTheme.colors.brand.textAccentColor3} isExternal>
            <Flex align="center" gap={2}>
              <FaTelegram />
              <Text>{member.tg}</Text>
            </Flex>
          </Link>
        </Flex>
      </Box>
    </Box>
  );
};

const teamMembers = [
  {
    name: 'fox',
    role: 'Founding Dev, Project Lead',
    image: foxImage,
    x: '@_sol_f0x',
    tg: '@hfox8',
  },
  {
    name: 'degen I rational',
    role: 'Business Operations',
    image: degenImage,
    x: '@Degenirational',
    tg: '@Yamato_Nakamura',
  },
  {
    name: 'k2',
    role: 'Founding Dev, Advisor',
    image: k2Image,
    x: '@0xk2_',
    tg: '@hieubt88',
  },
];

const ContactInfoItem: React.FC<{ icon: React.ElementType; text: string; href: string }> = ({ icon, text, href }) => {
  return (
    <Flex
      direction="row"
      align="center"
      justify="center"
      bg={landingPageTheme.colors.brand.boxBgColor}
      color={landingPageTheme.colors.brand.textAccentColor}
      p={6}
      borderRadius="md"
      gap={2}
      _hover={{ transform: 'scale(1.05)', transition: 'transform 0.3s ease-in-out' }}
      _active={{ transform: 'scale(0.95)', transition: 'transform 0.3s ease-in-out' }}
    >
      <Icon as={icon} boxSize={5} />
      <Link href={href} textDecoration="none" color={landingPageTheme.colors.brand.textAccentColor} fontWeight="bold">
        {text}
      </Link>
    </Flex>
  );
};

const contactInfo = [
  {
    icon: CgMail,
    text: 'team@usesolai.xyz',
    href: 'mailto:team@usesolai.xyz',
  },
  {
    icon: FaXTwitter,
    text: '@usesolai',
    href: 'https://x.com/usesolai',
  },
  {
    icon: FaTelegram,
    text: 'Join Telegram Group',
    href: 'https://t.me/+WVRI_EcdZrkyZDhk',
  },
];

const Team = () => {
  return (
    <Flex 
      direction="column"
      align="center"
      textAlign="center"
      zIndex={1}
      w="80%"
      h="full"
      gap={10}
    >
      <Flex direction="column" align="center" justify="center" w="full" h="full">
        <Heading 
          fontFamily="Major Mono Display"
          color="white"
          size="lg" 
          textAlign="center" 
          mb={6}
          >
            solAi team
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={index} member={member} />
            ))}
        </SimpleGrid>
      </Flex>
      <Flex
        zIndex={1}
        direction="row"
        justify="space-around"
        align="center"
        w="100%"
        gap={6}
        p={6}
        borderRadius="lg"
      >
        {contactInfo.map((contact, index) => (
          <ContactInfoItem key={index} icon={contact.icon} text={contact.text} href={contact.href} />
        ))}
      </Flex>
    </Flex>
  );
};

export default Team;