import axios from 'axios';
import { createWallet, getWalletInfo } from '../api/wallet';
import { User } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL;

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  //withCredentials: true,
});

authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (
  username: string, 
  password: string,
  setUser: (user: User) => void
) => {
  try {
    const response = await authApi.post('/auth/login', { username, password });
    if (response.data.token && response.data.user) {
      localStorage.setItem('token', response.data.token);

      setUser({
        id: response.data.user.id,
        username: response.data.user.username,
        org_id: response.data.user.org_id,
        orgName: response.data.user.org_name,
        walletCreated: response.data.user.wallet_created,
        hasViewedWalletModal: response.data.user.private_key_viewed,
        walletPublicKey: response.data.user.wallet_public_key,
        walletPrivateKey: response.data.user.wallet_private_key,
      });
      
    } else console.error('No token or user data received in response');

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (
  organisation: string,
  username: string,
  password: string,
  code: string,
  openAiApiKey: string
): Promise<any> => {
  try {
    const response = await authApi.post('/auth/register', {
      organisation,
      username,
      password,
      code,
      openAiApiKey
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      console.log("token stored in localStorage", response.data.token)
    }

    if(response.data.user) {
      console.log("user created!", response.data.user.username)
      await createWallet();
    } else {
      console.error('No user data received in response');
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await authApi.post('/auth/logout');
    console.log(response.data.message);
    localStorage.removeItem('token');
  } catch (error: any) {
    console.error('Error during logout:', error.response?.data || error.message);
    throw error;
  }
};

export const getUser = async () => {
  try {
    const response = await authApi.get('/auth/user');
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export default authApi;
