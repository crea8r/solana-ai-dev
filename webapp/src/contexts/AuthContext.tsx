import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
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
}

interface RegisterResponse {
  user: {
    id: string;
    username: string;
  };
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (username: string, password: string) => Promise<void>;
  register: (
    orgName: string,
    username: string,
    password: string
  ) => Promise<RegisterResponse>;
  logout: () => void;
  firstLoginAfterRegistration: boolean;
  markWalletModalViewed: () => void;
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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/user`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser({
            id: data.user.id,
            username: data.user.username,
            org_id: data.user.org_id,
            orgName: data.user.org_name,
            walletCreated: data.user.wallet_created,
            hasViewedWalletModal: data.user.private_key_viewed,
            walletPublicKey: data.user.wallet_public_key,
            walletPrivateKey: data.user.wallet_private_key,
          });
          setFirstLoginAfterRegistration(
            data.user.walletCreated && !data.user.hasViewedWalletModal
          );
          console.log('User:', data.user);
        } else {
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
      setUser(response.user);
      setFirstLoginAfterRegistration(!response.user.walletCreated);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (
    orgName: string,
    username: string,
    password: string
  ): Promise<RegisterResponse> => {
    try {
      const response: RegisterResponse = await apiRegister(orgName, username, password);
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
