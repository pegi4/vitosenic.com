import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { Embeddings } from "@langchain/core/embeddings";
import { AsyncCaller } from "@langchain/core/utils/async_caller";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const token = process.env.TOKEN_GITHUB;
const endpoint = "https://models.github.ai/inference";

if (!token) {
  throw new Error("TOKEN_GITHUB environment variable is not set.");
}

// Model configurations
export const EMBEDDINGS = {
  name: "openai/text-embedding-3-small",
  maxTokens: 8192,
  type: "embedding" as const
} as const;

// Create the client
export const githubModelsClient = ModelClient(endpoint, new AzureKeyCredential(token));

// Raw embeddings function (for direct use)
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await githubModelsClient.path("/embeddings").post({
    body: {
      input: texts,
      model: EMBEDDINGS.name
    }
  });

  if (isUnexpected(response)) {
    throw new Error(`Embedding error: ${response.body.error?.message}`);
  }

  // Explicitly cast to ensure correct type
  return response.body.data.map(item => item.embedding as number[]);
}

// Chat completion function
export async function createChatCompletion(
  model: string,
  messages: Array<{ role: string; content: string }>,
  options?: {
    temperature?: number;
    maxTokens?: number;
    top_p?: number;
  }
): Promise<string> {
  console.log('model:', model);
  console.log('messages:', messages);
  console.log('options:', options);
  const response = await githubModelsClient.path("/chat/completions").post({
    body: {
      messages,
      model: model || "openai/gpt-4.1-mini",
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      top_p: options?.top_p
    }
  });

  if (isUnexpected(response)) {
    throw new Error(`Chat error: ${response.body.error?.message}`);
  }

  return response.body.choices[0]?.message?.content || "";
}

// LangChain-compatible embeddings class
export class GithubModelsEmbeddings implements Embeddings {
  caller: AsyncCaller = new AsyncCaller({});

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return await createEmbeddings(texts);
  }
  
  async embedQuery(text: string): Promise<number[]> {
    const result = await createEmbeddings([text]);
    return result[0];
  }
}

// Chat completion class for easy use
export class GithubModelsChat {
  async chat(
    model: string,
    messages: Array<{ role: string; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
      top_p?: number;
    }
  ): Promise<string> {
    return await createChatCompletion(model, messages, options);
  }

  async chatWithSystem(
    model: string,
    systemPrompt: string,
    userMessage: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ];
    return await createChatCompletion(model, messages, options);
  }
}

// Export default instances for easy use
export const embeddings = new GithubModelsEmbeddings();
export const chat = new GithubModelsChat();
