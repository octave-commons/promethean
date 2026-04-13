import crypto from "node:crypto"
import path from "node:path"

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex")
}

export function toPosixPath(value: string): string {
  return value.replaceAll("\\", "/")
}

export function toRepoRelative(repoRoot: string, targetPath: string): string {
  return toPosixPath(path.relative(repoRoot, targetPath))
}

export function isPathWithin(rootPath: string, targetPath: string): boolean {
  const relative = path.relative(rootPath, targetPath)
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))
}

export function slugify(value: string): string {
  const ascii = value
    .normalize("NFKD")
    .replace(/[^\w\s-]/gu, " ")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
  return ascii || "resource"
}

const SECRET_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/u,
  /ghp_[A-Za-z0-9]{20,}/u,
  /github_pat_[A-Za-z0-9_]{20,}/u,
  /AKIA[0-9A-Z]{16}/u,
  /aws_secret_access_key/u,
  /api[_-]?key\s*[:=]/iu,
  /client[_-]?secret\s*[:=]/iu,
  /bearer\s+[A-Za-z0-9._-]{20,}/iu,
  /xox[baprs]-[A-Za-z0-9-]{10,}/u,
]

export function looksSecret(value: string): boolean {
  return SECRET_PATTERNS.some((pattern) => pattern.test(value))
}

export function uniqueStrings(values: Iterable<string>): string[] {
  return [...new Set(values)]
}

export function currentMonthBucket(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`
}

export function quoteCommandArg(value: string): string {
  return JSON.stringify(value)
}
