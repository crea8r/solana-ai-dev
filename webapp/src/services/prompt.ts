import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://172.30.185.216:9999';

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

const promptAI = async (text: string) => {
  const body = { messages: [text] };
  const resp = await authApi.post('/ai/prompt', body);
  return resp.data?.data?.choices;
};

export default promptAI;
