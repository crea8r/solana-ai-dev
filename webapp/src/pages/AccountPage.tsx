import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Bell, ChevronDown, LogOut, Menu, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const AccountPage: React.FC = () => {
    const authContext = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Placeholder user data
    const placeholderUser = {
        username: 'exampleUser',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        orgName: 'Example Organization',
    };

    // Use user data from context if available, otherwise use placeholder
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
            {/* Sidebar for larger screens */}
            <aside className="hidden w-64 bg-white border-r lg:block">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">Organization Name</h2>
                </div>
                <nav className="p-4">
                    <ul className="space-y-2">
                        <li>
                            <a href="#" className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                                <User className="w-5 h-5 mr-3" />
                                Account
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                                <Settings className="w-5 h-5 mr-3" />
                                Settings
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Mobile sidebar */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetContent side="left">
                    <SheetHeader>
                        <SheetTitle>Company Name</SheetTitle>
                        <SheetDescription>Navigation</SheetDescription>
                    </SheetHeader>
                    <nav className="py-4">
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100"
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <User className="w-5 h-5 mr-3" />
                                    Account
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100"
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <Settings className="w-5 h-5 mr-3" />
                                    Settings
                                </a>
                            </li>
                        </ul>
                    </nav>
                </SheetContent>
            </Sheet>

            {/* Main content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top navigation */}
                <header className="flex items-center justify-between px-4 py-3 bg-white border-b lg:px-6">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="w-6 h-6" />
                        <span className="sr-only">Open sidebar</span>
                    </Button>
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon">
                            <Bell className="w-5 h-5" />
                            <span className="sr-only">Notifications</span>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative w-8 h-8 rounded-full">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src="/placeholder-user.jpg" alt="User" />
                                        <AvatarFallback>JD</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <User className="w-4 h-4 mr-2" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="w-4 h-4 mr-2" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <LogOut className="w-4 h-4 mr-2" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <h1 className="text-2xl font-semibold mb-6">Account Details</h1>
                    <div className="grid gap-6 mb-6 md:grid-cols-2">
                        <Card className="bg-white border border-gray-200">
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Manage your personal details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input id="username" value={user.username} readOnly />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" placeholder={`${user.firstName} ${user.lastName}`} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" placeholder={user.email} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                                    </div>
                                    <Button>Save Changes</Button>
                                </form>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border border-gray-200">
                            <CardHeader>
                                <CardTitle>Company Information</CardTitle>
                                <CardDescription>Your role and company details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Company</Label>
                                        <p className="text-sm font-medium">{user.orgName}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <p className="text-sm font-medium">Senior Developer</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Department</Label>
                                        <p className="text-sm font-medium">Engineering</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <h2 className="text-xl font-semibold mb-4">Team Members</h2>
                    <Card className="bg-white border border-gray-200">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teamMembers.map((member) => (
                                    <TableRow key={member.email}>
                                        <TableCell className="font-medium">{member.name}</TableCell>
                                        <TableCell>{member.role}</TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </main>
            </div>
        </div>
    );
};

export default AccountPage;