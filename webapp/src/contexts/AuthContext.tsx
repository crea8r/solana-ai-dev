import React, { createContext, useState, useEffect, useContext } from 'react';
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
          setUser(data.user);
          setFirstLoginAfterRegistration(
            data.user.walletCreated && !data.user.hasViewedWalletModal
          );
          console.log('User:', data.user);
        } else {
          setUser(null); // Clear user if not authenticated
        }
      } catch (error) {
        console.error('Failed to fetch authenticated user:', error);
        setUser(null);
      } finally {
        setLoading(false); // Ensure loading state is updated
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
      const response = await apiLogin(username, password);
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
  ) => {
    try {
      await apiRegister(orgName, username, password);
      setFirstLoginAfterRegistration(true);
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
