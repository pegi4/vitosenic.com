import { load } from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PromptConfig } from '@/types/prompt';

// Load the prompt configuration
export function loadPromptConfig(customPath?: string): PromptConfig {
  try {
    const promptPath = customPath || join(process.cwd(), 'src', 'prompts', 'main.prompt.yaml');
    const promptContent = readFileSync(promptPath, 'utf8');
    return load(promptContent) as PromptConfig;
  } catch (error) {
    console.error('Error loading prompt config:', error);
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