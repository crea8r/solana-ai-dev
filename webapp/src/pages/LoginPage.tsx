import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Text,
  Button,
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input
 } from "@chakra-ui/react";
 import { ViewIcon, ViewOffIcon, ArrowBackIcon } from '@chakra-ui/icons';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState(''); // Changed from email to username
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password); // Use username instead of email
      navigate('/design');
    } catch (error) {
      console.error('Login failed:', error);
      // Handle error (e.g., show a toast notification)
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white border border-gray-200">
        <CardHeader className="space-y-1 relative">
          <Link to="/" className="absolute left-0 top-0 p-5">
            <ArrowBackIcon className="h-5 w-5 text-gray-600 hover:text-gray-800" />
          </Link>
          <CardHeader className="text-2xl font-bold text-center">Login</CardHeader>
          <Text className="text-center text-gray-500">
            Enter your details to login to your account
          </Text>
        </CardHeader>
        <CardBody>
          <FormControl onSubmit={handleSubmit} className="space-y-4">
            <Box className="space-y-2">
              <FormLabel htmlFor="username">Username</FormLabel>
              <Input 
                id="username" 
                type="text" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Box>
            <Box className="space-y-2">
              <FormLabel htmlFor="password">Password</FormLabel>
              <Box className="relative flex flex-row gap-2 items-center">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center border-none shadow-none bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <ViewOffIcon className="h-5 w-5" />
                  ) : (
                    <ViewIcon className="h-5 w-5" />
                  )}
                </Button>
              </Box>
            </Box>
            <Button type="submit" className="w-full px-4 py-2 text-white rounded inline-block text-center">
              Sign in
            </Button>
          </FormControl>
        </CardBody>
        <CardFooter className="flex flex-wrap items-center justify-between gap-2">
          <Text className="text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary underline underline-offset-4">Forgot password?</a>
          </Text>
          <Text className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to='/register' className="hover:text-primary underline underline-offset-4 ml-2">Sign up</Link>
          </Text>
        </CardFooter>
      </Card>
    </Box>
  );
};

export default LoginPage;
