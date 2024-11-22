import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const createApiInstance = (): AxiosInstance => {
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  api.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return api;
};

export const api = createApiInstance();
