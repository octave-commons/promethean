import type {
  LithKeywordNode,
  LithListNode,
  LithNode,
  LithNumberNode,
  LithStringNode,
  LithSymbolNode,
  LithVectorNode,
  ParseLithOptions,
  SourcePoint,
  SourceSpan,
} from "./types.js"

const SYMBOL_RE = /^[^\s\[\]();"]+$/u

export class LithError extends Error {
  readonly code: string
  readonly span?: SourceSpan

  constructor(code: string, message: string, span?: SourceSpan) {
    super(message)
    this.name = "LithError"
    this.code = code
    if (span) {
      this.span = span
    }
  }
}

function clonePoint(point: SourcePoint): SourcePoint {
  return { offset: point.offset, line: point.line, column: point.column }
}

function makeSpan(path: string, start: SourcePoint, end: SourcePoint): SourceSpan {
  return {
    path,
    start: clonePoint(start),
    end: clonePoint(end),
  }
}

function syntaxError(code: string, message: string, path: string, start: SourcePoint, end?: SourcePoint): never {
  throw new LithError(code, message, makeSpan(path, start, end ?? start))
}

export function isList(node: LithNode): node is LithListNode {
  return node.type === "list"
}

export function isVector(node: LithNode): node is LithVectorNode {
  return node.type === "vector"
}

export function isSymbol(node: LithNode, expected?: string): node is LithSymbolNode {
  return node.type === "symbol" && (expected === undefined || node.value === expected)
}

export function isKeyword(node: LithNode, expected?: string): node is LithKeywordNode {
  return node.type === "keyword" && (expected === undefined || node.value === expected)
}

export function isString(node: LithNode): node is LithStringNode {
  return node.type === "string"
}

export function isNumber(node: LithNode): node is LithNumberNode {
  return node.type === "number"
}

export function getHeadSymbol(node: LithNode): string | null {
  if (!isList(node) || node.items.length === 0) return null
  const first = node.items[0]
  if (first && (first.type === "symbol" || first.type === "keyword")) return first.value
  return null
}

export function asStringValue(node: LithNode | undefined): string | undefined {
  if (!node) return undefined
  if (node.type === "string" || node.type === "symbol" || node.type === "keyword") return node.value
  if (node.type === "number") return node.raw
  return undefined
}

export function findChild(node: LithNode, head: string): LithListNode | undefined {
  if (!isList(node)) return undefined
  return node.items.find((item): item is LithListNode => isList(item) && getHeadSymbol(item) === head)
}

export function printLith(node: LithNode): string {
  switch (node.type) {
    case "list":
      return `(${node.items.map((item) => printLith(item)).join(" ")})`
    case "vector":
      return `[${node.items.map((item) => printLith(item)).join(" ")}]`
    case "symbol":
    case "keyword":
      return node.value
    case "string":
      return `"${escapeLithString(node.value)}"`
    case "number":
      return node.raw
    default:
      return ""
  }
}

function escapeLithString(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r")
    .replaceAll("\t", "\\t")
    .replaceAll('"', '\\"')
}

export function quoteLithString(value: string): string {
  return `"${escapeLithString(value)}"`
}

export function parseLith(source: string, options: ParseLithOptions = {}): LithNode[] {
  const filePath = options.filePath ?? "<memory>"
  const baseOffset = options.baseOffset ?? 0
  const baseLine = options.baseLine ?? 1

  let index = 0
  let line = baseLine
  let column = 1

  const currentPoint = (): SourcePoint => ({ offset: baseOffset + index, line, column })

  const advance = (): string => {
    const ch = source[index] ?? ""
    index += 1
    if (ch === "\n") {
      line += 1
      column = 1
    } else {
      column += 1
    }
    return ch
  }

  const peek = (): string => source[index] ?? ""

  const skipWhitespaceAndComments = (): void => {
    while (index < source.length) {
      const ch = peek()
      if (ch === ";") {
        while (index < source.length && peek() !== "\n") {
          advance()
        }
        continue
      }
      if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n" || ch === ",") {
        advance()
        continue
      }
      break
    }
  }

  const parseString = (): LithStringNode => {
    const startIndex = index
    const startPoint = currentPoint()
    advance()
    let value = ""
    while (index < source.length) {
      const ch = advance()
      if (ch === "\\") {
        if (index >= source.length) {
          syntaxError("E_STRING_ESCAPE", "unterminated string escape", filePath, startPoint, currentPoint())
        }
        const escaped = advance()
        if (escaped === "n") value += "\n"
        else if (escaped === "r") value += "\r"
        else if (escaped === "t") value += "\t"
        else if (escaped === '"') value += '"'
        else if (escaped === "\\") value += "\\"
        else value += escaped
        continue
      }
      if (ch === '"') {
        const endPoint = currentPoint()
        return {
          type: "string",
          value,
          span: makeSpan(filePath, startPoint, endPoint),
          text: source.slice(startIndex, index),
        }
      }
      value += ch
    }
    syntaxError("E_STRING_UNTERM", "unterminated string", filePath, startPoint, currentPoint())
  }

  const parseAtom = (): LithNode => {
    const startIndex = index
    const startPoint = currentPoint()
    let raw = ""
    while (index < source.length) {
      const ch = peek()
      if (!ch || ch === "(" || ch === ")" || ch === "[" || ch === "]" || ch === ";" || /[\s,]/u.test(ch)) {
        break
      }
      raw += advance()
    }
    if (!raw) {
      syntaxError("E_TOKEN", "unexpected token", filePath, startPoint, currentPoint())
    }
    if (!SYMBOL_RE.test(raw)) {
      syntaxError("E_SYMBOL", `invalid symbol '${raw}'`, filePath, startPoint, currentPoint())
    }
    const endPoint = currentPoint()
    if (/^-?\d+$/.test(raw) || /^-?(?:\d+\.\d+|\d+\.\d*|\d*\.\d+)(?:[eE][+-]?\d+)?$/.test(raw) || /^-?\d+[eE][+-]?\d+$/.test(raw)) {
      return {
        type: "number",
        value: Number(raw),
        raw,
        span: makeSpan(filePath, startPoint, endPoint),
        text: source.slice(startIndex, index),
      }
    }
    if (raw.startsWith(":")) {
      return {
        type: "keyword",
        value: raw,
        span: makeSpan(filePath, startPoint, endPoint),
        text: source.slice(startIndex, index),
      }
    }
    return {
      type: "symbol",
      value: raw,
      span: makeSpan(filePath, startPoint, endPoint),
      text: source.slice(startIndex, index),
    }
  }

  const parseSequence = (closing: ")" | "]", type: "list" | "vector"): LithListNode | LithVectorNode => {
    const startIndex = index
    const startPoint = currentPoint()
    advance()
    const items: LithNode[] = []
    while (true) {
      skipWhitespaceAndComments()
      if (index >= source.length) {
        syntaxError("E_LIST_UNTERM", `unterminated ${type}`, filePath, startPoint, currentPoint())
      }
      if (peek() === closing) {
        advance()
        const endPoint = currentPoint()
        return {
          type,
          items,
          span: makeSpan(filePath, startPoint, endPoint),
          text: source.slice(startIndex, index),
        }
      }
      items.push(parseForm())
    }
  }

  const parseForm = (): LithNode => {
    skipWhitespaceAndComments()
    if (index >= source.length) {
      syntaxError("E_EOF", "unexpected end of input", filePath, currentPoint())
    }
    const ch = peek()
    if (ch === "(") return parseSequence(")", "list")
    if (ch === "[") return parseSequence("]", "vector")
    if (ch === ")" || ch === "]") {
      const point = currentPoint()
      syntaxError("E_CLOSE", `unexpected '${ch}'`, filePath, point, point)
    }
    if (ch === '"') return parseString()
    return parseAtom()
  }

  const forms: LithNode[] = []
  while (true) {
    skipWhitespaceAndComments()
    if (index >= source.length) break
    forms.push(parseForm())
  }
  return forms
}

export interface MarkdownLithBlock {
  language: string
  text: string
  startOffset: number
  startLine: number
}

export function extractMarkdownLithBlocks(source: string): MarkdownLithBlock[] {
  const blocks: MarkdownLithBlock[] = []
  const lines = source.split(/\n/u)
  let offset = 0
  let inside = false
  let language = ""
  let blockStartOffset = 0
  let blockStartLine = 1
  let buffer: string[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? ""
    const lineWithBreak = index < lines.length - 1 ? `${line}\n` : line
    const match = line.match(/^```\s*([^\s`]*)/u)
    if (!inside && match) {
      const lang = (match[1] ?? "").toLowerCase()
      if (["lith", "lisp", "sexp", "clj"].includes(lang)) {
        inside = true
        language = lang
        buffer = []
        blockStartOffset = offset + lineWithBreak.length
        blockStartLine = index + 2
      }
      offset += lineWithBreak.length
      continue
    }
    if (inside && /^```/u.test(line)) {
      blocks.push({
        language,
        text: buffer.join(""),
        startOffset: blockStartOffset,
        startLine: blockStartLine,
      })
      inside = false
      language = ""
      buffer = []
      offset += lineWithBreak.length
      continue
    }
    if (inside) {
      buffer.push(lineWithBreak)
    }
    offset += lineWithBreak.length
  }

  return blocks
}
