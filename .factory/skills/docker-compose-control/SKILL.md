---
name: docker-compose-control
description: "Start, stop, restart, inspect, and follow logs for Docker Compose-managed local stacks"
metadata:
  owner: local
  version: 1
---

# docker-compose-control

Use this skill when the task requires managing a local stack with `docker compose`
instead of PM2, especially when services are already defined in one or more
compose files and should be started, stopped, rebuilt, or inspected together.

## Use This Skill When

- The user asks to start, stop, restart, rebuild, or inspect a Docker Compose stack
- A repo already has `docker-compose.yml`, `compose.yml`, or environment-specific compose files
- The stack should be managed as containers, not as separate PM2 processes
- You need `docker compose up`, `down`, `restart`, `ps`, `logs`, or `exec`
- The user explicitly wants Docker Compose instead of PM2

## Do Not Use This Skill When

- The task is about authoring a new Dockerfile or compose file from scratch
- The task is about managing one-off standalone `docker run` containers
- The process model is intentionally PM2-inside-container for multi-process images
- The service is managed by systemd, ansible, or a remote orchestrator instead of local compose

## Core Rule

If a service stack is already defined in Docker Compose, manage it with `docker compose`
directly rather than wrapping the same stack in PM2.

Use PM2 with Docker only when PM2 runs *inside a container image* to supervise multiple
processes within that container.

## Inputs

- Compose file path(s), for example `deploy/docker-compose.dev.yml`
- Optional compose project name
- Desired action: `up`, `down`, `restart`, `ps`, `logs`, `build`, `exec`
- Optional service names
- Optional environment overrides

## Common Commands

Start / refresh a stack:

```bash
docker compose -f <compose-file> up -d
docker compose -f <compose-file> up -d --build
```

Stop and remove a stack:

```bash
docker compose -f <compose-file> down
```

Restart a service or stack:

```bash
docker compose -f <compose-file> restart
docker compose -f <compose-file> restart <service>
```

Inspect container state:

```bash
docker compose -f <compose-file> ps
docker compose -f <compose-file> config
```

Follow logs:

```bash
docker compose -f <compose-file> logs --tail=200
docker compose -f <compose-file> logs -f <service>
```

Run commands in a service:

```bash
docker compose -f <compose-file> exec <service> <command>
docker compose -f <compose-file> run --rm <service> <command>
```

## Recommended Workflow

1. Identify the correct compose file for the task.
2. Ensure any required external network/volume exists if the compose file expects it.
3. Start or refresh with `docker compose ... up -d --build` when code or images changed.
4. Confirm health with `docker compose ... ps`.
5. Inspect logs with `docker compose ... logs --tail=200` if behavior is unclear.
6. Use `docker compose ... down` only when the user wants the stack stopped/removed.

## Example

Generic stack workflow:

```bash
docker network inspect my-app-network >/dev/null 2>&1 || docker network create my-app-network
docker compose -f docker-compose.yml up -d --build
docker compose -f docker-compose.yml ps
```

Dev stack with external networks:

```bash
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml ps
```

## Safety Notes

- Prefer `docker compose ps` and `logs` before assuming a service is healthy
- Avoid mixing PM2 and Docker Compose for the same outer process lifecycle
- Respect external networks declared in compose files; create them first if needed
- Use `--build` when local code changes affect images
- Use service-specific restarts when only one service changed

## Output

- Clear statement of which compose file was used
- Whether services are running and healthy
- Key logs or errors if startup failed
- Exact follow-up commands if more validation is needed
