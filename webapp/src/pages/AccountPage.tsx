import React, { useContext, useEffect, useState } from 'react';
import { AuthContext, useAuthContext } from '../contexts/AuthContext';
import { 
    Box,
    Flex,
    Heading,
    Text,
    Button,
    Input,
    Card, 
    CardHeader, 
    CardBody, 
    CardFooter,
    FormControl,
    FormLabel,
    Avatar,
    useToast,
} from '@chakra-ui/react';
import { FaUserCircle, FaUser, FaKey } from "react-icons/fa";
import { updateApiKey, getUser } from '../services/authApi';

const AccountPage: React.FC = () => {
    const authContext = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [newApiKey, setNewApiKey] = useState('');
    const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);
    const toast = useToast();

    const fetchUser = async () => {
        try {
            const userData = await getUser();
            if (!userData) throw new Error('User data not found');
            setCurrentApiKey(userData.openai_api_key);
            console.log("userData", userData);
            console.log("currentApiKey", userData.openai_api_key);
        } catch (error) {
            console.error('Error fetching user:', error);
            toast({
                title: 'Error fetching user details.',
                description: 'Unable to retrieve the latest API key.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const getAvatarInitial = (username: string) => {
        return username.charAt(0).toUpperCase();
    };

    const maskApiKey = (key: string): string => {
        if (key.length <= 8) return key;
        return `${key.substring(0, 4)}••••••••${key.substring(key.length - 4)}`;
    };

    const handleUpdateApiKey = async () => {
        try {
            const response = await updateApiKey(newApiKey);
            setCurrentApiKey(response.openAiApiKey);
            console.log("response", response.openAiApiKey);
            await fetchUser();
            toast({
                title: 'API Key updated successfully!',
                description: 'Your API key has been saved and updated.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setNewApiKey('');
        } catch (error) {
            console.error('Error updating API key:', error);
            toast({
                title: 'Error updating API key.',
                description: 'There was a problem saving your new API key.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box maxW="2xl" mx="auto" py={10}>
            <Box mb={8}>
                <Heading as="h1" size="lg" mb={2}>
                    Account Settings
                </Heading>
                <Text color="gray.600">Manage your account details and preferences</Text>
            </Box>

            <Flex direction="column" gap={6}>
                <Card bg="white" boxShadow="sm" borderRadius="md" borderWidth="1px">
                    <CardHeader display="flex" alignItems="center" gap={4} pb={0}>
                        <Avatar size="lg" bg="gray.300" icon={<FaUserCircle fontSize="2rem" />} />
                        <Box>
                            <Heading as="h2" size="md">
                                Personal Information
                            </Heading>
                            <Text color="gray.600">Manage your personal details</Text>
                        </Box>
                    </CardHeader>

                    <CardBody>
                        <Flex direction="column" gap={6}>
                            <FormControl>
                                <FormLabel fontWeight="medium">
                                    <Flex alignItems="center" gap={2}>
                                        <FaUser />
                                        Username
                                    </Flex>
                                </FormLabel>
                                <Input value={authContext?.user?.username} isReadOnly />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontWeight="medium">
                                    Current API Key
                                </FormLabel>
                                <Text 
                                    fontSize="md" 
                                    fontWeight="medium" 
                                    color="gray.700" 
                                    bg="gray.100" 
                                    px={3} 
                                    py={2} 
                                    borderRadius="md"
                                >
                                    {currentApiKey ? maskApiKey(currentApiKey) : 'No API Key Available'}
                                </Text>
                            </FormControl>

                            <FormControl>
                                <FormLabel fontWeight="medium">
                                    <Flex alignItems="center" gap={2}>
                                        <FaKey />
                                        Change API Key
                                    </Flex>
                                </FormLabel>
                                <Input 
                                    placeholder="Enter new API key" 
                                    value={newApiKey} 
                                    onChange={(e) => setNewApiKey(e.target.value)} 
                                    type="password"
                                />
                                <Text fontSize="sm" color="gray.500" mt={2}>
                                    Your API key is used to authenticate API requests
                                </Text>
                            </FormControl>
                        </Flex>
                    </CardBody>

                    <CardFooter>
                        <Flex justify="flex-end" w="full">
                            <Button 
                                colorScheme="blue" 
                                onClick={handleUpdateApiKey}
                                isDisabled={!newApiKey}
                            >
                                Save Changes
                            </Button>
                        </Flex>
                    </CardFooter>
                </Card>
            </Flex>
        </Box>
    );
};

export default AccountPage;
