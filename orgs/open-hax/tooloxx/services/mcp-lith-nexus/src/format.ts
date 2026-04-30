import { quoteLithString } from "./lith.js"

function keyToSymbol(key: string): string {
  const trimmed = key.trim()
  return trimmed && /^[A-Za-z0-9_:+./-]+$/.test(trimmed) ? trimmed : quoteLithString(trimmed)
}

export function valueToLith(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent)
  const nextPad = "  ".repeat(indent + 1)

  if (value === null || value === undefined) return "nil"
  if (typeof value === "string") return quoteLithString(value)
  if (typeof value === "number" || typeof value === "bigint") return String(value)
  if (typeof value === "boolean") return value ? "true" : "false"

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]"
    return `[` + value.map((item) => valueToLith(item, indent + 1)).join(" ") + `]`
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, item]) => item !== undefined)
    if (entries.length === 0) return "(object)"
    const body = entries
      .map(([key, item]) => `\n${nextPad}(${keyToSymbol(key)} ${valueToLith(item, indent + 1)})`)
      .join("")
    return `(object${body}\n${pad})`
  }

  return quoteLithString(String(value))
}

export function namedRecord(name: string, value: Record<string, unknown>): string {
  const body = Object.entries(value)
    .filter(([, item]) => item !== undefined)
    .map(([key, item]) => `\n  (${keyToSymbol(key)} ${valueToLith(item, 1)})`)
    .join("")
  return `(${name}${body}\n)`
}
