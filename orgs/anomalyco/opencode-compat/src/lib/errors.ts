import type { FastifyReply } from "fastify";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function badRequest(reply: FastifyReply, message: string) {
  return reply.code(400).send({
    name: "BadRequestError",
    data: { message }
  });
}

export function notFound(reply: FastifyReply, message: string) {
  return reply.code(404).send({
    name: "NotFoundError",
    data: { message }
  });
}

export function unauthorized(reply: FastifyReply, message: string) {
  return reply.code(401).send({
    name: "UnauthorizedError",
    data: { message }
  });
}
