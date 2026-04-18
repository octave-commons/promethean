import yauzl from "yauzl";
import chain from "stream-chain";
import StreamJson from "stream-json";
import StreamArrayPkg from "stream-json/streamers/StreamArray.js";
import type { Duck } from "../duckdb.js";
import { run } from "../duckdb.js";
import type { EventEnvelopeV1 } from "../types.js";
import type { Readable } from "node:stream";

const { parser } = StreamJson;
const { streamArray } = StreamArrayPkg;

type ChatGPTNode = {
  id: string;
  message?: {
    id: string;
    author: { role: string; name?: string; metadata?: any };
    create_time: number;
    content: { content_type: string; parts: string[] };
    status: string;
    end_turn?: boolean;
    weight?: number;
    metadata?: any;
    recipient?: string;
  } | null;
  parent?: string;
  children: string[];
};

type ChatGPTConversation = {
  title: string;
  create_time: number;
  mapping: Record<string, ChatGPTNode>;
};

export async function importChatGPTZip(
  zipPath: string,
  duck: Duck,
  onProgress: (count: number) => Promise<void>
): Promise<{ count: number; errors: string[] }> {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);
      if (!zipfile) return reject(new Error("Failed to open zip"));

      zipfile.readEntry();

      zipfile.on("entry", (entry) => {
        if (entry.fileName === "conversations.json") {
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err);
            if (!readStream) return reject(new Error("Failed to read stream"));

            processStream(readStream, duck, onProgress)
              .then(resolve)
              .catch(reject)
              .finally(() => zipfile.close());
          });
        } else {
          zipfile.readEntry();
        }
      });

      zipfile.on("end", () => {
        // "end" means we scanned all entries and didn't open a stream (or logic elsewhere handled it).
        // Since we resolve inside the stream processor, we just ignore "end" if we found it.
        // We could track "found" state if needed.
      });
    });
  });
}

async function processStream(
  readStream: Readable,
  duck: Duck,
  onProgress: (count: number) => Promise<void>
): Promise<{ count: number; errors: string[] }> {
  let totalEvents = 0;
  const errors: string[] = [];
  const eventsBatch: EventEnvelopeV1[] = [];

  const pipeline = chain([
    readStream,
    parser(),
    streamArray()
  ]);

  for await (const { value: conv } of pipeline) {
    const c = conv as ChatGPTConversation;
    // Iterate all nodes in 'mapping' that have a message.
    for (const nodeId in c.mapping) {
      const node = c.mapping[nodeId];
      if (!node.message) continue;

      const msg = node.message;
      if (!msg.content) continue;
      
      const parts = msg.content.parts || [];
      const textContent = parts.map(p => (typeof p === 'string' ? p : JSON.stringify(p))).join("\n");
      
      if (!textContent.trim()) continue;

      const event: EventEnvelopeV1 = {
        schema: "openplanner.event.v1",
        id: msg.id,
        ts: new Date((msg.create_time || 0) * 1000).toISOString(),
        source: "chatgpt-export",
        kind: "message",
        source_ref: {
          session: c.title || "Untitled",
          message: msg.id,
          project: "chatgpt"
        },
        text: textContent,
        meta: {
          role: msg.author.role,
          model: msg.metadata?.model_slug,
          author_name: msg.author.name
        },
        extra: {
          original_node_id: nodeId,
          parent_node_id: node.parent
        }
      };

      eventsBatch.push(event);

      if (eventsBatch.length >= 500) {
        await upsertEvents(duck, eventsBatch);
        totalEvents += eventsBatch.length;
        eventsBatch.length = 0;
        await onProgress(totalEvents);
      }
    }
  }

  if (eventsBatch.length > 0) {
    await upsertEvents(duck, eventsBatch);
    totalEvents += eventsBatch.length;
    await onProgress(totalEvents);
  }

  return { count: totalEvents, errors };
}

async function upsertEvents(duck: Duck, events: EventEnvelopeV1[]) {
  // Batch insert loop
  for (const e of events) {
    await run(duck.conn, `
      INSERT OR REPLACE INTO events (
        id, ts, source, kind, project, session, message, role, author, model, tags, text, attachments, extra
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `, [
      e.id,
      e.ts,
      e.source,
      e.kind,
      e.source_ref?.project ?? null,
      e.source_ref?.session ?? null,
      e.source_ref?.message ?? null,
      e.meta?.role ?? null,
      e.meta?.author_name ?? null,
      e.meta?.model ?? null,
      null, // tags
      e.text ?? null,
      null, // attachments
      JSON.stringify(e.extra || {})
    ]);
  }
}
