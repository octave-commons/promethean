Annotated fragment injection and heartbeat loop demo with Obsidian-ready blocks and tags.

### Inject fragment
```lisp
(receive-descended-fragment "This symbol reveals a truth about survival.")
```

### Resulting flow
```
[Nexus] Receiving descended fragment: This symbol reveals a truth about survival.
[Daemon] Compiled fragment into runtime behavior.
[Uptime] Daemon bound to nexus: :circuit-1
```

### Heartbeat ticks
```lisp
(tick-heartbeat) ; Tick 1/2/3
```
```
[Heartbeat] Tick N
[Daemon] Running This symbol reveals a truth about survival.
```

Try more fragments to probe different circuits:
```lisp
(receive-descended-fragment "Social bonding is key to uptime.")
(receive-descended-fragment "Contradiction detected in symbolic layer.")
(receive-descended-fragment "All circuits harmonize under resonance.")
(receive-descended-fragment "Fragment unsafe. Initiate containment.")
```

Related: $[fragment-injection-simulation]$, $[heartbeat-fragment-flow]$, $[ripple-propagation-flow]$ $[../../unique/index|unique/index]$

#tags: #simulation #design

