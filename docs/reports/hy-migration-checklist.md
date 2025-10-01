---
project: Promethean
hashtags: [#migration, #hy, #python-ban]
---

# 📋 Hy Migration Checklist

This document tracks the migration from raw **Python** to **Hy** across the Promethean repo.

---

## ✅ Core Rules
- [ ] Remove all committed `.py` files outside `dist/`
- [ ] Add `.gitignore` rule for `dist/**/*.py`
- [ ] Pre-commit hook rejects `.py` outside `dist/`
- [ ] CI enforces ban during checks

---

## ⚠️ Service Migrations
- [ ] Port all Python-based services/libs → `.hy`
- [ ] Ensure identical public APIs preserved
- [ ] Compile Hy → Python under `./dist`
- [ ] Update ecosystem configs to import from `dist`

---

## ⚠️ Build + Tooling
- [ ] Add Babashka task `bb build-hy` (or equivalent) to orchestrate the Hy → Python compile
- [ ] Ensure build runs Hy → Python into `./dist`
- [ ] Integrate with CI pipelines via `pnpm exec nx` / `bb` automation (see [[Babashka + Nx Automation Reference|../notes/automation/bb-nx-cli.md]])

---

## ⚠️ Documentation
- [ ] Update `readme.md`: “Python source forbidden”
- [ ] Update `AGENTS.md` with Hy build instructions
- [ ] Add note to contributing guidelines

---

## 🏁 Next Steps
- [ ] Start with smallest Python service → Hy port
- [ ] Incrementally replace until all `.py` gone
- [ ] Lock ban in CI + pre-commit

---

> ✅ Once complete, Promethean will be a **Hy-first Lisp system** with zero Python source leakage.