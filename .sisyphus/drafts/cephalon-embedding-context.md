# Draft: Cephalon Embedding Context Size

## Requirements (confirmed)
- Reduce embedding model context size in `services/cephalon-cljs` to lower GPU memory usage so it can co-exist with the LLM.
- Target workload is Discord messages; inputs are small and do not require large context windows.
- Suspected issue: embedding requests may be passing the wrong context size, defaulting to very large values (e.g., 32000).
- Need configurable knobs for context size of both embedding and LLM models (env-driven or config-driven).
- Focus immediate change on shrinking embedding context size to fit with the current LLM.
- LLM context size should be configurable (aiming for 64k for qwen3-vl-4b-instruct), but user expects to tune based on memory limits.
- Constraint: OpenAI-compatible API likely cannot set `num_ctx` per request.

## Technical Decisions
- Target embedding context size: 4096.
- Context size settings should live in config defaults with env overrides.
- Default LLM context size: 64000.
- Env var names: `CEPHALON_EMBED_NUM_CTX` and `CEPHALON_LLM_NUM_CTX`.
- Enforce both embedding and chat `num_ctx` by switching to the Ollama native API for those requests.
- Use the Ollama npm module for native API calls.
- Add the Ollama npm module dependency to `services/cephalon-cljs`.

## Research Findings
- Embedding model name comes from config in `services/cephalon-cljs/src/promethean/main.cljs` and defaults to `qwen3-embedding` (`:models :embedding`).
- Embedding effect is created in `services/cephalon-cljs/src/promethean/sys/eidolon.cljs` and only carries `:model` + `:input`.
- Effect execution in `services/cephalon-cljs/src/promethean/sys/effects.cljs` passes only `{:model :input}` to `promethean.llm.openai/embed!`.
- OpenAI embedding request payload in `services/cephalon-cljs/src/promethean/llm/openai.cljs` includes only `model` and `input` (no context-size options today).
- Current env vars read in `services/cephalon-cljs/src/promethean/main.cljs` only cover OpenAI/Discord/TS bridge (no context-size env vars in this package today).
- `services/cephalon-ts` already uses the `ollama` npm module and `OLLAMA_BASE_URL` (see `services/cephalon-ts/src/llm/ollama.ts` and `services/cephalon-ts/src/config/defaults.ts`).
- Test infrastructure exists: `services/cephalon-cljs/shadow-cljs.edn` defines a `:test` build targeting `promethean.test-runner/-main`, output `dist/test.js`.
- `services/cephalon-cljs/package.json` only defines `build` script; tests run via Shadow-CLJS `:test` build rather than an npm `test` script.

## Open Questions
- Which embedding backend is used in this environment (e.g., `qwen3-embedding`), and does it accept `num_ctx` or a different parameter name?

## Scope Boundaries
- INCLUDE: Switch chat + embedding requests in `services/cephalon-cljs` to the Ollama npm module; add context-size config/env overrides.
- EXCLUDE: Unrelated model tuning or changes outside cephalon-cljs (Ollama server config/model files remain out of scope).

## Test Strategy Decision
- Infrastructure exists: YES (Shadow-CLJS; `services/cephalon-cljs/shadow-cljs.edn` has a `:test` build).
- User wants tests: YES (TDD).
- QA approach: TDD (Shadow-CLJS test build).
