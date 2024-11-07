import { api } from '../utils/apiHelper';

export const promptAI = async (text: string) => {
  const body = { messages: [text] };
  const resp = await api.post('/ai/prompt', body);
  return resp.data?.data?.choices;
};

export const chatAI = async (
  text: string, 
  fileContexts: { path: string; content: string }[], 
  model: string
) => {
  const body = { 
    message: text,
    fileContext: fileContexts,
    model,
  };

  try {
    const resp = await api.post('/ai/chat', body);
    return resp.data?.response || 'AI did not return a valid response.';
  } catch (error) {
    console.error('Error in chatAI function:', error);
    return 'Error occurred while trying to get a response from AI.';
  }
};