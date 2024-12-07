import { api } from '../utils/apiHelper';

export const promptAI = async (
  text: string, 
  model: string, 
  apiKey: string, 
  schema: any, 
  promptType: string
) => {
  console.log('promptAI called');
  console.log('model:', model);
  console.log('apiKey:',  apiKey);
  const body = { messages: [text], model, _apiKey: apiKey, _schema: schema, _promptType: promptType };
  const resp = await api.post('/ai/prompt', body);
  return resp.data?.data;
};

export const promptAI_v2 = async (
  text: string,
  model: string,
  apiKey: string,
  schema: any,
  promptType: string,
  maxRetries = 1,
  delay = 5000 
): Promise<any> => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log('promptAI called');
      console.log('model:', model);
      console.log('apiKey:', apiKey);

      const body = {
        messages: [text],
        model,
        _apiKey: apiKey,
        _schema: schema,
        _promptType: promptType,
      };

      const resp = await api.post('/ai/prompt', body);

      return resp.data?.data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay)); 
        delay *= 2; 
        retries++;
      } else {
        console.error('API call failed:', error);
        throw error;
      }
    }
  }

  throw new Error(`Failed to get AI response after ${maxRetries} retries.`);
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