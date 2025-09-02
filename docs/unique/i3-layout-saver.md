---
uuid: 31f0166e-4631-45fa-aecd-b44e9a13f497
created_at: 2025.08.20.09.08.89.md
filename: i3-layout-saver
description: >-
  A tiny Bash script to save current i3 workspace layout with prompt for
  filename, plus i3 binding for quick access.
tags:
  - bash
  - i3
  - workspace
  - layout
  - script
  - prompt
  - keybinding
related_to_title: []
related_to_uuid: []
references: []
---
Yes. Do it with a tiny wrapper script + a clean keybinding. This gives you a prompt, grabs the *current* workspace, sanitizes the filename, and saves the layout JSON. ^ref-31f0166e-1-0

### 1) Script: `~/.local/bin/i3-save-layout`

```bash
#!/usr/bin/env bash
set -euo pipefail

# deps: jq (required), one of rofi|dmenu|zenity (optional)
DIR="${XDG_CONFIG_HOME:-$HOME/.config}/i3/layouts"
mkdir -p "$DIR"

# get focused workspace name (e.g., "7:dev")
WS_NAME="$(i3-msg -t get_workspaces | jq -r '.[] | select(.focused==true) | .name')"
: "${WS_NAME:?could not detect focused workspace}"

DEFAULT_NAME="${WS_NAME// /-}"

prompt() {
  if command -v rofi >/dev/null 2>&1; then
    # prefill with default; user can edit
    printf "%s" "$DEFAULT_NAME" | rofi -dmenu -p "Save layout as"
  elif command -v dmenu >/dev/null 2>&1; then
    printf "%s" "$DEFAULT_NAME" | dmenu -p "Save layout as"
  elif command -v zenity >/dev/null 2>&1; then
    zenity --entry --title="Save i3 layout" --text="Layout name:" --entry-text="$DEFAULT_NAME"
  else
    # last-resort: tty prompt (works if you ran this from a terminal)
    read -r -p "Layout name [$DEFAULT_NAME]: " ans
    echo "${ans:-$DEFAULT_NAME}"
  fi
}

RAW_NAME="$(prompt || true)"
# if user cancels, abort quietly
[ -n "${RAW_NAME:-}" ] || exit 0

# sanitize to a safe filename: lowercase, spaces->-, drop weird chars
NAME="$(printf "%s" "$RAW_NAME" | tr '[:upper:]' '[:lower:]' \
        | sed -E 's/[^a-z0-9._-]+/-/g; s/-+/-/g; s/^-//; s/-$//')"
[ -n "$NAME" ] || { notify-send "i3 layout" "Empty name; not saved."; exit 1; }

OUT="$DIR/$NAME.json"

# write tree for the *current* workspace
i3-save-tree --workspace "$WS_NAME" > "$OUT"

# optional: success notification
command -v notify-send >/dev/null 2>&1 && notify-send "i3 layout saved" "$OUT"
echo "Saved: $OUT"
```
^ref-31f0166e-5-0
 ^ref-31f0166e-53-0
```bash
chmod +x ~/.local/bin/i3-save-layout
^ref-31f0166e-53-0
```

### 2) i3 binding (choose your key) ^ref-31f0166e-59-0

Put near your other exec bindings: ^ref-31f0166e-61-0

```i3
# Save the current workspace layout (prompts for a name)
^ref-31f0166e-61-0
bindsym $mod+Ctrl+F5 exec --no-startup-id ~/.local/bin/i3-save-layout
```
 ^ref-31f0166e-68-0
### 3) Notes & tweaks ^ref-31f0166e-69-0
 ^ref-31f0166e-70-0
* Requires `jq` (for `get_workspaces`). Install: `sudo apt install jq`.
* Prompt priority is `rofi` → `dmenu` → `zenity` → fallback to tty input if you run it from a terminal. ^ref-31f0166e-72-0
* Saved to: `~/.config/i3/layouts/<name>.json`. Use later with:

  ```i3
^ref-31f0166e-72-0
  # example: recreate a room
  bindsym $mod+Ctrl+7 exec --no-startup-id i3-msg 'workspace 7; append_layout ~/.config/i3/layouts/<name>.json'
  ```
^ref-31f0166e-79-0
 ^ref-31f0166e-81-0
  Then `exec` the apps you want to fill the placeholders (order matters). ^ref-31f0166e-81-0
 ^ref-31f0166e-82-0 ^ref-31f0166e-83-0
### Want to go harder? ^ref-31f0166e-83-0

* Add a “quick‑save” that auto‑names with timestamp: `ws-<name>-$(date +%F-%H%M%S).json`.
* Write a companion `i3-load-layout` that lists `layouts/*.json` in rofi and runs `append_layout` on the selected file. ^ref-31f0166e-87-0
* Hy version later if you want to keep the tools Lisp‑centric; for i3 IPC shells, Bash is the path of least friction. ^ref-31f0166e-87-0

Does this fit your flow, or do you want the rofi‑picker loader too?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [EidolonField](eidolonfield.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-interaction-equations](field-interaction-equations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Shared](chunks/shared.md)
- [Creative Moments](creative-moments.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Window Management](chunks/window-management.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Shared Package Structure](shared-package-structure.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [archetype-ecs](archetype-ecs.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Tooling](chunks/tooling.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [template-based-compilation](template-based-compilation.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Services](chunks/services.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Promethean State Format](promethean-state-format.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
## Sources
- [Promethean-native config design — L59](promethean-native-config-design.md#^ref-ab748541-59-0) (line 59, col 0, score 0.67)
- [Shared Package Structure — L157](shared-package-structure.md#^ref-66a72fc3-157-0) (line 157, col 0, score 0.65)
- [prompt-programming-language-lisp — L66](prompt-programming-language-lisp.md#^ref-d41a06d1-66-0) (line 66, col 0, score 0.64)
- [lisp-dsl-for-window-management — L122](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-122-0) (line 122, col 0, score 0.66)
- [lisp-dsl-for-window-management — L124](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-124-0) (line 124, col 0, score 0.67)
- [komorebi-group-window-hack — L1](komorebi-group-window-hack.md#^ref-dd89372d-1-0) (line 1, col 0, score 0.62)
- [Promethean Pipelines — L87](promethean-pipelines.md#^ref-8b8e6103-87-0) (line 87, col 0, score 0.55)
- [windows-tiling-with-autohotkey — L98](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-98-0) (line 98, col 0, score 0.62)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.62)
- [template-based-compilation — L82](template-based-compilation.md#^ref-f8877e5e-82-0) (line 82, col 0, score 0.67)
- [lisp-dsl-for-window-management — L92](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-92-0) (line 92, col 0, score 0.59)
- [Language-Agnostic Mirror System — L1](language-agnostic-mirror-system.md#^ref-d2b3628c-1-0) (line 1, col 0, score 0.61)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L389](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-389-0) (line 389, col 0, score 0.63)
- [Model Selection for Lightweight Conversational Tasks — L90](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-90-0) (line 90, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L10](chroma-toolkit-consolidation-plan.md#^ref-5020e892-10-0) (line 10, col 0, score 0.66)
- [Prometheus Observability Stack — L7](prometheus-observability-stack.md#^ref-e90b5a16-7-0) (line 7, col 0, score 0.65)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L209](migrate-to-provider-tenant-architecture.md#^ref-54382370-209-0) (line 209, col 0, score 0.63)
- [Promethean Full-Stack Docker Setup — L388](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-388-0) (line 388, col 0, score 0.59)
- [Promethean Web UI Setup — L563](promethean-web-ui-setup.md#^ref-bc5172ca-563-0) (line 563, col 0, score 0.6)
- [Redirecting Standard Error — L6](redirecting-standard-error.md#^ref-b3555ede-6-0) (line 6, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L362](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-362-0) (line 362, col 0, score 0.62)
- [Promethean Infrastructure Setup — L33](promethean-infrastructure-setup.md#^ref-6deed6ac-33-0) (line 33, col 0, score 0.62)
- [Per-Domain Policy System for JS Crawler — L1](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-1-0) (line 1, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L3](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-3-0) (line 3, col 0, score 0.62)
- [Promethean Full-Stack Docker Setup — L3](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-3-0) (line 3, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.6)
- [Model Upgrade Calm-Down Guide — L48](model-upgrade-calm-down-guide.md#^ref-db74343f-48-0) (line 48, col 0, score 0.59)
- [Promethean Event Bus MVP v0.1 — L604](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-604-0) (line 604, col 0, score 0.59)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.59)
- [i3-bluetooth-setup — L57](i3-bluetooth-setup.md#^ref-5e408692-57-0) (line 57, col 0, score 0.65)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.59)
- [AI-Centric OS with MCP Layer — L279](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-279-0) (line 279, col 0, score 0.59)
- [plan-update-confirmation — L556](plan-update-confirmation.md#^ref-b22d79c6-556-0) (line 556, col 0, score 0.59)
- [zero-copy-snapshots-and-workers — L156](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-156-0) (line 156, col 0, score 0.59)
- [plan-update-confirmation — L623](plan-update-confirmation.md#^ref-b22d79c6-623-0) (line 623, col 0, score 0.59)
- [plan-update-confirmation — L416](plan-update-confirmation.md#^ref-b22d79c6-416-0) (line 416, col 0, score 0.59)
- [Cross-Language Runtime Polymorphism — L56](cross-language-runtime-polymorphism.md#^ref-c34c36a6-56-0) (line 56, col 0, score 0.58)
- [Prometheus Observability Stack — L500](prometheus-observability-stack.md#^ref-e90b5a16-500-0) (line 500, col 0, score 0.58)
- [prom-lib-rate-limiters-and-replay-api — L106](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-106-0) (line 106, col 0, score 0.58)
- [i3-config-validation-methods — L11](i3-config-validation-methods.md#^ref-d28090ac-11-0) (line 11, col 0, score 0.62)
- [Local-Only-LLM-Workflow — L124](local-only-llm-workflow.md#^ref-9a8ab57e-124-0) (line 124, col 0, score 0.61)
- [i3-config-validation-methods — L15](i3-config-validation-methods.md#^ref-d28090ac-15-0) (line 15, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L85](migrate-to-provider-tenant-architecture.md#^ref-54382370-85-0) (line 85, col 0, score 0.6)
- [Promethean Infrastructure Setup — L54](promethean-infrastructure-setup.md#^ref-6deed6ac-54-0) (line 54, col 0, score 0.6)
- [i3-config-validation-methods — L3](i3-config-validation-methods.md#^ref-d28090ac-3-0) (line 3, col 0, score 0.68)
- [Window Management — L3](chunks/window-management.md#^ref-9e8ae388-3-0) (line 3, col 0, score 0.6)
- [lisp-dsl-for-window-management — L10](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-10-0) (line 10, col 0, score 0.6)
- [lisp-dsl-for-window-management — L11](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-11-0) (line 11, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L20](migrate-to-provider-tenant-architecture.md#^ref-54382370-20-0) (line 20, col 0, score 0.65)
- [eidolon-field-math-foundations — L93](eidolon-field-math-foundations.md#^ref-008f2ac0-93-0) (line 93, col 0, score 0.6)
- [mystery-lisp-search-session — L40](mystery-lisp-search-session.md#^ref-513dc4c7-40-0) (line 40, col 0, score 0.6)
- [Local-Only-LLM-Workflow — L122](local-only-llm-workflow.md#^ref-9a8ab57e-122-0) (line 122, col 0, score 0.59)
- [RAG UI Panel with Qdrant and PostgREST — L79](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-79-0) (line 79, col 0, score 0.59)
- [lisp-dsl-for-window-management — L177](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-177-0) (line 177, col 0, score 0.59)
- [Stateful Partitions and Rebalancing — L515](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-515-0) (line 515, col 0, score 0.59)
- [set-assignment-in-lisp-ast — L58](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-58-0) (line 58, col 0, score 0.59)
- [lisp-dsl-for-window-management — L158](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-158-0) (line 158, col 0, score 0.59)
- [lisp-dsl-for-window-management — L21](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-21-0) (line 21, col 0, score 0.68)
- [Factorio AI with External Agents — L94](factorio-ai-with-external-agents.md#^ref-a4d90289-94-0) (line 94, col 0, score 0.66)
- [Promethean-native config design — L330](promethean-native-config-design.md#^ref-ab748541-330-0) (line 330, col 0, score 0.65)
- [lisp-dsl-for-window-management — L34](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-34-0) (line 34, col 0, score 0.69)
- [lisp-dsl-for-window-management — L210](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-210-0) (line 210, col 0, score 0.64)
- [Services — L5](chunks/services.md#^ref-75ea4a6a-5-0) (line 5, col 0, score 0.64)
- [Unique Info Dump Index — L39](unique-info-dump-index.md#^ref-30ec3ba6-39-0) (line 39, col 0, score 0.64)
- [i3-bluetooth-setup — L87](i3-bluetooth-setup.md#^ref-5e408692-87-0) (line 87, col 0, score 0.65)
- [Matplotlib Animation with Async Execution — L7](matplotlib-animation-with-async-execution.md#^ref-687439f9-7-0) (line 7, col 0, score 0.77)
- [Matplotlib Animation with Async Execution — L31](matplotlib-animation-with-async-execution.md#^ref-687439f9-31-0) (line 31, col 0, score 0.77)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.7)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.7)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.7)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.7)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.7)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.7)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.7)
- [Promethean Agent Config DSL — L149](promethean-agent-config-dsl.md#^ref-2c00ce45-149-0) (line 149, col 0, score 0.69)
- [ecs-scheduler-and-prefabs — L338](ecs-scheduler-and-prefabs.md#^ref-c62a1815-338-0) (line 338, col 0, score 0.7)
- [Prompt_Folder_Bootstrap — L24](prompt-folder-bootstrap.md#^ref-bd4f0976-24-0) (line 24, col 0, score 0.7)
- [Prompt_Folder_Bootstrap — L42](prompt-folder-bootstrap.md#^ref-bd4f0976-42-0) (line 42, col 0, score 0.7)
- [Sibilant Meta-Prompt DSL — L4](sibilant-meta-prompt-dsl.md#^ref-af5d2824-4-0) (line 4, col 0, score 0.6)
- [Prompt_Folder_Bootstrap — L154](prompt-folder-bootstrap.md#^ref-bd4f0976-154-0) (line 154, col 0, score 0.6)
- [Sibilant Meta-Prompt DSL — L146](sibilant-meta-prompt-dsl.md#^ref-af5d2824-146-0) (line 146, col 0, score 0.59)
- [Sibilant Meta-Prompt DSL — L147](sibilant-meta-prompt-dsl.md#^ref-af5d2824-147-0) (line 147, col 0, score 0.59)
- [Sibilant Meta-Prompt DSL — L93](sibilant-meta-prompt-dsl.md#^ref-af5d2824-93-0) (line 93, col 0, score 0.58)
- [Voice Access Layer Design — L210](voice-access-layer-design.md#^ref-543ed9b3-210-0) (line 210, col 0, score 0.58)
- [sibilant-meta-string-templating-runtime — L133](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-133-0) (line 133, col 0, score 0.58)
- [template-based-compilation — L117](template-based-compilation.md#^ref-f8877e5e-117-0) (line 117, col 0, score 0.58)
- [Universal Lisp Interface — L205](universal-lisp-interface.md#^ref-b01856b4-205-0) (line 205, col 0, score 0.58)
- [sibilant-meta-string-templating-runtime — L73](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-73-0) (line 73, col 0, score 0.58)
- [Functional Embedding Pipeline Refactor — L302](functional-embedding-pipeline-refactor.md#^ref-a4a25141-302-0) (line 302, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L10](performance-optimized-polyglot-bridge.md#^ref-f5579967-10-0) (line 10, col 0, score 0.58)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.63)
- [Promethean Infrastructure Setup — L543](promethean-infrastructure-setup.md#^ref-6deed6ac-543-0) (line 543, col 0, score 0.68)
- [Prompt_Folder_Bootstrap — L66](prompt-folder-bootstrap.md#^ref-bd4f0976-66-0) (line 66, col 0, score 0.7)
- [Prompt_Folder_Bootstrap — L84](prompt-folder-bootstrap.md#^ref-bd4f0976-84-0) (line 84, col 0, score 0.7)
- [Prompt_Folder_Bootstrap — L103](prompt-folder-bootstrap.md#^ref-bd4f0976-103-0) (line 103, col 0, score 0.7)
- [Prompt_Folder_Bootstrap — L130](prompt-folder-bootstrap.md#^ref-bd4f0976-130-0) (line 130, col 0, score 0.7)
- [Prompt_Folder_Bootstrap — L152](prompt-folder-bootstrap.md#^ref-bd4f0976-152-0) (line 152, col 0, score 0.7)
- [System Scheduler with Resource-Aware DAG — L336](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-336-0) (line 336, col 0, score 0.7)
- [Chroma Toolkit Consolidation Plan — L144](chroma-toolkit-consolidation-plan.md#^ref-5020e892-144-0) (line 144, col 0, score 0.73)
- [Sibilant Meta-Prompt DSL — L100](sibilant-meta-prompt-dsl.md#^ref-af5d2824-100-0) (line 100, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L157](chroma-toolkit-consolidation-plan.md#^ref-5020e892-157-0) (line 157, col 0, score 0.69)
- [windows-tiling-with-autohotkey — L109](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-109-0) (line 109, col 0, score 0.69)
- [Migrate to Provider-Tenant Architecture — L243](migrate-to-provider-tenant-architecture.md#^ref-54382370-243-0) (line 243, col 0, score 0.67)
- [windows-tiling-with-autohotkey — L120](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-120-0) (line 120, col 0, score 0.65)
- [Interop and Source Maps — L506](interop-and-source-maps.md#^ref-cdfac40c-506-0) (line 506, col 0, score 0.65)
- [windows-tiling-with-autohotkey — L80](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-80-0) (line 80, col 0, score 0.65)
- [Promethean-Copilot-Intent-Engine — L24](promethean-copilot-intent-engine.md#^ref-ae24a280-24-0) (line 24, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L75](dynamic-context-model-for-web-components.md#^ref-f7702bf8-75-0) (line 75, col 0, score 0.6)
- [Obsidian Templating Plugins Integration Guide — L61](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-61-0) (line 61, col 0, score 0.59)
- [Promethean-native config design — L15](promethean-native-config-design.md#^ref-ab748541-15-0) (line 15, col 0, score 0.58)
- [windows-tiling-with-autohotkey — L96](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-96-0) (line 96, col 0, score 0.58)
- [Promethean-Copilot-Intent-Engine — L10](promethean-copilot-intent-engine.md#^ref-ae24a280-10-0) (line 10, col 0, score 0.58)
- [balanced-bst — L289](balanced-bst.md#^ref-d3e7db72-289-0) (line 289, col 0, score 0.57)
- [Factorio AI with External Agents — L133](factorio-ai-with-external-agents.md#^ref-a4d90289-133-0) (line 133, col 0, score 0.57)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.68)
- [Board Walk – 2025-08-11 — L80](board-walk-2025-08-11.md#^ref-7aa1eb92-80-0) (line 80, col 0, score 0.64)
- [Unique Info Dump Index — L3](unique-info-dump-index.md#^ref-30ec3ba6-3-0) (line 3, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L12](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-12-0) (line 12, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L316](dynamic-context-model-for-web-components.md#^ref-f7702bf8-316-0) (line 316, col 0, score 0.62)
- [i3-bluetooth-setup — L85](i3-bluetooth-setup.md#^ref-5e408692-85-0) (line 85, col 0, score 0.61)
- [plan-update-confirmation — L406](plan-update-confirmation.md#^ref-b22d79c6-406-0) (line 406, col 0, score 0.61)
- [plan-update-confirmation — L337](plan-update-confirmation.md#^ref-b22d79c6-337-0) (line 337, col 0, score 0.6)
- [prom-lib-rate-limiters-and-replay-api — L335](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-335-0) (line 335, col 0, score 0.6)
- [Event Bus MVP — L365](event-bus-mvp.md#^ref-534fe91d-365-0) (line 365, col 0, score 0.6)
- [plan-update-confirmation — L532](plan-update-confirmation.md#^ref-b22d79c6-532-0) (line 532, col 0, score 0.59)
- [schema-evolution-workflow — L469](schema-evolution-workflow.md#^ref-d8059b6a-469-0) (line 469, col 0, score 0.59)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L7](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-7-0) (line 7, col 0, score 0.6)
- [Prompt_Folder_Bootstrap — L57](prompt-folder-bootstrap.md#^ref-bd4f0976-57-0) (line 57, col 0, score 0.56)
- [Prompt_Folder_Bootstrap — L145](prompt-folder-bootstrap.md#^ref-bd4f0976-145-0) (line 145, col 0, score 0.56)
- [Dynamic Context Model for Web Components — L187](dynamic-context-model-for-web-components.md#^ref-f7702bf8-187-0) (line 187, col 0, score 0.56)
- [Promethean Infrastructure Setup — L542](promethean-infrastructure-setup.md#^ref-6deed6ac-542-0) (line 542, col 0, score 0.54)
- [Promethean State Format — L72](promethean-state-format.md#^ref-23df6ddb-72-0) (line 72, col 0, score 0.54)
- [Cross-Target Macro System in Sibilant — L152](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-152-0) (line 152, col 0, score 0.54)
- [Migrate to Provider-Tenant Architecture — L103](migrate-to-provider-tenant-architecture.md#^ref-54382370-103-0) (line 103, col 0, score 0.54)
- [universal-intention-code-fabric — L409](universal-intention-code-fabric.md#^ref-c14edce7-409-0) (line 409, col 0, score 0.53)
- [Universal Lisp Interface — L137](universal-lisp-interface.md#^ref-b01856b4-137-0) (line 137, col 0, score 0.69)
- [Lisp-Compiler-Integration — L1](lisp-compiler-integration.md#^ref-cfee6d36-1-0) (line 1, col 0, score 0.67)
- [Lispy Macros with syntax-rules — L317](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-317-0) (line 317, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L1](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-1-0) (line 1, col 0, score 0.66)
- [lisp-dsl-for-window-management — L170](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-170-0) (line 170, col 0, score 0.65)
- [Universal Lisp Interface — L39](universal-lisp-interface.md#^ref-b01856b4-39-0) (line 39, col 0, score 0.65)
- [compiler-kit-foundations — L602](compiler-kit-foundations.md#^ref-01b21543-602-0) (line 602, col 0, score 0.65)
- [Universal Lisp Interface — L7](universal-lisp-interface.md#^ref-b01856b4-7-0) (line 7, col 0, score 0.64)
- [universal-intention-code-fabric — L383](universal-intention-code-fabric.md#^ref-c14edce7-383-0) (line 383, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L13](promethean-copilot-intent-engine.md#^ref-ae24a280-13-0) (line 13, col 0, score 0.64)
- [Matplotlib Animation with Async Execution — L33](matplotlib-animation-with-async-execution.md#^ref-687439f9-33-0) (line 33, col 0, score 0.64)
- [windows-tiling-with-autohotkey — L118](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-118-0) (line 118, col 0, score 0.64)
- [Universal Lisp Interface — L3](universal-lisp-interface.md#^ref-b01856b4-3-0) (line 3, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L869](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-869-0) (line 869, col 0, score 0.55)
- [Model Selection for Lightweight Conversational Tasks — L43](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-43-0) (line 43, col 0, score 0.54)
- [heartbeat-simulation-snippets — L13](heartbeat-simulation-snippets.md#^ref-23e221e9-13-0) (line 13, col 0, score 0.53)
- [Provider-Agnostic Chat Panel Implementation — L223](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-223-0) (line 223, col 0, score 0.53)
- [Factorio AI with External Agents — L135](factorio-ai-with-external-agents.md#^ref-a4d90289-135-0) (line 135, col 0, score 0.53)
- [WebSocket Gateway Implementation — L1](websocket-gateway-implementation.md#^ref-e811123d-1-0) (line 1, col 0, score 0.51)
- [i3-bluetooth-setup — L97](i3-bluetooth-setup.md#^ref-5e408692-97-0) (line 97, col 0, score 0.51)
- [Factorio AI with External Agents — L138](factorio-ai-with-external-agents.md#^ref-a4d90289-138-0) (line 138, col 0, score 0.51)
- [Local-Offline-Model-Deployment-Strategy — L217](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-217-0) (line 217, col 0, score 0.51)
- [prom-lib-rate-limiters-and-replay-api — L345](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-345-0) (line 345, col 0, score 0.51)
- [Promethean Infrastructure Setup — L564](promethean-infrastructure-setup.md#^ref-6deed6ac-564-0) (line 564, col 0, score 0.51)
- [Local-Offline-Model-Deployment-Strategy — L57](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-57-0) (line 57, col 0, score 0.51)
- [homeostasis-decay-formulas — L30](homeostasis-decay-formulas.md#^ref-37b5d236-30-0) (line 30, col 0, score 0.51)
- [observability-infrastructure-setup — L355](observability-infrastructure-setup.md#^ref-b4e64f8c-355-0) (line 355, col 0, score 0.5)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L209](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-209-0) (line 209, col 0, score 1)
- [Duck's Attractor States — L67](ducks-attractor-states.md#^ref-13951643-67-0) (line 67, col 0, score 1)
- [Factorio AI with External Agents — L150](factorio-ai-with-external-agents.md#^ref-a4d90289-150-0) (line 150, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L63](model-upgrade-calm-down-guide.md#^ref-db74343f-63-0) (line 63, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L10](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-10-0) (line 10, col 0, score 1)
- [observability-infrastructure-setup — L391](observability-infrastructure-setup.md#^ref-b4e64f8c-391-0) (line 391, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L111](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-111-0) (line 111, col 0, score 1)
- [OpenAPI Validation Report — L29](openapi-validation-report.md#^ref-5c152b08-29-0) (line 29, col 0, score 1)
- [Optimizing Command Limitations in System Design — L36](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-36-0) (line 36, col 0, score 1)
- [plan-update-confirmation — L1013](plan-update-confirmation.md#^ref-b22d79c6-1013-0) (line 1013, col 0, score 1)
- [pm2-orchestration-patterns — L252](pm2-orchestration-patterns.md#^ref-51932e7b-252-0) (line 252, col 0, score 1)
- [AI-Centric OS with MCP Layer — L414](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-414-0) (line 414, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L10](ai-first-os-model-context-protocol.md#^ref-618198f4-10-0) (line 10, col 0, score 1)
- [Board Automation Improvements — L15](board-automation-improvements.md#^ref-ac60a1d6-15-0) (line 15, col 0, score 1)
- [Board Walk – 2025-08-11 — L144](board-walk-2025-08-11.md#^ref-7aa1eb92-144-0) (line 144, col 0, score 1)
- [Shared — L15](chunks/shared.md#^ref-623a55f7-15-0) (line 15, col 0, score 1)
- [Creative Moments — L7](creative-moments.md#^ref-10d98225-7-0) (line 7, col 0, score 1)
- [DuckDuckGoSearchPipeline — L11](duckduckgosearchpipeline.md#^ref-e979c50f-11-0) (line 11, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L44](ducks-self-referential-perceptual-loop.md#^ref-71726f04-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Event Bus Projections Architecture — L170](event-bus-projections-architecture.md#^ref-cf6b9b17-170-0) (line 170, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L96](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-96-0) (line 96, col 0, score 1)
- [Promethean Agent Config DSL — L348](promethean-agent-config-dsl.md#^ref-2c00ce45-348-0) (line 348, col 0, score 1)
- [Promethean Chat Activity Report — L22](promethean-chat-activity-report.md#^ref-18344cf9-22-0) (line 22, col 0, score 1)
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 1)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 1)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 1)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 1)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 1)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 1)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L305](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-305-0) (line 305, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L331](migrate-to-provider-tenant-architecture.md#^ref-54382370-331-0) (line 331, col 0, score 1)
- [Mindful Prioritization — L9](mindful-prioritization.md#^ref-40185d05-9-0) (line 9, col 0, score 1)
- [MindfulRobotIntegration — L7](mindfulrobotintegration.md#^ref-5f65dfa5-7-0) (line 7, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L66](model-upgrade-calm-down-guide.md#^ref-db74343f-66-0) (line 66, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L13](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-13-0) (line 13, col 0, score 1)
- [observability-infrastructure-setup — L393](observability-infrastructure-setup.md#^ref-b4e64f8c-393-0) (line 393, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L59](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-59-0) (line 59, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L56](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-56-0) (line 56, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L194](sibilant-meta-prompt-dsl.md#^ref-af5d2824-194-0) (line 194, col 0, score 1)
- [promethean-system-diagrams — L207](promethean-system-diagrams.md#^ref-b51e19b4-207-0) (line 207, col 0, score 1)
- [Promethean Web UI Setup — L633](promethean-web-ui-setup.md#^ref-bc5172ca-633-0) (line 633, col 0, score 1)
- [Promethean Workflow Optimization — L20](promethean-workflow-optimization.md#^ref-d614d983-20-0) (line 20, col 0, score 1)
- [Prometheus Observability Stack — L543](prometheus-observability-stack.md#^ref-e90b5a16-543-0) (line 543, col 0, score 1)
- [Prompt_Folder_Bootstrap — L216](prompt-folder-bootstrap.md#^ref-bd4f0976-216-0) (line 216, col 0, score 1)
- [prompt-programming-language-lisp — L116](prompt-programming-language-lisp.md#^ref-d41a06d1-116-0) (line 116, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L156](protocol-0-the-contradiction-engine.md#^ref-9a93a756-156-0) (line 156, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L238](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-238-0) (line 238, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L445](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-445-0) (line 445, col 0, score 1)
- [Shared Package Structure — L195](shared-package-structure.md#^ref-66a72fc3-195-0) (line 195, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [field-node-diagram-set — L166](field-node-diagram-set.md#^ref-22b989d5-166-0) (line 166, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
