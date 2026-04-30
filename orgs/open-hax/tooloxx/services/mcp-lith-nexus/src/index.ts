import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import { LithNexusService } from "./service.js"
import { resolveRuntimePaths } from "./runtime.js"
import { createServer } from "./server.js"

async function main(): Promise<void> {
  const { repoRoot, pythonWorkdir } = resolveRuntimePaths()
  const service = new LithNexusService(repoRoot, pythonWorkdir)
  const server = createServer(service)
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
  process.exit(1)
})
