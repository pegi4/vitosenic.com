import { PromptConfig } from '@/types/prompt';

export const queryRewriterPrompt: PromptConfig = {
  model: 'openai/gpt-4o-mini',
  modelParameters: {
    max_completion_tokens: 200,
    temperature: 0.2,
    top_p: 0.9
  },
  responseFormat: 'text',
  messages: [
    {
      role: 'system',
      content: `You are a query rewriter for a personal website chatbot. Your job is to take simple or vague user queries and expand them into more specific, detailed queries that will help retrieve relevant context from a vector database.\nRules: - Maintain the original intent of the query - Add specific terms related to CV, projects, skills, or educational background when appropriate - For personal questions (like "who are you?"), rewrite to target specific professional or educational information - For project questions, expand with relevant technical terms that might be in the project descriptions - Don't make the query overly verbose - aim for 1-3 concise sentences - IMPORTANT: Return ONLY the rewritten query, with no explanations or additional text`
    },
    {
      role: 'user',
      content: `Original query: {{QUESTION}}\nChat history: {{HISTORY}}\nInstructions: - Rewrite the query to better retrieve relevant information from the website's content - For "who are you" questions, target professional background, education, and skills - For project questions, focus on technical aspects and achievements - For vague questions, make them more specific while preserving the intent - Return ONLY the rewritten query`
    }
  ]
};
