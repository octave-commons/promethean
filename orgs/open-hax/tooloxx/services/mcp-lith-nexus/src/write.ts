import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { parseLith, printLith, quoteLithString } from "./lith.js"
import type { CreateFactInput, CreateResourceInput, NexusConfig } from "./types.js"
import { currentMonthBucket, isPathWithin, looksSecret, sha256, slugify, toPosixPath } from "./utils.js"

function normalizeTag(tag: string): string {
  const trimmed = tag.trim()
  if (!trimmed) return ""
  return trimmed.startsWith(":") ? trimmed : `:${slugify(trimmed).replaceAll("-", "_")}`
}

function buildRefs(links: Array<{ uri: string; rel: string }> | undefined): string[] {
  return [...new Set((links ?? []).map((link) => link.uri.trim()).filter(Boolean))]
}

function buildResourceFact(input: CreateResourceInput, resourceId: string): string {
  const tags = (input.tags ?? []).map(normalizeTag).filter(Boolean)
  const refs = buildRefs(input.links)
  const lines = [
    `(fact`,
    `  (id ${quoteLithString(resourceId)})`,
    `  (kind ${normalizeTag(input.kind) || ":resource"})`,
    `  (title ${quoteLithString(input.title)})`,
  ]
  if (tags.length > 0) lines.push(`  (tags [${tags.join(" ")}])`)
  if (refs.length > 0) lines.push(`  (refs [${refs.map((item) => quoteLithString(item)).join(" ")}])`)
  if ((input.links ?? []).length > 0) {
    lines.push(`  (links [${(input.links ?? [])
      .map((link) => `(link (rel ${normalizeTag(link.rel) || ":related"}) (uri ${quoteLithString(link.uri)}))`)
      .join(" ")}])`)
  }
  lines.push(`)`)
  return lines.join("\n")
}

function ensureSingleFactForm(factLith: string): { canonical: string; explicitId?: string; head: string } {
  const forms = parseLith(factLith, { filePath: "<fact>" })
  if (forms.length !== 1) throw new Error("fact_lith must contain exactly one top-level form")
  const root = forms[0]
  if (!root || root.type !== "list") throw new Error("fact_lith must be a list form")
  const head = root.items[0] && (root.items[0].type === "symbol" || root.items[0].type === "keyword") ? root.items[0].value : ""
  if (!head || !["fact", "obs", "q"].includes(head)) throw new Error("fact_lith must be a (fact ...), (obs ...), or (q ...) form")
  const idChild = root.items.find(
    (item) => item.type === "list" && item.items[0] && item.items[0].type === "symbol" && item.items[0].value === "id",
  )
  const explicitId = idChild && idChild.type === "list" && idChild.items[1] ? String((idChild.items[1] as { value?: unknown }).value ?? "") : undefined
  return explicitId ? { canonical: printLith(root), explicitId, head } : { canonical: printLith(root), head }
}

async function writeDeterministicFile(targetPath: string, content: string): Promise<"created" | "noop"> {
  await mkdir(path.dirname(targetPath), { recursive: true })
  try {
    const existing = await readFile(targetPath, "utf8")
    if (existing === content) return "noop"
  } catch {
    // continue
  }
  await writeFile(targetPath, content, "utf8")
  return "created"
}

export async function createFact(repoRoot: string, config: NexusConfig, input: CreateFactInput): Promise<Record<string, unknown>> {
  if (looksSecret(input.factLith) && !config.writes.allowSecretWrites) {
    throw new Error("fact_lith looks like it may contain a secret")
  }
  const parsed = ensureSingleFactForm(input.factLith)
  const month = currentMonthBucket()
  const digest = sha256(parsed.canonical)
  const relPath = toPosixPath(path.join(config.writes.factsDir, month, `${digest.slice(0, 12)}.lisp`))
  const absPath = path.join(repoRoot, relPath)
  const status = await writeDeterministicFile(absPath, `${parsed.canonical}\n`)
  return {
    status,
    path: relPath,
    id: parsed.explicitId ?? `${parsed.head}:${digest.slice(0, 12)}`,
    target: input.target ?? {},
    sha256: digest,
  }
}

export async function createResource(repoRoot: string, config: NexusConfig, input: CreateResourceInput): Promise<Record<string, unknown>> {
  const factsText = input.facts?.trim() ?? ""
  if (looksSecret(input.title) || looksSecret(factsText)) {
    if (!config.writes.allowSecretWrites) throw new Error("resource payload looks like it may contain a secret")
  }

  if (factsText) parseLith(factsText, { filePath: "<resource-facts>" })

  const digestSeed = JSON.stringify({
    kind: input.kind,
    title: input.title,
    tags: input.tags ?? [],
    links: input.links ?? [],
    facts: factsText,
  })
  const digest = sha256(digestSeed)
  const resourceId = `resource:${digest.slice(0, 12)}`
  const baseFact = buildResourceFact(input, resourceId)
  const content = factsText ? `${baseFact}\n\n${factsText}\n` : `${baseFact}\n`

  const defaultDir = path.join(repoRoot, config.writes.inboxDir)
  const hinted = input.pathHint?.trim() ?? ""
  let absPath = path.join(defaultDir, `${slugify(input.title)}--${digest.slice(0, 12)}.lisp`)
  if (hinted) {
    const resolved = path.resolve(repoRoot, hinted)
    if (isPathWithin(repoRoot, resolved)) absPath = resolved
  }
  if (!isPathWithin(repoRoot, absPath)) throw new Error("resolved write path escapes repo root")

  const relPath = toPosixPath(path.relative(repoRoot, absPath))
  const status = await writeDeterministicFile(absPath, content)
  return {
    status,
    path: relPath,
    id: resourceId,
    sha256: digest,
  }
}
