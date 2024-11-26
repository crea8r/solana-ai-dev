import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useClipboard,
  HStack,
  Icon,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Skeleton,
  useColorModeValue,
} from "@chakra-ui/react";
import { CheckIcon, CopyIcon, TimeIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { KeyRound, WalletIcon } from 'lucide-react';
import { getPrivateKey, getWalletInfo } from '../api/wallet';
import { WalletPrivateKeyInfo, WalletInfo } from '../interfaces/wallet';
import { AuthContext } from '../contexts/AuthContext';

interface WalletCreationModalProps { userId: string; onClose: () => void; };

export const WalletCreationModal: React.FC<WalletCreationModalProps> = ({ userId, onClose }) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const { hasCopied: publicKeyCopied, onCopy: onCopyPublicKey } = useClipboard(walletInfo?.publicKey || '');
  const { hasCopied: privateKeyCopied, onCopy: onCopyPrivateKey } = useClipboard(privateKey || '');

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const info = await getWalletInfo(userId);
        setWalletInfo(info);
        const privateKeyInfo = await getPrivateKey(userId);
        setPrivateKey(privateKeyInfo.privateKey);
      } catch (error) {
        console.error('Failed to fetch wallet info:', error);
      }
    };

    fetchWalletData();
  }, [userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Modal isOpen={!!walletInfo && !!privateKey} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="500px">
        <ModalHeader fontSize="xl" fontWeight="bold">
          Wallet Created Successfully
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="start" spacing={6} py={4}>
            <Box width="100%">
              <FormControl>
                <FormLabel fontWeight="semibold" display="flex" alignItems="center" gap={2}>
                  <Icon as={KeyRound} boxSize={4} /> Public Key
                </FormLabel>
                <HStack>
                  <Input value={walletInfo?.publicKey} isReadOnly fontFamily="mono" size="sm" />
                  <IconButton
                    aria-label="Copy Public Key"
                    icon={publicKeyCopied ? <CheckIcon color="green.500" /> : <CopyIcon />}
                    onClick={onCopyPublicKey}
                  />
                </HStack>
              </FormControl>
            </Box>

            <Box width="100%">
              <FormControl>
                <FormLabel fontWeight="semibold" display="flex" alignItems="center" gap={2} color="red.500">
                  <Icon as={KeyRound} boxSize={4} /> Private Key
                </FormLabel>
                <HStack>
                  <Input
                    value={privateKey || ''}
                    isReadOnly
                    type={showPrivateKey ? "text" : "password"}
                    fontFamily="mono"
                    size="sm"
                  />
                  <IconButton
                    aria-label="Copy Private Key"
                    icon={privateKeyCopied ? <CheckIcon color="green.500" /> : <CopyIcon />}
                    onClick={onCopyPrivateKey}
                  />
                </HStack>
                <Text fontSize="sm" color="red.500">
                  Please store your private key securely. You will not see it again.
                </Text>
              </FormControl>
            </Box>

            <HStack spacing={2} color="gray.500" fontSize="sm">
              <Icon as={TimeIcon} boxSize={4} />
              <Text>Created on: {formatDate(walletInfo?.creationDate || '')}</Text>
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose} width="full">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const Wallet: React.FC = () => {
  const { user } = useContext(AuthContext)!;
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { onCopy } = useClipboard(walletInfo?.publicKey || '');

  const bgColor = useColorModeValue("gray.100", "gray.700");
  const sidebarBgColor = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const fetchWalletInfo = async () => {
      if (user?.id) {
        try {
          const info = await getWalletInfo(user.id);
          setWalletInfo(info);
        } catch (error) {
          console.error('Failed to fetch wallet info:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchWalletInfo();
  }, [user]);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (addr: string) => {
    return addr.length < 12 ? addr : `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const viewOnExplorer = () => {
    if (walletInfo?.publicKey) {
      window.open(`https://explorer.solana.com/address/${walletInfo.publicKey}`, "_blank");
    }
  };

  if (isLoading) {
    return (
      <Box
        position="relative"
        right={0}
        top={0}
        width="auto"
        p={4}
        zIndex="1000"
      >
        <Card width="full" p={4}>
          <CardHeader>
            <Flex align="center" gap={2}>
              <WalletIcon size={20} />
              <Skeleton height="20px" width="120px" />
            </Flex>
            <Skeleton mt={2} height="15px" width="180px" />
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <Skeleton height="10px" width="80px" />
              <Skeleton height="40px" width="full" />
              <Skeleton height="10px" width="80px" />
              <Skeleton height="40px" width="full" />
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      position="relative"
      right={0}
      top={0}
      width="auto"
      p={4}
      zIndex="1000"
      overflowY="auto"
    >
      <Card width="full" boxShadow="lg" px={6} py={2}>
        <CardHeader>
          <Flex align="center" gap={2} mb={2}>
            <WalletIcon size={18} />
            <Heading fontSize="lg">Wallet Information</Heading>
          </Flex>
          <Text fontSize="xs" color="gray.500">
            View and manage your wallet details
          </Text>
        </CardHeader>
        <CardBody>
          <VStack align="start" spacing={4}>
            <Box width="full">
              <Text fontWeight="semibold" fontSize="sm">
                Address
              </Text>
              <Flex align="center" gap={2} mt={1}>
                <Box
                  flex="1"
                  p={2}
                  bg={bgColor}
                  fontFamily="mono"
                  fontSize="sm"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.300"
                >
                  {formatAddress(walletInfo?.publicKey || '')}
                </Box>
                <IconButton
                  aria-label="Copy address"
                  icon={copied ? <CheckIcon color="green.500" /> : <CopyIcon />}
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                />
                <IconButton
                  aria-label="View on explorer"
                  icon={<ExternalLinkIcon />}
                  onClick={viewOnExplorer}
                  variant="outline"
                  size="sm"
                />
              </Flex>
            </Box>

            <Box width="full">
              <Text fontWeight="semibold" fontSize="sm">
                Balance
              </Text>
              <Flex align="center" gap={2} mt={1}>
                <Box
                  flex="1"
                  p={2}
                  bg={bgColor}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.300"
                  display="flex"
                  alignItems="center"
                >
                  <Text fontSize="2xl" fontWeight="bold">
                    {walletInfo?.balance || 0}
                  </Text>
                  <Text ml={2} fontSize="sm" color="gray.500">
                    SOL
                  </Text>
                </Box>
              </Flex>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};