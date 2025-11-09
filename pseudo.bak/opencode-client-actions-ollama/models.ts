// SPDX-License-Identifier: GPL-3.0-only
// Ollama model types and actions

import { OLLAMA_URL } from '@promethean/ollama-queue';
import { check } from './api.js';

export type OllamaModel = Readonly<{
  name: string;
  size?: number;
  digest?: string;
  modified_at?: string;
  details?: {
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}>;

// List available models
export async function listModels(detailed: boolean = false) {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    await check(res, 'list models');
    const data = await res.json();

    if (!data.models || !Array.isArray(data.models)) {
      throw new Error('Invalid models response from ollama');
    }

    const models: OllamaModel[] = data.models;

    return {
      models: detailed ? models : models.map((model) => model.name),
      count: models.length,
    };
  } catch (error) {
    throw new Error(
      `Failed to list models: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
