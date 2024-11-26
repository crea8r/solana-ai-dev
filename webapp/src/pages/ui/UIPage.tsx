import React, { useCallback, useState }   from "react";
import { Box, Flex, Text, useToast, Divider } from "@chakra-ui/react";
import TopPanel from "./TopPanel";
import { useProjectContext } from "../../contexts/ProjectContext";
import { logout } from "../../services/authApi";
import { Wallet } from "../../components/Wallet";
import UISpace from "./UISpace";
import Toolbox from "./Toolbox";
import PropertyPanel from "./PropertyPanel";

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
    <Flex direction="column" height="100vh" overflow="hidden">
      <TopPanel 
          onSelectModel={handleSelectModel} 
          onToggleWallet={handleToggleWallet} 
          onLogout={handleLogout} 
        />
      <Flex flex={1} overflow="hidden">
        <Toolbox />

        <Flex
          flex={1}
          bg="white"
          p={4}
          justifyContent="center"
          alignItems="flex-start"
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

        <PropertyPanel />
      
      </Flex>
    </Flex>
  );
};

export default UIPage;
