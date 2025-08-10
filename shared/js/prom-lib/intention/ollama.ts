import type { LLM } from "./llm";

type OllamaOpts = {
  model: string;
  host?: string;
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
    num_ctx?: number;
    seed?: number;
    stop?: string[];
  };
  timeoutMs?: number;
};

export class OllamaLLM implements LLM {
  private host: string;
  private model: string;
  private options: OllamaOpts["options"];
  private timeoutMs: number;

  constructor(opts: OllamaOpts) {
    this.model = opts.model;
    this.host = opts.host ?? "http://127.0.0.1:11434";
    this.options = {
      temperature: 0.2,
      top_p: 0.95,
      num_predict: 512,
      stop: ["```", "</code>", "END_OF_CODE"],
      ...opts.options,
    };
    this.timeoutMs = opts.timeoutMs ?? 90_000;
  }

  async generate({
    system,
    prompt,
  }: {
    system: string;
    prompt: string;
  }): Promise<string> {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.host}/api/chat`, {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          stream: true,
          messages: [
            {
              role: "system",
              content: `${system}\nReturn ONLY the code. No fences.`,
            },
            { role: "user", content: prompt },
          ],
          options: this.options,
        }),
      });
      if (!res.ok || !res.body) {
        throw new Error(
          `ollama http ${res.status} ${await res
            .text()
            .catch(() => "<no body>")}`,
        );
      }
      const reader = res.body.getReader();
      const td = new TextDecoder();
      let buf = "";
      let out = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += td.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          let obj: any;
          try {
            obj = JSON.parse(line);
          } catch {
            continue;
          }
          if (obj.done) break;
          const chunk = obj?.message?.content ?? "";
          out += chunk;
        }
      }
      return stripFences(out.trim());
    } finally {
      clearTimeout(to);
    }
  }
}

function stripFences(s: string): string {
  const fence = s.match(/^```[\w-]*\n([\s\S]*?)\n```$/);
  if (fence) return fence[1];
  return s.replace(/^```|```$/g, "");
}
