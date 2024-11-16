import { Request, Response, NextFunction, response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { logMessages } from '../utils/aiLog';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://codestral.mistral.ai/v1/chat/completions';
let OPENAI_API_KEY = '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const generateAIResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { messages, model, _apiKey, _schema, _promptType } = req.body;
  OPENAI_API_KEY = _apiKey;
  console.log('OPENAI_API_KEY:', OPENAI_API_KEY);

  // preliminary checks
  if (!Array.isArray(messages) || messages.length === 0) return next(new AppError('Invalid messages format', 400));
  if (!model) return next(new AppError('Model is not provided', 400));
  if (!MISTRAL_API_KEY && model === 'Codestral') return next(new AppError('Mistral API key is not configured', 500));
  if (!OPENAI_API_KEY && model === 'GPT-4o') return next(new AppError('OpenAI API key is not configured', 500));

  const transformMessages = messages.map((message) => ({
    role: 'user',
    content: message,
  }));

  let apiKey, apiUrl, requestBody;

  switch (model) {
    case 'codestral-latest':
      apiKey = MISTRAL_API_KEY;
      apiUrl = MISTRAL_API_URL;
      requestBody = {
        model: 'codestral-latest',
        temperature: 0.2,
        messages: transformMessages,
        response_format: {
          type: 'json_object',
        },
      };
      break;
    case 'gpt-4o':
      apiKey = OPENAI_API_KEY;
      apiUrl = OPENAI_API_URL;
      requestBody = {
        model: 'gpt-4o',
        messages: transformMessages,
        max_tokens: 3000,
        temperature: 0.2,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: `${_promptType}_schema`,
            strict: true,
            schema: _schema,
          },
        }
      };
      break;
    default:
      return next(new AppError(`Model ${model} is not supported`, 400));
  }

  //console.log('apiKey', apiKey);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error details:', JSON.stringify(errorData, null, 2));
      throw new AppError(`AI API error: ${JSON.stringify(errorData, null, 2)}`, response.status);
    }
    const data = await response.json();
    await logMessages(messages, data);

    //console.log('data', JSON.stringify(data.choices[0].message, null, 2));

    res.status(200).json({
      message: 'AI response generated successfully',
      data: data,
    });

  } catch (error) {
    console.error('Error generating AI response:', error);
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Failed to generate AI response', 500));
    }
  }
};

export const handleAIChat = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message, fileContext, model } = req.body;

  let messageContent = `User's question:\n"${message}"\n\nPlease respond with markdown formatting. For code snippets, use triple backticks (\`\`\`) for block code and single backticks (\`) for inline code.`;

  if (fileContext && Array.isArray(fileContext) && fileContext.length > 0) {
    fileContext.forEach((file, index) => {
      messageContent += `\n\nFile #${index + 1}: ${file.path || 'Unknown path'}\nFile Content:\n${file.content || 'No content provided'}`;
    });
  } else {
    messageContent += '\n\nNo specific file context provided.';
  }

  const chatMessages = [
    {
      role: 'user',
      content: messageContent,
    },
  ];

  try {
    if (model === 'GPT-4o') {
      if (!OPENAI_API_KEY) {
        return next(new AppError('OpenAI API key is not configured', 500));
      }

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: chatMessages,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API Error:', errorData);
        throw new AppError(`OpenAI API error: ${errorData.error?.message || response.statusText}`, response.status);
      }

      const data = await response.json();
      res.status(200).json({
        response: data.choices[0].message.content,
      });

    } else if (model === 'Codestral') {
      if (!MISTRAL_API_KEY) {
        return next(new AppError('Mistral API key is not configured', 500));
      }

      const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'codestral-latest',
          temperature: 0.2,
          messages: chatMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Mistral API Error:', errorData);
        throw new AppError(`Mistral API error: ${errorData.error || response.statusText}`, response.status);
      }

      const data = await response.json();
      res.status(200).json({
        response: data.choices[0].message.content,
      });
    } else {
      throw new AppError(`Model ${model} is not supported`, 400);
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    next(new AppError('Failed to generate AI chat response', 500));
  }
};
