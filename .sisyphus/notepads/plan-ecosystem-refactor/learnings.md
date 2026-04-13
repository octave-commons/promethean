Refactor: CLJS ecosystem rename in riatzukiza.github.io
- Moved ecosystem.clj to ecosystem.cljs inside the submodule orgs/riatzukiza/riatzukiza.github.io
- Replaced (load-file ...) with a proper CLJS ns + require pattern and migrated macros to clobber.macro/ecosystem-output
- Updated references from (clobber.macro/ecosystem) to (clobber.macro/ecosystem-output)
- Committed submodule change and updated superproject pointer
- Ran basic diagnostics; initiating full workspace build

Verification plan:
- lsp_diagnostics should not show unresolved-namespace for clobber.macro when the CLJS compiler runs
- pnpm build completes without TS errors in octavia build
