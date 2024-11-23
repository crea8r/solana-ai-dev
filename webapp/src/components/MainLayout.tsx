import React from 'react';
import { Box, VStack, Icon, Tooltip, Flex, Button } from '@chakra-ui/react';
import { PiGraphLight } from "react-icons/pi";
import { PiTerminalWindowLight } from "react-icons/pi";
import { PiBookOpenText } from "react-icons/pi";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { PiAppWindowLight } from "react-icons/pi";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProjectContext } from '../contexts/ProjectContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { projectContext } = useProjectContext();

  const menuItems = [
    { icon: PiGraphLight, label: 'Design', path: '/design' },
    { icon: PiTerminalWindowLight, label: 'Code', path: '/code', disabled: !projectContext.details.isCode },
    { icon: PiAppWindowLight, label: 'UI', path: '/ui', disabled: true }, //disabled: !projectContext.details.isCode
    { icon: PiBookOpenText, label: 'Docs', path: '/doc', disabled: true },
    { icon: HiOutlineUserCircle, label: 'Account', path: '/account' },
  ];

  const handleNavigation = (path: string) => {
    if (path === '/account') {
      navigate('/account'); 
    } else {
      navigate(path);
    }
  };

  return (
    <Flex h='100vh !important' overflow='hidden'>
      <Box w='4vw' bg='white' p={4} pr={6} pl={6} borderRight="1px solid" borderColor="gray.300">
        <VStack spacing={4} align='center' h='full'>
          {menuItems.map((item) => (
            <Tooltip 
              key={item.path} 
              label={item.label} 
              placement='right'
              hasArrow
              bg='#a9b7ff'
              color='white'
              shadow='md'
              fontSize='xs' 
              borderRadius='md'
              p={3}
            >
              <Box
                as={!item.disabled ? 'button' : 'text'}
                onClick={
                  !item.disabled ? () => handleNavigation(item.path) : () => {}
                }
                p={2}
                borderRadius='md'
                bg={
                  location.pathname === item.path ? 'blue.50' : 'transparent'
                }
                _hover={{ bg: !item.disabled ? 'blue.50' : 'transparent' }}
              >
                <Icon as={item.icon} w={5} h={5} color='black' />
              </Box>
            </Tooltip>
          ))}
        </VStack>
      </Box>
      <Box flex={1} overflow='auto'>
        {children}
      </Box>
    </Flex>
  );
};

export default MainLayout;
