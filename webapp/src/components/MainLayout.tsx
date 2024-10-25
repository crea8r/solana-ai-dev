import React from 'react';
import { Box, VStack, Icon, Tooltip, Flex, Button } from '@chakra-ui/react';
import { PiGraphLight } from "react-icons/pi";
import { CiFileOn } from "react-icons/ci";
import { IoBookOutline } from "react-icons/io5";
import { HiOutlineUserCircle } from "react-icons/hi2";
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
    { icon: PiGraphLight, label: 'System Design', path: '/design' },
    { icon: CiFileOn, label: 'Coding', path: '/code', disabled: !projectContext.details.isCode },
    { icon: IoBookOutline, label: 'Documentation', path: '/doc', disabled: true },
    { icon: HiOutlineUserCircle, label: 'User Account', path: '/account' },
  ];

  const handleNavigation = (path: string) => {
    if (path === '/account') {
      navigate('/account'); 
    } else {
      navigate(path);
    }
  };

  return (
    <Flex h='100vh'>
      <Box w='60px' bg='white' p={4} pr={6} pl={6} borderRight="1px solid" borderColor="gray.300">
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
                  location.pathname === item.path ? 'blue.100' : 'transparent'
                }
                _hover={{ bg: !item.disabled ? 'blue.100' : 'tranperant' }}
              >
                <Icon as={item.icon} w={6} h={6} color='black' />
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
