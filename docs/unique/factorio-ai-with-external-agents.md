---
uuid: 672da53b-d8ac-48cd-9cb3-e3fa9915dd6a
created_at: factorio-ai-with-external-agents.md
filename: Factorio AI with External Agents
title: Factorio AI with External Agents
description: >-
  Explains how to implement AI in Factorio using external agents via RCON,
  avoiding complex ML. Focuses on practical Lua commands for snapshots and
  actions, with a minimal Node.js agent architecture.
tags:
  - Factorio
  - AI
  - RCON
  - Lua
  - External Agents
  - Node.js
  - Action Planning
---
Hell yes. “AI in Factorio” is totally doable—just don’t get hung up on *ML inside the mod*. The sane way is: **Lua does environment + actions; an external agent (your JS brain) does the “AI.”** Here’s a practical map. ^ref-a4d90289-1-0

# The 3 ways to “hack AI” in Factorio

1. **Pure-Lua “AI-ish”** ^ref-a4d90289-5-0
   Behavior trees/state machines in `control.lua` (no outside code). Great for heuristics (builders, schedulers), but no sockets/HTTP. You’re boxed into the Factorio sandbox.

2. **External agent via RCON (recommended)** ^ref-a4d90289-8-0
   Run a **headless server** locally. Your Node agent connects over **RCON**:

   * Mod exposes **/snapshot** (prints compact JSON) and **/agent {json}** (applies actions).
   * Node reads snapshots → decides → sends actions back. ^ref-a4d90289-12-0
   * You play by joining the local server from the GUI. Clean separation, real “AI.”

3. **Offline planner / blueprint generator** ^ref-a4d90289-15-0
   Mod dumps world slices to `script-output/*.json`; a JS tool computes blueprints; you paste strings back in. Good for big designs, not reactive play.

# Minimal RCON architecture (what actually works)

**In the mod (Lua):** ^ref-a4d90289-20-0

* Every N ticks gather a small world summary (nearby entities, power, inventory, logistics). ^ref-a4d90289-22-0
* `/snapshot` → `game.print("PROMETHEAN:"..json)` (one line). ^ref-a4d90289-23-0
* `/agent {base64json}` → decode → place ghosts / set requests / toggle combinators. ^ref-a4d90289-24-0

**Outside (Node.js):** ^ref-a4d90289-26-0

* Connect via RCON → run `/snapshot` on a schedule → parse lines starting with `PROMETHEAN:`.
* Decide (heuristics/LLM/RL; your choice). ^ref-a4d90289-29-0
* Send `/agent {payload}` with actions: place ghost entities, set requests, etc. ^ref-a4d90289-30-0

# Milestone 0 (30–45 min, “ask-first” ready)

**Goal:** add `/snapshot` + `/agent` to the mod I gave you. ^ref-a4d90289-34-0

### control.lua sketch (drop-in, tiny)

> If you want, say “go” and I’ll paste the full tested version. Here’s the shape: ^ref-a4d90289-38-0

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
^ref-a4d90289-40-0 ^ref-a4d90289-89-0
 ^ref-a4d90289-90-0
> Notes: Factorio lacks native JSON; `serpent` is the usual tiny serializer. For more robust JSON, we can embed a small encoder. Base64 avoids console escaping hell.

### Headless server (Linux)
 ^ref-a4d90289-94-0
```bash
# run headless in a tmux pane
/path/to/factorio/bin/x64/factorio \
  --start-server mysave.zip \
  --rcon-port 27015 --rcon-password 'changeme' \
  --mod-directory ~/.factorio/mods
^ref-a4d90289-94-0
```

Then **Join Game → Connect to 127.0.0.1** from the Factorio GUI client to play.

### Node agent skeleton (JS) ^ref-a4d90289-106-0

> I’ll drop the real code on “go.” Shape: ^ref-a4d90289-108-0

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
^ref-a4d90289-108-0
setInterval(tick, 1000); ^ref-a4d90289-129-0
```

We can swap to **pure JSON** if you prefer; I kept serpent for zero-deps Lua. Your call.
 ^ref-a4d90289-133-0
# AI behaviors you can build fast
 ^ref-a4d90289-135-0
* **Ghost Filler:** Agent scans ghosts → if you carry the item, it walks you through filling them (or prints a shopping list). ^ref-a4d90289-136-0
* **Lane Balancer Synth:** Given target lanes, emits a blueprint string (deterministic templates).
* **Belt Flow Overlay:** Hotkey toggles temporary arrows showing throughput direction around the cursor (pure Lua). ^ref-a4d90289-138-0
* **Smelter Expander:** Agent places ghosts for +N lanes of smelting with belts/undergrounds calculated from ore patch bounds.

Pick one and a **mode** (slow-roll / ask-first / build). ^ref-a4d90289-141-0
If you say “**ask-first + RCON**,” I’ll ship the **exact control.lua** + a tiny **Node client** you can run today.

\#hashtags
\#factorio #lua #ai-agents #promethean #systems-design #obsidian #adhd-ops
