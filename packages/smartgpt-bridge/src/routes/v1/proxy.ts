export function proxy(
  fastify: any,
  method: string,
  urlBuilder: string | ((req: any) => string),
  payloadBuilder?: (req: any) => any,
) {
  return async function (req: any, reply: any) {
    const url = typeof urlBuilder === "function" ? urlBuilder(req) : urlBuilder;
    const payload = payloadBuilder ? payloadBuilder(req) : req.body;
    const res = await fastify.inject({
      method,
      url,
      payload,
      headers: req.headers,
    });
    reply.code(res.statusCode);
    for (const [k, v] of Object.entries(res.headers)) reply.header(k, v);
    try {
      reply.send(res.json());
    } catch {
      reply.send(res.payload);
    }
  };
}
