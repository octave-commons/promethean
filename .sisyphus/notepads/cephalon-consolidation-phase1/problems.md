# Problems

## 2026-02-03T06:20:00Z LSP diagnostics unavailable
`lsp_diagnostics` at project root fails because no LSP server is configured for Clojure/CLJS in `oh-my-opencode.json`, so the "zero LSP errors" acceptance check cannot be verified yet.

## 2026-02-03T06:30:00Z LSP configured
Resolved by adding `clojure-lsp` in `/home/err/.config/opencode/oh-my-opencode.json`; diagnostics now run on CLJS files without errors.
