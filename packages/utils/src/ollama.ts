export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

async function check(res: globalThis.Response, ctx: string) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const snippet = text ? `: ${text.slice(0, 400)}${text.length > 400 ? "…" : ""}` : "";
    throw new Error(`ollama ${ctx} ${res.status}${snippet}`);
  }
  return res;
}

export async function ollamaEmbed(
  model: string,
  text: string,
): Promise<number[]> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 60_000);
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // send both fields for wider server compatibility
    body: JSON.stringify({ model, prompt: text, input: text }),
    signal: ac.signal,
  });
  try {
    await check(res, "embeddings");
  } finally {
    clearTimeout(timer);
  }
  const data: any = await res.json();
  const embedding = data?.embedding ?? data?.data?.[0]?.embedding;
  if (!Array.isArray(embedding) || !embedding.every((n: any) => typeof n === "number")) {
    throw new Error("invalid embeddings response");
  }
  return embedding;
}

export async function ollamaJSON(model: string, prompt: string): Promise<any> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: { temperature: 0 },
      format: "json",
    }),
  });
  await check(res, "generate");
  const data: any = await res.json();
  const raw =
    typeof data.response === "string"
      ? data.response
      : JSON.stringify(data.response);
  return JSON.parse(
    String(raw)
      .replace(/```json\s*/g, "")
      .replace(/```\s*$/g, "")
      .trim(),
  );
}
