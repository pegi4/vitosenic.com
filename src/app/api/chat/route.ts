import { NextRequest } from 'next/server';
import { logChatInteraction } from '@/utils/database';
import { mainPrompt } from '@/prompts';
import { RateLimiter } from '@/lib/rate-limit';
import { loadAllContent } from '@/utils/content';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import type { ModelMessage } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Google provider with custom API key from GOOGLE_AI_STUDIO_GEMINI
const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_STUDIO_GEMINI || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Helper function to extract IP address from request
function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for') || 
         req.headers.get('x-real-ip') || 
         req.headers.get('cf-connecting-ip') ||
         'unknown';
}

// Generate a unique user fingerprint
function generateUserFingerprint(req: NextRequest): string {
  const ip = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return `${ip}:${userAgent}`;
}

// Get last N messages from conversation history (excluding system messages)
function getLastMessages(messages: Array<{ role: string; content: string }>, count: number = 10): Array<{ role: string; content: string }> {
  // Filter out system messages and get last N messages
  const nonSystemMessages = messages.filter(m => m.role !== 'system');
  return nonSystemMessages.slice(-count);
}

export async function POST(req: NextRequest) {
  try {
    // Extract user fingerprint for logging
    const fingerprint = generateUserFingerprint(req);
    
    // Check rate limit first
    const rateLimitResult = await RateLimiter.checkLimit(req);
    if (!rateLimitResult.success) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded',
        message: rateLimitResult.message,
        resetTime: rateLimitResult.resetTime
      }), {
        status: 429, // Too Many Requests
        headers: { 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
        }
      });
    }

    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract the latest user message
    const latestMessage = messages.filter(m => m.role === 'user').pop();
    if (!latestMessage) {
      return new Response(JSON.stringify({ error: 'No user message found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('latestMessage:', latestMessage);

    // Load all formatted content (using Gemini's 1M context window)
    const context = loadAllContent();

    // Load the main prompt configuration
    const promptConfig = mainPrompt();
    
    // Get the system message from the prompt config
    const systemMessage = promptConfig.messages.find((msg) => msg.role === 'system');
    
    // Get last 10 messages from conversation history (excluding system)
    const conversationHistory = getLastMessages(messages, 10);
    
    // Build messages array for Gemini with full conversation history
    // Include all previous messages to maintain context
    const geminiMessages: ModelMessage[] = conversationHistory.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    // Add the latest user message - context is provided in system message, so we don't need to repeat it
    // This allows the model to focus on the conversation flow
    const contextUserMessage = `Current question: ${latestMessage.content}\n\nRemember to use the provided context about Vito Senič to answer. Maintain conversation continuity with previous messages.`;

    // Build the system message with context included
    const systemMessageWithContext = `${systemMessage?.content || ''}\n\n--- AVAILABLE CONTEXT ---\n${context}\n\n--- IMPORTANT REMINDERS ---\n- Always respond in English, regardless of the user's language.\n- Use the conversation history to provide context-aware responses.\n- Be clear, thoughtful, and complete in your answers.`;
    
    // Generate response using Gemini
    const result = await generateText({
      model: googleProvider(promptConfig.model),
      system: systemMessageWithContext,
      messages: [
        ...geminiMessages,
        {
          role: 'user',
          content: latestMessage.content
        }
      ],
      temperature: promptConfig.modelParameters?.temperature || 0.5,
      maxOutputTokens: promptConfig.modelParameters?.max_completion_tokens || 1000,
      topP: promptConfig.modelParameters?.top_p || 0.9,
    });

    const response = result.text;

    // Log the chat interaction with fingerprint instead of just IP
    await logChatInteraction(
      fingerprint,
      latestMessage.content,
      response
    );

    // Return the response with rate limit headers
    return new Response(JSON.stringify({ content: response }), {
      headers: { 
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
      }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
