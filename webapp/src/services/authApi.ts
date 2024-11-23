import axios from 'axios';
import { createWallet } from '../api/wallet';

const API_URL = process.env.REACT_APP_API_URL;

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const login = async (username: string, password: string) => {
  try {
    const response = await authApi.post('/auth/login', { username, password });
    if (response.data.token) {
      console.log('Token cookie set:', response.data.token);
    } else {
      console.error('No token received in response');
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (
  organisation: string,
  username: string,
  password: string
) => {
  try {
    const response = await authApi.post('/auth/register', {
      organisation,
      username,
      password,
    });

    sessionStorage.setItem('token', response.data.token);
    await createWallet(response.data.user.id);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('projectContext');
    sessionStorage.removeItem('chatMessages');
    sessionStorage.removeItem('terminalLogs');
    sessionStorage.removeItem('selectedFilePath');
    const response = await authApi.post('/auth/logout');
    console.log(response.data.message);
  } catch (error: any) {
    console.error('Error during logout:', error.response?.data || error.message);
    throw error;
  }
};

export default authApi;
