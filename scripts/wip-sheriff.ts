// tools/wip-sheriff.ts
import fs from "node:fs/promises";
import path from "node:path";

type Card = {
  title: string;
  wikilink?: string;
  filepath?: string;
  points: number;
  tags: string[];
  origin?: string;
  mtimeMs?: number;
};
type Lane = {
  title: string;
  name: string;
  capacity: number | null;
  cards: Card[];
};
type Board = Lane[];

const VAULT = process.env.VAULT_ROOT ?? ".";
const BOARD_PATH = path.join(VAULT, "docs/agile/boards/kanban.md");
const TASKS_DIR = path.join(VAULT, "docs/agile/tasks");

const argv = new Map(
  process.argv.slice(2).flatMap((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [[m[1], m[2] ?? "true"]] : [];
  }),
);
const WRITE = argv.get("write") === "true";
const BASIS = (argv.get("basis") ?? "points") as "points" | "count";
const DEFAULT_CAP = parseInt(argv.get("default-cap") ?? "3", 10);
const DOING = (
  argv.get("doing") ??
  "Prompt Refinement,Agent Thinking,Breakdown,In Progress,Todo"
)
  .split(",")
  .map((s) => s.trim());
const SAFE_LEFT = argv.get("safe-left") ?? "Accepted";
// Keep exactly what's after the settings marker so we can round-trip it.
function splitKanbanSettings(md: string): { content: string; footer: string } {
  const start = md.search(/^\s*%%\s*kanban:settings\b/m);
  if (start >= 0) {
    return {
      content: md.slice(0, start).replace(/\s+$/, ""),
      footer: md.slice(start),
    };
  }
  return { content: md.replace(/\s+$/, ""), footer: "" };
}

// Optional: keep any preamble before the first "## " heading
function extractPreamble(content: string): { preamble: string; body: string } {
  const idx = content.search(/^##\s+/m);
  if (idx > 0) {
    return {
      preamble: content.slice(0, idx).replace(/\s+$/, ""),
      body: content.slice(idx),
    };
  }
  return { preamble: "", body: content };
}

// Normalize lane titles (strip "(n)" etc.) — unchanged from earlier advice
function laneName(title: string): string {
  const noHash = title.split("#")[0].trim();
  return noHash
    .replace(/\s*(?:\(|\[)\d+\s*(?:pts?|points?)?(?:\)|\])\s*$/i, "")
    .trim();
}
function parseCapacity(title: string): number | null {
  // Strip trailing hashtags/comments (e.g. "In Progress (5) #doing")
  const base = title.split("#")[0];

  // Find the LAST "(number ...)" group in the remaining text.
  const all = Array.from(base.matchAll(/\((\d+)\s*(?:pts?|points?)?\)/g));
  if (all.length) return parseInt(all[all.length - 1][1], 10);

  // (Optional) allow bracket style e.g. "In Progress [5]"
  const alt = base.match(/\[(\d+)\s*(?:pts?|points?)?\]/);
  return alt ? parseInt(alt[1], 10) : null;
}

function extractPointsFromTitle(t: string): number | undefined {
  const m = t.match(/\[(\d+)\]\s*$/);
  return m ? parseInt(m[1], 10) : undefined;
}
function slugFromWiki(s: string) {
  return s.replace(/\[\[|\]\]/g, "").split("|")[0];
}

async function readTask(filepath: string): Promise<Partial<Card>> {
  let txt = "";
  try {
    txt = await fs.readFile(filepath, "utf8");
  } catch {
    return {};
  }
  const tags = Array.from(txt.matchAll(/#([\w\-]+)/g), (m) => `#${m[1]}`);
  const fmPts = (() => {
    const m = txt.match(/(?:^|\n)points:\s*(\d+)/i);
    return m ? parseInt(m[1], 10) : undefined;
  })();
  const origin = (() => {
    const m = txt.match(/(?:^|\n)origin:\s*([^\n]+)/i);
    return m ? m[1].trim() : undefined;
  })();
  const st = await fs.stat(filepath).catch(() => null);
  return { points: fmPts, tags, origin, mtimeMs: st?.mtimeMs };
}

async function parseBoard(md: string): Promise<Board> {
  const lines = md.split(/\r?\n/);
  const lanes: Board = [];
  let current: Lane | null = null;

  for (const line of lines) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) {
      if (current) lanes.push(current);
      // when parsing a heading:
      const title = h[1].trim();
      current = {
        title,
        name: laneName(title),
        capacity: parseCapacity(title),
        cards: [],
      };
      continue;
    }
    const it = line.match(/^- \[.\]\s+\[\[([^\]]+)\]\](?:\s+(.+))?$/);
    if (it && current) {
      const wikilink = `[[${it[1]}]]`;
      const suffix = it[2] ?? "";
      const fileSlug = slugFromWiki(wikilink);
      const title = fileSlug.includes("|")
        ? fileSlug.split("|")[1]
        : fileSlug.split("|")[0];
      const filepath = path.join(
        TASKS_DIR,
        fileSlug.endsWith(".md") ? fileSlug : `${fileSlug}.md`,
      );
      const meta = await readTask(filepath);
      const pts = meta.points ?? extractPointsFromTitle(title) ?? 1;
      current.cards.push({
        title,
        wikilink,
        filepath,
        points: pts,
        tags: meta.tags ?? [],
        origin: meta.origin,
        mtimeMs: meta.mtimeMs,
      });
    }
  }
  if (current) lanes.push(current);
  return lanes;
}

function laneUsage(l: Lane): number {
  return BASIS === "points"
    ? l.cards.reduce((a, c) => a + (c.points || 1), 0)
    : l.cards.length;
}

function nearestSafeLeft(lanes: Board, idx: number): number {
  for (let i = idx - 1; i >= 0; i--) {
    if (lanes[i].capacity == null || lanes[i].title.startsWith(SAFE_LEFT))
      return i;
  }
  return Math.max(0, idx - 1);
}

function pickVictims(l: Lane, need: number): Card[] {
  const key = (c: Card) =>
    [
      c.mtimeMs ?? Number.POSITIVE_INFINITY, // younger first
      c.origin?.startsWith("bot/") ? 0 : 1, // bot first
      c.points || 1, // low points first
    ] as const;
  const sorted = [...l.cards].sort((a, b) => {
    const ka = key(a),
      kb = key(b);
    return ka[0] - kb[0] || ka[1] - kb[1] || ka[2] - kb[2];
  });
  const take = [] as Card[];
  let acc = 0;
  for (const c of sorted) {
    take.push(c);
    acc += BASIS === "points" ? c.points || 1 : 1;
    if (acc >= need) break;
  }
  return take;
}

// When writing, round-trip preamble and footer
function renderBoard(lanes: Board, preamble: string, footer: string): string {
  const out: string[] = [];
  if (preamble) out.push(preamble.trimEnd());
  for (const l of lanes) {
    out.push(`\n## ${l.title}`);
    for (const c of l.cards) {
      const wl = c.wikilink ?? `[[${c.title}]]`;
      const tagStr = (c.tags || []).join(" ");
      out.push(`- [ ] ${wl}${tagStr ? " " + tagStr : ""}`);
    }
  }
  const body =
    out
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trimEnd() + "\n";
  return footer ? body + (body.endsWith("\n") ? "" : "\n") + footer : body;
}

(async function main() {
  const raw = await fs.readFile(BOARD_PATH, "utf8");

  // NEW: split footer so parsing ignores the settings block
  const { content, footer } = splitKanbanSettings(raw);

  // (optional) preserve preamble (anything before first "## ")
  const { preamble, body } = extractPreamble(content);

  // Parse lanes from body only
  const lanes = await parseBoard(body);

  const laneIndex = new Map(lanes.map((l, i) => [laneName(l.title), i]));

  const doingIdxs = DOING.map((name) => laneIndex.get(laneName(name))).filter(
    (i): i is number => i != null,
  );

  const moves: { from: number; to: number; card: Card }[] = [];
  for (const i of doingIdxs) {
    const lane = lanes[i];
    const cap = lane.capacity ?? DEFAULT_CAP;
    const used = laneUsage(lane);
    const over = Math.max(0, used - cap);
    if (over > 0) {
      const victims = pickVictims(lane, over);
      const to = nearestSafeLeft(lanes, i);
      for (const v of victims) {
        lanes[i].cards = lanes[i].cards.filter((c) => c !== v);
        lanes[to].cards.unshift(v);
        moves.push({ from: i, to, card: v });
      }
    }
  }

  // Report
  console.log(`Basis: ${BASIS}, default-cap: ${DEFAULT_CAP}`);
  console.log({ doingIdxs, DOING, laneIndex });
  for (const i of doingIdxs) {
    const l = lanes[i],
      used = laneUsage(l),
      cap = l.capacity ?? DEFAULT_CAP;
    console.log(`- ${l.title}: ${used}/${cap}`);
  }
  if (moves.length === 0) {
    console.log("No WIP violations.");
  } else {
    console.log("\nPlanned moves:");
    for (const m of moves) {
      console.log(
        `  • ${lanes[m.from].title} → ${lanes[m.to].title}: ${m.card.title} (${
          m.card.points
        } pts)`,
      );
    }
    if (WRITE) {
      const out = renderBoard(lanes, preamble, footer);
      const tmp = BOARD_PATH + ".tmp";
      await fs.writeFile(tmp, out, "utf8");
      await fs.rename(tmp, BOARD_PATH);
      console.log(`\nApplied. Wrote ${BOARD_PATH} (footer preserved)`);
    } else {
      console.log("\nDry run. Footer will be preserved on write.");
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
