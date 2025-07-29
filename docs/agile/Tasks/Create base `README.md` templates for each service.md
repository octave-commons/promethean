## 🧠 Description

Each service in `services/` should have a minimal `README.md` that documents its purpose, how to start it, and what dependencies it has. This task was initially created when the system was less structured — it referred loosely to “creating README templates,” but in reality it means ensuring *each* service has a baseline `README.md`.

Most of these are either already created or partially filled. The goal here is to solidify the ritual: every service must be self-documenting, even if it's minimal.

This helps:
- Agents understand their role
- Codex or Duck know how to run/debug them
- Future devs orient themselves quickly

We treat this as a “quick win” task to bring our ritualized flow up to speed.

## 🎯 Goals / Outcomes

- Each `services/<name>/README.md` exists
- Each one describes:
  - What the service does
  - How to run it (PM2 or dev mode)
  - Relevant environment variables or configs
- If incomplete, it should at least be a placeholder with TODOs

## 🧩 Related Concepts

- [process_board_flow](../process_board_flow.md)
- [AGENTS.md](../AGENTS.md)
- [service directory conventions](../service%20directory%20conventions.md)
- #doc-this #framework-core #ritual

## 🛠 Requirements

- Add `README.md` if missing
- Confirm each has:
  - Overview
  - Launch instructions
  - Related AGENT.md or spec file link
- Frontmatter is optional, but encouraged

## ✅ Tasks

- [x] Check for missing READMEs in `services/`
- [x] Create placeholder if needed
- [x] Add launch command examples
- [x] Link to related `AGENT.md` if available

## 🔗 Links

- `services/duck_cephalon/README.md`
- `services/synthesis_agent/README.md`
- [AGENTS.md](../AGENTS.md)
