
## Description

Agents will either crash the game, or require special behavior, if navigating ungenerated chunks. This breaks player immersion and many problems. There should be a way to effectively manage game sectors before the agent gets there. I believe the threaded implementation of wave function collapse is working to this end, but some testing is still required. 
## Related Epics

- [[Game Mechanics]]
- [[paralell processing for each system]]
- 
## Requirements

- Tile chunks load reasonably quick enough to not require frequent main thread blocking.
- If the chunk loader can't load them quickly enough, the main thread should be blocked 
- Ideally, if the main thread is blocked, it is not idle, and it is able to contribute to chunk generation.
- Chunk generation order is prioritized base on proximity to agents.
- Game mechanics prevent by design agents requireing chunks to be loaded faster than they can be generated.
	- Agent's need for food or shelter should require them to head back to explored chunks often enough that the chunk loader has time to generate chunks the agent is likely to explore.
	- Agent's exploration behavior should prioritize, if reasonable, unexplored chunks that are loaded

## Tasks 
- [x] implement tile generator worker ✅ 2025-01-19
- [x] optimize world generation system ✅ 2025-01-19
- [x] implement priority queue for chunk loading. ✅ 2025-01-19
- [ ] Add logic to exploration to avoid unexplored chunks that have not been loaded.
