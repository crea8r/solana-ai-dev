import React, { useCallback, useState }   from "react";
import { Box, Flex, Text, useToast, Divider } from "@chakra-ui/react";
import TopPanel from "./TopPanel";
import { useProjectContext } from "../../contexts/ProjectContext";
import { logout } from "../../services/authApi";
import { Wallet } from "../../components/Wallet";
import UISpace from "./UISpace";

const UIPage = () => {
  const { projectContext, setProjectContext } = useProjectContext();
  const [aiModel, setAiModel] = useState('Codestral');
  const [showWallet, setShowWallet] = useState(false);
  const toast = useToast();

  const handleSelectModel = (model: string, apiKey: string) => {
    setAiModel(model);
    setProjectContext({ ...projectContext, aiModel: model });
  };

  const handleToggleWallet = () => {
    setShowWallet((prev) => !prev);
  };

  const handleLogout = useCallback(() => {
    logout();
    toast({
      title: 'Logged out successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    window.location.href = '/';
  }, [toast]);

  return (
    <Flex direction="column" height="100vh">
      <TopPanel 
          onSelectModel={handleSelectModel} 
          onToggleWallet={handleToggleWallet} 
          onLogout={handleLogout} 
        />
      <Flex height="100vh">
        {/* Toolbox */}
        <Flex
          width="20%"
          bg="gray.100"
          p={4}
          gap={4}
          direction="column"
          borderRight="1px solid"
          borderColor="gray.300"
          shadow="md"
        >
          <Flex direction="column" gap={2}> 
            <Text fontSize="lg" fontWeight="normal" mb={4} color="gray.600">Toolbox</Text>
            <Text fontSize="sm" color="gray.500">Drag and drop components to the canvas</Text>
            <Divider borderColor="gray.400" my={4}/>
          </Flex>
            {/* Placeholder for draggable components */}
            <Flex direction="row" gap={4} width="100%" align="flex-start" wrap="wrap" flexWrap="wrap">
            <Box p={4} border="1px solid" borderColor="gray.300" textAlign="center" bg="white">
              <Text>Button</Text>
            </Box>
            <Box p={4} border="1px solid" borderColor="gray.300" textAlign="center" bg="white">
              <Text>Form</Text>
            </Box>
            <Box p={4} border="1px solid" borderColor="gray.300" textAlign="center" bg="white">
              <Text>Table</Text>
            </Box>
          </Flex>
        </Flex>

        {/* Runtime Interactor */}
        <Flex
          width="60%"
          bg="white"
          p={4}
          justifyContent="center"
          alignItems="center"
          borderLeft="1px solid"
          borderRight="1px solid"
          borderColor="gray.300"
          overflowY="auto"
        >
          <UISpace />
        </Flex>

        <Box flex={1} position="absolute" right={0} top={9}>
          {showWallet && <Wallet />}
        </Box>
        {/* Properties Panel */}
        <Box
          width="20%"
          bg="gray.100"
          p={4}
          borderLeft="1px solid"
          borderColor="gray.300"
        >
          <Flex direction="column" gap={2}>
            <Text fontWeight="normal" color="gray.600" fontSize="md" mb={2}>Component Properties</Text>
            <Text fontWeight="normal" color="gray.600" fontSize="sm" borderTop="1px solid" borderBottom="1px solid" borderColor="gray.300" pt={2} pb={2}>Width:</Text>
            <Text fontWeight="normal" color="gray.600" fontSize="sm" borderBottom="1px solid" borderColor="gray.300" pb={2}>Height:</Text>
            <Text fontWeight="normal" color="gray.600" fontSize="sm" borderBottom="1px solid" borderColor="gray.300" pb={2}>Color:</Text>
            <Text fontWeight="normal" color="gray.600" fontSize="sm" borderBottom="1px solid" borderColor="gray.300" pb={2}>Functionality:</Text>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};

export default UIPage;
