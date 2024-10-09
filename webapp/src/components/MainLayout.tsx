import React from 'react';
import {
  Box,
  VStack,
  Icon,
  Tooltip,
  Flex,
  Text,
  Button,
  CloseButton,
} from '@chakra-ui/react';
import { FaCog, FaFile, FaComments, FaUser } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../contexts/ProjectContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { project } = useProject();

  const menuItems = [
    { icon: FaCog, label: 'System Design', path: '/design' },
    { icon: FaFile, label: 'Coding', path: '/code', disabled: !project?.files },
    { icon: FaComments, label: 'Documentation', path: '/doc' },
    { icon: FaUser, label: 'User Account', path: '/account' },
  ];

  const handleNavigation = (path: string) => {
    if (path === '/account') {
      logout();
      navigate('/');
    } else {
      navigate(path);
    }
  };

  return (
    <Flex h='100vh'>
      <Box w='60px' bg='gray.800' p={2}>
        <VStack spacing={4} align='center' h='full'>
          {menuItems.map((item) => (
            <Tooltip key={item.path} label={item.label} placement='right'>
              <Box
                as={!item.disabled ? 'button' : 'text'}
                onClick={
                  !item.disabled ? () => handleNavigation(item.path) : () => {}
                }
                p={2}
                borderRadius='md'
                bg={
                  location.pathname === item.path ? 'blue.500' : 'transparent'
                }
                _hover={{ bg: !item.disabled ? 'blue.600' : 'tranperant' }}
              >
                <Icon as={item.icon} w={6} h={6} color='white' />
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
