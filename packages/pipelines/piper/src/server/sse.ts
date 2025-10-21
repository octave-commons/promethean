import type { FastifyReply } from "fastify";

export function sseInit(reply: FastifyReply) {
  reply.raw.setHeader("Content-Type", "text/event-stream");
  reply.raw.setHeader("Cache-Control", "no-cache");
  reply.raw.setHeader("Connection", "keep-alive");
  reply.hijack();
  reply.raw.write(`: ok\n\n`);
  return (line: string) => {
    const raw = reply.raw as { writableEnded?: boolean; destroyed?: boolean };
    if (raw?.writableEnded || raw?.destroyed) return;
    const safe = String(line).replace(/[\r\n]/g, "\\n");
    reply.raw.write(`data: ${safe}\n\n`);
  };
}
