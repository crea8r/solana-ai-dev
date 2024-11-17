import { api } from '../utils/apiHelper';

export const promptAI = async (text: string, model: string, apiKey: string, schema: any, promptType: string) => {
  console.log('model:', model);
  console.log('apiKey:',  apiKey);
  const body = { messages: [text], model, _apiKey: apiKey, _schema: schema, _promptType: promptType };
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