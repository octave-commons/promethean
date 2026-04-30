import { FormEvent, useState } from "react";

import { runImageGeneration } from "../lib/api";
import { useStoredState } from "../lib/use-stored-state";

const LS_IMAGES_MODEL = "open-hax-proxy.ui.images.model";
const LS_IMAGES_PROMPT = "open-hax-proxy.ui.images.prompt";

function validateString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractImages(payload: unknown): string[] {
  if (!isRecord(payload)) {
    return [];
  }

  const data = Array.isArray(payload.data) ? payload.data : [];
  const urls: string[] = [];

  for (const item of data) {
    if (!isRecord(item)) {
      continue;
    }

    const b64 = typeof item.b64_json === "string" ? item.b64_json.trim() : "";
    if (b64.length > 0) {
      urls.push(`data:image/png;base64,${b64}`);
      continue;
    }

    const url = typeof item.url === "string" ? item.url.trim() : "";
    if (url.length > 0) {
      urls.push(url);
    }
  }

  return urls;
}

export function ImagesPage(): JSX.Element {
  const [model, setModel] = useStoredState(LS_IMAGES_MODEL, "gpt-image-1", validateString);
  const [prompt, setPrompt] = useStoredState(
    LS_IMAGES_PROMPT,
    "A studio photo of a cat astronaut, 35mm, ultra-detailed.",
    validateString,
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [rawResponse, setRawResponse] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    const trimmedModel = model.trim();

    if (sending || trimmedPrompt.length === 0 || trimmedModel.length === 0) {
      return;
    }

    setSending(true);
    setError(null);
    setImageUrls([]);
    setRawResponse("");

    try {
      const payload = await runImageGeneration({
        model: trimmedModel,
        prompt: trimmedPrompt,
        response_format: "b64_json",
      });

      setRawResponse(JSON.stringify(payload, null, 2));
      setImageUrls(extractImages(payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="tools-layout">
      <section className="tools-panel">
        <header>
          <h2>Images</h2>
          <p>OpenAI-compatible image generation (POST /v1/images/generations).</p>
        </header>

        <form className="chat-input-form" onSubmit={(event) => void submit(event)}>
          <input
            value={model}
            onChange={(event) => setModel(event.currentTarget.value)}
            placeholder="model (e.g. gpt-image-1)"
          />
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.currentTarget.value)}
            rows={4}
            placeholder="prompt"
          />
          <button type="submit" disabled={sending}>
            {sending ? "Generating…" : "Generate"}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}

        {imageUrls.length > 0 && (
          <div className="credentials-provider-grid">
            {imageUrls.map((url) => (
              <article key={url} className="credentials-card">
                <img src={url} alt="generated" style={{ width: "100%", borderRadius: 12 }} />
              </article>
            ))}
          </div>
        )}

        {!sending && !error && imageUrls.length === 0 && rawResponse.length > 0 && (
          <p className="status-text">No image data found in response payload.</p>
        )}
      </section>

      <section className="tools-panel">
        <header>
          <h2>Raw response</h2>
          <p>Rendered from the proxied upstream response (useful for debugging provider quirks).</p>
        </header>
        <textarea readOnly value={rawResponse} rows={24} placeholder="(response will appear here)" />
      </section>
    </div>
  );
}
