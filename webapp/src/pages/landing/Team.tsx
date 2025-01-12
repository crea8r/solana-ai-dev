import React from 'react';
import { Box, Image, Text, Link, Flex, Heading, SimpleGrid } from '@chakra-ui/react';
import { FaTelegram, FaTwitter } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

// Import images at the top
import foxImage from '../../assets/team/fox.png';
import degenImage from '../../assets/team/degen.png';
import k2Image from '../../assets/team/k2.png';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  x: string;
  tg: string;
}

const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => {
  return (
    <Box
      bg="rgba(255, 255, 255, 0.6)"
      borderRadius="lg"
      boxShadow="lg"
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
        <Text fontSize="xl" fontWeight="bold" mb={2}>
          {member.name}
        </Text>
        <Text fontSize="md" color="gray.600" mb={4}>
          {member.role}
        </Text>
        <Flex direction="column" gap={3}>
          <Link href={`https://x.com/${member.x}`} color="blue.500" isExternal>
            <Flex align="center" gap={2}>
              <FaXTwitter />
              <Text>{member.x}</Text>
            </Flex>
          </Link>
          <Link href={`https://t.me/${member.tg}`} color="blue.500">
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

const Team = () => {
  return (
    <Box  py={16}>
      <Box maxW="1200px" mx="auto" px={4}>
        <Heading 
            fontFamily="IBM Plex Mono"
            color="white"
            as="h2" size="lg" textAlign="center" mb={12}>
          Our Team
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={index} member={member} />
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default Team;