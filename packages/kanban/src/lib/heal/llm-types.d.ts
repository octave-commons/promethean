// Type declarations for @promethean-os/llm module
declare module '@promethean-os/llm' {
  export function generate(args: {
    prompt: string;
    context?: Array<{ role: string; content: string }>;
    format?: unknown;
  }): Promise<unknown>;
}
