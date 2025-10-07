# Data Structure Abstraction Opportunities

## 1. Index pipelines by name once
- **What we do today:** Multiple Piper entry points scan `cfg.pipelines` with `Array.prototype.find` every time a request references a pipeline name. Examples include the CLI status command and both `/api/run` handlers in the Fastify service, all of which perform linear scans per lookup.【F:packages/piper/src/status.ts†L18-L50】【F:packages/piper/src/server/routes/pipelines.ts†L101-L186】
- **Why it hurts:** Each request duplicates the same search work and makes the code harder to share. The repeated `find` calls also make it easy to forget edge cases (e.g., step validation) because the lookup logic lives in several places.
- **Better option:** Parse the config once into an immutable `Map<string, Pipeline>` and expose helpers such as `getPipeline(name)` and `getStep(pipelineName, stepId)`. We can keep that map in module scope (config is static) or pass it alongside the parsed config so all call sites share the same lookup table. Besides O(1) lookups, a common helper ensures consistent error messages.

## 2. Prefer `Set` membership for queue/contract checks
- **What we do today:** Several flows rely on repeated `Array.prototype.includes` to test membership, such as speech arbitration adding utterance IDs back into a queue and migration contract validation checking if collections exist.【F:packages/agent-ecs/src/systems/speechArbiter.ts†L31-L123】【F:packages/migrations/src/contract.ts†L18-L37】 The MCP origin allow-list uses the same pattern when gatekeeping CORS origins.【F:packages/mcp/src/auth.ts†L1-L7】
- **Why it hurts:** Membership checks on arrays stay O(n), so hot paths like the speech arbiter end up quadratic when they loop over every utterance and call `includes`. The allow-list and migration checks also become noisy as the list grows.
- **Better option:** Convert those hot arrays into `Set`s once $e.g., `new Set(queue.items)`$, giving O(1) membership checks and clearer intent. For queue mutation, derive a fresh array from the set when writing back to ECS to keep immutability guarantees intact.

## 3. Use a priority queue for utterance scheduling
- **What we do today:** The speech arbiter rebuilds and resorts the utterance list each tick to pick the highest-priority queued utterance, then filters the array again to dequeue the picked element.【F:packages/agent-ecs/src/systems/speechArbiter.ts†L31-L123】
- **Why it hurts:** Resorting `items` every frame is O$n log n$ per tick even when few utterances change, and filtering to remove the picked entry adds another O(n). As concurrency grows we spend most of the tick rebuilding the same ordering.
- **Better option:** Maintain a min-/max-heap keyed by utterance priority $or `Map` + `BinaryHeap`$. Push/pop operations stay O$log n$, and the data structure naturally gives us the next utterance without re-sorting the entire list. We can still keep the authoritative array on the ECS component by deriving it from the heap when needed.

## Human operator follow-up
- Draft a small RFC describing the shared pipeline lookup helper (API shape, caching strategy) so we can scope the refactor and align call sites before coding.
