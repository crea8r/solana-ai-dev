import React, { createContext, useState, useEffect } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from '../services/authApi';

interface User {
  id: string;
  username: string;
  org_id: string;
  orgName: string;
  walletCreated: boolean;
  hasViewedWalletModal?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    orgName: string,
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  firstLoginAfterRegistration: boolean;
  markWalletModalViewed: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [firstLoginAfterRegistration, setFirstLoginAfterRegistration] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // You might want to add a verification step here to check if the token is still valid
      // For now, we'll assume if there's a token, the user is logged in
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        setFirstLoginAfterRegistration(parsedUser.walletCreated && !parsedUser.hasViewedWalletModal);
      }
    }
  }, []);

  const markWalletModalViewed = () => {
    setFirstLoginAfterRegistration(false);
    if (user) {
      const updatedUser = { ...user, hasViewedWalletModal: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await apiLogin(username, password);
      setUser(response.user);
      setFirstLoginAfterRegistration(!response.user.walletCreated);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (
    orgName: string,
    username: string,
    password: string
  ) => {
    try {
      await apiRegister(orgName, username, password);
      setFirstLoginAfterRegistration(true);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setFirstLoginAfterRegistration(false);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        firstLoginAfterRegistration,
        markWalletModalViewed,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
