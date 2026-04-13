import { asStringValue, findChild, getHeadSymbol, isList, isVector, parseLith } from "./lith.js"

export interface QueryRow {
  id: string
  kind: string
  uri: string
  title: string
  path: string
  tags: string[]
  text: string
}

interface ParsedQuery {
  select: string[]
  kind?: string
  tag?: string
  textLike?: string
  id?: string
  pathGlob?: string
  limit: number
}

function normalizeToken(value: string | undefined): string | undefined {
  if (!value) return undefined
  return value.startsWith(":") ? value.slice(1) : value
}

function parseQuery(queryLith: string): ParsedQuery {
  const forms = parseLith(queryLith, { filePath: "<query>" })
  const root = forms[0]
  if (!root || !isList(root) || getHeadSymbol(root) !== "query") {
    throw new Error("query_lith must be a single (query ...) form")
  }

  const selectNode = findChild(root, "select")
  const whereNode = findChild(root, "where")
  const limitNode = findChild(root, "limit")

  const selectVector = selectNode?.items[1]
  const select = selectVector && isVector(selectVector)
    ? selectVector.items
        .map((item) => normalizeToken(asStringValue(item)))
        .filter((item): item is string => Boolean(item))
    : ["id", "kind", "uri", "title"]

  const parsed: ParsedQuery = {
    select,
    limit: Math.max(1, Math.min(200, Number.parseInt(asStringValue(limitNode?.items[1]) ?? "25", 10) || 25)),
  }

  if (whereNode) {
    for (const clause of whereNode.items.slice(1)) {
      if (!isList(clause)) continue
      const head = getHeadSymbol(clause)
      const arg = normalizeToken(asStringValue(clause.items[1]))
      if (!head || !arg) continue
      if (head === "kind") parsed.kind = arg
      else if (head === "tag") parsed.tag = arg
      else if (head === "text~") parsed.textLike = arg.toLowerCase()
      else if (head === "id") parsed.id = arg
      else if (head === "path_glob") parsed.pathGlob = arg
    }
  }

  return parsed
}

export function runQuery(rows: QueryRow[], queryLith: string, matchesGlob: (value: string, pattern: string) => boolean): Record<string, unknown>[] {
  const parsed = parseQuery(queryLith)
  const filtered = rows.filter((row) => {
    if (parsed.kind && row.kind !== parsed.kind) return false
    if (parsed.tag && !row.tags.some((tag) => normalizeToken(tag) === parsed.tag)) return false
    if (parsed.id && row.id !== parsed.id) return false
    if (parsed.textLike && !row.text.toLowerCase().includes(parsed.textLike)) return false
    if (parsed.pathGlob && !matchesGlob(row.path, parsed.pathGlob)) return false
    return true
  })

  return filtered.slice(0, parsed.limit).map((row) => {
    const selected: Record<string, unknown> = {}
    for (const field of parsed.select) {
      if (field in row) selected[field] = row[field as keyof QueryRow]
    }
    return selected
  })
}
