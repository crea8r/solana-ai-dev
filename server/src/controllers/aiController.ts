import { Request, Response, NextFunction } from 'express';
import { AppError } from 'src/middleware/errorHandler';
import { logMessages } from 'src/utils/aiLog';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://codestral.mistral.ai/v1/chat/completions';

export const generateAIResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return next(new AppError('Invalid messages format', 400));
  }

  if (!MISTRAL_API_KEY) {
    return next(new AppError('Mistral API key is not configured', 500));
  }
  console.log('MISTRAL_API_KEY: ', MISTRAL_API_KEY);
  const transformMessages = messages.map((message) => ({
    role: 'user',
    content: message,
  }));
  try {
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
        messages: transformMessages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AppError(
        `AI API error: ${errorData.error || response.statusText}`,
        response.status
      );
    }
    const data = await response.json();
    await logMessages(messages, data);

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
