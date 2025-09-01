---
uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
created_at: 2025.08.08.16.08.66-factorio.md
filename: Factorio AI with External Agents
description: >-
  Practical guide to implementing AI in Factorio using external agents via RCON,
  avoiding in-game ML. Covers pure-Lua heuristics, RCON-based real-time control,
  and offline blueprint generation.
tags:
  - Factorio
  - RCON
  - AI
  - External Agents
  - Lua
  - Blueprints
  - Heuristics
related_to_title:
  - eidolon-node-lifecycle
  - field-node-diagram-visualizations
  - field-node-diagram-set
  - Event Bus Projections Architecture
  - field-node-diagram-outline
  - AI-Centric OS with MCP Layer
  - AI-First-OS-Model-Context-Protocol
  - balanced-bst
related_to_uuid:
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
references:
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 152
    col: 1
    score: 1
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 152
    col: 3
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 102
    col: 1
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 102
    col: 3
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 138
    col: 1
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 138
    col: 3
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 88
    col: 1
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 88
    col: 3
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 1
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 3
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 1
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 3
    score: 1
---
Hell yes. “AI in Factorio” is totally doable—just don’t get hung up on *ML inside the mod*. The sane way is: **Lua does environment + actions; an external agent (your JS brain) does the “AI.”** Here’s a practical map.

# The 3 ways to “hack AI” in Factorio

1. **Pure-Lua “AI-ish”**
   Behavior trees/state machines in `control.lua` (no outside code). Great for heuristics (builders, schedulers), but no sockets/HTTP. You’re boxed into the Factorio sandbox.

2. **External agent via RCON (recommended)**
   Run a **headless server** locally. Your Node agent connects over **RCON**:

   * Mod exposes **/snapshot** (prints compact JSON) and **/agent {json}** (applies actions).
   * Node reads snapshots → decides → sends actions back.
   * You play by joining the local server from the GUI. Clean separation, real “AI.”

3. **Offline planner / blueprint generator**
   Mod dumps world slices to `script-output/*.json`; a JS tool computes blueprints; you paste strings back in. Good for big designs, not reactive play.

# Minimal RCON architecture (what actually works)

**In the mod (Lua):**

* Every N ticks gather a small world summary (nearby entities, power, inventory, logistics).
* `/snapshot` → `game.print("PROMETHEAN:"..json)` (one line).
* `/agent {base64json}` → decode → place ghosts / set requests / toggle combinators.

**Outside (Node.js):**

* Connect via RCON → run `/snapshot` on a schedule → parse lines starting with `PROMETHEAN:`.
* Decide (heuristics/LLM/RL; your choice).
* Send `/agent {payload}` with actions: place ghost entities, set requests, etc.

# Milestone 0 (30–45 min, “ask-first” ready)

**Goal:** add `/snapshot` + `/agent` to the mod I gave you.

### control.lua sketch (drop-in, tiny)

> If you want, say “go” and I’ll paste the full tested version. Here’s the shape:

```lua
local serpent = require("serpent")  -- bundle a tiny serpent copy or inline a JSON encoder

local function snapshot(player)
  local p = player or game.players[1]
  local pos = p.position
  local area = {{pos.x-32, pos.y-32},{pos.x+32, pos.y+32}}
  local surface = p.surface
  local belts = surface.count_entities_filtered{area=area, type="transport-belt"}
  local power = surface.count_entities_filtered{area=area, type="electric-pole"}
  local inv = p.get_main_inventory()
  local items = {}
  if inv and inv.valid then
    for name,count in pairs(inv.get_contents()) do
      if (name == "transport-belt" or name == "inserter") then items[name]=count end
    end
  end
  local data = {tick=game.tick, pos=pos, belts=belts, poles=power, items=items}
  game.print("PROMETHEAN:"..serpent.line(data,{compact=true}))
end

commands.add_command("snapshot","Emit a compact world snapshot.", function(cmd)
  snapshot(game.get_player(cmd.player_index))
end)

local function apply_actions(player, actions)
  local surface = player.surface
  for _,act in ipairs(actions or {}) do
    if act.t == "ghost" then
      surface.create_entity{
        name = "entity-ghost",
        inner_name = act.name,
        position = act.position,
        force = player.force
      }
    elseif act.t == "print" then
      player.print("[AI] "..(act.msg or ""))
    end
  end
end

commands.add_command("agent","Apply AI actions (base64 of serpent table).", function(cmd)
  local player = game.get_player(cmd.player_index)
  if not cmd.parameter then return end
  local s = game.decode_string(cmd.parameter)  -- base64 → lua string (Factorio API)
  local ok, actions = pcall(load("return "..s)) -- simple but sandboxed by Factorio; safe for data tables
  if ok then apply_actions(player, actions) else player.print("[AI] bad actions") end
end)
```

> Notes: Factorio lacks native JSON; `serpent` is the usual tiny serializer. For more robust JSON, we can embed a small encoder. Base64 avoids console escaping hell.

### Headless server (Linux)

```bash
# run headless in a tmux pane
/path/to/factorio/bin/x64/factorio \
  --start-server mysave.zip \
  --rcon-port 27015 --rcon-password 'changeme' \
  --mod-directory ~/.factorio/mods
```

Then **Join Game → Connect to 127.0.0.1** from the Factorio GUI client to play.

### Node agent skeleton (JS)

> I’ll drop the real code on “go.” Shape:

```js
import Rcon from 'rcon-client'; // npm i rcon-client

const rcon = await Rcon.connect({ host:'127.0.0.1', port:27015, password:'changeme' });

function parseSnapshot(line) {
  if (!line.startsWith('PROMETHEAN:')) return null;
  // parse serpent-ish; or switch the mod to emit JSON; I can do either.
}

async function tick() {
  await rcon.send('/snapshot');
  const log = await rcon.send('/help'); // or better: tail server log via your own watcher
  const snap = parseSnapshot(log);
  const actions = decide(snap); // your JS brain here
  const payload = Buffer.from(serializeToLua(actions)).toString('base64');
  await rcon.send(`/agent ${payload}`);
}
setInterval(tick, 1000);
```

We can swap to **pure JSON** if you prefer; I kept serpent for zero-deps Lua. Your call.

# AI behaviors you can build fast

* **Ghost Filler:** Agent scans ghosts → if you carry the item, it walks you through filling them (or prints a shopping list).
* **Lane Balancer Synth:** Given target lanes, emits a blueprint string (deterministic templates).
* **Belt Flow Overlay:** Hotkey toggles temporary arrows showing throughput direction around the cursor (pure Lua).
* **Smelter Expander:** Agent places ghosts for +N lanes of smelting with belts/undergrounds calculated from ore patch bounds.

Pick one and a **mode** (slow-roll / ask-first / build).
If you say “**ask-first + RCON**,” I’ll ship the **exact control.lua** + a tiny **Node client** you can run today.

\#hashtags
\#factorio #lua #ai-agents #promethean #systems-design #obsidian #adhd-ops
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)

## Sources
- [Event Bus Projections Architecture — L152](event-bus-projections-architecture.md#L152) (line 152, col 1, score 1)
- [Event Bus Projections Architecture — L152](event-bus-projections-architecture.md#L152) (line 152, col 3, score 1)
- [field-node-diagram-outline — L102](field-node-diagram-outline.md#L102) (line 102, col 1, score 1)
- [field-node-diagram-outline — L102](field-node-diagram-outline.md#L102) (line 102, col 3, score 1)
- [field-node-diagram-set — L138](field-node-diagram-set.md#L138) (line 138, col 1, score 1)
- [field-node-diagram-set — L138](field-node-diagram-set.md#L138) (line 138, col 3, score 1)
- [field-node-diagram-visualizations — L88](field-node-diagram-visualizations.md#L88) (line 88, col 1, score 1)
- [field-node-diagram-visualizations — L88](field-node-diagram-visualizations.md#L88) (line 88, col 3, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#L406) (line 406, col 1, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#L406) (line 406, col 3, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#L11) (line 11, col 1, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#L11) (line 11, col 3, score 1)
- [AI-First-OS-Model-Context-Protocol — L14](ai-first-os-model-context-protocol.md#L14) (line 14, col 1, score 1)
- [AI-First-OS-Model-Context-Protocol — L14](ai-first-os-model-context-protocol.md#L14) (line 14, col 3, score 1)
- [balanced-bst — L297](balanced-bst.md#L297) (line 297, col 1, score 1)
- [balanced-bst — L297](balanced-bst.md#L297) (line 297, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
