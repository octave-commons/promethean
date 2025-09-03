# Promethean Framework

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE.txt)

This project is licensed under the [GNU GPL v3](LICENSE.txt).

This repository contains a modular multi‑agent architecture. To start shared infrastructure like speech services, run pm2 with the root configuration:

```bash
pm2 start ecosystem.config.js
```

Then start individual agents using their own ecosystem file. For Duck you would
run:

```bash
pm2 start agents/duck/ecosystem.config.js
```

Choose the config inside `agents/<agent>/` for other agents.

Set `AGENT_NAME` in your environment before launching agent services to isolate collections and data.
Promethean is a modular cognitive architecture for building embodied AI agents. It breaks the system
into small services that handle speech-to-text, text-to-speech, memory, and higher level reasoning.
📖 For a high-level overview, see [docs/vision.md](docs/vision.md).
📊 For architecture roadmaps and visualizations, see [docs/architecture/index.md](docs/architecture/index.md).
📦 Data migration conventions and runbooks live under [docs/data](docs/data/contracts/README.md).

### Broker Heartbeat

`BrokerClient` sends periodic heartbeats to keep connections alive. Configure the interval in milliseconds with the `BROKER_HEARTBEAT_MS` environment variable (default `30000`).

## 📊 Project Evolution Master Graph

````mermaid

graph TD

    KanbanBoard[[docs/agile/boards/kanban.md]] --> HyMigration[[docs/architecture/hy-migration-graph.md]]

    KanbanBoard --> DualStoreMigration[[docs/architecture/persistence-migration-graph.md]]

    KanbanBoard --> CompilerEvolution[[docs/architecture/compiler-evolution-graph.md]]



    HyMigration --> HyChecklist[[docs/reports/hy-migration-checklist.md]]

## 🗓️ Project Evolution Timeline

```mermaid

gantt

    title Promethean Strategic Timeline

    dateFormat  YYYY-MM-DD

    section Hy Migration

    Core Rules + Tooling    :active,  des1, 2025-08-15, 15d

    Service Ports           :crit,    des2, 2025-08-20, 20d

    CI + Docs Enforcement   :crit,    des3, 2025-09-05, 10d



    section DualStore Migration

    Cephalon + MarkdownGraph:done,    des4, 2025-08-10, 10d

    Bridge + Embedder       :active,  des5, 2025-08-20, 15d

    Kanban Processor        :active,  des6, 2025-08-22, 15d

    Migration Scripts + Docs:crit,    des7, 2025-09-01, 20d



    section Lisp Compiler Evolution

    Redefine Lambdas        :active,  des8, 2025-08-15, 15d

    Implement Defun         :active,  des9, 2025-08-20, 15d

    Implement Classes       :crit,    des10, 2025-08-25, 20d

    Ecosystem + Packages    :crit,    des11, 2025-09-05, 25d

````

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
make setup-quick SERVICE=<name>
```

This skips `pipenv` and installs dependencies for a single service using the
generated requirement files. Use `SERVICE=stt` or `SERVICE=cephalon` for example.
Running `make setup-quick` without specifying a service installs all services and
is much slower.

Makefile targets for Python, JavaScript and TypeScript iterate over their
respective service directories using a shared helper.
Missing services are skipped with a message, and the overall target fails if
any service command returns an error.

Always install into a virtual environment (`pipenv shell` or one created with
`python -m venv`) to avoid modifying your system Python packages.

### Node (pnpm required)

Use pnpm for all JavaScript/TypeScript packages. npm is intentionally blocked in this repo and will fail with a preinstall guard (EACCES/permission errors are common with npm here).

```bash
# Ensure pnpm is available (Corepack)
corepack enable && corepack prepare pnpm@latest --activate

# Install workspace deps
pnpm install
```

Install PM2 globally (pnpm only):

```bash
pnpm add -g pm2

Note: The repository sets `"packageManager": "pnpm@9"` and a `preinstall` script that exits when not using pnpm. If `npm install` is attempted, it will fail with a clear error message and instructions to enable Corepack and rerun with pnpm.
```

The service management targets `make start`, `make start-tts` and
`make start-stt` require PM2. You can install it globally as shown above or add
it as a project dependency.

### Testing (JS/TS)

Run JavaScript/TypeScript tests with AVA, split by type:

- Unit tests: `pnpm run test:unit`
- Integration tests: `pnpm run test:integration`
- E2E tests: `pnpm run:e2e` (alias for `test:e2e`)

Conventions used to classify tests:
- Unit: all tests excluding files or directories containing `integration`, `e2e`, or `system`.
- Integration: tests with filenames containing `.integration.` or under an `integration/` directory.
- E2E: tests with filenames containing `.e2e.` or under `e2e/` or `system/` directories.

TypeScript packages are built first (`pnpm -r run build`) so tests can execute from `dist/`.
Packages using Node’s built-in test runner (e.g., `auth-service`) expose `test:unit` locally and are not run by AVA.

### MongoDB

Some services (for example `heartbeat`) require a running MongoDB instance.
On Linux you can install and start MongoDB with:

```bash
make install-mongodb
```

This target adds the MongoDB apt repository and installs the `mongodb-org` package.
On Windows, install [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
and ensure the `mongod` service is running locally before starting PM2.

## Running Services

Scripts in `agents/scripts/` launch commonly used services:

- `duck_cephalon_run.sh` – starts the Cephalon language router
- `duck_embedder_run.sh` – starts the Discord embedding service
- `discord_indexer_run.sh` – runs the Discord indexer

Each script assumes dependencies are installed and should be run from the repository root.

## Environment Variables

The framework relies on several environment variables for configuration. See
[[environment-variables.md|docs/environment-variables.md]] for details on
all available settings.

## Makefile Commands

Common tasks are wrapped in the root `Makefile`:

- `make install` – attempt a quick dependency install and fall back to full setup if needed
- `make setup` – install dependencies across all services
- `make build` – transpile Hy, Sibilant and TypeScript sources
- `make start` – launch shared services defined in `ecosystem.config.js` via PM2
- `make start:<service>` – run a service from `ecosystem.config.js` by name
- `make stop` – stop running services
- `make start-tts` – start the text-to-speech service
- `make start-stt` – start the speech-to-text service
- `make stop-tts` – stop the text-to-speech service
- `make stop-stt` – stop the speech-to-text service
- `make test` – run Python and JS test suites without coverage
- `make board-sync` – sync `kanban.md` with GitHub Projects
- `make kanban-from-tasks` – regenerate `kanban.md` from task files
- `make kanban-to-hashtags` – update task statuses from `kanban.md`
- `make kanban-to-issues` – create GitHub issues from the board
- `make coverage` – run tests with coverage reports for Python, JavaScript and TypeScript services
- `make refresh` - runs install only on packages with new depednencies.

Agent-specific services may define their own `ecosystem.config.js` files.

#hashtags: #promethean #framework #overview

## Obsidian Vault

This repository doubles as an Obsidian vault. If you would like to view the
documentation inside Obsidian, copy the baseline configuration provided in
`vault-config/.obsidian/` to `docs/.obsidian/` directory:

```bash
cp -r docs/vault-config/.obsidian docs/.obsidian
```

This enables the Kanban plugin for task tracking so `docs/agile/boards/kanban.md`
renders as a board. Open the repository folder in Obsidian after copying the
configuration. Feel free to customize the settings or install additional
plugins locally. See `vault-config/README.md` for more details.
To push tasks from the board to GitHub Projects, see `docs/board_sync.md` and the
`github_board_sync.py` script.

## Tests

Unit tests are located in `tests/` and run automatically on every pull request
through [[tests.yml|GitHub Actions]].
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

Documentation uses `[[wikilinks.md]]` inside the vault. We refinforce this using precommit hooks. It breaks the markdown on github, but they are so much simpler to manage. A wiki will be published from the notes in due time.

Install the hook with:

```bash
pip install pre-commit
pre-commit install
```

This ensures all modified markdown files are converted during `git commit`.

## License

Promethean Framework is released under the [GNU General Public License v3](LICENSE.txt).
