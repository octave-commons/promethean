# Documentation Overview for the Promethean Framework

This `docs` directory houses internal documentation for the **Promethean Framework**, a modular multi‑agent architecture designed to build embodied AI agents. The documentation lives alongside the code so you can navigate architecture diagrams, task boards and design notes in one place.

## What this folder contains

- **High‑level references**
    
    - [AGENTS](AGENTS.md) – an overview of the framework, how agents like Duck fit into it and the allowed operations for automated tools[raw.githubusercontent.com](https://raw.githubusercontent.com/riatzukiza/promethean/ef2459fe07e70d361b9d915670ce2fa8218fbe51/AGENTS.md#:~:text=This%20repo%20defines%20the%20,and%20emotionally%20mediated%20decision%20structures).
        
    - [file‑structure](file-structure.md) – a description of the monorepo layout and design principles[raw.githubusercontent.com](https://raw.githubusercontent.com/riatzukiza/promethean/ef2459fe07e70d361b9d915670ce2fa8218fbe51/docs/file-structure.md#:~:text=).
        
    - [MIGRATION_PLAN](MIGRATION_PLAN.md) – a living checklist of steps to migrate code from legacy repositories into this structure.
    - [site README](../site/README.md) – instructions for building and serving the portfolio site.
        
- **Agile process and tasks**
    
    - [Kanban board](agile/boards/kanban.md) – the Kanban board used to track work. When opened in Obsidian with the Kanban plugin, it renders as an interactive board. See [board usage](board_usage.md) for how to interact with it.
        
    - [Process](agile/Process.md) – explains the stages of the development flow (Ice Box, Accepted, Breakdown, etc.) and when cards move between them[raw.githubusercontent.com](https://raw.githubusercontent.com/riatzukiza/promethean/ef2459fe07e70d361b9d915670ce2fa8218fbe51/docs/agile/Process.md#:~:text=).
        
    - [`agile/tasks/`](agile/tasks/) – individual task files. Each document includes a description, goals, requirements and subtasks. The board links to these files; creating a new task means adding a markdown file here and linking it from the board.
        
- **Vault configuration**
    
    - [vault‑config README](vault-config/README.md) – guidance for using this repo as an Obsidian vault. It covers settings for GitHub‑compatible Markdown, recommended plugins and how to install the baseline configuration[raw.githubusercontent.com](https://raw.githubusercontent.com/riatzukiza/promethean/ef2459fe07e70d361b9d915670ce2fa8218fbe51/vault-config/README.md#:~:text=%23%23%20GitHub).
        
    - [`vault-config/.obsidian/`](vault-config/.obsidian/) – a minimal Obsidian configuration with the Kanban plugin enabled. Copy it to the repository root (`cp -r vault-config/.obsidian .obsidian`) to activate the baseline setup.
        
- **Research and scripts**
    
    - Various notes under `docs/research/` summarize APIs or algorithms (e.g. `github_projects_api.md`).
        
    - Utility scripts in `scripts/` (outside `docs`) may be referenced here; for example, `scripts/github_board_sync.py` syncs the Kanban board with a GitHub Projects column[api.github.com](https://api.github.com/repos/riatzukiza/promethean/pulls/41/files).
    - Duck agent helper scripts are documented under [agents/duck/scripts](agents/duck/scripts/).
        

## Writing and navigating docs

- **Use relative Markdown links.** To ensure links work on GitHub, write them in standard Markdown with a relative path: `[kanban](agile/boards/kanban.md)`. Obsidian’s wikilink shorthand can be handy locally, but the repository’s recommended settings convert it to a proper link on save or via pre‑commit.
    
- **Keep filenames simple.** Avoid spaces or punctuation in new document filenames. Use kebab‑case or underscores instead of spaces (e.g. `clarify-promethean-project-vision.md`). This prevents URL‑encoding issues when browsing on GitHub.
    
- **Create tasks in the right place.** When you add a new task or design note, create a file under `docs/agile/tasks/` and link it from the Kanban board in the appropriate column. The board‑manager agent relies on these links to move cards through the workflow.
    
- **Leverage the vault, but don’t depend on it.** Obsidian is optional. If you use it, copy the baseline configuration and explore the knowledge graph. If not, all docs are plain Markdown and render correctly on GitHub or any editor.
    

## Getting started

1. Read [AGENTS](AGENTS.md) and [file‑structure](file-structure.md) to understand the architecture, repository layout and language choices.
    
2. Browse the [Kanban board](agile/boards/kanban.md) to see what work is planned or in progress.
    
3. If you plan to use Obsidian, follow the setup in [vault‑config/README.md](vault-config/README.md); otherwise, open the docs directly on GitHub.
    
4. When contributing documentation, follow the guidelines above to ensure your links and filenames remain portable.
    

---

This overview is meant to orient new contributors to the structure of Promethean’s documentation. For deeper technical details, explore the individual files referenced above.