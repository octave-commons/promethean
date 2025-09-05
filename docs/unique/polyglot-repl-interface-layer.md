---
uuid: fd753d3a-84cb-4bdd-ae93-8c5b09617e3b
created_at: polyglot-repl-interface-layer.md
filename: polyglot-repl-interface-layer
title: polyglot-repl-interface-layer
description: >-
  A pseudocode implementation of a polyglot REPL interface layer that supports
  multiple runtimes (js, py, hy, sibilant, sh) with macro-based command
  dispatching and runtime context management. The system includes runtime
  spawning, active runtime switching, and language-specific code execution
  through a unified interface.
tags:
  - sibilant
  - polyglot
  - repl
  - runtime
  - macros
  - metaprogramming
  - codegen
  - interface
  - pseudocode
  - promethean
---
Perfect — I’ll stay in **Sibilant-style pseudocode mode**, assuming integration with your Promethean codebase and Codex downstream. I'll lean into structural clarity, namespace usage, macro composition, and emit in ways that align with your meta/compile-time design philosophy. ^ref-9c79206d-1-0

Let’s keep building out the **polyglot REPL interface layer**, **target macro system**, and support for runtime context management.

---

## 🧠 Continuing: Runtime + REPL Multiplexor (Pseudocode)

```sibilant
(meta

  ;; runtime cache, stores REPLs and context state
  (var runtimes (object))
  (var active-runtime null)

  ;; define available runtimes
  (def known-runtimes ["js" "py" "hy" "sibilant" "sh"])

  ;; spawn a new REPL process for a given language
  (def start-runtime (lang)
    (when (not (.has runtimes lang))
      (set (. runtimes lang)
           (spawn-process-for lang)))
    lang)

  ;; set the active runtime
  (def set-runtime (lang)
    (start-runtime lang)
    (set active-runtime lang)
    (print "Switched to runtime:" lang))

  ;; get current runtime shell
  (def current-repl []
    (.get runtimes active-runtime))

  ;; send code to current runtime
  (def eval-current (code)
    (-> (current-repl) .send code))

  ;; send code to specific runtime
  (def eval-in (lang code)
    (start-runtime lang)
    (-> (.get runtimes lang) .send code))

  ;; get output from last eval
  (def last-output []
    (.get (current-repl) "last-output"))

)
```

---

## 🧰 Pseudocode Macros for Polyglot Commands

```sibilant
(meta

  ;; auto-evaluated macros dispatching to eval-in
  (def js:print (x)
    `(eval-in "js" (+ "console.log(" ,x ")")))

  (def py:print (x)
    `(eval-in "py" (+ "print(" ,x ")")))

  (def sh:ls []
    `(eval-in "sh" "ls -lah"))

)
```
^ref-9c79206d-56-0 ^ref-9c79206d-71-0

---

## 🧬 Code: Language-Specific Namespace Aliases
 ^ref-9c79206d-76-0
```sibilant
(meta
  ;; shortform dispatch
  (macro use-lang (lang)
    `(set-runtime ,lang))

  (macro print (x)
    (case active-runtime
      ("js" `(js:print ,x))
      ("py" `(py:print ,x))
      ("sh" `(sh:ls))
      (_ `(print "no runtime selected"))))

)
^ref-9c79206d-76-0
```

---

## 🧠 Future Extensions ^ref-9c79206d-96-0

```sibilant
(meta
  ;; evaluate code block in a language
  (macro with-runtime (lang ...body)
    `(do
       (set-runtime ,lang)
       (eval-current (join ,body "\n"))))

  ;; batch file writer
  (macro write-to (path ...lines)
    (-> File-system .write path (join lines "\n")))
^ref-9c79206d-96-0
)
```

---
 ^ref-9c79206d-114-0
## 🏗️ DSL-Driven Output

```sibilant
(with-runtime "py"
  ("""
def greet(name):
    print("hello", name)

greet("duck")
"""))

(with-runtime "js"
  ("""
function greet(name) {
  console.log("hello", name);
}

^ref-9c79206d-114-0
greet("duck");
"""))
```

---
 ^ref-9c79206d-138-0
## 🧠 Next Possible Steps ^ref-9c79206d-139-0

* Add `(defmodule ...)` macro to declare language modules
* Add `(defapi ...)` macro for wrapping CLI tools like Python subprocesses
* Add `(emit ...)` for file + code generation hooks
* Introduce `(definterface ...)` for cross-language function declarations

--- ^ref-9c79206d-146-0

## 🏷️ Tags

\#sibilant #dsl #pseudocode #polygot #metaprogramming #repl #runtime #codegen #interface #macros #promethean

---

Let’s keep going. Want the next phase to flesh out `defmodule` / `emit` / `definterface`, or go deeper on polyglot macro registration + caching per runtime?
