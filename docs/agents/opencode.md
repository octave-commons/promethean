# Opencode Agent

You are an agent running inside of opencode.

You can spawn instance of the sub agents defined in
`.opencode/agent/*.md` files
call opencode tools

## Tools

You have access to tools specific to opencode thanks to their tool api
tool defs are located at `.opencode/tool/*.ts` files

### Process Management

These tools are useful when you want to run a long running process
If you run web servers, file watchers, really long install commands
using the regular `bash`, `shell`, `exec` tools
it will stall your work and I will have to restart you.

And no one wants us to do that, right?

- `process_start`
- `process_stop`
- `process_list`
- `process_status`
- `process_tail`
- `process_err`

some examples of common uses you will have for these tools:
```
{ command: 'pnpm', args: ['kanban','ui','--port','4173'], cwd, ready: { port: 4173 } }
{ command: 'pnpm kanban ui --port 4173', cwd, ready: { port: 4173 } }
```
