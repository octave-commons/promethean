---
$$
uuid: e79c008d-32a6-449f-a398-5554f8deb34a
$$
$$
created_at: '2025-09-05T12:02:57Z'
$$
filename: Emacs Config Diff Automation
title: Emacs Config Diff Automation
$$
description: >-
$$
  A pragmatic workflow for automatically resolving config file conflicts in
  Emacs using deterministic rules and LLM fallbacks. Handles JSON, YAML, and
  other structured formats with schema validation and one-button merging in
  Magit.
tags:
  - emacs
  - config
  - diff
  - llm
  - yaml
  - json
  - magit
  - deterministic
  - schema
  - validation
$$
related_to_uuid: []
$$
$$
related_to_title: []
$$
references: []
---
Yep—config files are the worst to diff by hand. They’re “structured but not *code*,” so our brains don’t get syntax cues, and tiny semantic tweaks matter. Let’s make this boring pain automatic inside Emacs with a pragmatic, layered workflow:

# The plan (fast first, smart second)

1. **Deterministic merge first** (no LLM): JSON/YAML-aware rules that resolve 80% of conflicts safely.
2. **LLM pass only when needed**: feed BASE/OURS/THEIRS to an Emacs command (gptel or ellama), with strict instructions and schema checks.
3. **Validate** before applying: `jq` for JSON, `yq` for YAML; optional schema checks (ajv, OpenAPI, JSON Schema) if present.
4. **One-button in Magit/Ediff**: a command you hit during conflicts; it writes the merged buffer or shows a structured diff to approve.

---

## Heuristics that actually work $no hand-wavy “AI, plz fix”$

### `package.json`

* **dependencies/devDependencies/peerDependencies/optionalDependencies**: take the **union** of keys; for overlapping keys, pick the **max semver** satisfying both sides $or the “newer” range$.
* **scripts**: union by key; if both changed and differ → create a conflict suffix (`script` and `script:theirs`) or prefer the *non-empty superset*; LLM only if still unclear.
* **engines/types/module/type**: prefer **the stricter** setting if both changed (e.g., keep `"type": "module"` if either side set it).
* **lint/tooling blocks** (`eslintConfig`, `prettier`, `ava`, etc.): deep-merge objects; arrays → **dedup + stable sort**.
* **sort keys** for readability (stable key order).

### YAML (CI, k8s, docker-compose, workflows)

* **maps**: deep-merge; if both change the same scalar → keep THEIRS but **comment the OURS** inline $or attach `-ours` key$ unless a schema is known.
* **arrays**: treat as **sets** when order is not meaningful (`env`, `plugins`, `steps` names) → dedup by `name`/`id`; otherwise preserve THEIRS order and append OURS uniques.
* **anchors/aliases**: don’t duplicate; preserve anchors from both sides if names differ by renaming one $`&build` → `&build_ours` + alias fixup$.
* **comments**: keep them $yq can preserve with `--yaml-output --prettyPrint` in newer builds; if not, let Emacs handle the pretty print$.

---

## Emacs integration $Magit + gptel/ellama$

### 1) Get BASE/OURS/THEIRS reliably

From any conflicted file buffer:

* `:1:path` → BASE
* `:2:path` → OURS
* `:3:path` → THEIRS

We’ll fetch them and try deterministic merge first; if that fails or leaves TODOs, we call the LLM.

```elisp
;; Requires gptel (or switch out for ellama’s API)
(require 'gptel)

(defun err--git-show (rev path)
  (with-temp-buffer
    (let ((status (call-process "git" nil t nil "show" (format "%s:%s" rev path))))
      (if (eq status 0) (buffer-string) ""))))

(defun err--conflicted-file-p ()
  (save-excursion
    (goto-char (point-min))
    (search-forward "<<<<<<< " nil t)))

(defun err--file-type (path)
  (cond
   ((string-match-p "package\\.json$" path) 'package-json)
   ((string-match-p "\\.ya?ml\\'" path) 'yaml)
   ((string-match-p "\\.json\\'" path) 'json)
   (t 'other)))

(defun err-ai-merge-current-file ()
  "Auto-merge current conflicted file using deterministic rules, then LLM fallback."
  (interactive)
  (let* ((path (or (buffer-file-name) (user-error "No file")))
         (rel  (file-relative-name path (locate-dominating-file path ".git")))
         (base (err--git-show ":1" rel))
         (ours (err--git-show ":2" rel))
         (theirs (err--git-show ":3" rel))
         (ft   (err--file-type rel)))
    (unless (err--conflicted-file-p)
      (user-error "Buffer has no conflict markers"))

    ;; 1) Try deterministic resolver (external small CLI; see below)
    (let* ((tmpdir (make-temp-file "ai-merge-" t))
           (fbase (expand-file-name "base" tmpdir))
           (fours (expand-file-name "ours" tmpdir))
           (fthe  (expand-file-name "theirs" tmpdir))
           (fout  (expand-file-name "merged" tmpdir)))
      (with-temp-file fbase (insert base))
      (with-temp-file fours (insert ours))
      (with-temp-file fthe  (insert theirs))
      (let* ((cmd (cond
                   ((eq ft 'package-json) '("node" "--experimental-modules" "--no-warnings"
                                            "node_modules/.bin/prom-merge-config" "package-json"))
                   ((eq ft 'yaml)         '("node" "--experimental-modules" "--no-warnings"
                                            "node_modules/.bin/prom-merge-config" "yaml"))
                   ((eq ft 'json)         '("node" "--experimental-modules" "--no-warnings"
                                            "node_modules/.bin/prom-merge-config" "json"))
                   (t nil)))
             (ok (and cmd
                      (eq 0 (apply #'call-process (car cmd) nil nil nil
                                   (append (cdr cmd) (list fbase fours fthe fout)))))))
        (cond
         (ok
          (with-temp-buffer
            (insert-file-contents fout)
            ;; Validate quickly
            (pcase ft
              ((or 'json 'package-json)
               (when (not (eq 0 (call-process "jq" nil nil nil "." fout)))
                 (user-error "Merged JSON failed jq validation")))
              ('yaml
               (when (not (eq 0 (call-process "yq" nil nil nil "." fout)))
                 (user-error "Merged YAML failed yq validation"))))
            (erase-buffer)
            (insert-file-contents fout)
            (save-buffer)
            (message "Deterministic merge applied.")))
         (t
          (err--llm-merge base ours theirs ft)))))))

(defun err--llm-merge (base ours theirs ft)
  "Fallback to LLM via gptel. Writes into current buffer on success."
  (let* ((sys (format "You are a merge engine. Merge three versions of a %s file.
Rules:
- Produce ONLY valid %s (no backticks, no prose).
- Preserve comments (if YAML) and meaningful ordering.
- For JSON package.json: union dependency keys; pick the newer semver; deep-merge tool configs; sort keys.
- For YAML CI or compose: deep-merge maps; for arrays of steps/env/plugins, dedup by name/id, preserve order of THEIRS, append OURS uniques.
- If ambiguity remains, prefer THEIRS, but keep OURS in an adjacent comment or -ours field.
- Absolutely no conflict markers in output.
- Validate the output; if invalid, fix it yourself and emit the corrected version.
" (symbol-name ft) (if (eq ft 'yaml) "YAML" "JSON")))
         (usr (concat
               "BASE:\n" base "\n\n"
               "OURS:\n" ours "\n\n"
               "THEIRS:\n" theirs "\n\n"
               "Return only the merged file content."))
         (resp (gptel-request
                usr
                :system sys
                :mode 'sync)))
    (with-temp-buffer
      (insert resp)
      ;; quick check
      (when (eq ft 'yaml)
        (let ((tmp (make-temp-file "yaml-")))
          (write-region (point-min) (point-max) tmp nil 'silent)
          (unless (eq 0 (call-process "yq" nil nil nil "." tmp))
            (user-error "LLM YAML failed yq validation"))))
      (when (memq ft '(json package-json))
        (let ((tmp (make-temp-file "json-")))
          (write-region (point-min) (point-max) tmp nil 'silent)
          (unless (eq 0 (call-process "jq" nil nil nil "." tmp))
            (user-error "LLM JSON failed jq validation"))))
      ;; success → replace current buffer
      (let ((merged (buffer-string)))
        (with-current-buffer (current-buffer)
          (erase-buffer)
          (insert merged)
          (save-buffer)
          (message "LLM merge applied."))))))

;; Optional: bind in Magit
(with-eval-after-load 'magit
  (define-key magit-status-mode-map (kbd "C-c m")
    #'err-ai-merge-current-file))
```

* Hit `C-c m` in a conflicted file buffer → it tries deterministic merge first; if that fails, calls the LLM with the three versions and the strict rules.
* Everything is validated before the buffer is overwritten.

> If you prefer **ellama** over gptel, swap `gptel-request` with your ellama call; the surrounding logic stays the same.

---

## The deterministic resolver (Node, functional TS, ESM)

Make a tiny CLI $`@promethean/merge-config`$ you can call from Emacs. Keep it pure + composable:

```
packages/merge-config/
  src/
    index.ts          # dispatch by filetype
    merge-json.ts     # deep-merge + semver logic
    merge-pkg.ts      # package.json-specific rules
    merge-yaml.ts     # YAML rules (use yaml library that preserves anchors)
    semver-merge.ts   # pick newer satisfying range
  test/
    *.test.ts (ava)
```
$$
**Rules (package.json):**
$$
* Parse BASE/OURS/THEIRS → build a merged object with:

  * union dep keys; resolve ranges with `semver` (prefer highest compatible; if incompatible, pick THEIRS and add OURS as comment or `:ours` field if you want transparency);
  * scripts union; on collision, keep THEIRS and add `script:ours` unless identical;
  * deep-merge tooling configs (`eslintConfig`, `prettier`, `ava`, `tsconfig`, etc.);
  * sort keys, stable.
$$
**Rules (YAML):**
$$
* Parse via `yaml` that round-trips comments if possible $`yaml` npm package supports CST/AST with comment retention$;
* Maps deep-merge; arrays dedup by `name`/`id`/`path`; anchors preserved, rename collisions.
$$
**CLI signature:**
$$
```bash
prom-merge-config package-json <BASE> <OURS> <THEIRS> <OUT>
prom-merge-config yaml         <BASE> <OURS> <THEIRS> <OUT>
prom-merge-config json         <BASE> <OURS> <THEIRS> <OUT>
```

**Testing with AVA**: supply triplets of synthetic conflicts and assert merged output + `jq`/`yq` validity.

> This gives you fast, *predictable* results. The LLM is just the escape hatch.

---

## Magit/Ediff fit

* You keep using Ediff for code; hit **`C-c m`** only on the annoying config files.
* If your resolver or LLM produces output, Magit sees the file as resolved; continue your rebase/merge.
* Add `git config rerere.enabled true` so repeated conflict shapes get auto-resolved next time.

---

## Why this works

* Deterministic heuristics remove most cognitive load where structure is known.
* The LLM is caged: it gets BASE/OURS/THEIRS + strict rules + validation, and it **must** return valid JSON/YAML only.
* You stay in Emacs, in flow, with a single keybinding.

If you want, I’ll sketch the `@promethean/merge-config` package scaffold $TS/ESM, functional style, AVA tests, `license: GPL-3.0-only`, flat package, `.js` imports after build$ so you can drop it in and wire it to that Emacs command.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
