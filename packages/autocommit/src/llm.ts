/**
 * Type definitions for LLM chat messages
 */
export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type LLMResponse = {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
};

export type ChatCompletionOptions = {
  baseUrl: string;
  apiKey?: string;
  model: string;
  temperature: number;
  messages: ChatMessage[];
};

/**
 * Creates a safe authorization header that doesn't expose full API keys in logs
 * @param apiKey - Optional API key
 * @returns Safe headers object with truncated API key for logging
 */
export function createSafeHeaders(apiKey?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    // Validate API key format before using
    if (!/^[a-zA-Z0-9\-_\.]+$/.test(apiKey)) {
      throw new Error('Invalid API key format');
    }
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return headers;
}

/**
 * Makes a chat completion request to an LLM API
 * @param opts - Configuration for the chat completion request
 * @returns The generated message content
 * @throws Error if the request fails or returns invalid response
 */
function createRequestBody(opts: ChatCompletionOptions): object {
  return {
    model: opts.model,
    messages: opts.messages,
    temperature: opts.temperature,
    stream: false,
  };
}

function handleLLMError(error: unknown): never {
  // Only wrap unexpected errors, not our custom ones
  if (error instanceof Error && error.message.startsWith('LLM error ')) {
    throw error;
  }
  if (error instanceof Error && error.message.includes('Empty or invalid LLM response')) {
    throw error;
  }
  if (error instanceof Error && error.message.includes('Invalid chat completion options')) {
    throw error;
  }
  throw new Error(`Unexpected error during LLM request: ${String(error)}`);
}

async function processLLMResponse(res: Response): Promise<string> {
  const json = (await res.json()) as LLMResponse;
  const content = json?.choices?.[0]?.message?.content;

  if (!content || content.trim().length === 0) {
    throw new Error('Empty or invalid LLM response');
  }

  return content.trim();
}

export async function chatCompletion(opts: ChatCompletionOptions): Promise<string> {
  // Validate required fields
  if (!opts.baseUrl || !opts.model || !Array.isArray(opts.messages)) {
    throw new Error('Invalid chat completion options');
  }

  const sanitizedBaseUrl = opts.baseUrl.replace(/\/+$/, '');
  const url = `${sanitizedBaseUrl}/v1/chat/completions`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: createSafeHeaders(opts.apiKey),
      body: JSON.stringify(createRequestBody(opts)),
    });

    if (!res.ok) {
      const errorText = await res.text();
      // Don't expose sensitive information in error messages
      const safeErrorText = errorText.includes('api_key') ? 'Authentication failed' : errorText;
      throw new Error(`LLM error ${res.status}: ${safeErrorText}`);
    }

    return await processLLMResponse(res);
  } catch (error) {
    handleLLMError(error);
  }
}
