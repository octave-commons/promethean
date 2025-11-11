## OpenHax Project Analysis

**Current State**: Empty git repository at `/home/err/devel/riatzukiza/openhax` with no commits or source files.

**Task**: Implement Opencode Reactant system - an event-driven GitHub + worktrees + PR agents system with:
- Reagent frontend (shadow-cljs + ClojureScript)
- Node/TypeScript backend daemon
- Event-sourced architecture
- GitHub API integration
- Git worktree management
- WebSocket communication

**Implementation Plan**:
1. Create monorepo structure (packages/, services/, shared/)
2. Setup Reagent frontend with shadow-cljs
3. Implement Node/TS backend with Fastify + Octokit
4. Add event bus and WebSocket layer
5. Implement git worktree automation
6. Add agent system for event-driven responses

**Next Steps**: Start with monorepo structure and package.json setup