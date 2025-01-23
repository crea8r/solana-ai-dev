import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getUser,
} from '../services/authApi';

export interface User {
  id: string;
  username: string;
  org_id: string;
  orgName: string;
  walletCreated: boolean;
  hasViewedWalletModal?: boolean;
  walletPublicKey?: string;
  walletPrivateKey?: string;
  openAiApiKey?: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    username: string;
    openAiApiKey: string;
  };
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (username: string, password: string) => Promise<void>;
  register: (
    orgName: string,
    username: string,
    password: string,
    code: string,
    openAiApiKey: string
  ) => Promise<RegisterResponse>;
  logout: () => void;
  firstLoginAfterRegistration: boolean;
  markWalletModalViewed: () => void;
  updateApiKey: (newApiKey: string) => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [firstLoginAfterRegistration, setFirstLoginAfterRegistration] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (token) {
          //console.log("token", token);
          const fetchedUser = await getUser(); 
          setUser({
            id: fetchedUser.id,
            username: fetchedUser.username,
            org_id: fetchedUser.org_id,
            orgName: fetchedUser.orgName,
            walletCreated: fetchedUser.walletCreated,
            hasViewedWalletModal: fetchedUser.hasViewedWalletModal,
            walletPublicKey: fetchedUser.walletPublicKey,
            walletPrivateKey: fetchedUser.walletPrivateKey,
            openAiApiKey: fetchedUser.openAiApiKey,
          });
          setFirstLoginAfterRegistration(
            fetchedUser.walletCreated && !fetchedUser.hasViewedWalletModal
          );
          //console.log('User:', fetchedUser);
        } else {
          console.log("no token");
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch authenticated user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const markWalletModalViewed = () => {
    setFirstLoginAfterRegistration(false);
    if (user) {
      const updatedUser = { ...user, hasViewedWalletModal: true };
      setUser(updatedUser);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await apiLogin(username, password, setUser);
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        setFirstLoginAfterRegistration(!response.user.walletCreated);
      } else throw new Error('Invalid login response');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (
    orgName: string,
    username: string,
    password: string,
    code: string,
    openAiApiKey: string
  ): Promise<RegisterResponse> => {
    try {
      const response: RegisterResponse = await apiRegister(orgName, username, password, code, openAiApiKey);
      setFirstLoginAfterRegistration(true);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    setFirstLoginAfterRegistration(false);
  };

  const updateApiKey = async (newApiKey: string) => {
    if (!user) {
      console.error("No user is logged in");
      return;
    }

    try {
      const response = await fetch('/api/update-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: user.id,
          apiKey: newApiKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update API key');
      }

      const updatedUser = { ...user, openAiApiKey: newApiKey };
      setUser(updatedUser);
      console.log('API key updated successfully');
    } catch (error) {
      console.error('Error updating API key:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        firstLoginAfterRegistration,
        markWalletModalViewed,
        updateApiKey,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within a AuthProvider');
  }
  return context;
};
