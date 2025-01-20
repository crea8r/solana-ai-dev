import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { logMessages } from '../utils/aiLog';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const generateAIResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { messages, model, _apiKey, _schema } = req.body;
  const _schema_name = 'function_logic_schema';

  console.log('messages', messages);
  console.log('model', model);
  console.log('_apiKey', _apiKey);
  console.log('_schema', _schema);

  if (!_apiKey) {
    console.error('No API key provided in the API call');
    return next(new AppError('No API key provided', 400));
  }

  if (model !== 'gpt-4o') {
    console.error(`Unsupported model: ${model}`);
    return next(new AppError('Unsupported model', 400));
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    console.error('Invalid messages format');
    return next(new AppError('Invalid messages format', 400));
  }

  const transformMessages = messages.map((message) => ({
    role: 'user',
    content: message,
  }));

  const requestBody = {
    model: 'gpt-4o',
    messages: transformMessages,
    max_tokens: 3000,
    temperature: 0.2,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: _schema_name,
        strict: true,
        schema: _schema,
      },
    },
  };

  try {
    console.log('Calling OpenAI with:', { model, apiKey: _apiKey, requestBody });

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${_apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return next(new AppError(`AI API error: ${errorData.error || response.statusText}`, response.status));
    }

    const data = await response.json();
    await logMessages(messages, data);

    const responseData = data.choices[0].message.content;
    console.log('OpenAI response:', responseData);

    res.status(200).json({
      message: 'AI response generated successfully',
      data: responseData,
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

  if (!message || model !== 'gpt-4o') {
    return next(new AppError('Invalid input or unsupported model', 400));
  }

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
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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
      return next(new AppError(`AI API error: ${errorData.error?.message || response.statusText}`, response.status));
    }

    const data = await response.json();
    res.status(200).json({
      response: data.choices[0].message.content,
    });
  } catch (error) {
    console.error('Error generating AI chat response:', error);
    next(new AppError('Failed to generate AI chat response', 500));
  }
};
