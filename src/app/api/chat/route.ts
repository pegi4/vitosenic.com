import { NextRequest } from 'next/server';
import { logChatInteraction } from '@/utils/database';
import { chat } from '@/utils/githubModels';
import { mainPrompt } from '@/prompts';
import { PromptMessage } from '@/types/prompt';
import { RateLimiter } from '@/lib/rate-limit';
import { loadAllContent } from '@/utils/content';

// Helper function to extract IP address from request
function getClientIP(req: NextRequest): string {
  // Use the same approach as the rate limiter
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
    const systemMessage = promptConfig.messages.find((msg: PromptMessage) => msg.role === 'system');
    const userMessage = promptConfig.messages.find((msg: PromptMessage) => msg.role === 'user');
    
    // Replace the {{text}} and {{QUESTION}} placeholders with the actual values
    let userContent = userMessage?.content || '';
    userContent = userContent.replace('{{text}}', context);
    userContent = userContent.replace('{{QUESTION}}', latestMessage.content); // Keep the original query for the final response

    // Create messages array with the structured prompt
    const chatMessages = [
      { role: 'system', content: systemMessage?.content || '' },
      { role: 'user', content: userContent },
      ...messages.filter(m => m.role !== 'system')
    ];

    // Get response from GitHub Models
    const response = await chat.chat(promptConfig.model, chatMessages, {
      temperature: promptConfig.modelParameters?.temperature || 0.7,
      maxTokens: promptConfig.modelParameters?.max_completion_tokens || 600,
      top_p: promptConfig.modelParameters?.top_p || 0.9
    });

    // Log the chat interaction with fingerprint instead of just IP
    await logChatInteraction(
      fingerprint, // Use fingerprint instead of just IP
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
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
