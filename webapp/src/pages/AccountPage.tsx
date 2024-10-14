import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
    //Avatar,
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
        <div className="flex h-screen bg-gray-100">
            <aside className="hidden w-64 bg-white border-r lg:block">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">Organization Name</h2>
                </div>
                <nav className="p-4">
                    <ul className="space-y-2">
                        <li>
                            <a href="#" className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                                <FaUserCircle className="w-5 h-5 mr-3" />
                                Account
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                                <IoSettingsOutline className="w-5 h-5 mr-3" />
                                Settings
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>

            <Drawer isOpen={isSidebarOpen} placement="left" onClose={() => setIsSidebarOpen(false)}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Company Name</DrawerHeader>
                    <DrawerBody>
                        <nav className="py-4">
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="#"
                                        className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100"
                                        onClick={() => setIsSidebarOpen(false)}
                                    >
                                        <FaUserCircle className="w-5 h-5 mr-3" />
                                        Account
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100"
                                        onClick={() => setIsSidebarOpen(false)}
                                    >
                                        <IoSettingsOutline className="w-5 h-5 mr-3" />
                                        Settings
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between px-4 py-3 bg-white border-b lg:px-6">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
                        <IoMdMenu className="w-6 h-6" />
                        <span className="sr-only">Open sidebar</span>
                    </Button>
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon">
                            <FaRegBell className="w-5 h-5" />
                            <span className="sr-only">Notifications</span>
                        </Button>
                        <Menu>
                            <MenuButton as={Button} variant="ghost" className="relative w-8 h-8 rounded-full">
                                <Avatar className="w-8 h-8" />
                            </MenuButton>
                            <MenuList className="w-56">
                                <div className="flex flex-col space-y-1 p-2">
                                    <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                </div>
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
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <h1 className="text-2xl font-semibold mb-6">Account Details</h1>
                    <div className="grid gap-6 mb-6 md:grid-cols-2">
                        <Card className="bg-white border border-gray-200">
                            <CardHeader>
                                <Text>Personal Information</Text>
                                <Text>Manage your personal details</Text>
                            </CardHeader>
                            <CardBody>
                                <form className="space-y-4">
                                    <div className="space-y-2">
                                        <FormLabel htmlFor="username">Username</FormLabel>
                                        <Input id="username" value={user.username} readOnly />
                                    </div>
                                    <div className="space-y-2">
                                        <FormLabel htmlFor="name">Full Name</FormLabel>
                                        <Input id="name" placeholder={`${user.firstName} ${user.lastName}`} />
                                    </div>
                                    <div className="space-y-2">
                                        <FormLabel htmlFor="email">Email</FormLabel>
                                        <Input id="email" type="email" placeholder={user.email} />
                                    </div>
                                    <div className="space-y-2">
                                        <FormLabel htmlFor="phone">Phone Number</FormLabel>
                                        <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                                    </div>
                                    <Button>Save Changes</Button>
                                </form>
                            </CardBody>
                        </Card>
                        <Card className="bg-white border border-gray-200">
                            <CardHeader>
                                <Text>Company Information</Text>
                                <Text>Your role and company details</Text>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <FormLabel>Company</FormLabel>
                                        <p className="text-sm font-medium">{user.orgName}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <FormLabel>Role</FormLabel>
                                        <p className="text-sm font-medium">Senior Developer</p>
                                    </div>
                                    <div className="space-y-2">
                                        <FormLabel>Department</FormLabel>
                                        <p className="text-sm font-medium">Engineering</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                    <h2 className="text-xl font-semibold mb-4">Team Members</h2>
                    <Card className="bg-white border border-gray-200">
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>Name</Th>
                                    <Th>Role</Th>
                                    <Th>Email</Th>
                                    <Th className="text-right">Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {teamMembers.map((member) => (
                                    <Tr key={member.email}>
                                        <Td className="font-medium">{member.name}</Td>
                                        <Td>{member.role}</Td>
                                        <Td>{member.email}</Td>
                                        <Td className="text-right">
                                            <Button variant="ghost" size="sm">
                                                View
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Card>
                </main>
            </div>
        </div>
    );
};

export default AccountPage;
