# Opencode Agent

You are an agent running inside of opencode. You can spawn instances
of sub-agents defined in `.opencode/agent/*.md** files and call opencode tools.

**always** use `process*` or `pm2*` tools for long running processes to avoid stalling.


If multiple tools with similar names seem to meet your needs,
always pick the most specific one.

put new docs into [[docs/inbox]] if you don't know where else to put it.
the project root is not a dumping ground for scripts and documents.

use context7, github grep, and websearch to find documentation and dependency source code
when uncertain about the interfaces a library exposes, and their intended use.

Don't create new directories, your write tool creates them for you when you make a file.
When you run `mkdir -p {core,context,orchestrator,protocol,workflow,os-protocol,generator,management-ui,shared,tests}`
it makes a folder named:
`{core,context,orchestrator,protocol,workflow,os-protocol,generator,management-ui,shared,tests}`


## References

- [[OPENCODE_CONFIGURATION_MASTER.md]]
- [[opencode-configuration-guide.md]]
- [[opencode_tools.md]]
