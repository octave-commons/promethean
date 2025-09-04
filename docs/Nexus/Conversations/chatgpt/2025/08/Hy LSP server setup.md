---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Hy LSP server setup"
conversation_id: 68af4856-1a58-8326-bcb7-1006ba14b528
create_time: 08/27/2025 at 1:03 PM
update_time: 08/27/2025 at 3:06 PM
---

# Title: Hy LSP server setup

Created: 08/27/2025 at 1:03 PM
Last Updated: 08/27/2025 at 3:06 PM
Chat URL: https://chat.openai.com/c/68af4856-1a58-8326-bcb7-1006ba14b528


>[!nexus_user] **User** - 08/27/2025 at 1:03 PM
> I need an LSP server for hy. I feel like I should be able to use a source mapping between python and hy, and leverage a python lsp?
<!-- UID: 408b5690-c38a-4172-8c25-6c613f5556d0 -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 1:04 PM
> Short answer: yes, but you’ll need a shim. Hy compiles to a Python **AST**, not to stable Python **source**, so you can’t naively point Pyright/Pylance at `.hy` and call it a day. The workable pattern is a **mirror+map**: keep a generated Python mirror of each Hy file, run a Python LSP on the mirrors, and remap all ranges/diagnostics back to Hy using a source-map you control.
> 
> If you want something today, try these first:
> 
> - **Hyuga** — an actively maintained Hy language server (Neovim-friendly). Worth testing as a baseline. cite 
> - **hy-language-server** — older, built with pygls/Jedhy; pinned to Hy 1.0a1 and now points people to Hyuga. Useful to study. cite
> 
> If you want to build a robust LSP that *leverages* a Python LSP (Pyright/BasedPyright/pylsp), here’s the practical design that works:
> 
> # Architecture (mirror+map)
> 
> 1) **Parse & compile Hy → Python AST → Python text** 
> Hy already transforms sexps into Python AST. You’ll emit a *readable* Python file per `.hy` with stable, deterministic formatting and symbol names (e.g., keep macro-expanded identifiers stable). Track an interval map from generated Python (file, line, col) → original Hy (file, line, col). 
> Why: the Python LSPs speak in Python *text* coordinates. Hy itself gives you AST, but the LSPs need bytes/lines. cite
> 
> 2) **Generate and persist a source map** 
> Produce a standard VLQ source map (or a minimal custom map) that covers: definitions, call sites, string/number literals, macro expansions, and whitespace/indent anchors. Python doesn’t consume source maps, but *you* will—inside your LSP proxy—to translate diagnostics, hovers, and code actions back to Hy. A small Python library exists for JS-style source maps you can reuse/learn from. cite
> 
> 3) **Run a Python LSP on the mirrors** 
> Spin up **Pyright** (or **BasedPyright** if you want stricter checks) against the generated mirror tree. You can embed Pyright via its Python wrapper or drive the Node server as a subprocess; either way, you get LSP responses in Python-source coordinates. cite
> 
> 4) **LSP proxy (your Hy-LSP front end)** 
> Implement a thin LSP server (pygls or Node’s vscode-languageserver) that your editor connects to. It:
> - Watches `.hy` files, (re)generates the Python mirrors + maps. 
> - For each LSP request that requires Python semantics (hover, go-to-def, references, diagnostics, code actions), forwards it to the Python LSP on the mirror, then **remaps** ranges back to Hy before replying. 
> - For Hy-specific features (macro expansion peek, REPL docstrings, `require`/`import` sugar, `defmacro!` discovery), answer natively using the Hy compiler + a REPL helper like **Jedhy**. (The older hy-language-server used Jedhy; the idea still holds.) cite
> 
> 5) **Macro hygiene & stability rules** 
> To keep locations stable across edits, enforce rules in your generator: 
> - Expand macros with location retention; attach original token spans to expanded nodes. 
> - Normalize gensym’d names deterministically (prefix+counter based on expansion site). 
> - Keep formatting canonical (black-like) so line offsets don’t flap between runs.
> 
> 6) **Imports & environments** 
> Build the mirror alongside your `.hy` tree, and point Pyright’s root at the mirror. Configure module search paths so `import foo` in Hy resolves to `mirror/foo.py`. (You can also emit `py.typed` stubs for library hy modules to improve type info.)
> 
> 7) **Edits & latency** 
> On each Hy buffer change, re-emit the single affected mirror file and the map, then send LSP `didChange` to the Python LSP. Keep a debounce (e.g., 50–100ms) to avoid thrashing.
> 
> # Feature matrix (what you get)
> 
> - **Diagnostics / type-checking**: from Pyright/BasedPyright, mapped back to Hy lines. 
> - **Go-to-definition / references / rename**: via Python LSP, remapped; rename requires careful remap+rewrite in Hy (start with range-limited symbols). 
> - **Hover / signature help / completion**: combine Python LSP symbols with Hy REPL/Jedhy completions for macros and special forms. cite 
> - **Formatting**: provide a Hy formatter (not the Python one). Keep generator formatting separate to avoid confusion. 
> - **Macro peek** (Hy-native): on demand, show expanded code and the original span overlays.
> 
> # Why not “just” use a Python LSP without mirrors?
> 
> - Hy does not produce a *stable* Python **source**—it produces Python **AST**; Python LSPs operate on text. Without a mirror and mapping, you can’t round-trip positions or edits. 
> - Even if you generated text once, without a map you’d surface diagnostics in the wrong file/line, which is unusable.
> 
> # What exists today
> 
> - **Hyuga**: current community LSP for Hy; try it first to see what’s missing for your workflow. If it’s close, consider contributing mirror+map support rather than starting from scratch. cite 
> - **hy-language-server** (archival/older): a reference for pygls wiring + Jedhy integration. cite
> 
> # Build steps (concrete)
> 
> 1. **Scaffold**: start with `pygls` (Python) or `vscode-languageserver` (Node). Implement open/change/save + basic diagnostics passthrough. 
> 2. **Generator**: write a Hy→Python text emitter that walks Hy’s AST; emit `# @src: file:line:col` comments every N tokens to simplify mapping, and in parallel write a proper `.map` file for machine remap. 
> 3. **Mapper**: implement two functions: `py→hy(range)` and `hy→py(range)` using your map structure (interval tree). 
> 4. **Backend LSP**: launch Pyright (or BasedPyright) against the mirror dir; forward/translate requests: 
>  - TextDocument/hover, definition, references, completion, diagnostics. 
> 5. **Hy-native extras**: add commands for macro-peek, REPL doc lookup, and formatting. 
> 6. **Editor glue**: VS Code extension (or Neovim lspconfig stanza) that marks `*.hy` as supported, starts your server, and surfaces code actions.
> 
> # Gotchas
> 
> - **Macros**: expansions can move/duplicate code; your map must record *origin spans* for expansions. Treat macro bodies as “transparent” for navigation where possible. 
> - **Rename**: do not trust the backend blindly; confirm that replacing in Hy preserves syntax—fallback to symbol-scoped single-file rename initially. 
> - **Performance**: debounce regeneration; cache maps; avoid full-project re-emits on small edits. 
> - **Type stubs**: if you expose Hy libraries to Python LSP, emit `.pyi` stubs (or real `.py`) in the mirror so Pyright has symbols.
> 
> ---
> 
> If you want, I can sketch the minimal LSP proxy outline (pygls) plus a trivial Hy→Python emitter and a toy source-map format to prove the loop end-to-end, then you can harden it. Or we can start by evaluating **Hyuga** against your needs and list deltas to close. #hy #lsp #hyuga #pyright #basedpyright #jedhy
<!-- UID: 84551154-78e6-4caf-8a3f-464830c4bde3 -->

---




>[!nexus_user] **User** - 08/27/2025 at 1:54 PM
> Nice find. Hyuga is still out dated but it may work... it's at least the same major version...
<!-- UID: 6c9154df-b0a2-484b-81d4-433b453197ca -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 1:54 PM
> Yeah—Hyuga’s “experimental but current-ish” is probably good enough to start proving the loop. Here’s the fastest path that gets you signal today, plus the plan to graduate to mirror+map if/when Hyuga stalls.
> 
> # Step 1 — Kick the tires on Hyuga
> - **Install** (new venv): `pip install hyuga` (or clone + `pip install -e .`) and wire it via your editor’s LSP settings. Repo: Hyuga (actively points folks off the old hyls). cite 
> - **Baseline checks** (open a `.hy` file): hover, goto-def, references, diagnostics. Expect it to cover “Hy-native” things better than type-level Python stuff. The old `hy-language-server` is pinned to Hy 1.0a1 and explicitly defers to Hyuga now. cite 
> - **Confirm your Hy runtime** (Hy supports modern Python; recent release added 3.12 support). cite
> 
> If that’s “decent but not enough” (likely), don’t throw it out—**extend it**.
> 
> # Step 2 — Bolt on real Python semantics via a mirror+map
> Goal: keep Hy in the editor, but **run Pyright/BasedPyright on generated Python mirrors** and remap diagnostics/ranges back to Hy.
> 
> Minimal, pragmatic version:
> 1) **Emit Python text + a map** whenever a `.hy` buffer changes. You can start by inserting lightweight `# @src file:line:col` breadcrumbs every few tokens and also produce a proper source-map for machines. (Standard VLQ mapping format exists; there’s a Python sourcemap lib and good VLQ refs.) cite 
> 2) **Run Pyright** against the mirror tree (Node server `pyright-langserver` is fine; many folks embed/drive it). cite 
> 3) **Proxy LSP**: your Hy LSP front-end forwards hover/defs/refs/diags to Pyright on the mirror, then **remaps** ranges back to Hy before responding to the editor. Use pygls for the server scaffold. cite
> 
> Why this works: Python LSPs operate on **text positions**; Hy compiles to a **Python AST**, not stable Python source. Without a mirror+map, locations won’t line up, period. (Hy is a Lisp front-end to Python’s AST—by design.) cite
> 
> # Step 3 — Integration strategy with Hyuga
> - **Keep Hyuga for Hy-specific smarts** (macros, forms, doc lookup), and **add a Pyright sidecar** behind it. Start with diagnostics + goto-def; add rename/completions later.
> - If you upstream: a “python-backend” capability flag in Hyuga + a small remap layer is a clean PR seam.
> 
> # Step 4 — Gotchas you should plan for
> - **Macro expansion mapping**: attach origin spans to expanded nodes; keep gensyms deterministic so positions don’t flap between edits. 
> - **Rename**: don’t trust backend blindly—limit to symbol-scoped single-file rename first. 
> - **Perf**: debounce mirror regeneration (~50–100ms), incremental writes only.
> 
> # Quick acceptance checklist
> - [ ] Diagnostics from Pyright appear **on Hy lines** (not the mirror). 
> - [ ] Hover/defs navigate through Hy→Python interop (e.g., `(import [pathlib [Path]])` then use `Path`). 
> - [ ] Hy-specific help (macro docs) still works. 
> - [ ] Changing `.hy` rechecks within ~150ms.
> 
> If you want, I can sketch a tiny pygls server that: watches a `.hy`, emits `mirror/foo.py` + a toy `.map`, launches `pyright-langserver`, and remaps diagnostics. From there, we harden the mapper and add defs/hover.
> 
> #hy #lsp #hyuga #pyright #basedpyright #sourcemaps #pygls
<!-- UID: cea74c89-29ae-4dd2-94d9-152b9a5e5953 -->

---




>[!nexus_user] **User** - 08/27/2025 at 2:50 PM
> yea.. this thing isn't able to do code analysis it seems like... It can't pick up if there is a missing variable... though... I could see how tricky that gets if you layer enough macros on.... stilll... if it was properly compiled, then the python it made checked, you'd still be able to go "There is something wrong here" and say "something" that would be meaningful, especially if the macro you're using was something you wrote.
<!-- UID: a54931a6-ddc8-4107-bd48-4cf8b2566ba4 -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 2:50 PM
> Yep—that’s exactly the gap: Hyuga gives editor sugar, but no real semantic checks. If you want “missing variable,” wrong arity, bad attribute access, etc., you need a Python type checker in the loop. The workable path is:
> 
> # Plan: mirror+map for real diagnostics
> You **compile each `.hy` buffer into a stable `.py` mirror** and a **bidirectional source map**. Run Pyright/BasedPyright on the mirrors. Your LSP proxy remaps the diagnostic ranges back to Hy and surfaces them in-editor.
> 
> ## What “good enough” looks like
> - Hy edit → regenerate `mirror/foo.py` + `mirror/foo.py.map`
> - Send `textDocument/didChange` for the mirror to Pyright
> - Get diagnostics like “`NameError: bar is not defined` @ (py-line, py-col)”
> - Translate (py-line, py-col) → (hy-line, hy-col) using your map
> - Return LSP diagnostics to the editor for the `.hy` file
> 
> Even under heavy macros you’ll still catch **“something’s wrong here”**: undefined names, wrong attr on a union type, incompatible call signatures, dead code, etc. The key is **stable, deterministic generation** so positions don’t flap.
> 
> ---
> 
> # Minimal viable mapping that works
> Don’t over-engineer out of the gate. You can get 80% with a simple interval map plus periodic anchors.
> 
> **Emit Python with breadcrumbs:**
> ```python
> # mirror/foo.py (generated)
> # @src foo.hy:1:0
> from hy import HySymbol as _H # example scaffolding
> 
> # @src foo.hy:3:0
> def add(a, b):
>  # @src foo.hy:4:2
>  return a + b
> 
> # @src foo.hy:7:0
> result = add(x, 1) # <-- Pyright will flag 'x' undefined
> ```
> 
> **Keep a `.map` file** (json is fine to start):
> ```json
> {
>  "source": "foo.hy",
>  "mappings": [
>  {"py":{"l":1,"c":0}, "hy":{"l":1,"c":0}},
>  {"py":{"l":5,"c":4}, "hy":{"l":4,"c":2}},
>  {"py":{"l":8,"c":0}, "hy":{"l":7,"c":0}}
>  ]
> }
> ```
> 
> **Remap rule (simple first pass):**
> - Maintain the last anchor with `py.l <= diag.l` and adjust columns by delta within line.
> - For tokens you know you placed (names, calls, literals), record **exact spans** (start/end) during emission so goto/hover work precisely later.
> - Store these spans in a side table keyed by a stable symbol-id.
> 
> This is crude but enough to remap **line-level** diagnostics like undefined names and arity errors with good accuracy. You can refine to token-precise later.
> 
> ---
> 
> # Deterministic emission rules (non-negotiable)
> 1. **Stable newline/layout policy** (black-like): same Hy → same `.py` line structure.
> 2. **Deterministic gensyms**: seed by `(macro-name, expansion-site-offset, occurrence-index)`.
> 3. **Location hygiene**: propagate original (file, line, col) through macro expansion; when you lower to Python AST, attach those to nodes and reflect them in the emitted text & map.
> 
> ---
> 
> # LSP proxy shape (pygls example)
> - Start a small LSP server that handles `.hy`.
> - For `didOpen/didChange` on `.hy`:
>  - Re-emit `mirror/<rel>.py` and `<rel>.py.map`
>  - Forward a synthesized `didChange` to the **Pyright** sidecar (pointed at `mirror/`).
> - For `textDocument/publishDiagnostics` from Pyright:
>  - Remap each diagnostic range via the map
>  - Re-publish as diagnostics for the original `.hy` URI.
> 
> **Routes to forward (phase 1):** diagnostics, hover, definition, references. 
> **Keep Hy-native:** macro docs, special forms, formatter.
> 
> ---
> 
> # Handling macros without losing your mind
> - **Origin attribution:** every expanded node gets an `origin_span` (hy-start…hy-end). When you emit Python, copy the nearest origin span to that chunk.
> - **“Transparent” mapping for wrappers:** if a macro wraps a user symbol in scaffolding, prefer mapping diagnostics to the **user symbol span** not the wrapper.
> - **Macro blame:** when a diagnostic lands in macro-emitted code *far* from user spans, rewrite the message: 
>  > “Type error inside expansion of `with-gensym` at foo.hy:12:3 → check arguments to `make-widget`”
> 
> Even this basic blame rewrite turns otherwise cryptic errors into “actionable enough.”
> 
> ---
> 
> # What you’ll immediately catch (and how it feels)
> - **Undefined names**: `x` not defined where you call `(add x 1)` → highlighted at your Hy callsite.
> - **Bad attrs**: `(.- not-a-field some-dataclass)` becomes `some_dataclass.not_a_field` → Pyright flags invalid attribute; you remap to the Hy attr form.
> - **Wrong arity/types**: `(pathlib.Path 1 2)` emits a call with too many args → Pyright signature help + diag; you remap to the Hy list form.
> 
> ---
> 
> # Project layout & config
> ```
> hy-lsp/
>  server.py # pygls LSP for *.hy
>  hy_emit/
>  __init__.py
>  emitter.py # Hy AST -> Python text (+ span recording)
>  sourcemap.py # anchors, span table, py<->hy map
>  mirror/
>  ... # generated .py and .map files
>  pyrightconfig.json # points at ./mirror as root
> ```
> 
> - Start Pyright (or BasedPyright) as a subprocess. Keep it warm.
> - When a file changes, only rewrite that one mirror file + map.
> - Debounce 50–150ms to avoid thrash.
> 
> ---
> 
> # Sharp edges (be honest about them)
> - **Rename**: don’t trust Python-side rename blindly. Start with **single-file, symbol-scope rename** in Hy using your own parser/tokenizer.
> - **Completions**: Python-side completions remap fine for values; **macro completions** remain Hy-native.
> - **Docstrings**: prefer Hy’s runtime doc capture for macro/function docs; Python mirror docstrings can exist solely to please the checker.
> - **Third-party Hy libs**: generate `.pyi` stubs in `mirror/` so Pyright sees their types.
> 
> ---
> 
> # Tight, testable MVP checklist
> - [ ] Mirror generation is deterministic line-for-line on stable input.
> - [ ] Undefined-name diagnostic lands on the right Hy line/column.
> - [ ] Hover on imported Python symbols works (e.g., `Path`) from Hy code.
> - [ ] Goto-def crosses file boundaries via mirror + maps.
> - [ ] Macro blame message shows original macro site when needed.
> 
> If you want, I can sketch:
> - the tiny `sourcemap.py` (anchors + binary search),
> - the emission of `# @src file:line:col` and a span table for identifiers,
> - and the pygls handler that rewrites `publishDiagnostics`.
> 
> That’ll get you missing-variable today, and a path to richer analysis tomorrow without rewriting a Python type checker from scratch.
> 
> #hy #lsp #hylang #pyright #basedpyright #sourcemaps #pygls #macro-hygiene #systems-design
<!-- UID: ae4774f5-a02b-4685-9fa6-f6b86bf8d23d -->

---




>[!nexus_user] **User** - 08/27/2025 at 3:00 PM
> yea give me a zip file I can start hacking off of.
<!-- UID: 96f8d080-9f34-48d1-90b8-f88d8d8d18e4 -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 3:06 PM
> Here’s a hackable MVP you can rip apart:
> 
> [Download **hy-lsp-proxy.zip**](https://chat.openai.com/c/68af4856-1a58-8326-bcb7-1006ba14b528) *(visit original conversation to download)*
> 
> What you get:
> - A tiny pygls LSP that watches `*.hy`, emits a naive `mirror/*.py` + a simple source map, runs **Pyright** CLI, and remaps diagnostics back to your Hy buffer.
> - A toy emitter that handles just enough Hy to flag **undefined variables** (e.g., `(setv result (add x 1))` → `x` undefined).
> - A `sample/foo.hy` that triggers an error so you can see the loop working.
> - `tools/standalone_demo.py` to run without an editor and see Pyright’s JSON.
> 
> Quick start:
> ```bash
> unzip hy-lsp-proxy.zip && cd hy-lsp-proxy
> python -m venv .venv && source .venv/bin/activate
> pip install -r requirements.txt
> pnpm i # or: npm i
> python tools/standalone_demo.py
> ```
> You should see pyright diagnostics for `sample/foo.hy` pointing at the Hy line.
> 
> Wire it to your editor (example snippets in README for Emacs/Neovim), then start hacking:
> - Replace `hy_emit/emitter.py` with a real Hy→Python generator (or call into Hy’s compiler and unparse the AST).
> - Make `sourcemap.py` track token spans (it’s line-anchored now).
> - Swap the CLI call for a proper **Pyright LSP sidecar** and forward hover/defs/refs through the proxy.
> 
> If you want me to extend this next (e.g., macro-span blame, hover/defs via a sidecar, or a better emitter), say the word and I’ll ship another zip. #hy #lsp #pyright #basedpyright #emacs #neovim #obsidian
<!-- UID: beeede14-657b-4756-a964-8dd7a0139044 -->

---


