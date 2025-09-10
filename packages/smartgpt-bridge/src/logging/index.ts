import { v4 as uuidv4 } from "uuid";

import { contextStore } from "../sinks.js";

export async function mongoChromaLogger(app: any) {
  let logStore;
  try {
    logStore = contextStore.getCollection("bridge_logs");
  } catch {
    return; // sink not available
  }

  app.addHook("onRequest", async (req: any) => {
    req.requestId = uuidv4();
    req.startTime = Date.now();
  });

  app.addHook("onResponse", async (req: any, reply: any) => {
    const latencyMs = Date.now() - (req.startTime || Date.now());
    const entry = {
      requestId: req.requestId,
      method: req.method,
      path: req.url,
      statusCode: reply.statusCode,
      request: { query: req.query, params: req.params, body: req.body },
      response: safeParse(reply.payload),
      latencyMs,
      service: "smartgpt-bridge",
      operationId: reply.context?.schema?.operationId,
    };
    try {
      await (logStore as any).addEntry({
        text: JSON.stringify(entry),
        timestamp: Date.now(),
        metadata: {
          path: entry.path,
          method: entry.method,
          statusCode: entry.statusCode,
          hasError: false,
          service: entry.service,
          operationId: entry.operationId,
        },
      });
    } catch {}
  });

  app.addHook("onError", async (req: any, reply: any, error: any) => {
    const latencyMs = Date.now() - (req.startTime || Date.now());
    const entry = {
      requestId: req.requestId || uuidv4(),
      method: req.method,
      path: req.url,
      statusCode: reply.statusCode,
      request: { query: req.query, params: req.params, body: req.body },
      error: error.message,
      latencyMs,
      service: "smartgpt-bridge",
      operationId: reply.context?.schema?.operationId,
    };
    try {
      await (logStore as any).addEntry({
        text: JSON.stringify(entry),
        timestamp: Date.now(),
        metadata: {
          path: entry.path,
          method: entry.method,
          statusCode: entry.statusCode,
          hasError: !!entry.error,
          service: entry.service,
          operationId: entry.operationId,
        },
      });
    } catch {}
  });
}

function safeParse(payload: any): any {
  if (!payload) return undefined;
  try {
    return typeof payload === "string" ? JSON.parse(payload) : payload;
  } catch {
    return { raw: String(payload) };
  }
}
