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

Activate the environment when developing or running Python services:

```bash
pipenv shell
```

### Node

```bash
npm install
```

## Running Services

Scripts in `agents/scripts/` launch commonly used services:

- `duck_cephalon_run.sh` – starts the Cephalon language router
- `duck_embedder_run.sh` – starts the Discord embedding service
- `discord_indexer_run.sh` – runs the Discord indexer

Each script assumes dependencies are installed and should be run from the repository root.

#hashtags: #promethean #framework #overview
## Tests

Unit tests are located in `tests/` and run automatically on every pull request
through [GitHub Actions](.github/workflows/tests.yml).
To run them locally:

```bash
pytest -q
```

## Converting Kanban Tasks to GitHub Issues

A helper script `scripts/kanban_to_issues.py` can create GitHub issues from the tasks listed in `docs/kanban.md`. Set the following environment variables before running the script:

- `GITHUB_TOKEN` – a personal access token with permission to create issues
- `GITHUB_REPO` – the repository in `owner/repo` format

Then run:

```bash
python scripts/kanban_to_issues.py
```

Without a token the script performs a dry run and prints the issues that would be created.

