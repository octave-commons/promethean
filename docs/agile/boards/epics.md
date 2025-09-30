# 🚀 Promethean Epics

This document outlines high level initiatives for the Promethean Framework. Epics group multiple related tasks from the kanban board and AGENTS guidelines.

## 📚 Vault Setup & Knowledge Management
- Initialize Obsidian vault at repo root
- Add `.obsidian/` to `.gitignore`
- Structure vault to mirror `/services/`, `/agents/`, `/docs/`
- Create `vault-config/.obsidian/` and onboarding README
- Add vault instructions to main `README.md`

## 🔄 Legacy Code Migration
- Migrate Duck services and other modules from older repositories
- Migrate portfolio client code
- Migrate server-side Sibilant libraries
- Annotate imported code with migration tags

## 🛠 Developer Tooling & Build Pipeline
- Finalize `MIGRATION_PLAN.md`
- Document pnpm-first automation for Python and JS build/test flows
- Provide base `README.md` templates for each service

## 🤖 Agent Ecosystem & Configuration
- Write a simple ecosystem declaration library for new agents
- Standardize environment variables like `AGENT_NAME`

## 📖 Documentation & Onboarding
- Ensure GitHub‑compatible markdown settings are documented
- Expand docs describing STT/TTS/Cephalon services
- Keep kanban board up to date with #hashtags

Coordinate automation updates with the CI owners per
[[Babashka + Nx Automation Reference|../notes/automation/bb-nx-cli.md]].

---

#hashtags: #epics #promethean #documentation #project-management
