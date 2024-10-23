import { Request, Response, NextFunction } from 'express';
import { AppError } from 'src/middleware/errorHandler';
import { logMessages } from 'src/utils/aiLog';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://codestral.mistral.ai/v1/chat/completions';

const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN;
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/bigcode/starcoder';

const queryHuggingFace = async (data: any) => {
  try {
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error calling Hugging Face API:', error.message);
    } else {
      console.error('Error calling Hugging Face API:', error);
    }
    throw error;
  }
};

export const generateAIResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return next(new AppError('Invalid messages format', 400));
  }

  const transformMessages = messages.map((message) => ({
    role: 'user',
    content: message,
  }));

  try {
    // Attempt Mistral API first
    if (!MISTRAL_API_KEY) {
      throw new AppError('Mistral API key is not configured', 500);
    }

    console.log('MISTRAL_API_KEY: ', MISTRAL_API_KEY);
    const mistralResponse = await fetch(MISTRAL_API_URL, {
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

    if (!mistralResponse.ok) {
      let errorData: any;
      try {
        errorData = await mistralResponse.json();
      } catch (jsonError) {
        errorData = { error: mistralResponse.statusText };
      }
      throw new AppError(
        `Mistral API error: ${errorData.error || mistralResponse.statusText}`,
        mistralResponse.status
      );
    }

    const data = await mistralResponse.json();
    await logMessages(messages, data);

    // Send successful response using Mistral
    return res.status(200).json({
      message: 'AI response generated successfully (Mistral)',
      data: data,
    });
  } catch (mistralError) {
    if (mistralError instanceof Error) {
      console.error('Mistral API failed. Switching to backup:', mistralError.message);
    } else {
      console.error('Mistral API failed. Switching to backup:', mistralError);
    }

    // Fallback: Try Hugging Face API
    try {
      const inputText = messages.map((message) => message.content).join('\n'); // Combine messages

      const hfResponse = await queryHuggingFace({
        inputs: inputText,  // Sending the inputs to Hugging Face API
      });

      await logMessages(messages, hfResponse);

      // Send successful response using Hugging Face
      return res.status(200).json({
        message: 'AI response generated successfully (Hugging Face)',
        data: hfResponse,
      });
    } catch (huggingfaceError) {
      if (huggingfaceError instanceof Error) {
        console.error('Both APIs failed:', huggingfaceError.message);
      } else {
        console.error('Both APIs failed:', huggingfaceError);
      }

      // If both APIs fail, return an error
      next(new AppError('Failed to generate AI response from both Mistral and Hugging Face', 500));
    }
  }
};
