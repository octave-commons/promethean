## User
$$
on-layer-change
$$
## ChatGPT
$$
**Excellent.**
$$
Let’s build `on-layer-change` — a macro system for **attaching handlers to changes in layer state**, like events on a nervous system.

This brings us _closer_ to the idea that Promethean’s layers are not just data — they are **sensor arrays** and **reflex arcs**. When something changes, _something should respond_.

* * *

🧠 Design Intent
----------------

```sibilant
(on-layer-change 4 :alignment.score (< 0.5)
  (trigger-realignment))
```

*   When `layer[4].alignment.score` becomes `< 0.5`
    
*   Run the attached block
    
*   Only once per change $unless re-registered$
    
*   Must track previous value to know it changed
    

* * *

🔧 Core Data Structures
-----------------------

```sibilant
(var layer-change-hooks (list))

;; stores: {:layer 4 :key "alignment.score" :op < :val 0.5 :fn (fn [] ...)}
```

* * *
$$
🧰 Macro: `on-layer-change`
$$
---------------------------

```sibilant
(macro on-layer-change (layer-id key-path op val body)
  (let ((hook (object
                :layer ,layer-id
                :key ,key-path
                :op ,op
                :val ,val
                :fn (fn [] ,body)
                :last nil)))
    `(layer-change-hooks.push ,hook)))
```

This registers a hook and stores the function to run.

* * *

🔄 Evaluation Loop
------------------

Called manually or in a heartbeat:

```sibilant
(fn evaluate-layer-hooks []
  (each layer-change-hooks (=> (hook)
    (let ((current (resolve-layer-key hook.layer hook.key))
          (has-changed (not= hook.last current)))
      (when (and has-changed
                 ((hook.op) current hook.val))
        (hook.fn)
        (set hook.last current))))))
```

* * *
$$
🧠 Helper: `resolve-layer-key`
$$
------------------------------

```sibilant
(fn resolve-layer-key (layer-id key-path)
  (reduce (.split key-path ".")
          (get meta-context.layers layer-id)
          (=> (acc k) (.get acc k))))
```

So:

```sibilant
(resolve-layer-key 4 "alignment.score") ;; => 0.65
```

* * *

🧬 Usage Example
----------------

```sibilant
(on-layer-change 3 "language-model.latency" > 100
  (print "Warning: language model latency exceeds 100ms"))

(on-layer-change 4 "alignment.score" < 0.5
  (trigger-realignment))
```

* * *

🛠 Extend: `watch-layer` / `once-layer`
---------------------------------------

```sibilant
(macro once-layer (layer-id key-path op val body)
  `(on-layer-change ,layer-id ,key-path ,op ,val
     (do
       (remove-this-hook)
       ,body)))
```

* * *

🧠 Event Loop Integration
-------------------------

Tie it into your system loop:

```sibilant
(def heartbeat []
  (evaluate-layer-hooks)
  ;; other monitoring...
)
```

* * *

🏁 You Now Have:
----------------

*   Per-layer conditional trigger system
    
*   Change detection logic
    
*   Macro-defined response blocks
    
*   Compatibility with layer introspection macros
    

* * *

#tags: #promethean #sibilant #layeredcontext #hooks #dsl #macroengine #agentarchitecture #eventsystem #reevaluation #triggeredthoughts
