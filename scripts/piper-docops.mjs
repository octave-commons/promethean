// Wrapper functions so Piper can run DocOps steps via runJSModule
// - Opens/closes the DocOps LevelDB per step
// - Creates/tears down the Chroma collection when needed

export async function frontmatter(args = {}) {
  const { openDB } = await import('@promethean/docs-system/dist/database/db.js');
  const { runFrontmatter } = await import('@promethean/docs-system/dist/index.js');
  const db = await openDB();
  try {
    let files = args.files;
    if (!files && process.env.PIPER_FILES) {
      try {
        files = JSON.parse(process.env.PIPER_FILES);
      } catch {}
    }
    await runFrontmatter(
      {
        dir: args.dir ?? 'docs/unique',
        exts: args.exts ?? ['.md', '.mdx', '.txt'],
        genModel: args.genModel ?? 'qwen3:4b',
        dryRun: Boolean(args.dryRun ?? false),
        ...(files ? { files } : {}),
      },
      db,
    );
  } finally {
    try {
      await db.root.close();
    } catch {}
  }
}

export async function embed(args = {}) {
  const { openDB } = await import('@promethean/docs-system/dist/database/db.js');
  const { getChromaCollection } = await import('@promethean/docs-system/dist/lib/chroma.js');
  const { runEmbed } = await import('@promethean/docs-system/dist/index.js');
  const db = await openDB();
  let client;
  try {
    const embedModel = args.embedModel ?? 'nomic-embed-text:latest';
    const collection = args.collection ?? 'docs';
    const { client: c, coll } = await getChromaCollection({
      collection,
      embedModel,
    });
    client = c;
    let files = args.files;
    if (!files && process.env.PIPER_FILES) {
      try {
        files = JSON.parse(process.env.PIPER_FILES);
      } catch {}
    }
    await runEmbed(
      {
        dir: args.dir ?? 'docs/unique',
        exts: args.exts ?? ['.md', '.mdx', '.txt'],
        embedModel,
        collection,
        batch: args.batch ?? 128,
        debug: Boolean(args.debug ?? false),
        ...(files ? { files } : {}),
      },
      db,
      coll,
    );
  } finally {
    try {
      await db.root.close();
    } catch {}
    try {
      await client?.close?.();
    } catch {}
  }
}

export async function query(args = {}) {
  const { openDB } = await import('@promethean/docops/dist/db.js');
  const { getChromaCollection } = await import('@promethean/docops/dist/lib/chroma.js');
  const { runQuery } = await import('@promethean/docops/dist/index.js');
  const db = await openDB();
  let client;
  try {
    const embedModel = args.embedModel ?? 'nomic-embed-text:latest';
    const collection = args.collection ?? 'docs';
    const { client: c, coll } = await getChromaCollection({
      collection,
      embedModel,
    });
    client = c;
    let files = args.files;
    if (!files && process.env.PIPER_FILES) {
      try {
        files = JSON.parse(process.env.PIPER_FILES);
      } catch {}
    }
    await runQuery(
      {
        embedModel,
        collection,
        k: args.k ?? 16,
        force: Boolean(args.force ?? false),
        debug: Boolean(args.debug ?? false),
        ...(files ? { files } : {}),
      },
      db,
      coll,
    );
  } finally {
    try {
      await db.root.close();
    } catch {}
    try {
      await client?.close?.();
    } catch {}
  }
}

export async function relations(args = {}) {
  const { openDB } = await import('@promethean/docops/dist/db.js');
  const { runRelations } = await import('@promethean/docops/dist/index.js');
  const db = await openDB();
  try {
    let files = args.files;
    if (!files && process.env.PIPER_FILES) {
      try {
        files = JSON.parse(process.env.PIPER_FILES);
      } catch {}
    }
    await runRelations(
      {
        docsDir: args.dir ?? 'docs/unique',
        docThreshold: args.docThreshold ?? 0.78,
        refThreshold: args.refThreshold ?? 0.6,
        refMin: args.refMin,
        refMax: args.refMax,
        maxRelated: args.maxRelated ?? 25,
        maxReferences: args.maxReferences ?? 100,
        debug: Boolean(args.debug ?? false),
        ...(files ? { files } : {}),
      },
      db,
    );
  } finally {
    try {
      await db.root.close();
    } catch {}
  }
}

export async function footers(args = {}) {
  const { openDB } = await import('@promethean/docops/dist/db.js');
  const { runFooters } = await import('@promethean/docops/dist/index.js');
  const db = await openDB();
  try {
    await runFooters(
      {
        dir: args.dir ?? 'docs/unique',
        anchorStyle: args.anchorStyle ?? 'block',
        includeRelated: args.includeRelated ?? true,
        includeSources: args.includeSources ?? true,
        dryRun: Boolean(args.dryRun ?? false),
      },
      db,
    );
  } finally {
    try {
      await db.root.close();
    } catch {}
  }
}

export async function rename(args = {}) {
  const { openDB } = await import('@promethean/docops/dist/db.js');
  const { runRename } = await import('@promethean/docops/dist/index.js');
  const db = await openDB();
  try {
    await runRename(
      {
        dir: args.dir ?? 'docs/unique',
      },
      db,
    );
  } finally {
    try {
      await db.root.close();
    } catch {}
  }
}
