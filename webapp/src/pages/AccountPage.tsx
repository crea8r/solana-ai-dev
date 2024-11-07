import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
    //Avatar,
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
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuItemOption,
    MenuGroup,
    MenuOptionGroup,
    MenuDivider,
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
} from '@chakra-ui/react';
import { Avatar, ChevronDownIcon } from "@chakra-ui/icons";
import { FaUserCircle } from "react-icons/fa";
import { FaRegBell } from "react-icons/fa6";
import { MdOutlineLogout } from "react-icons/md";
import { IoMdMenu } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";

const AccountPage: React.FC = () => {
    const authContext = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const placeholderUser = {
        username: 'exampleUser',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        orgName: 'Example Organization',
    };

    const user = {
        username: authContext?.user?.username || placeholderUser.username,
        email: placeholderUser.email,
        firstName: placeholderUser.firstName,
        lastName: placeholderUser.lastName,
        orgName: placeholderUser.orgName,
    };

    const teamMembers = [
        { name: "Alex Johnson", role: "Product Manager", email: "alex@example.com" },
        { name: "Sarah Lee", role: "UX Designer", email: "sarah@example.com" },
        { name: "Michael Chen", role: "Full Stack Developer", email: "michael@example.com" },
        { name: "Emily Davis", role: "Marketing Specialist", email: "emily@example.com" },
        { name: "David Kim", role: "Data Analyst", email: "david@example.com" },
    ];

    return (
        <Flex className="flex h-screen bg-gray-100">
            <Box className="hidden w-64 bg-white border-r lg:block">
                <Flex className="flex items-center justify-between p-4 border-b">
                    <Text className="text-lg font-semibold">Organization Name</Text>
                </Flex>
                <Box as="nav" p={4}>
                    <Box as="ul">
                        <Box as="li" mb={2}>
                        <Button
                            as="a"
                            href="#"
                            variant="ghost"
                            leftIcon={<FaUserCircle />}
                            justifyContent="flex-start"
                            w="full"
                            p="2"
                            color="gray.700"
                            _hover={{ bg: "gray.100" }}
                            borderRadius="lg"
                            >
                                Account
                            </Button>
                        </Box>
                        <Box as="li">
                        <Button
                            as="a"
                            href="#"
                            variant="ghost"
                            leftIcon={<IoSettingsOutline className="w-5 h-5 mr-3" />}
                            justifyContent="flex-start"
                            w="full"
                            p="2"
                            color="gray.700"
                            _hover={{ bg: "gray.100" }}
                            borderRadius="lg"
                            >
                                Settings
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Drawer isOpen={isSidebarOpen} placement="left" onClose={() => setIsSidebarOpen(false)}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Company Name</DrawerHeader>
                    <DrawerBody>
                        <Box as="nav" p={4}>
                            <Box as="ul">
                                <Box as="li" mb={2}>
                                    <Button
                                        as="a"
                                        href="#"
                                        className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100"
                                        onClick={() => setIsSidebarOpen(false)}
                                    >
                                        <FaUserCircle className="w-5 h-5 mr-3" />
                                        Account
                                    </Button>
                                </Box>
                                <Box as="li">
                                    <Button
                                        as="a"
                                        href="#"
                                        className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100"
                                        onClick={() => setIsSidebarOpen(false)}
                                    >
                                        <IoSettingsOutline className="w-5 h-5 mr-3" />
                                        Settings
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            <Box className="flex flex-col flex-1 overflow-hidden">
                <Box className="flex items-center justify-between px-4 py-3 bg-white border-b lg:px-6">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
                        <IoMdMenu className="w-6 h-6" />
                        <Box className="sr-only">Open sidebar</Box>
                    </Button>
                    <Box className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon">
                            <FaRegBell className="w-5 h-5" />
                            <Box className="sr-only">Notifications</Box>
                        </Button>
                        <Menu>
                            <MenuButton as={Button} variant="ghost" className="relative w-8 h-8 rounded-full">
                                <Avatar className="w-8 h-8" />
                            </MenuButton>
                            <MenuList className="w-56">
                                <Box className="flex flex-col space-y-1 p-2">
                                    <Text className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</Text>
                                    <Text className="text-xs leading-none text-muted-foreground">{user.email}</Text>
                                </Box>
                                <MenuDivider />
                                <MenuItem icon={<FaUserCircle className="w-4 h-4 mr-2" />}>
                                    Profile
                                </MenuItem>
                                <MenuItem icon={<IoSettingsOutline className="w-4 h-4 mr-2" />}>
                                    Settings
                                </MenuItem>
                                <MenuDivider />
                                <MenuItem icon={<MdOutlineLogout className="w-4 h-4 mr-2" />}>
                                    Log out
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </Box>
                </Box>

                <Box className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <Text className="text-2xl font-semibold mb-6">Account Details</Text>
                    <Box className="grid gap-6 mb-6 md:grid-cols-2">
                        <Card className="bg-white border border-gray-200">
                            <CardHeader>
                                <Text>Personal Information</Text>
                                <Text>Manage your personal details</Text>
                            </CardHeader>
                            <CardBody>
                                <FormControl className="space-y-4">
                                    <Box className="space-y-2">
                                        <FormLabel htmlFor="username">Username</FormLabel>
                                        <Input id="username" value={user.username} readOnly />
                                    </Box>
                                    <Box className="space-y-2">
                                        <FormLabel htmlFor="name">Full Name</FormLabel>
                                        <Input id="name" placeholder={`${user.firstName} ${user.lastName}`} />
                                    </Box>
                                    <Box className="space-y-2">
                                        <FormLabel htmlFor="email">Email</FormLabel>
                                        <Input id="email" type="email" placeholder={user.email} />
                                    </Box>
                                    <Button>Save Changes</Button>
                                </FormControl>
                            </CardBody>
                        </Card>
                    </Box>
                </Box>
            </Box>
        </Flex>
    );
};

export default AccountPage;
