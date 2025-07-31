# Promethean Framework

This repository contains a modular multi‑agent architecture. To start shared infrastructure like speech services, run pm2 with the root configuration:

```bash
pm2 start ecosystem.config.js
```

Then start individual agents, for example Duck, using the agent config:

```bash
pm2 start agents/ecosystem.config.js
```

Set `AGENT_NAME` in your environment before launching agent services to isolate collections and data.
Promethean is a modular cognitive architecture for building embodied AI agents. It breaks the system into small services that handle speech-to-text, text-to-speech, memory, and higher level reasoning. Agents such as **Duck** combine these services to create an interactive assistant with emotional state and memory.

## Setup

### Python

```bash
pipenv install
```

Install additional packages needed for the test suite (including the `discord` library):

```bash
pip install -r requirements-dev.txt
```

Activate the environment when developing or running Python services:

```bash
pipenv shell
```

#### Quick Setup

Generate pinned `requirements.txt` files and install from them if you prefer a
standard virtual environment:

```bash
make generate-requirements
python -m venv .venv && source .venv/bin/activate
make setup-quick
```

This skips `pipenv` during installation and uses the generated requirement
files.

Always install into a virtual environment (`pipenv shell` or one created with
`python -m venv`) to avoid modifying your system Python packages.

### Node

```bash
npm install
```

Install PM2 globally if it isn't already available:

```bash
npm install -g pm2
```

## Running Services

Scripts in `agents/scripts/` launch commonly used services:

- `duck_cephalon_run.sh` – starts the Cephalon language router
- `duck_embedder_run.sh` – starts the Discord embedding service
- `discord_indexer_run.sh` – runs the Discord indexer

Each script assumes dependencies are installed and should be run from the repository root.

## Environment Variables

The framework relies on several environment variables for configuration. See
[docs/environment-variables.md](docs/environment-variables.md) for details on
all available settings.

## Makefile Commands

Common tasks are wrapped in the root `Makefile`:

- `make setup` – install dependencies across all services
- `make build` – transpile Hy, Sibilant and TypeScript sources
- `make start` – launch shared services defined in `ecosystem.config.js` via PM2
- `make start:<service>` – run a service from `ecosystem.config.js` by name
- `make stop` – stop running services
- `make test` – run Python and JS test suites without coverage
- `make board-sync` – sync `kanban.md` with GitHub Projects
- `make kanban-from-tasks` – regenerate `kanban.md` from task files
- `make kanban-to-hashtags` – update task statuses from `kanban.md`
- `make kanban-to-issues` – create GitHub issues from the board
- `make coverage` – run tests with coverage reports for Python, JavaScript and TypeScript services

Agent-specific services may define their own `ecosystem.config.js` files.

#hashtags: #promethean #framework #overview
## Obsidian Vault

This repository doubles as an Obsidian vault. If you would like to view the
documentation inside Obsidian, copy the baseline configuration provided in
`vault-config/.obsidian/` to a local `.obsidian/` directory:

```bash
cp -r vault-config/.obsidian .obsidian
```

This enables the Kanban plugin for task tracking so `docs/agile/boards/kanban.md`
renders as a board. Open the repository folder in Obsidian after copying the
configuration. Feel free to customize the settings or install additional
plugins locally. See `vault-config/README.md` for more details.
To push tasks from the board to GitHub Projects, see `docs/board_sync.md` and the
`github_board_sync.py` script.

## Tests

Unit tests are located in `tests/` and run automatically on every pull request
through [GitHub Actions](.github/workflows/tests.yml).
To run them locally:

```bash
pytest -q
```

## Converting Kanban Tasks to GitHub Issues

A helper Makefile target `make kanban-to-issues` can create GitHub issues from the tasks listed in `docs/agile/boards/kanban.md`. Set the following environment variables before running it:

- `GITHUB_TOKEN` – a personal access token with permission to create issues
- `GITHUB_REPO` – the repository in `owner/repo` format

Then run:

```bash
make kanban-to-issues
```

Without a token the script performs a dry run and prints the issues that would be created.


## Pre-commit Setup

Documentation uses `[wikilinks](wikilinks.md)` inside the vault but they must be converted to standard markdown links before committing. A helper script `scripts/convert_wikilinks.py` runs automatically via [pre-commit](https://pre-commit.com/).

Install the hook with:

```bash
pip install pre-commit
pre-commit install
```

This ensures all modified markdown files are converted during `git commit`.
