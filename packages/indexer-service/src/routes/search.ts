import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { search as semanticSearch } from "@promethean/indexer-core";

type SearchBody = { q?: string; n?: number };

export function registerSearchRoutes(
  app: FastifyInstance,
  rootPath: string,
): void {
  app.post(
    "/search",
    async (
      request: FastifyRequest<{ Body: SearchBody }>,
      reply: FastifyReply,
    ) => {
      const body = request.body;
      if (!body?.q) {
        reply.code(400).send({ ok: false, error: "Missing 'q'" });
        return;
      }
      try {
        const results = await semanticSearch(rootPath, body.q, body.n ?? 8);
        reply.send({ ok: true, results });
      } catch (error: any) {
        reply
          .code(500)
          .send({ ok: false, error: String(error?.message || error) });
      }
    },
  );
}
