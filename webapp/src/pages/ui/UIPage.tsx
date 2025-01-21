import React, { useCallback, useEffect, useState, useMemo }   from "react";
import { Box, Flex, Text, useToast, Divider, Button } from "@chakra-ui/react";
import TopPanel from "./TopPanel";
import { useProjectContext } from "../../contexts/ProjectContext";
import { logout } from "../../services/authApi";
import { Wallet } from "../../components/Wallet";
import UISpace from "./UISpace";
import Toolbox from "./Toolbox";
import PropertyPanel from "./PropertyPanel";
import { useTerminalLogs } from "../../hooks/useTerminalLogs";
import { TaskModal } from "./TaskModal";
import { useAuthContext } from '../../contexts/AuthContext';

const UIPage = () => {
  const { projectContext, setProjectContext } = useProjectContext();  
  const { user } = useAuthContext();
  const { addLog } = useTerminalLogs();
  
  const [aiModel, setAiModel] = useState('Codestral');
  const [showWallet, setShowWallet] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const toast = useToast();
  const [toggleState, setToggleState] = useState(true);
  const [walletPrivateKey, setWalletPrivateKey] = useState(user?.walletPrivateKey || '');

  /*
  useEffect(() => {
    if (!user || !user.walletPrivateKey) throw new Error('User or wallet private key not found');
  }, []);
  */

  useEffect(() => {
    console.log('user:', user);
  }, []);

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

  const handleToggleUI = () => {
    setToggleState((prev) => !prev);
  };

  useEffect(() => {
    console.log("projectContext", projectContext);
  }, [projectContext]);


  return (
    <Flex direction="column" height="100vh" overflow="hidden">
      <TopPanel 
        onToggleWallet={handleToggleWallet} 
        onLogout={handleLogout} 
        setIsPolling={setIsPolling}
        setIsLoading={setIsLoading}
        addLog={addLog} 
        setIsTaskModalOpen={setIsTaskModalOpen}
        user={user}
      />
      <Flex flex={1} overflow="hidden" direction="column">

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

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          setIsPolling={setIsPolling}
          setIsLoading={setIsLoading}
          addLog={addLog}
        />
      )}
    </Flex>
  );
};

export default UIPage;
