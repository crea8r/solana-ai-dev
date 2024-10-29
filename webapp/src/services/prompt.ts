import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://172.30.185.216:9999';

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const promptAI = async (text: string) => {
  const body = { messages: [text] };
  const resp = await authApi.post('/ai/prompt', body);
  return resp.data?.data?.choices;
};

export const chatAI = async (text: string, fileContexts: { path: string; content: string }[] = []) => {
  const body = { 
    messages: [{ content: text }],
    fileContexts: fileContexts.length > 0 ? fileContexts : null,
  };

  try {
    const resp = await authApi.post('/ai/chat', body);
    return resp.data?.response || 'AI did not return a valid response.';
  } catch (error) {
    console.error('Error in chatAI function:', error);
    return 'Error occurred while trying to get a response from AI.';
  }
};