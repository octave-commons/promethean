import { access, readFile } from "node:fs/promises"
import path from "node:path"

import { asStringValue, findChild, isList, isSymbol, isVector, parseLith } from "./lith.js"
import type { LithListNode, LithNode, NexusConfig } from "./types.js"

const DEFAULT_ROOTS = ["contracts", ".opencode/knowledge", ".opencode/promptdb", ".opencode/protocol", "specs", "manifest.lith"]
const DEFAULT_INCLUDE_EXT = [".lith", ".lisp", ".md"]
const DEFAULT_IGNORE_GLOB = ["**/node_modules/**", "**/dist/**", "**/.git/**"]

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath)
    return true
  } catch {
    return false
  }
}

function readVectorStrings(node: LithNode | undefined): string[] | undefined {
  if (!node || !(isVector(node) || isList(node))) return undefined
  const values = node.items.map((item) => asStringValue(item)).filter((item): item is string => Boolean(item))
  return values.length > 0 ? values : undefined
}

function readBoolean(node: LithNode | undefined): boolean | undefined {
  if (!node) return undefined
  const value = asStringValue(node)
  if (value === "true") return true
  if (value === "false") return false
  return undefined
}

function getChildValue(node: LithListNode, head: string): LithNode | undefined {
  const child = findChild(node, head)
  return child?.items[1]
}

function normalizeRoots(roots: string[]): string[] {
  return [...new Set(roots.map((item) => item.replaceAll("\\", "/").replace(/^\.\//u, "")))]
}

export async function loadConfig(repoRoot: string): Promise<NexusConfig> {
  const configPath = path.join(repoRoot, "mcp.lith-nexus.config.lith")
  const config: NexusConfig = {
    repoRoot,
    configPath,
    roots: [...DEFAULT_ROOTS],
    includeExt: [...DEFAULT_INCLUDE_EXT],
    ignoreGlob: [...DEFAULT_IGNORE_GLOB],
    mime: {
      lith: "text/x-lith",
      md: "text/markdown",
    },
    writes: {
      factsDir: ".opencode/promptdb/facts",
      inboxDir: ".opencode/knowledge/inbox",
      allowSecretWrites: false,
    },
    index: {
      useGitLsFiles: true,
      watch: false,
    },
  }

  if (!(await pathExists(configPath))) {
    return config
  }

  const source = await readFile(configPath, "utf8")
  const forms = parseLith(source, { filePath: configPath })
  const rootForm = forms.find((form): form is LithListNode => isList(form) && isSymbol(form.items[0]!, "config"))
  if (!rootForm) return config

  const roots = readVectorStrings(getChildValue(rootForm, "roots"))
  if (roots) config.roots = normalizeRoots(roots)

  const includeExt = readVectorStrings(getChildValue(rootForm, "include_ext"))
  if (includeExt) config.includeExt = includeExt

  const ignoreGlob = readVectorStrings(getChildValue(rootForm, "ignore_glob"))
  if (ignoreGlob) config.ignoreGlob = ignoreGlob

  const mimeNode = findChild(rootForm, "mime")
  if (mimeNode) {
    const lith = asStringValue(getChildValue(mimeNode, "lith"))
    const md = asStringValue(getChildValue(mimeNode, "md"))
    if (lith) config.mime.lith = lith
    if (md) config.mime.md = md
  }

  const writesNode = findChild(rootForm, "writes")
  if (writesNode) {
    const factsDir = asStringValue(getChildValue(writesNode, "facts_dir"))
    const inboxDir = asStringValue(getChildValue(writesNode, "inbox_dir"))
    const allowSecretWrites = readBoolean(getChildValue(writesNode, "allow_secret_writes"))
    if (factsDir) config.writes.factsDir = factsDir
    if (inboxDir) config.writes.inboxDir = inboxDir
    if (allowSecretWrites !== undefined) config.writes.allowSecretWrites = allowSecretWrites
  }

  const indexNode = findChild(rootForm, "index")
  if (indexNode) {
    const useGitLsFiles = readBoolean(getChildValue(indexNode, "use_git_ls_files"))
    const watch = readBoolean(getChildValue(indexNode, "watch"))
    if (useGitLsFiles !== undefined) config.index.useGitLsFiles = useGitLsFiles
    if (watch !== undefined) config.index.watch = watch
  }

  return config
}
