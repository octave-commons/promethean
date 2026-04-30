# Work log: ecosystem.cljs conversion
- Task: Convert EDN ecosystem.pm2.edn to root ecosystem.cljs using clobber.macro.
- Apps covered: devel/opencode, duck-io, duck-brain, duck-ui.
- Dev profile added: includes duck-io-compiler-dev, duck-io-dev, duck-brain-dev, duck-ui-dev.
- File created: ecosystem.cljs at repository root.
- Commit: feat(ecosystem): create root ecosystem.cljs
- Verification: build/tests should pass; lsp diagnostics clean for changed files.
