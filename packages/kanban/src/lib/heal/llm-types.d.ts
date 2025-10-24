// Type declarations for @promethean/llm module
declare module '@promethean/llm' {
  export function generate(args: {
    prompt: string;
    context?: Array<{ role: string; content: string }>;
    format?: unknown;
  }): Promise<unknown>;
}
