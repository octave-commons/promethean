import { ollamaEmbed } from '@promethean/utils';

export async function getPromptEmbedding(prompt: string, modelName: string): Promise<number[]> {
  try {
    return await ollamaEmbed(modelName, prompt);
  } catch (error) {
    console.warn('Failed to generate embedding for prompt caching:', error);
    throw error;
  }
}
