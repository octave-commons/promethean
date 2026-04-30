import { readFile } from "node:fs/promises"
import path from "node:path"

import { minimatch } from "minimatch"

import { loadConfig } from "./config.js"
import type { CreateFactInput, CreateResourceInput, FindMatch, FindOptions, NexusConfig, NexusNode, ResourcePayload } from "./types.js"
import { LithNexusBackend, type LithSnapshot } from "./backend.js"
import { namedRecord } from "./format.js"
import { runQuery, type QueryRow } from "./query.js"
import { createFact, createResource } from "./write.js"

function normalizeTag(tag: string): string {
  return tag.startsWith(":") ? tag.slice(1) : tag
}

function nodeKind(node: Record<string, unknown>): string {
  return String(node.role ?? node.kind ?? "unknown")
}

function nodeTags(node: Record<string, unknown>): string[] {
  const extension = (node.extension ?? {}) as Record<string, unknown>
  const tags = Array.isArray(extension.tags) ? extension.tags : []
  return tags.map((item) => String(item))
}

function nodePath(node: Record<string, unknown>): string {
  const extension = (node.extension ?? {}) as Record<string, unknown>
  return String(node.path ?? extension.path ?? ((node.provenance ?? {}) as Record<string, unknown>).path ?? "")
}

function nodeTitle(node: Record<string, unknown>): string {
  const extension = (node.extension ?? {}) as Record<string, unknown>
  return String(node.title ?? node.label ?? extension.title ?? node.id ?? "")
}

function nodeText(node: Record<string, unknown>): string {
  const extension = (node.extension ?? {}) as Record<string, unknown>
  const refs = Array.isArray(extension.refs) ? extension.refs.map(String).join(" ") : ""
  const tags = Array.isArray(extension.tags) ? extension.tags.map(String).join(" ") : ""
  return [String(node.id ?? ""), nodeKind(node), nodeTitle(node), nodePath(node), refs, tags].join(" ").trim()
}

export class LithNexusService {
  readonly backend: LithNexusBackend
  readonly configPromise: Promise<NexusConfig>

  constructor(
    readonly repoRoot: string,
    readonly pythonWorkdir: string,
  ) {
    this.backend = new LithNexusBackend(repoRoot, pythonWorkdir)
    this.configPromise = loadConfig(repoRoot)
  }

  async getConfig(): Promise<NexusConfig> {
    return await this.configPromise
  }

  async getSnapshot(includeText = false): Promise<LithSnapshot> {
    return await this.backend.getSnapshot(includeText)
  }

  private buildQueryRows(snapshot: LithSnapshot): QueryRow[] {
    const nodes = Array.isArray((snapshot.nexus_graph as Record<string, unknown>).nodes)
      ? ((snapshot.nexus_graph as Record<string, unknown>).nodes as Record<string, unknown>[])
      : []
    return nodes.map((node) => ({
      id: String(node.id ?? ""),
      kind: nodeKind(node),
      uri: `lith://graph/node/${encodeURIComponent(String(node.id ?? ""))}`,
      title: nodeTitle(node),
      path: nodePath(node),
      tags: nodeTags(node),
      text: nodeText(node),
    }))
  }

  async listRepoResourceUris(): Promise<Array<{ uri: string; name: string; mimeType: string }>> {
    const snapshot = await this.getSnapshot(false)
    const config = await this.getConfig()
    const files = Array.isArray((snapshot.index as Record<string, unknown>).files)
      ? ((snapshot.index as Record<string, unknown>).files as Record<string, unknown>[])
      : []
    return files.map((file) => {
      const relPath = String(file.path ?? "")
      const ext = path.extname(relPath).toLowerCase()
      const mimeType = ext === ".md" ? config.mime.md : config.mime.lith
      return {
        uri: `lith://repo/${relPath}`,
        name: relPath,
        mimeType,
      }
    })
  }

  async listGraphNodeUris(): Promise<Array<{ uri: string; name: string; mimeType: string }>> {
    const snapshot = await this.getSnapshot(false)
    const nodes = Array.isArray((snapshot.nexus_graph as Record<string, unknown>).nodes)
      ? ((snapshot.nexus_graph as Record<string, unknown>).nodes as Record<string, unknown>[])
      : []
    return nodes.map((node) => ({
      uri: `lith://graph/node/${encodeURIComponent(String(node.id ?? ""))}`,
      name: nodeTitle(node),
      mimeType: "text/x-lith",
    }))
  }

  async listPromptDbUris(kind: "packet" | "contract" | "fact"): Promise<Array<{ uri: string; name: string; mimeType: string }>> {
    const snapshot = await this.getSnapshot(false)
    const key = kind === "packet" ? "packets" : kind === "contract" ? "contracts" : "facts"
    const rows = Array.isArray((snapshot.index as Record<string, unknown>)[key])
      ? (((snapshot.index as Record<string, unknown>)[key] as Record<string, unknown>[]))
      : []
    return rows.map((row) => ({
      uri: `lith://promptdb/${kind}/${encodeURIComponent(String(row.id ?? row.node_key ?? ""))}`,
      name: String(row.title ?? row.id ?? row.node_key ?? kind),
      mimeType: "text/x-lith",
    }))
  }

  async readResource(uri: string): Promise<ResourcePayload> {
    const config = await this.getConfig()
    if (uri === "lith://graph/index") {
      const snapshot = await this.getSnapshot(false)
      return {
        uri,
        mimeType: config.mime.lith,
        text: namedRecord("graph_index", {
          generated_at: snapshot.generated_at,
          repo_root: snapshot.repo_root,
          stats: (snapshot.nexus_graph as Record<string, unknown>).stats ?? {},
          index_stats: (snapshot.index as Record<string, unknown>).stats ?? {},
        }),
      }
    }

    if (uri.startsWith("lith://repo/")) {
      const relPath = decodeURIComponent(uri.slice("lith://repo/".length))
      const absPath = path.join(this.repoRoot, relPath)
      const text = await readFile(absPath, "utf8")
      const mimeType = path.extname(relPath).toLowerCase() === ".md" ? config.mime.md : config.mime.lith
      return { uri, mimeType, text }
    }

    if (uri.startsWith("lith://graph/node/")) {
      const snapshot = await this.getSnapshot(false)
      const nodeId = decodeURIComponent(uri.slice("lith://graph/node/".length))
      const nodes = Array.isArray((snapshot.nexus_graph as Record<string, unknown>).nodes)
        ? ((snapshot.nexus_graph as Record<string, unknown>).nodes as Record<string, unknown>[])
        : []
      const edges = Array.isArray((snapshot.nexus_graph as Record<string, unknown>).edges)
        ? ((snapshot.nexus_graph as Record<string, unknown>).edges as Record<string, unknown>[])
        : []
      const node = nodes.find((item) => String(item.id ?? "") === nodeId)
      if (!node) throw new Error(`graph node not found: ${nodeId}`)
      return {
        uri,
        mimeType: config.mime.lith,
        text: namedRecord("graph_node", {
          node,
          outgoing: edges.filter((edge) => String(edge.source ?? "") === nodeId),
          incoming: edges.filter((edge) => String(edge.target ?? "") === nodeId),
        }),
      }
    }

    if (uri.startsWith("lith://graph/edges/from/")) {
      const snapshot = await this.getSnapshot(false)
      const nodeId = decodeURIComponent(uri.slice("lith://graph/edges/from/".length))
      const edges = Array.isArray((snapshot.nexus_graph as Record<string, unknown>).edges)
        ? ((snapshot.nexus_graph as Record<string, unknown>).edges as Record<string, unknown>[])
        : []
      return {
        uri,
        mimeType: config.mime.lith,
        text: namedRecord("graph_edges", { direction: "from", node_id: nodeId, edges: edges.filter((edge) => String(edge.source ?? "") === nodeId) }),
      }
    }

    if (uri.startsWith("lith://graph/edges/to/")) {
      const snapshot = await this.getSnapshot(false)
      const nodeId = decodeURIComponent(uri.slice("lith://graph/edges/to/".length))
      const edges = Array.isArray((snapshot.nexus_graph as Record<string, unknown>).edges)
        ? ((snapshot.nexus_graph as Record<string, unknown>).edges as Record<string, unknown>[])
        : []
      return {
        uri,
        mimeType: config.mime.lith,
        text: namedRecord("graph_edges", { direction: "to", node_id: nodeId, edges: edges.filter((edge) => String(edge.target ?? "") === nodeId) }),
      }
    }

    if (uri.startsWith("lith://promptdb/")) {
      const snapshot = await this.getSnapshot(true)
      const relative = uri.slice("lith://promptdb/".length)
      const firstSlash = relative.indexOf("/")
      const kind = firstSlash >= 0 ? relative.slice(0, firstSlash) : relative
      const targetId = decodeURIComponent(firstSlash >= 0 ? relative.slice(firstSlash + 1) : "")
      const forms = Array.isArray((snapshot.index as Record<string, unknown>).forms)
        ? ((snapshot.index as Record<string, unknown>).forms as Record<string, unknown>[])
        : []
      const matchedForm = forms.find((form) => String(form.explicit_id ?? form.stable_id ?? form.id ?? "") === targetId)
      if (!matchedForm) throw new Error(`promptdb ${kind} not found: ${targetId}`)
      return {
        uri,
        mimeType: config.mime.lith,
        text: String(matchedForm.text ?? matchedForm.canonical ?? ""),
      }
    }

    throw new Error(`unsupported resource uri: ${uri}`)
  }

  async find(options: FindOptions): Promise<FindMatch[]> {
    const snapshot = await this.getSnapshot(false)
    const nodes = Array.isArray((snapshot.nexus_graph as Record<string, unknown>).nodes)
      ? ((snapshot.nexus_graph as Record<string, unknown>).nodes as Record<string, unknown>[])
      : []
    const query = options.query.trim().toLowerCase()
    const limit = Math.max(1, Math.min(100, options.limit ?? 25))

    const matches = nodes
      .map((node) => {
        const row: NexusNode = {
          id: String(node.id ?? ""),
          kind: nodeKind(node) as NexusNode["kind"],
          uri: `lith://graph/node/${encodeURIComponent(String(node.id ?? ""))}`,
          title: nodeTitle(node),
          tags: nodeTags(node),
          text: nodeText(node),
          path: nodePath(node),
          sha256: String((((node.provenance ?? {}) as Record<string, unknown>).sha256 ?? "")),
          lookupKeys: [],
          provenance: { source: { path: nodePath(node), span: { path: nodePath(node), start: { offset: 0, line: 1, column: 1 }, end: { offset: 0, line: 1, column: 1 } }, sha256: String((((node.provenance ?? {}) as Record<string, unknown>).sha256 ?? "")) } },
          metadata: node,
        }
        let score = 0
        const text = row.text.toLowerCase()
        if (query && text.includes(query)) score += 10
        if (row.id.toLowerCase() === query) score += 30
        if (row.title.toLowerCase().includes(query)) score += 8
        if (row.path.toLowerCase().includes(query)) score += 6
        if (row.tags.some((tag) => normalizeTag(tag) === normalizeTag(query))) score += 12
        if (options.kinds?.length && !options.kinds.includes(row.kind)) score = 0
        if (options.tags?.length && !options.tags.every((tag) => row.tags.some((candidate) => normalizeTag(candidate) === normalizeTag(tag)))) score = 0
        if (options.pathGlob && row.path && !minimatch(row.path, options.pathGlob)) score = 0
        return { node: row, score }
      })
      .filter((match) => match.score > 0)
      .sort((left, right) => right.score - left.score || left.node.id.localeCompare(right.node.id))

    return matches.slice(0, limit)
  }

  async query(queryLith: string): Promise<Record<string, unknown>[]> {
    const snapshot = await this.getSnapshot(false)
    const rows = this.buildQueryRows(snapshot)
    return runQuery(rows, queryLith, (value, pattern) => minimatch(value, pattern))
  }

  async createFact(input: CreateFactInput): Promise<Record<string, unknown>> {
    const config = await this.getConfig()
    const receipt = await createFact(this.repoRoot, config, input)
    this.backend.invalidate()
    return receipt
  }

  async createResource(input: CreateResourceInput): Promise<Record<string, unknown>> {
    const config = await this.getConfig()
    const receipt = await createResource(this.repoRoot, config, input)
    this.backend.invalidate()
    return receipt
  }
}
