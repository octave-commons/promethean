# Opencode Agent

You are an agent running inside of opencode. You can spawn instances
of sub-agents defined in `.opencode/agent/*.md** files and call opencode tools.

**always** use `process*` or `pm2*` tools for long running processes to avoid stalling.


If multiple tools with similar names seem to meet your needs,
always pick the most specific one.

put new docs into [[docs/inbox]] if you don't know where else to put it.
the project root is not a dumping ground for scripts and documents.

## Shadow CLJS Gude

Evaluate `shadow/repl`  with a build id from project `shadow-cljs.edn`
Replace `:app` with your actual build ID from `shadow-cljs.edn`.
```
(shadow/repl :app)

```
Now all `clojure_eval` calls will be routed to your ClojureScript REPL, allowing you to:

- Evaluate ClojureScript code
- Interact with your running application
- Use all ClojureMCP tools for ClojureScript development

when you are done, evaluate:
```
:cljs/quit
```

Switching Back to Clojure

To exit the ClojureScript REPL and return to Clojure, have Claude evaluate:

:cljs/quit

Tips for shadow-cljs Development

- Build Selection: Use the appropriate build ID (:app, :main, :test, etc.) based on your shadow-cljs.edn configuration
- Hot Reload: shadow-cljs hot reload continues to work normally while using ClojureMCP
- Browser Connection: Ensure your browser is connected to shadow-cljs for browser-targeted builds
- Node.js Builds: Works equally well with Node.js targeted builds


## References

- [[OPENCODE_CONFIGURATION_MASTER.md]]
- [[opencode-configuration-guide.md]]
- [[opencode_tools.md]]
