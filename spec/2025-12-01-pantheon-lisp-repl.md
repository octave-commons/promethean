# Pantheon Lisp REPL for Agents

## Context

- Goal: Provide a simple Lisp-style REPL command `(ask "question" :provider 'opencode :agent 'build :model 'zai-coding-plan/glm-4.6)` that streams markdown responses from providers.
- Target providers: OpenAI Agents SDK (primary), OpenCode (optional/stub with clear error messaging if unavailable).
- Location: `experimental/pantheon` package (Esm/TS), hook into Pantheon CLI.

## Scope & Definition of Done

- New REPL entrypoint in `experimental/pantheon/src/repl.ts` supporting Lisp-ish `(ask ...)` parsing and streaming output to stdout.
- Provider registry with at least OpenAI Agents SDK implementation; OpenCode provider should be wired with graceful missing-SDK handling.
- CLI command `pantheon repl` (via existing CLI) to launch REPL.
- Streaming output prints markdown chunks from provider responses (no buffering-only mode).
- Documentation/spec captured here; code builds with `pnpm --filter @promethean-os/pantheon typecheck`.

## Files to touch

- `experimental/pantheon/src/repl.ts` (new)
- `experimental/pantheon/src/cli/index.ts` (add repl command)
- `experimental/pantheon/package.json` (dependency for @openai/agents)

## Open Questions / Assumptions

- OpenCode SDK may not be installed; will handle via dynamic import error message.
- Minimal Lisp parser: only `(ask ...)` with string question and keyword pairs `:provider`, `:agent`, `:model`, `:system`.

## Risks

- Streaming API differences across providers; mitigate with narrow adapter interface returning `AsyncIterable<string>`.
- Optional dependency import failures; provide actionable error messages.

## Timeline / Phases

1. Implement parser + provider interface + REPL loop in `src/repl.ts`.
2. Add OpenAI provider (Agents SDK streaming) and stub OpenCode provider.
3. Wire CLI command and ensure typecheck passes.

## Definition of Done Checklist

- [ ] `pantheon repl` starts a prompt, accepts `(ask ...)`, streams markdown output.
- [ ] OpenAI provider works with `OPENAI_API_KEY` set; error is clear if missing.
- [ ] OpenCode provider path exists with clear guidance if SDK/key missing.
- [ ] Typecheck succeeds for `@promethean-os/pantheon`.
