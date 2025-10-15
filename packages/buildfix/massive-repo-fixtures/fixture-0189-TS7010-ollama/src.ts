// Native ESM. Official client: https://www.npmjs.com/package/ollama
// import Ollama from "ollama";
// import type { LlmAdapter } from "./types.js";

// Functional adapter: returns a pure interface the rest of the app expects
export const ollamaClient = (
  host: string | undefined = process.env.OLLAMA_BASE,
  model = process.env.OLLAMA_MODEL || "llama3.1",
): LlmAdapter => {
  // Ollama default export is callable and also constructable with host opts
  const client = host ? new (Ollama as any)({ host }) : (Ollama as any);

  return {
    async complete({
      system,
      prompt,
      maxTokens = 1200,
      temperature = 0.2,
      signal,
    }) {
      const full = [system?.trim(), prompt.trim()].filter(Boolean).join("\n\n");
      const res = await client.generate(
        {
          model,
          prompt: full,
          options: { temperature, num_predict: maxTokens },
        },
        { signal },
      );

      // API returns { response } for generate; but guard anyway
      const text =
        (res && (res.response ?? (res.message && res.message.content))) || "";
      if (!text) throw new Error("ollama: empty response");
      return String(text);
    },
  };
};
