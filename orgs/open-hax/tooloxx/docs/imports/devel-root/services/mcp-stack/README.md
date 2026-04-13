# MCP Stack

Container-first shared-context runtime for the MCP family.

This stack runs the following processes together inside one PM2-managed container:

- `janus`
- `mcp-fs-oauth-stable`
- `mcp-fs-oauth-dev`
- `kronos`
- `mnemosyne`
- `mcp-github`
- `mcp-process`
- `mcp-devtools`
- `mcp-tdd`
- `mcp-sandboxes`
- `mcp-ollama`
- `mcp-exec`

The container mounts the workspace at `/workspace` so the MCP tools operate on the live repo while the process group itself stays isolated from host PM2.
