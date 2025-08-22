import { load } from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PromptConfig } from '@/types/prompt';

// Base function to load any prompt config
function loadPrompt(filename: string): PromptConfig {
  try {
    const promptPath = join(process.cwd(), 'src', 'prompts', filename);
    const promptContent = readFileSync(promptPath, 'utf8');
    return load(promptContent) as PromptConfig;
  } catch (error) {
    console.error(`Error loading prompt config ${filename}:`, error);
    return {
      model: 'openai/gpt-4.1-mini',
      responseFormat: 'text',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant for Vito Senič. Answer questions based on the provided context.'
        }
      ]
    };
  }
}

// Export individual prompt configs
export const mainPrompt = () => loadPrompt('main.prompt.yaml');
export const queryRewriterPrompt = () => loadPrompt('query_rewriter.prompt.yml');

// Export a general loader function for future prompts
export const loadPromptConfig = (filename?: string): PromptConfig => {
  if (filename) {
    return loadPrompt(filename);
  }
  return mainPrompt();
};

// Export all available prompts as an object for easy reference
export const prompts = {
  main: mainPrompt,
  queryRewriter: queryRewriterPrompt,
} as const;

// Type for available prompt keys
export type PromptKey = keyof typeof prompts;
