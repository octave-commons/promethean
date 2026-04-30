import assert from "node:assert/strict"
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"

import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"

import { LithNexusService } from "./service.js"
import { createServer } from "./server.js"

async function writeFixture(filePath: string, text: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${text.trim()}\n`, "utf8")
}

async function createFixtureRepo(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "lith-nexus-server-"))
  await writeFixture(
    path.join(root, ".opencode", "promptdb", "demo.intent.lisp"),
    `
(packet
  (v "opencode.packet/v1")
  (id "demo:packet")
  (kind :intent)
  (title "Demo Packet")
  (tags [:demo]))
    `,
  )
  await writeFixture(path.join(root, "manifest.lith"), `(manifest (id "demo:manifest") (title "Demo Manifest"))`)
  return root
}

test("mcp server exposes resources and tools over in-memory transport", async () => {
  const repoRoot = await createFixtureRepo()
  const pythonWorkdir = path.resolve(import.meta.dirname, "..", "..", "part64")
  const service = new LithNexusService(repoRoot, pythonWorkdir)
  const mcpServer = createServer(service)
  const client = new Client({ name: "test-client", version: "1.0.0" })
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

  try {
    await Promise.all([client.connect(clientTransport), mcpServer.server.connect(serverTransport)])

    const resources = await client.listResources()
    assert.ok(resources.resources.some((resource) => resource.uri === "lith://graph/index"))
    assert.ok(resources.resources.some((resource) => resource.uri === "lith://repo/manifest.lith"))

    const graphIndex = await client.readResource({ uri: "lith://graph/index" })
    const firstContent = graphIndex.contents[0]
    assert.match(String(firstContent && "text" in firstContent ? firstContent.text : ""), /graph_index/)

    const result = await client.callTool({ name: "lith.find", arguments: { query: "demo:packet" } })
    const content = Array.isArray(result.content) ? result.content : []
    const textItem = content.find(
      (item): item is { type: "text"; text: string } =>
        typeof item === "object" && item !== null && "type" in item && item.type === "text" && "text" in item,
    )
    assert.match(String(textItem && "text" in textItem ? textItem.text : ""), /demo:packet/)
  } finally {
    await client.close()
    await mcpServer.close()
    await rm(repoRoot, { recursive: true, force: true })
  }
})
