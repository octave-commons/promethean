export async function chat({ model, messages, options = {}, }) {
    const host = process.env.OLLAMA_HOST || "http://localhost:11434";
    const res = await fetch(`${host}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, options, stream: false }),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`ollama chat failed: ${res.status} ${text}`);
    }
    const data = await res.json();
    return (data?.message?.content ?? "").toString();
}
//# sourceMappingURL=ollama.js.map