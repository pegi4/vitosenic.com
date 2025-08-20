import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase';
import { chat, embeddings } from '@/utils/githubModels';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { load } from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';

// Number of relevant documents to retrieve
const RETRIEVE_K = 5;

// Load the prompt configuration
function loadPromptConfig() {
  try {
    const promptPath = join(process.cwd(), 'src', 'prompts', 'index.prompt.yml');
    const promptContent = readFileSync(promptPath, 'utf8');
    return load(promptContent) as any;
  } catch (error) {
    console.error('Error loading prompt config:', error);
    // Fallback to default prompt
    return {
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant for Vito Senič. Answer questions based on the provided context.'
        }
      ]
    };
  }
}

export async function POST(req: NextRequest) {
  try {
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

    // Initialize vector store with our embeddings
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabaseAdmin,
      tableName: 'documents',
      queryName: 'match_docs',
      filter: {} // Empty filter to match the function signature
    });

    // Search for relevant documents based on the user's query
    const vectorResults = await vectorStore.similaritySearch(
      latestMessage.content,
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

    // Load the prompt configuration
    const promptConfig = loadPromptConfig();
    
    // Get the system message from the prompt config
    const systemMessage = promptConfig.messages.find((msg: any) => msg.role === 'system');
    
    // Replace the {{text}} and {{QUESTION}} placeholders with the actual values
    let systemContent = systemMessage?.content || '';
    systemContent = systemContent.replace('{{text}}', context);
    systemContent = systemContent.replace('{{QUESTION}}', latestMessage.content);

    // Create messages array with the structured prompt
    const chatMessages = [
      { role: 'system', content: systemContent },
      ...messages.filter(m => m.role !== 'system')
    ];

    // Get response from GitHub Models
    const response = await chat.chat(chatMessages, {
      temperature: promptConfig.modelParameters?.temperature || 0.7,
      maxTokens: promptConfig.modelParameters?.max_completion_tokens || 600,
      top_p: promptConfig.modelParameters?.top_p || 0.9
    });

    // Return the response
    return new Response(JSON.stringify({ content: response }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
