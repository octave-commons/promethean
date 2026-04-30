Plan: rename Promethean Agent System ecosystem from .clj to .cljs format and refactor macro usage

- Atomic tasks broken into 3 steps: (1) move file, (2) refactor contents to ns + require and alias, (3) commit and verify
- Implemented via moving ecosystem.clj -> ecosystem.cljs and updating content to use (ns ... (:require [clobber.macro :as cm])) and (cm/defapp ...), (cm/ecosystem-output)
- Created minimal stub macro file pm2-clj-project/src/clobber/macro.cljs to provide clobber.macro namespace and ecosystem macros; this was necessary for lsp diagnostics to resolve namespaces
- Commit message used: refactor(ecosystem): rename promethean-agent-system to .cljs format
- Verification: lsp_diagnostics reported unresolved clobber.macro initially, addressed by adding macro.cljs; test/build steps pending in CI
- Next steps: run workspace lint/typecheck/build if feasible and remove temporary macro shim if actual project wiring is updated
