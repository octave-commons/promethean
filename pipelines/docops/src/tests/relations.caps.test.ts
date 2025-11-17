import * as path from "path";
import * as fs from "fs/promises";

import test from "ava";
import matter from "gray-matter";

import { runRelations } from "../04-relations.js";
import { parseMarkdownChunks } from "../utils.js";

async function withTmp(fn: (dir: string) => Promise<void> | void) {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    String(Date.now()) + "-" + Math.random().toString(36).slice(2),
  );
  await fs.mkdir(dir, { recursive: true });
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

// Minimal in-memory DB-like stubs to satisfy runRelations
function makeKV() {
  const m = new Map<any, any>();
  return {
    async put(k: any, v: any) {
      m.set(k, v);
    },
    async get(k: any) {
      if (!m.has(k)) throw new Error("not found");
      return m.get(k);
    },
    iterator() {
      const it = m[Symbol.iterator]();
      return {
        async *[Symbol.asyncIterator]() {
          for (const kv of it) yield kv as any;
        },
        async close() {},
      };
    },
    _map: m,
  };
}

test.serial("relations cap related_to and references", async (t) => {
  await withTmp(async (tmp: string) => {
    const docsDir = path.join(tmp, "docs");
    await fs.mkdir(docsDir, { recursive: true });

    const makeDoc = async (uuid: string, title: string, body: string) => {
      const file = path.join(docsDir, `${title}.md`);
      const raw = matter.stringify(body, { uuid, filename: title });
      await fs.writeFile(file, raw, "utf8");
      return { file };
    };

    // Create primary doc A with content
    const A = await makeDoc("u1", "A", "# A\nMain text.");

    // Create N peer docs with minimal content and distinct text so exact-match filter does not drop them
    const N = 30; // more than the caps used below
    const peers: Array<{ uuid: string; file: string; title: string }> = [];
    for (let i = 0; i < N; i++) {
      const id = `p${i}`;
      const p = await makeDoc(id, `Peer-${i}`, `# P${i}\nPeer text ${i}.`);
      peers.push({ uuid: id, file: p.file, title: `Peer-${i}` });
    }

    // Build chunks for each doc
    const chunksByUuid = new Map<string, any[]>();
    const docsList = [{ uuid: "u1", file: A.file, title: "A" }, ...peers];
    for (const d of docsList) {
      const body = matter.read(d.file).content;
      const chunks = parseMarkdownChunks(body).map((c, i) => ({
        ...c,
        id: `${d.uuid}:${i}`,
        docUuid: d.uuid,
        docPath: d.file,
      }));
      chunksByUuid.set(d.uuid, chunks);
    }

    // Fake DB object with docs, chunks, and qhits sublevel
    const docsKV = makeKV();
    const chunksKV = makeKV();
    const qhits = new Map<string, any[]>(); // key: chunkId -> hits[]

    // Seed docs and chunks
    for (const d of docsList) {
      await docsKV.put(d.uuid, { path: d.file, title: d.title });
      await chunksKV.put(d.uuid, chunksByUuid.get(d.uuid));
    }

    // For A's first chunk, add many hits to peers with descending scores
    const aChunk0 = chunksByUuid.get("u1")![0]!;
    const hits = peers.map((p, i) => ({
      id: `${p.uuid}:0`,
      docUuid: p.uuid,
      startLine: 1 + i,
      startCol: 1,
      score: 1 - i * 0.01,
    }));
    qhits.set(aChunk0.id, hits);

    // Also, add some duplicate-line hits to test dedupe and sorting
    qhits.get(aChunk0.id)!.push({
      id: `${peers[0]!.uuid}:0`,
      docUuid: peers[0]!.uuid,
      startLine: 1,
      startCol: 1,
      score: 0.5,
    });

    // Root stub with sublevel('q')
    const db = {
      root: {
        sublevel() {
          return {
            async get(k: string) {
              return qhits.get(k) || [];
            },
          };
        },
      },
      docs: docsKV,
      chunks: chunksKV,
    } as any;

    // Run with tight caps
    await runRelations(
      {
        docsDir,
        docThreshold: 0.0,
        refThreshold: 0.0,
        maxRelated: 5,
        maxReferences: 7,
      },
      db,
    );

    // Read A file and inspect frontmatter
    const gm = matter.read(A.file);
    const fm = gm.data || {};

    t.true(Array.isArray(fm.related_to_uuid));
    t.true(Array.isArray(fm.related_to_title));
    t.true(Array.isArray(fm.references));

    t.true(fm.related_to_uuid.length <= 5);
    t.true(fm.related_to_title.length <= 5);
    t.true(fm.references.length <= 7);
  });
});

test.serial("relations caps reset between runs", async (t) => {
  await withTmp(async (tmp: string) => {
    const docsDir = path.join(tmp, "docs");
    await fs.mkdir(docsDir, { recursive: true });

    const makeDoc = async (uuid: string, title: string, body: string) => {
      const file = path.join(docsDir, `${title}.md`);
      const raw = matter.stringify(body, { uuid, filename: title });
      await fs.writeFile(file, raw, "utf8");
      return { file, uuid, title };
    };

    const primary = await makeDoc("u1", "Primary", "# A\nMain text.");
    const peerA = await makeDoc("u2", "PeerA", "# B\nPeer text one.");
    const peerB = await makeDoc("u3", "PeerB", "# C\nPeer text two.");

    const docsKV = makeKV();
    const chunksKV = makeKV();
    const qhits = new Map<string, any[]>();

    const seedDoc = async (doc: {
      uuid: string;
      file: string;
      title: string;
    }) => {
      const body = matter.read(doc.file).content;
      const chunks = parseMarkdownChunks(body).map((c, i) => ({
        ...c,
        id: `${doc.uuid}:${i}`,
        docUuid: doc.uuid,
        docPath: doc.file,
      }));
      await docsKV.put(doc.uuid, { path: doc.file, title: doc.title });
      await chunksKV.put(doc.uuid, chunks);
      return chunks;
    };

    const primaryChunks = await seedDoc(primary);
    const peerAChunks = await seedDoc(peerA);
    const peerBChunks = await seedDoc(peerB);

    qhits.set(primaryChunks[0]!.id, [
      {
        id: peerAChunks[0]!.id,
        docUuid: peerA.uuid,
        startLine: 1,
        startCol: 1,
        score: 0.9,
      },
      {
        id: peerBChunks[0]!.id,
        docUuid: peerB.uuid,
        startLine: 2,
        startCol: 1,
        score: 0.8,
      },
    ]);

    const db = {
      root: {
        sublevel() {
          return {
            async get(k: string) {
              return qhits.get(k) || [];
            },
          };
        },
      },
      docs: docsKV,
      chunks: chunksKV,
    } as any;

    const baseOpts = {
      docsDir,
      docThreshold: 0,
      refThreshold: 0,
    } as const;

    await runRelations(
      {
        ...baseOpts,
        maxRelated: 1,
        maxReferences: 1,
      },
      db,
    );

    let fm = matter.read(primary.file).data || {};
    t.is(fm.related_to_uuid.length, 1);
    t.is(fm.references.length, 1);

    await fs.writeFile(
      primary.file,
      matter.stringify("# A\nMain text.", { uuid: "u1", filename: "Primary" }),
      "utf8",
    );

    await runRelations({ ...baseOpts }, db);

    fm = matter.read(primary.file).data || {};
    t.is(fm.related_to_uuid.length, 2);
    t.is(fm.references.length, 2);
  });
});
