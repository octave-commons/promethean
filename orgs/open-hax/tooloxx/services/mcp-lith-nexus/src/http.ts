import { randomUUID } from "node:crypto"
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http"

import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"

import { resolveHttpRuntimeConfig } from "./runtime.js"
import { LithNexusService } from "./service.js"
import { createServer as createMcpServer } from "./server.js"

interface SessionEntry {
  server: ReturnType<typeof createMcpServer>
  transport: StreamableHTTPServerTransport
}

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve(undefined)
        return
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")))
      } catch (error) {
        reject(error)
      }
    })
    req.on("error", reject)
  })
}

function writeJson(res: ServerResponse, statusCode: number, payload: Record<string, unknown>): void {
  res.statusCode = statusCode
  res.setHeader("content-type", "application/json")
  res.end(JSON.stringify(payload))
}

async function main(): Promise<void> {
  const { repoRoot, pythonWorkdir, host, port, mcpPath } = resolveHttpRuntimeConfig()
  const service = new LithNexusService(repoRoot, pythonWorkdir)
  const sessions = new Map<string, SessionEntry>()

  const server = createHttpServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url ?? "/", `http://${req.headers.host ?? `${host}:${port}`}`)

      if (req.method === "GET" && requestUrl.pathname === `${mcpPath}/healthz`) {
        writeJson(res, 200, { ok: true, record: "eta-mu.lith-nexus.health.v1" })
        return
      }

      if (requestUrl.pathname !== mcpPath) {
        writeJson(res, 404, { error: "not_found" })
        return
      }

      const sessionIdHeader = req.headers["mcp-session-id"]
      const sessionId = Array.isArray(sessionIdHeader) ? sessionIdHeader[0] : sessionIdHeader

      if (req.method === "POST") {
        const body = await readBody(req)
        if (sessionId && sessions.has(sessionId)) {
          await sessions.get(sessionId)!.transport.handleRequest(req, res, body)
          return
        }
        if (!sessionId && isInitializeRequest(body)) {
          const mcpServer = createMcpServer(service)
          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (createdSessionId) => {
              sessions.set(createdSessionId, { server: mcpServer, transport })
            },
          })
          transport.onclose = () => {
            const activeSessionId = transport.sessionId
            if (activeSessionId) sessions.delete(activeSessionId)
            void mcpServer.close()
          }
          await mcpServer.connect(transport as unknown as Transport)
          await transport.handleRequest(req, res, body)
          return
        }
        writeJson(res, 400, { error: "invalid_session_or_initialize_request" })
        return
      }

      if (req.method === "GET" || req.method === "DELETE") {
        if (!sessionId || !sessions.has(sessionId)) {
          writeJson(res, 400, { error: "missing_or_invalid_session_id" })
          return
        }
        await sessions.get(sessionId)!.transport.handleRequest(req, res)
        return
      }

      writeJson(res, 405, { error: "method_not_allowed" })
    } catch (error) {
      writeJson(res, 500, {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  })

  const shutdown = async (): Promise<void> => {
    await Promise.all(
      [...sessions.values()].map(async ({ server: mcpServer, transport }) => {
        await transport.close().catch(() => undefined)
        await mcpServer.close().catch(() => undefined)
      }),
    )
    sessions.clear()
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }

  process.on("SIGINT", () => {
    void shutdown().finally(() => process.exit(0))
  })
  process.on("SIGTERM", () => {
    void shutdown().finally(() => process.exit(0))
  })

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject)
    server.listen(port, host, () => resolve())
  })
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
  process.exit(1)
})
