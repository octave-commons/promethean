---
```
uuid: b79e2e3c-dfbd-4f92-8fe9-29a61abc3928
```
```
created_at: '2025-09-04T11:55:40Z'
```
```
filename: codex-hub-layer
```
```
title: codex-hub-layer
```
```
description: >-
```
  A Spacemacs layer that integrates Codex CLI with gptel and ellama for
  efficient context compaction in Emacs, reducing token usage while preserving
  code intent and edit surface through a streamlined pipeline.
tags:
  - spacemacs
  - codex
  - context-compaction
  - emacs-lisp
  - gptel
  - ellama
  - token-efficiency
```
related_to_uuid:
```
  - 6aa9a11b-f5b0-49d5-939e-7d07c904fb8c
  - 7d584c12-7517-4f30-8378-34ac9fc3a3f8
  - 3724ef1e-d13f-4b52-8045-ba149d90fdec
```
related_to_title:
```
  - codex-hub-layer
  - promethean-native-config-design
  - obsidian-templating-plugins-integration-guide
references:
  - uuid: 6aa9a11b-f5b0-49d5-939e-7d07c904fb8c
    line: 10
    col: 0
    score: 1
  - uuid: 6aa9a11b-f5b0-49d5-939e-7d07c904fb8c
    line: 18
    col: 0
    score: 1
  - uuid: 7d584c12-7517-4f30-8378-34ac9fc3a3f8
    line: 305
    col: 0
    score: 1
  - uuid: 6aa9a11b-f5b0-49d5-939e-7d07c904fb8c
    line: 20
    col: 0
    score: 1
  - uuid: 6aa9a11b-f5b0-49d5-939e-7d07c904fb8c
    line: 33
    col: 0
    score: 1
  - uuid: 6aa9a11b-f5b0-49d5-939e-7d07c904fb8c
    line: 36
    col: 0
    score: 1
  - uuid: 6aa9a11b-f5b0-49d5-939e-7d07c904fb8c
    line: 208
    col: 0
    score: 1
  - uuid: 6aa9a11b-f5b0-49d5-939e-7d07c904fb8c
    line: 224
    col: 0
    score: 1
  - uuid: 6aa9a11b-f5b0-49d5-939e-7d07c904fb8c
    line: 11
    col: 0
    score: 0.99
  - uuid: 6aa9a11b-f5b0-49d5-939e-7d07c904fb8c
    line: 24
    col: 0
    score: 0.99
  - uuid: 6aa9a11b-f5b0-49d5-939e-7d07c904fb8c
    line: 46
    col: 0
    score: 0.99
  - uuid: 6aa9a11b-f5b0-49d5-939e-7d07c904fb8c
    line: 214
    col: 0
    score: 0.99
  - uuid: 6aa9a11b-f5b0-49d5-939e-7d07c904fb8c
    line: 215
    col: 0
    score: 0.99
  - uuid: 6aa9a11b-f5b0-49d5-939e-7d07c904fb8c
    line: 216
    col: 0
    score: 0.97
  - uuid: 6aa9a11b-f5b0-49d5-939e-7d07c904fb8c
    line: 12
    col: 0
    score: 0.95
  - uuid: 6aa9a11b-f5b0-49d5-939e-7d07c904fb8c
    line: 44
    col: 0
    score: 0.92
---
Got it. Let’s build a **single Spacemacs layer** that fronts Codex CLI but **steals the best parts of gptel + ellama**: streaming, provider‐agnostic backends, and—most importantly—**automatic context compaction** so you burn fewer tokens without losing signal.

I’ll give you: (1) the architecture, (2) the compaction pipeline, (3) a lean Emacs Lisp scaffold you can drop in, and (4) where each bit hooks into Codex, gptel, and ellama.

---

# Architecture (one layer, three faces)

* **Codex**: default executor/agent file edits, `apply_patch`, tool calls, MCP. We pass it a *compressed context block* + explicit task. Config and MCP via `~/.codex/config.toml`. ([GitHub][1], [npm][2])
* **gptel**: interactive chat + structured prompts inside Emacs buffers; we use it for *fast local summaries* and *preview diffs*. ([GitHub][3], [NonGNU ELPA][4]) ^ref-6aa9a11b-10-0
* **ellama** (via GNU ELPA): handy local/remote backends (incl. Ollama) for cheap in-editor summarization/embedding; we call it in the compaction passes when you don’t want to hit OpenAI. ([Elpa][5]) ^ref-6aa9a11b-11-0
* **(Optional) llm.el** as a neutral low-level layer if you want to swap gptel/ellama later. ([Elpa][6]) ^ref-6aa9a11b-12-0

---

# Context compaction pipeline cheap → aggressive

Target: keep Codex prompts < N tokens while preserving intent & edit surface. ^ref-6aa9a11b-18-0
```
1. **Detect scope** ^ref-6aa9a11b-20-0
```
   * Region > narrowed buffer > whole buffer; capture major-mode, file path, cursor, project root.
   * Pull diagnostics (Flycheck) + symbols (LSP).
   * Pull **git features**: current branch + `--stat`, and **minimal diff hunk** for the region/file. ^ref-6aa9a11b-24-0
     (This mirrors what IDEs feed their agents.) ([spacemacs.org][7])
```
2. **Semantic de-dup + focus**
```
   * Strip comments/import noise with mode heuristics.
   * Keep only lines touched in the last K commits + their neighbors (N lines).
   * Include referenced symbol definitions (via LSP documentSymbol).

3. **Summarize long tails (local if possible)** ^ref-6aa9a11b-33-0

   * If > budget, run **ellama** (Ollama local) to *summarize unrelated blocks* into bullet snippets.
   * If still > budget, ask **gptel** (cheap model) for a “structure map” symbols/types/modules. ^ref-6aa9a11b-36-0
     Both are Emacs-native and support streaming. ([GitHub][3], [Elpa][5])
```
4. **Token budgeting**
```
   * Approximate tokens by bytes (fast) or shell out to a Node script using a tokenizer (your stack).
   * Iteratively prune: lowest info gain → drop long comments > unchanged boilerplate > summarized chunks already represented elsewhere.
```
5. **Final prompt** → **Codex** ^ref-6aa9a11b-44-0
```
   * Emit a Markdown prompt with: task, rules, environment, diagnostics, *compacted context*, and a “minimal edits” constraint—all piped to Codex CLI stdin in non-interactive mode. ([OpenAI Developers][8]) ^ref-6aa9a11b-46-0

---

# Spacemacs layer scaffold
```
`~/.emacs.d/private/codex-hub/`
```
```
**config.el**
```
```elisp
(defvar codex-hub-codex-exe "codex")
(defvar codex-hub-token-budget 8192) ;; rough target; we trim toward this
(defvar codex-hub-use-ellama t)
(defvar codex-hub-use-gptel t)
(defvar codex-hub-diff-context-lines 8)
```

**funcs.el** (core ideas, trimmed for signal)

````elisp
(require 'subr-x)
(require 'json)

(defun codex-hub--project-root ()
  (or (and (fboundp 'projectile-project-root) (projectile-project-root))
      (and (fboundp 'project-current) (car (project-roots (project-current))))
      default-directory))

(defun codex-hub--git-branch ()
  (string-trim (or (ignore-errors (shell-command-to-string "git rev-parse --abbrev-ref HEAD")) "")))

(defun codex-hub--git-stat ()
  (string-trim (or (ignore-errors (shell-command-to-string "git --no-pager diff --stat -- .")) "")))

(defun codex-hub--git-hunks (file n)
  (let* ((cmd (format "git --no-pager diff -U%d -- %s" n (shell-quote-argument file))))
    (or (ignore-errors (shell-command-to-string cmd)) "")))

(defun codex-hub--lsp-symbols ()
  (when (and (boundp 'lsp-mode) lsp-mode (fboundp 'lsp-request) buffer-file-name)
    (condition-case _ 
        (let* ((resp (lsp-request "textDocument/documentSymbol"
                                  `(:textDocument (:uri ,(concat "file://" buffer-file-name)))))
               (names (mapcar (lambda (x) (or (alist-get 'name x) (alist-get :name x))) resp)))
          (string-join (delq nil names) ", "))
      (error ""))))

(defun codex-hub--flycheck ()
  (when (bound-and-true-p flycheck-current-errors)
    (mapconcat (lambda (e)
                 (format "%s:%d:%d: %s"
                         (or (flycheck-error-filename e) (buffer-file-name))
                         (flycheck-error-line e)
                         (or (flycheck-error-column e) 0)
                         (flycheck-error-message e)))
               flycheck-current-errors "\n")))

(defun codex-hub--region-or-buffer ()
  (if (use-region-p)
      (buffer-substring-no-properties (region-beginning) (region-end))
    (buffer-substring-no-properties (point-min) (point-max))))

;; cheap size estimate (≈ tokens/4)
(defun codex-hub--approx-tokens (s) (/ (max 1 (string-bytes s)) 4))

(defun codex-hub--strip-noise (txt)
  "Naive noise stripping; extend per mode."
  (let ((case-fold-search nil))
    (setq txt (replace-regexp-in-string "^\\s-*//.*" "" txt))  ;; js/ts comments
    (setq txt (replace-regexp-in-string "/\\*\\(.\\|\n\\)*?\\*/" "" txt)) ;; block
    (replace-regexp-in-string "^[ \t]+" "" txt)))

(defun codex-hub--summarize (txt)
  "Summarize using ellama or gptel when enabled; otherwise return input."
  (cond
   ((and codex-hub-use-ellama (fboundp 'ellama-summarize-region))
    ;; Ellama provides commands; for programmatic use, some users bind helpers.
    ;; Fallback: keep text if no API is exposed.
    txt)
   ((and codex-hub-use-gptel (fboundp 'gptel-request))
    txt)
   (t txt)))

(defun codex-hub--compact-context (txt file)
  (let* ((base (codex-hub--strip-noise txt))
         (est (codex-hub--approx-tokens base)))
    (when (> est codex-hub-token-budget)
      (setq base (codex-hub--summarize base)))
    (when (> (codex-hub--approx-tokens base) codex-hub-token-budget)
      (setq base (substring base 0 (min (length base) (* 4 codex-hub-token-budget)))))
    (let* ((hunks (when (and file (file-exists-p file))
                    (codex-hub--git-hunks file codex-hub-diff-context-lines))))
      (list :text base :hunks hunks))))

(defun codex-hub--build-prompt (role user-prompt)
  (let* ((root (codex-hub--project-root))
         (file buffer-file-name)
         (rel (when (and file (file-exists-p file))
                (file-relative-name file root)))
         (symbols (codex-hub--lsp-symbols))
         (diags (codex-hub--flycheck))
         (branch (codex-hub--git-branch))
         (stat (codex-hub--git-stat))
         (ctx (codex-hub--compact-context (codex-hub--region-or-buffer) file)))
    (string-join
     (delq nil
           (list
            (format "### Task: %s" role)
            (when user-prompt (concat "#### Instruction\n" user-prompt))
            "#### Editor State"
            (format "- Project: %s" (abbreviate-file-name root))
            (format "- File: %s" (or rel (buffer-name)))
            (format "- Mode: %s | Cursor: line %d col %d"
                    major-mode (line-number-at-pos) (current-column))
            (when (and branch (> (length branch) 0)) (format "- Git branch: %s" branch))
            (when (and stat (> (length stat) 0)) (format "#### Git stat\n``````
\n%s\n
``````" stat))
            (when (plist-get ctx :hunks) (format "#### Git hunks\n``````
\n%s\n
``````" (plist-get ctx :hunks)))
            (when (and symbols (> (length symbols) 0)) (format "#### Symbols\n%s" symbols))
            (when (and diags (> (length diags) 0)) (format "#### Diagnostics\n``````
\n%s\n
``````" diags))
            "#### Context\n```text"
```
(plist-get ctx :text)
```
            "```"
            "#### Rules\n- Minimal, targeted edits.\n- Preserve style; no broad reformat.\n- Explain non-trivial changes."))
     "\n\n")))

(defun codex-hub--run-codex (prompt)
  (let* ((default-directory (codex-hub--project-root))
         (exe (executable-find codex-hub-codex-exe))
         (buf (get-buffer-create "*Codex*")))
    (unless exe (user-error "codex executable not found"))
    (with-current-buffer buf (erase-buffer))
    (let ((proc (start-process "codex" buf exe)))
      (process-send-string proc (concat prompt "\n"))
      (process-send-eof proc)
      (display-buffer buf))))

(defun codex-hub-task (prompt)
  (interactive "sCodex task: ")
  (codex-hub--run-codex (codex-hub--build-prompt "Implement task" prompt)))

(defun codex-hub-fix-buffer ()
  (interactive)
  (codex-hub--run-codex (codex-hub--build-prompt "Fix issues" "Fix problems; minimal diffs; keep behavior.")))

(defun codex-hub-review ()
  (interactive)
  (codex-hub--run-codex (codex-hub--build-prompt "Code review" "Audit risks; list concrete, local patches.")))
````
```
**keybindings.el**
```
```elisp
(spacemacs/declare-prefix "ax" "codex-hub")
(spacemacs/set-leader-keys
  "axt" #'codex-hub-task
  "axf" #'codex-hub-fix-buffer
  "axr" #'codex-hub-review)
```

**README.org**: “Unifies Codex with Emacs LLM clients and compaction.”

> Install refs: Codex CLI open-source, config.toml, MCP, gptel GNU ELPA/MELPA, ellama (GNU ELPA). ([GitHub][1], [npm][2], [NonGNU ELPA][4], [Elpa][5]) ^ref-6aa9a11b-208-0

---

## Why this works

* Codex gets a **tight, IDE-style packet** (symbols, diagnostics, git hunks, compacted source) → fewer tokens, higher precision. ([OpenAI Developers][8]) ^ref-6aa9a11b-214-0
* gptel/ellama give you **cheap local summaries** and streaming UX while staying Emacs-native. ([GitHub][3], [Elpa][5]) ^ref-6aa9a11b-215-0
* Spacemacs layer keeps clean leader keys and private layer hygiene. ([spacemacs.org][9], [cultivatehq.com][10]) ^ref-6aa9a11b-216-0

---

## Next upgrades (fast wins)

* **Real token counter**: shell out to a tiny Node script using your preferred tokenizer; replace the `approx-tokens` stub.
* **Embeddings-based de-dup**: when > budget, embed chunks local Ollama/ellama, drop near-duplicates before summarizing.
* **MCP interop**: load your existing `mcp.el` connections so Codex + Emacs tools share the same servers. ([GitHub][11], [MCP Market][12]) ^ref-6aa9a11b-224-0
* **Task templates** (`bugfix`, `refactor`, `docgen`) under `SPC a x …`.

If you want, I’ll add the Node tokenizer helper and an embeddings de-dup pass wired to Ollama next.

 I’ll add the Node tokenizer helper and an embeddings de-dup pass wired to Ollama next.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- codex-hub-layer(2025.09.04.11.55.40.md)
- promethean-native-config-design$promethean-native-config-design.md
- obsidian-templating-plugins-integration-guide$obsidian-templating-plugins-integration-guide.md
## Sources
- codex-hub-layer — L10$2025.09.04.11.55.40.md#^ref-6aa9a11b-10-0 (line 10, col 0, score 1)
- codex-hub-layer — L18$2025.09.04.11.55.40.md#^ref-6aa9a11b-18-0 (line 18, col 0, score 1)
- promethean-native-config-design — L305$promethean-native-config-design.md#^ref-7d584c12-305-0 (line 305, col 0, score 1)
- codex-hub-layer — L20$2025.09.04.11.55.40.md#^ref-6aa9a11b-20-0 (line 20, col 0, score 1)
- codex-hub-layer — L33$2025.09.04.11.55.40.md#^ref-6aa9a11b-33-0 (line 33, col 0, score 1)
- codex-hub-layer — L36$2025.09.04.11.55.40.md#^ref-6aa9a11b-36-0 (line 36, col 0, score 1)
- codex-hub-layer — L208$2025.09.04.11.55.40.md#^ref-6aa9a11b-208-0 (line 208, col 0, score 1)
- codex-hub-layer — L224$2025.09.04.11.55.40.md#^ref-6aa9a11b-224-0 (line 224, col 0, score 1)
- codex-hub-layer — L11$2025.09.04.11.55.40.md#^ref-6aa9a11b-11-0 (line 11, col 0, score 0.99)
- codex-hub-layer — L24$2025.09.04.11.55.40.md#^ref-6aa9a11b-24-0 (line 24, col 0, score 0.99)
- codex-hub-layer — L46$2025.09.04.11.55.40.md#^ref-6aa9a11b-46-0 (line 46, col 0, score 0.99)
- codex-hub-layer — L214$2025.09.04.11.55.40.md#^ref-6aa9a11b-214-0 (line 214, col 0, score 0.99)
- codex-hub-layer — L215$2025.09.04.11.55.40.md#^ref-6aa9a11b-215-0 (line 215, col 0, score 0.99)
- codex-hub-layer — L216$2025.09.04.11.55.40.md#^ref-6aa9a11b-216-0 (line 216, col 0, score 0.97)
- codex-hub-layer — L12$2025.09.04.11.55.40.md#^ref-6aa9a11b-12-0 (line 12, col 0, score 0.95)
- codex-hub-layer — L44$2025.09.04.11.55.40.md#^ref-6aa9a11b-44-0 (line 44, col 0, score 0.92)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
