import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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


const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState(''); // Changed from email to username
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    //console.log('Registration attempt with:', { username, password });
    navigate('/design');
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white border border-gray-200">
        <CardHeader className="space-y-1 relative">
          <Link to="/" className="absolute left-0 top-0 p-5">
            <ArrowBackIcon className="h-5 w-5 text-gray-600 hover:text-gray-800" />
          </Link>
          <CardHeader className="text-2xl font-bold text-center">Create an account</CardHeader>
          <Text className="text-center">
            Enter your details to create an account
          </Text>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Box className="relative flex flex-row items-center gap-2">
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <ViewOffIcon className="h-5 w-5" />
                  ) : (
                    <ViewIcon className="h-5 w-5" />
                  )}
                </Button>
              </Box>
            </Box>
            <Box className="space-y-2">
              <FormLabel htmlFor="confirm-password">Confirm Password</FormLabel>
              <Input 
                id="confirm-password" 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Box>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full px-4 py-2 text-white rounded inline-block text-center">
              Create account
            </Button>

          </form>
        </CardBody>
        <CardFooter>
          <Text className="text-sm text-center text-muted-foreground w-full">
            Already have an account?{' '}
            <Link to='/login' className="hover:text-primary underline underline-offset-4">Sign in</Link>
          </Text>
        </CardFooter>
      </Card>
    </Box>
  );
};

export default RegisterPage;
