# Stateless Agent Template

This is a copy-and-rename template for **stateless workers** in Promethean.

## What you get
- `agent.yml` — manifest with provider/tenant wildcards, idempotency key, and health interval.
- `src/agent.ts` — minimal subscriber/producer skeleton.
- `src/index.ts` — entrypoint calling `start()`.
- `test/agent.spec.ts` — golden test using Vitest + a local mock runtime.
- `test/mockRuntime.ts` — captures publishes and simulates the bus.
- `test/golden/v1/in/*.json` and `out/*.json` — sample fixtures.

## How to use
1. Copy this folder to `services/ts/<your-agent>/`.
2. Replace `your-agent` in `agent.yml` and topics/intents.
3. Implement `transform()` in `src/agent.ts`.
4. Run tests: `pnpm -F <your package> test`.

## Conventions
- **Stateless**: no durable local state; all caches optional and re-derivable.
- **Idempotent**: same input → same output; include `idempotency_key` in payload if helpful.
- **Tokenless**: never import provider SDKs or touch secrets.

