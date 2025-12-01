import { NextRequest } from 'next/server';
import { logChatInteraction, pgPool } from '@/utils/database';
import { chat, embeddings } from '@/utils/githubModels';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { mainPrompt, queryRewriterPrompt } from '@/prompts';
import { PromptMessage } from '@/types/prompt';
import { RateLimiter } from '@/lib/rate-limit';

// Number of relevant documents to retrieve
const RETRIEVE_K = 5;

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

    // Format chat history for the query rewriter
    const historyMessages = messages
      .filter((m, index) => index !== messages.length - 1) // Exclude the latest message which we're currently processing
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    // Rewrite the query for better context retrieval
    const queryRewriterConfig = queryRewriterPrompt();
    const rewriterSystemMessage = queryRewriterConfig.messages.find((msg: PromptMessage) => msg.role === 'system');
    const rewriterUserMessage = queryRewriterConfig.messages.find((msg: PromptMessage) => msg.role === 'user');
    
    // Format the rewriter prompt
    let rewriterContent = rewriterUserMessage?.content || '';
    rewriterContent = rewriterContent.replace('{{QUESTION}}', latestMessage.content);
    rewriterContent = rewriterContent.replace('{{HISTORY}}', historyMessages);
    
    // Create messages for the query rewriter
    const rewriterMessages = [
      { role: 'system', content: rewriterSystemMessage?.content || '' },
      { role: 'user', content: rewriterContent }
    ];
    
    // Get the rewritten query
    const rewrittenQuery = await chat.chat(queryRewriterConfig.model, rewriterMessages, {
      temperature: queryRewriterConfig.modelParameters?.temperature || 0.2,
      maxTokens: queryRewriterConfig.modelParameters?.max_completion_tokens || 200,
      top_p: queryRewriterConfig.modelParameters?.top_p || 0.9
    });
    
    console.log('Original query:', latestMessage.content);
    console.log('Rewritten query:', rewrittenQuery);
    
    // Initialize vector store with our embeddings
    const vectorStore = await PGVectorStore.initialize(embeddings, {
      pool: pgPool,
      tableName: 'documents',
      columns: {
        idColumnName: 'id',
        vectorColumnName: 'embedding',
        contentColumnName: 'content',
        metadataColumnName: 'metadata',
      },
      distanceStrategy: "cosine",
    });

    // Search for relevant documents based on the rewritten query
    const vectorResults = await vectorStore.similaritySearch(
      rewrittenQuery, // Use the rewritten query instead of the original
      RETRIEVE_K
    );

    // Format the context from retrieved documents
    const context = vectorResults
      .map(doc => {
        const metadata = doc.metadata;
        return `[Content type: ${metadata.type || 'Content'}, url: ${metadata.url || '#'}]\n${doc.pageContent}`;
      })
      .join('\n\n');

    console.log('getting CONTEXT:', context);

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
