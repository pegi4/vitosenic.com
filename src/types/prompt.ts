export interface PromptMessage {
    role: string;
    content: string;
  }
  
  export interface PromptConfig {
    model: string;
    responseFormat: string;
    messages: PromptMessage[];
    modelParameters?: {
      temperature?: number;
      max_completion_tokens?: number;
      top_p?: number;
    };
  }