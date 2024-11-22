import { Request, Response, NextFunction, response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { logMessages } from '../utils/aiLog';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
let OPENAI_API_KEY = '';
let ANTHROPIC_API_KEY = '';

const MISTRAL_API_URL = 'https://codestral.mistral.ai/v1/chat/completions';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export const generateAIResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { messages, model, _apiKey, _schema, _promptType } = req.body;

  if (model === 'gpt-4o') OPENAI_API_KEY = _apiKey;
  if (model === 'claude-3.5-sonnet') ANTHROPIC_API_KEY = _apiKey;

  if (model === 'gpt-4o') {
    console.log('model:', model);
    console.log('apiKey:', _apiKey);
  } else if (model === 'codestral-latest') {
    console.log('model:', model);
    console.log('apiKey:', MISTRAL_API_KEY);
  } else if (model === 'claude-3.5-sonnet') {
    console.log('model:', model);
    console.log('apiKey:', ANTHROPIC_API_KEY);
  }

  // preliminary checks
  if (!Array.isArray(messages) || messages.length === 0) return next(new AppError('Invalid messages format', 400));
  if (!model) return next(new AppError('Model is not provided', 400));
  if (!MISTRAL_API_KEY && model === 'Codestral' ||
      !OPENAI_API_KEY && model === 'gpt-4o' ||
      !ANTHROPIC_API_KEY && model === 'claude-3.5-sonnet') return next(new AppError('API key is not configured', 500));

  const transformMessages = messages.map((message) => ({ role: 'user', content: message, }));
  let apiKey, apiUrl, requestBody;
  const systemPrompt = 'You are a very experienced blockchain developer on the Solana network. Specialised in Rust and typescript, and Solana best security practices.';

  try {
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
      case 'claude-3.5-sonnet':
        apiKey = ANTHROPIC_API_KEY;
        apiUrl = ANTHROPIC_API_URL;
        requestBody = {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 3000,
          temperature: 0.2,
          system: systemPrompt,
          messages: transformMessages.map((message) => ({
            role: 'user',
            content: message.content, 
          })),
        };
        break;
    }
  } catch (error) {
    console.error('Error generating AI response:', JSON.stringify(error, null, 2));
    next(new AppError('Failed to generate AI response', 500));
  }

  if (!apiKey || !apiUrl) return next(new AppError('API key or URL is not configured', 500));
  try {
    let response;
    if (model === 'claude-3.5-sonnet') {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey, 
          'anthropic-version': '2023-06-01', 
        },
        body: JSON.stringify(requestBody),
      });
    } else {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new AppError(`AI API error: ${errorData.error || response.statusText}`, response.status);
    }

    let data = await response.json();
    await logMessages(messages, data);

    if (model === 'claude-3.5-sonnet') {
      data = data.content[0].text;
    } else {
      data = data.choices[0].message.content;
    }

    console.log('data', JSON.stringify(data, null, 2));

    res.status(200).json({
      message: 'AI response generated successfully',
      data: data,
    });
  } catch (error) {
    console.error('Error generating AI response:', error);
    next(new AppError('Failed to generate AI response', 500));
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
