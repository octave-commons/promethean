import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
} from "../openai/types.js";
import type { QueueSnapshot, TaskQueue } from "../queue/taskQueue.js";

import type { FastifyApp } from "./fastifyTypes.js";

type QueueSnapshotApi = {
  readonly snapshot: TaskQueue<
    ChatCompletionRequest,
    ChatCompletionResponse
  >["snapshot"];
};

const queueSnapshotSchema = {
  type: "object",
  required: ["pending", "processing", "metrics", "recent", "updatedAt"],
  properties: {
    pending: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "enqueuedAt"],
        properties: {
          id: { type: "string" },
          enqueuedAt: { type: "integer", minimum: 0 },
        },
        additionalProperties: false,
      },
    },
    processing: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "enqueuedAt", "startedAt"],
        properties: {
          id: { type: "string" },
          enqueuedAt: { type: "integer", minimum: 0 },
          startedAt: { type: "integer", minimum: 0 },
        },
        additionalProperties: false,
      },
    },
    metrics: {
      type: "object",
      required: ["enqueued", "completed", "failed"],
      properties: {
        enqueued: { type: "integer", minimum: 0 },
        completed: { type: "integer", minimum: 0 },
        failed: { type: "integer", minimum: 0 },
      },
      additionalProperties: false,
    },
    recent: {
      type: "array",
      items: {
        type: "object",
        required: [
          "id",
          "status",
          "enqueuedAt",
          "startedAt",
          "finishedAt",
          "durationMs",
        ],
        properties: {
          id: { type: "string" },
          status: { type: "string", enum: ["completed", "failed"] },
          enqueuedAt: { type: "integer", minimum: 0 },
          startedAt: { type: "integer", minimum: 0 },
          finishedAt: { type: "integer", minimum: 0 },
          durationMs: { type: "integer" },
        },
        additionalProperties: false,
      },
    },
    updatedAt: { type: "integer", minimum: 0 },
  },
  additionalProperties: false,
};

export const registerQueueRoutes = (
  app: FastifyApp,
  queue: QueueSnapshotApi,
): void => {
  app.get(
    "/queue/snapshot",
    {
      schema: {
        tags: ["Queue"],
        summary: "Inspect queue metrics and state",
        response: {
          200: queueSnapshotSchema,
        },
      },
    },
    async (): Promise<QueueSnapshot> => queue.snapshot(),
  );
};
