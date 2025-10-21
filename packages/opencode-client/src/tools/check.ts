import { OllamaError } from '@promethean/ollama-queue';

// Ollama API integration
export async function check(res: Readonly<Response>, ctx: string): Promise<Response> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const snippet = text ? `: ${text.slice(0, 400)}${text.length > 400 ? '…' : ''}` : '';
    throw new OllamaError(res.status, `ollama ${ctx} ${res.status}${snippet}`);
  }
  return res;
}
