import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"
import * as z from "zod/v4"

import { namedRecord } from "./format.js"
import { LithNexusService } from "./service.js"

export function createServer(service: LithNexusService): McpServer {
  const server = new McpServer({ name: "mcp-lith-nexus", version: "0.1.0" }, { capabilities: { logging: {} } })

  server.registerResource(
    "graph-index",
    "lith://graph/index",
    {
      title: "Lith Nexus Graph Index",
      description: "Summary of the canonical Lith nexus graph",
      mimeType: "text/x-lith",
    },
    async () => ({ contents: [await service.readResource("lith://graph/index")] }),
  )

  server.registerResource(
    "repo-file",
    new ResourceTemplate("lith://repo/{+path}", {
      list: async () => ({ resources: await service.listRepoResourceUris() }),
    }),
    {
      title: "Repo File",
      description: "Raw repo file served as Lith or Markdown",
      mimeType: "text/x-lith",
    },
    async (uri) => ({ contents: [await service.readResource(uri.href)] }),
  )

  server.registerResource(
    "graph-node",
    new ResourceTemplate("lith://graph/node/{id}", {
      list: async () => ({ resources: await service.listGraphNodeUris() }),
    }),
    {
      title: "Graph Node",
      description: "Canonical nexus graph node with neighborhood",
      mimeType: "text/x-lith",
    },
    async (uri) => ({ contents: [await service.readResource(uri.href)] }),
  )

  server.registerResource(
    "graph-edges-from",
    new ResourceTemplate("lith://graph/edges/from/{id}", { list: async () => ({ resources: [] }) }),
    {
      title: "Outgoing Graph Edges",
      description: "Outgoing edges for a graph node",
      mimeType: "text/x-lith",
    },
    async (uri) => ({ contents: [await service.readResource(uri.href)] }),
  )

  server.registerResource(
    "graph-edges-to",
    new ResourceTemplate("lith://graph/edges/to/{id}", { list: async () => ({ resources: [] }) }),
    {
      title: "Incoming Graph Edges",
      description: "Incoming edges for a graph node",
      mimeType: "text/x-lith",
    },
    async (uri) => ({ contents: [await service.readResource(uri.href)] }),
  )

  for (const kind of ["packet", "contract", "fact"] as const) {
    server.registerResource(
      `promptdb-${kind}`,
      new ResourceTemplate(`lith://promptdb/${kind}/{id}`, {
        list: async () => ({ resources: await service.listPromptDbUris(kind) }),
      }),
      {
        title: `PromptDB ${kind}`,
        description: `Convenience access for PromptDB ${kind} resources`,
        mimeType: "text/x-lith",
      },
      async (uri) => ({ contents: [await service.readResource(uri.href)] }),
    )
  }

  server.registerTool(
    "lith.find",
    {
      title: "Find Lith Resources",
      description: "Search canonical graph nodes and PromptDB facts",
      inputSchema: {
        query: z.string(),
        kinds: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        path_glob: z.string().optional(),
        limit: z.number().int().positive().max(100).optional(),
      },
    },
    async ({ query, kinds, tags, path_glob, limit }) => {
      const matches = await service.find({
        query,
        ...(kinds ? { kinds } : {}),
        ...(tags ? { tags } : {}),
        ...(path_glob ? { pathGlob: path_glob } : {}),
        ...(limit !== undefined ? { limit } : {}),
      })
      return {
        content: [
          {
            type: "text",
            text: namedRecord("matches", {
              count: matches.length,
              rows: matches.map((match) => ({
                id: match.node.id,
                kind: match.node.kind,
                uri: match.node.uri,
                title: match.node.title,
                score: match.score,
              })),
            }),
          },
        ],
      }
    },
  )

  server.registerTool(
    "lith.read",
    {
      title: "Read Lith Resource",
      description: "Read a Lith resource or graph node by URI",
      inputSchema: {
        uri: z.string(),
      },
    },
    async ({ uri }) => {
      const resource = await service.readResource(uri)
      return {
        content: [
          {
            type: "resource",
            resource,
          },
        ],
      }
    },
  )

  server.registerTool(
    "nexus.query",
    {
      title: "Query Nexus Graph",
      description: "Run a limited Lith query over the canonical nexus graph",
      inputSchema: {
        query_lith: z.string(),
      },
    },
    async ({ query_lith }) => {
      const rows = await service.query(query_lith)
      return {
        content: [
          {
            type: "text",
            text: namedRecord("query_result", { count: rows.length, rows }),
          },
        ],
      }
    },
  )

  server.registerTool(
    "nexus.create_resource",
    {
      title: "Create Nexus Resource",
      description: "Create a deterministic in-repo resource fact bundle",
      inputSchema: {
        kind: z.string(),
        title: z.string(),
        tags: z.array(z.string()).optional(),
        links: z.array(z.object({ uri: z.string(), rel: z.string() })).optional(),
        facts: z.string().optional(),
        path_hint: z.string().optional(),
      },
    },
    async ({ kind, title, tags, links, facts, path_hint }) => {
      const receipt = await service.createResource({
        kind,
        title,
        ...(tags ? { tags } : {}),
        ...(links ? { links } : {}),
        ...(facts ? { facts } : {}),
        ...(path_hint ? { pathHint: path_hint } : {}),
      })
      return {
        content: [
          {
            type: "text",
            text: namedRecord("receipt", receipt),
          },
        ],
      }
    },
  )

  server.registerTool(
    "promptdb.create_fact",
    {
      title: "Create PromptDB Fact",
      description: "Write a deterministic PromptDB fact/obs/q file",
      inputSchema: {
        fact_lith: z.string(),
        target: z
          .object({
            packet_id: z.string().optional(),
            contract_id: z.string().optional(),
            resource_id: z.string().optional(),
            path: z.string().optional(),
          })
          .optional(),
      },
    },
    async ({ fact_lith, target }) => {
      const receipt = await service.createFact({
        factLith: fact_lith,
        ...(target
          ? {
              target: {
                ...(target.packet_id ? { packetId: target.packet_id } : {}),
                ...(target.contract_id ? { contractId: target.contract_id } : {}),
                ...(target.resource_id ? { resourceId: target.resource_id } : {}),
                ...(target.path ? { path: target.path } : {}),
              },
            }
          : {}),
      })
      return {
        content: [
          {
            type: "text",
            text: namedRecord("receipt", receipt),
          },
        ],
      }
    },
  )

  server.registerPrompt(
    "find-promptdb-packets",
    {
      title: "Find PromptDB Packets",
      description: "Help a model find relevant PromptDB packets for a topic",
      argsSchema: {
        topic: z.string(),
      },
    },
    ({ topic }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Use lith.find with query ${JSON.stringify(topic)} and then lith.read or nexus.query to inspect the most relevant packet, contract, or fact resources.`,
          },
        },
      ],
    }),
  )

  server.registerPrompt(
    "create-nexus-resource",
    {
      title: "Create Nexus Resource",
      description: "Guide a model to create a new nexus resource with evidence links",
      argsSchema: {
        thing: z.string(),
      },
    },
    ({ thing }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Create a new nexus resource for ${thing} using nexus.create_resource. Include tags and refs to relevant repo files or URLs whenever possible.`,
          },
        },
      ],
    }),
  )

  server.registerPrompt(
    "summarize-graph-neighborhood",
    {
      title: "Summarize Graph Neighborhood",
      description: "Guide a model to summarize a graph neighborhood for a node",
      argsSchema: {
        node_id: z.string(),
      },
    },
    ({ node_id }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Read lith://graph/node/${encodeURIComponent(node_id)} and summarize the node, outgoing edges, incoming edges, and nearby tagged facts.`,
          },
        },
      ],
    }),
  )

  return server
}
