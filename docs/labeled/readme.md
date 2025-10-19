# Documentation Overview for the Promethean Framework

This `docs` directory houses internal documentation for the **Promethean Framework**, a modular multi‑agent architecture designed to build embodied AI agents. The documentation lives alongside the code so you can navigate architecture diagrams, task boards and design notes in one place.

## What this folder contains

- **High‑level references**

- [[agents]] – an overview of the framework, how agents like Duck fit into it and the allowed operations for automated tools.

- [file-structure|file‑structure] – a description of the monorepo layout and design principles.

- [migration_plan] – a living checklist of steps to migrate code from legacy repositories into this structure.
- [[readme|site README]] – instructions for building and serving the portfolio site.
- [pre-commit] – how to install and run repository hooks before committing changes.
- [local-development-setup] – service-specific install and validation steps.

- **Agile process and tasks**

- [[kanban|Kanban board]] – the Kanban board used to track work. When opened in Obsidian with the Kanban plugin, it renders as an interactive board. See [board_usage|board usage] for how to interact with it.

- [[process]] – explains the stages of the development flow (Ice Box, Accepted, Breakdown, etc.) and when cards move between them.

- [tasks|`agile/tasks/`] – individual task files. Each document includes a description, goals, requirements and subtasks. The board links to these files; creating a new task means adding a markdown file here and linking it from the board.

- **Vault configuration**

- [[readme|vault‑config README]] – guidance for using this repo as an Obsidian vault. It covers settings for GitHub‑compatible Markdown, recommended plugins and how to install the baseline configuration.

- [.obsidian|`vault-config/.obsidian/`] – a minimal Obsidian configuration with the Kanban plugin enabled. Copy it to the repository root `cp -r vault-config/.obsidian .obsidian` to activate the baseline setup.

- **Code-aligned documentation**

- [[readme|services]] – docs for individual subsystems under `services/`.
- [[readme|agents]] – behaviour notes and prompts for each agent.
- [[readme|shared]] – reusable libraries and clients shared across services.

- **Research and scripts**

- Various notes under `docs/research/` summarize APIs or algorithms e.g. `github_projects_api.md`.

- Utility scripts in `scripts/` (outside `docs`) may be referenced here; for example, `scripts/github_board_sync.py` syncs the Kanban board with a GitHub Projects column.


## Writing and navigating docs

- **Use relative Markdown links.** To ensure links work on GitHub, write them in standard Markdown with a relative path: `[[kanban.md]]`. Obsidian’s wikilink shorthand can be handy locally, but the repository’s recommended settings convert it to a proper link on save or via pre‑commit.

- **Keep filenames simple.** Avoid spaces or punctuation in new document filenames. Use kebab‑case or underscores instead of spaces e.g. `clarify-promethean-project-vision.md`. This prevents URL‑encoding issues when browsing on GitHub.

- **Create tasks in the right place.** When you add a new task or design note, create a file under `docs/agile/tasks/` and link it from the Kanban board in the appropriate column. The board‑manager agent relies on these links to move cards through the workflow.

- **Leverage the vault, but don’t depend on it.** Obsidian is optional. If you use it, copy the baseline configuration and explore the knowledge graph. If not, all docs are plain Markdown and render correctly on GitHub or any editor.


## Getting started

1. Read [[agents]] and [file-structure|file‑structure] to understand the architecture, repository layout and language choices.

2. Browse the [[kanban|Kanban board]] to see what work is planned or in progress.

3. If you plan to use Obsidian, follow the setup in [readme|vault‑config/README.md]; otherwise, open the docs directly on GitHub.

4. When contributing documentation, follow the guidelines above to ensure your links and filenames remain portable.


---

This overview is meant to orient new contributors to the structure of Promethean’s documentation. For deeper technical details, explore the individual files referenced above.
