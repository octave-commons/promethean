# Promethean Framework

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
