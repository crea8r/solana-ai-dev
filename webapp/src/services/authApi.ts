import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (username: string, password: string) => {
  try {
    const response = await authApi.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      console.log('Token set:', localStorage.getItem('token'));
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
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

export default authApi;
