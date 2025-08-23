import { PromptConfig } from "@/types/prompt";
import { mainPrompt as mainPromptConfig } from "./main.prompt";
import { queryRewriterPrompt as queryRewriterPromptConfig } from "./query_rewriter.prompt";

// Export individual prompt configs
export const mainPrompt = (): PromptConfig => mainPromptConfig;
export const queryRewriterPrompt = (): PromptConfig => queryRewriterPromptConfig;

// Export a general loader function for future prompts
export const loadPromptConfig = (filename?: string): PromptConfig => {
  if (filename) {
    // For future prompts, you can add more imports here
    throw new Error(`Prompt config for ${filename} not implemented yet`);
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
