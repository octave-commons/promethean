export function sseInit(reply: any) {
  reply.raw.setHeader("Content-Type", "text/event-stream");
  reply.raw.setHeader("Cache-Control", "no-cache");
  reply.raw.setHeader("Connection", "keep-alive");
  reply.hijack();
  return (line: string) => reply.raw.write(`data: ${String(line).replace(/\n/g, "\\n")}\n\n`);
}

export function log(line: (s: string) => void, s: string) {
  line(s);
}
