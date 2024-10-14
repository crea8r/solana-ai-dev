import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { EyeIcon, EyeOffIcon, MoveLeft } from 'lucide-react'; // Import MoveLeft
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white border border-gray-200">
        <CardHeader className="space-y-1 relative">
          <Link to="/" className="absolute left-0 top-0 p-5">
            <MoveLeft className="h-5 w-5 text-gray-600 hover:text-gray-800" />
          </Link>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your username and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                type="text" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-tr from-[#ca3bf7] via-[#7292d3] to-[#2fd6b7] text-white hover:opacity-90 px-4 py-2 rounded inline-block text-center">
              Sign in
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary underline underline-offset-4">Forgot password?</a>
          </div>
          <div className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to='/register' className="hover:text-primary underline underline-offset-4">Sign up</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
