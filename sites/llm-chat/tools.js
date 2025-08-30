export const tools = {
  codeSearch: { method: "POST", url: "/bridge/v1/search/code" },
  semanticSearch: { method: "POST", url: "/bridge/v1/search/semantic" },
};

export function parseToolCall(reply) {
  try {
    const j = JSON.parse(reply);
    if (j.tool && j.args) return j;
  } catch {}
  return null;
}

export async function callTool(name, args) {
  const spec = tools[name];
  if (!spec) return { error: `Unknown tool ${name}` };
  const res = await fetch(spec.url, {
    method: spec.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  return await res.json();
}
