# Local Development Setup

This guide explains how to install dependencies and validate changes when working on the Promethean Framework.

## Install only the services you need

Each service is independent. Install dependencies for a single service instead of running the global setup:

```bash
make setup-quick SERVICE=stt
make setup-quick SERVICE=tts
make setup-quick SERVICE=cephalon
```

You can also invoke the lower level targets directly if you prefer:

```bash
make setup-python-service-stt
make setup-hy-service-eidolon
make setup-js-service-io
```

Avoid using `make setup-quick` without a service name; it installs every service and takes much longer.

## Validate your work

Before opening a pull request run the relevant `make` targets for the services you touched:

```bash
make test
make build
make lint
make format
```

Run these commands only for the services affected by your changes. Skipping unrelated services keeps development fast and mirrors the expectations in [[AGENTS.md|../AGENTS.md]].
