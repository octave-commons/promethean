// tools/wip-sheriff.ts
// import fs from "node:fs/promises";
// import path from "node:path";

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
const DOING = (argv.get("doing") ?? "Breakdown,In Progress,Todo,In Review")
  .split(",")
  .map((s) => s.trim());
const SAFE_LEFT = argv.get("safe-left") ?? "Accepted";
const DRY_RUN =
  argv.get("dry-run") === "true" || (!WRITE && argv.get("dry-run") !== "false");
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
  const [head] = title.split("#", 1);
  const noHash = (head ?? title).trim();
  return noHash
    .replace(/\s*(?:\(|\[)\d+\s*(?:pts?|points?)?(?:\)|\])\s*$/i, "")
    .trim();
}
function parseCapacity(title: string): number | null {
  // Strip trailing hashtags/comments (e.g. "In Progress (5) #doing")
  const [head] = title.split("#", 1);
  const base = head ?? title;

  // Find the LAST "(number ...)" group in the remaining text.
  const all = Array.from(base.matchAll(/\((\d+)\s*(?:pts?|points?)?\)/g));
  const lastNumeric = all.length > 0 ? all[all.length - 1]?.[1] : undefined;
  if (typeof lastNumeric === "string") {
    return parseInt(lastNumeric, 10);
  }

  // (Optional) allow bracket style e.g. "In Progress [5]"
  const alt = base.match(/\[(\d+)\s*(?:pts?|points?)?\]/);
  const numeric = alt?.[1];
  return typeof numeric === "string" ? parseInt(numeric, 10) : null;
}

function extractPointsFromTitle(t: string): number | undefined {
  const match = t.match(/\[(\d+)\]\s*$/);
  const numeric = match?.[1];
  return typeof numeric === "string" ? parseInt(numeric, 10) : undefined;
}

const parseWikiTarget = (target: string): { slug: string; title: string } => {
  const [slugRaw, titleRaw] = target.split("|", 2);
  const slug = (slugRaw ?? "").trim();
  const title = (titleRaw ?? slug).trim();
  return { slug, title };
};

async function readTask(filepath: string): Promise<Partial<Card>> {
  let txt = "";
  try {
    txt = await fs.readFile(filepath, "utf8");
  } catch {
    return {};
  }
  const tags = Array.from(txt.matchAll(/#([\w\-]+)/g))
    .map((match) => match[1])
    .filter((label): label is string => typeof label === "string")
    .map((label) => `#${label}`);
  const fmPts = (() => {
    const match = txt.match(/(?:^|\n)points:\s*(\d+)/i);
    const numeric = match?.[1];
    return typeof numeric === "string" ? parseInt(numeric, 10) : undefined;
  })();
  const origin = (() => {
    const match = txt.match(/(?:^|\n)origin:\s*([^\n]+)/i);
    const raw = match?.[1];
    return typeof raw === "string" ? raw.trim() : undefined;
  })();
  const st = await fs.stat(filepath).catch(() => null);
  return { points: fmPts, tags, origin, mtimeMs: st?.mtimeMs };
}

async function parseBoard(md: string): Promise<Board> {
  const lines = md.split(/\r?\n/);
  const lanes: Board = [];
  let current: Lane | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);
    const headingTitle = headingMatch?.[1];
    if (typeof headingTitle === "string") {
      if (current) lanes.push(current);
      // when parsing a heading:
      const title = headingTitle.trim();
      current = {
        title,
        name: laneName(title),
        capacity: parseCapacity(title),
        cards: [],
      };
      continue;
    }
    const itemMatch = line.match(/^- \[.\]\s+\[\[([^\]]+)\]\](?:\s+(.+))?$/);
    if (current && itemMatch) {
      const rawTarget = itemMatch[1];
      if (typeof rawTarget !== "string" || rawTarget.trim().length === 0) {
        continue;
      }
      const { slug, title } = parseWikiTarget(rawTarget);
      if (slug.length === 0) {
        continue;
      }
      const wikilink = `[[${rawTarget}]]`;
      const filepath = path.join(
        TASKS_DIR,
        slug.endsWith(".md") ? slug : `${slug}.md`,
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
    const lane = lanes[i];
    if (!lane) continue;
    if (lane.capacity == null || lane.title.startsWith(SAFE_LEFT)) return i;
  }
  if (lanes.length === 0) {
    return 0;
  }
  const fallback = Math.max(0, idx - 1);
  return Math.min(fallback, lanes.length - 1);
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

  // Log lane usage and rebalance if over capacity
  for (const [i, lane] of lanes.entries()) {
    const usage = laneUsage(lane);
    const cap = lane.capacity ?? null;
    console.log(`${lane.title}: ${usage}${cap != null ? "/" + cap : ""}`);
    if (doingIdxs.includes(i)) {
      const effCap = cap ?? DEFAULT_CAP;
      if (effCap != null && usage > effCap) {
        const need = usage - effCap;
        const victims = pickVictims(lane, need);
        const destIdx = nearestSafeLeft(lanes, i);
        const destLane = lanes[destIdx];
        if (!destLane) {
          continue;
        }
        lane.cards = lane.cards.filter((c) => !victims.includes(c));
        destLane.cards.unshift(...victims);
        for (const v of victims) {
          console.log(
            `moving "${v.title}" from ${lane.title} -> ${destLane.title}`,
          );
        }
      }
    }
  }

  const rendered = renderBoard(lanes, preamble, footer);
  if (WRITE) {
    await fs.writeFile(BOARD_PATH, rendered);
  }
  if (DRY_RUN) {
    console.log(rendered);
  }
})();
