import { z } from "zod";

export const EnvelopeZ = z.object({
  id: z.string(),
  ts: z.number(),
  topic: z.string(),
  key: z.string().optional(),
  partition: z.number().optional(),
  headers: z.record(z.string()).optional(),
  payload_sha256: z.string().optional(),
  payload: z.unknown(),
});

export const EventRowZ = EnvelopeZ.extend({
  offset: z.number(),
  attempts: z.number().optional(),
});

export const SubscribeZ = z.object({
  type: z.literal("SUBSCRIBE"),
  topic: z.string(),
  group: z.string(),
  from: z
    .object({
      kind: z.enum(["latest", "offset", "timestamp"]),
      value: z.number().optional(),
    })
    .optional(),
  max_inflight: z.number().default(32),
  filter: z
    .object({
      key: z.string().optional(),
      header: z.tuple([z.string(), z.string()]).optional(),
    })
    .optional(),
});

export const PublishZ = z.object({
  type: z.literal("PUBLISH"),
  topic: z.string(),
  key: z.string().optional(),
  headers: z.record(z.string()).optional(),
  payload: z.unknown(),
});
export const AckZ = z.object({
  type: z.enum(["ACK", "NACK"]),
  topic: z.string(),
  partition: z.number(),
  group: z.string(),
  offset: z.number(),
  reason: z.string().optional(),
});
