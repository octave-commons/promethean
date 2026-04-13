---
name: frontend-worker
description: Implements React dashboard UI features including components, styling, animations, and browser-side compute
---

# Frontend Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Use for features involving:
- React component creation/modification in threat-radar-web
- CSS styling and animations
- SVG/canvas gauge and clock visualizations
- Dashboard layout changes
- Personalization controls
- Browser-side compute integration (signal-embed-browser)
- Any user-facing UI work

## Work Procedure

1. **Read the feature description thoroughly.** Check the UI mockup code in the mission context for reference component patterns. Check `.factory/library/architecture.md` for data flow.

2. **Understand the data shape.** Read `@workspace/radar-core` types that this component will consume. The API is at `http://localhost:9001` — check `GET /api/radars` for the data format.

3. **Write component tests first.** Create test files using vitest + React Testing Library (if available) or basic vitest tests for logic. At minimum, test that components render without crashing and display expected data.

4. **Implement the component.** Follow existing patterns in `orgs/riatzukiza/threat-radar-web/src/ui/`:
   - Functional components with hooks
   - CSS in `src/ui/styles.css` (plain CSS, dark theme, use existing color variables)
   - SVG for gauges and clocks (see existing `SweepClock` pattern)
   - Fetch from API using `fetch()` with polling interval

5. **Verify visually with agent-browser.**
   - Ensure threat-radar-mcp is running on 9001 (start if needed using `.factory/services.yaml`)
   - Start threat-radar-web: `cd orgs/riatzukiza/threat-radar-web && VITE_API_URL=http://localhost:9001 npx vite --port 9002`
   - Use `agent-browser open http://localhost:9002` to view
   - Use `agent-browser screenshot /tmp/dashboard-check.png` to capture
   - Check: Does it match the feature's expected behavior? Are animations smooth? Is text readable?
   - Stop dev servers when done

6. **Run typecheck.** `cd orgs/riatzukiza/threat-radar-web && npx tsc -p tsconfig.json --noEmit`

7. **Commit.** Stage only files you created/modified.

## Example Handoff

```json
{
  "salientSummary": "Implemented 3-lane layout with η (Global), μ (Local), and Π (Connections) columns in App.tsx; added lane header components with icons; verified layout renders correctly via agent-browser screenshot; typecheck passes with 0 errors.",
  "whatWasImplemented": "Created LaneHeader, GlobalLane, LocalLane, ConnectionsLane components in src/ui/. Updated App.tsx to render 3-column grid layout. Added CSS for lane colors (cyan for η, emerald for μ, fuchsia for Π) and responsive breakpoints. Each lane filters radars by category tag.",
  "whatWasLeftUndone": "",
  "verification": {
    "commandsRun": [
      { "command": "cd orgs/riatzukiza/threat-radar-web && npx tsc -p tsconfig.json --noEmit", "exitCode": 0, "observation": "no type errors" },
      { "command": "cd orgs/riatzukiza/threat-radar-web && npx vitest run", "exitCode": 0, "observation": "3 tests passed" }
    ],
    "interactiveChecks": [
      { "action": "agent-browser open http://localhost:9002", "observed": "Dashboard loads with 3 columns labeled η Global News, Localized Reach, and Π Connections" },
      { "action": "agent-browser screenshot /tmp/3-lane-layout.png", "observed": "Screenshot shows dark theme, 3 distinct colored lanes, radar cards in each lane" }
    ]
  },
  "tests": {
    "added": [
      {
        "file": "orgs/riatzukiza/threat-radar-web/src/ui/__tests__/lanes.test.tsx",
        "cases": [
          { "name": "GlobalLane renders with geopolitical radars", "verifies": "η lane filters and displays global-tagged radars" },
          { "name": "LocalLane renders with community radars", "verifies": "μ lane filters and displays local-tagged radars" }
        ]
      }
    ]
  },
  "discoveredIssues": []
}
```

## When to Return to Orchestrator

- API endpoint needed by the UI doesn't exist yet
- Data shape from API doesn't match what the component needs
- Cannot install a required React dependency without breaking other packages
- agent-browser cannot interact with a specific UI element (accessibility issue)
- Animation performance is poor and needs architectural change
