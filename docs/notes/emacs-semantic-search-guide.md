---
$$
uuid: 2f1317b2-deae-4c25-bf8a-c781bb64c39b
$$
$$
created_at: '2025-09-03T11:50:01Z'
$$
filename: Emacs Semantic Search Guide
title: Emacs Semantic Search Guide
$$
description: >-
$$
  A concise guide to semantic search in Emacs, comparing three approaches: real
  semantic (embeddings), structure-aware (code semantics), and high-quality
  lexical search. Provides practical implementation steps and use cases for each
  method.
tags:
  - Emacs
  - semantic search
  - embeddings
  - code navigation
  - vector databases
  - RAG
  - consult
$$
related_to_uuid:
$$
  - c7b8a045-45f2-42c4-9617-b0cda73ca3cf
  - 45d70390-0334-422e-b487-4499b1424936
$$
related_to_title:
$$
  - i3-bluetooth-setup
  - Semantic-Code-Commit-Optimization
references:
  - uuid: c7b8a045-45f2-42c4-9617-b0cda73ca3cf
    line: 101
    col: 0
    score: 1
---
Here’s the no-nonsense map of how to do “semantic search” in Emacs, from most “actually semantic” $embeddings/meaning$ to “structure-aware” $symbols/AST$ to “fast lexical” (grep). Pick the lane that matches your needs.

# Lane A — Real semantic (embeddings) search inside Emacs

**1) `sem.el` $local, on-device$**

* What: Indexes your files into embeddings locally and lets you query by meaning. No external API; uses a native module.
* Why: Private, fast once indexed, works offline.
* Caveats: Linux is easiest; macOS/Windows need a manual build for the dynamic module right now.
* Start:

  ```elisp
  (use-package sem
    :vc (:fetcher github :repo "lepisma/sem.el")
    :demand t)
  ;; Then: M-x sem-index to index a directory, M-x sem-search to query.
  ```

  Docs & background: intro write-up and repo. ([lepisma.xyz][1], [GitHub][2])

**2) `llm.el` + `vecdb` $pluggable provider + vector store$**

* What: `llm.el` can create embeddings $OpenAI/Anthropic/local backends$. `vecdb` stores/searches those vectors. You wire them up, index your notes/code, and query.
* Why: Flexible—swap providers, point `vecdb` at your embeddings, build your own RAG flow.
* Start:

  ```elisp
  (use-package llm :vc (:fetcher github :repo "ahyatt/llm"))
  (use-package vecdb :ensure t)
  ;; Pseudocode: use llm to embed chunks, store in vecdb, then query vecdb by embedding.
  ```

  References and discussion. ([GitHub][3], [Repology][4], [Reddit][5], [YouTube][6])
$$
**3) Org/notes specific examples**
$$
If you’re an Org-roam person, this walkthrough shows how to embed notes (OpenAI or local) and search them semantically. Good as a pattern even if you don’t use Roam. ([lgmoneda][7])

**4) Chat/LLM glue in Emacs**
`gptel` is the pragmatic LLM client that stays out of your way; you can bolt tool use or embeddings on top of it for ad-hoc semantic queries/RAG. ([GitHub][8], [karthinks.com][9], [Reddit][10])
$$
**When to choose Lane A:**
$$
* You want meaning-aware search across your notes/repo.
* You’re okay maintaining an index and (maybe) paying for an API—or running local models.

---

# Lane B — Structure-aware (code semantics) in Emacs

**CEDET/Semantic mode (builtin family)**

* What: Parses code into tags/structures; enables navigation, folding, and “find things by what they are,” not just strings.
* Why: Great for C/C++ and some other languages; no embeddings, but it’s semantics via parsing.
* Start:

  ```elisp
  (semantic-mode 1)
  ;; e.g., M-x semantic-ia-fast-jump, or configure tag folding & idle parser
  ```

  Good primers & manual: ([writequit.org][11], [alexott.net][12], [GNU][13], [cedet.sourceforge.net][14])

**LSP workspace/symbol search $via Eglot or lsp-mode$**
Not “semantic” by meaning, but leverages language servers’ symbol indices across a project. Very fast for finding defs/refs/types. (Standard Emacs LSP docs—no single canonical page needed here.)
$$
**When to choose Lane B:**
$$
* Your main need is code navigation by AST/symbols rather than “find conceptually related text.”

---

# Lane C — High-quality lexical search (because speed > everything)

**Consult ecosystem $`consult`, `consult-ripgrep`, `consult-omni`$**

* What: First-class, incremental search UIs. `consult-ripgrep` is gold for huge repos. `consult-omni` can mix local, notes, and even web/AI sources in one minibuffer.
* Start:

  ```elisp
  (use-package consult :ensure t)
  (use-package consult-omni :vc (:fetcher github :repo "armindarvish/consult-omni"))
  ```

  References: consult, consult-omni. ([GitHub][15])
$$
**When to choose Lane C:**
$$
* You want immediate wins and superb UX, and you can live without true semantics.

---

# Opinionated picks (practical paths)

* **I want local, private, real semantic search:** use `sem.el` and point it at your notes/code. It’s the cleanest on-device story today. ([lepisma.xyz][1], [GitHub][2])
* **I want to tinker/build a custom RAG inside Emacs:** wire `llm.el` (embeddings) → `vecdb` $storage/search$ and script your indexing pipeline. This scales to multiple sources and providers. ([GitHub][3], [Repology][4])
* **I mostly need code structure search:** enable CEDET Semantic for languages it supports, and lean on your LSP for workspace symbol/refs. ([writequit.org][11], [GNU][13])
* **I need a great search UX now:** `consult` + `consult-ripgrep`; optionally `consult-omni` to blend sources (and even AI) without committing to embeddings infra. ([GitHub][15])

---

# Minimal working snippets

**A. `sem.el` quick try (Linux easiest):**

```elisp
(use-package sem
  :vc (:fetcher github :repo "lepisma/sem.el")
  :demand t)

;; Index a directory, then search:
;; M-x sem-index  -> choose ~/notes
;; M-x sem-search -> query: "error handling patterns in TS"
```

Notes & Linux-first build reality: ([GitHub][2])

**B. `llm.el` + `vecdb` skeleton $provider-agnostic$:**

```elisp
(use-package llm :vc (:fetcher github :repo "ahyatt/llm"))
(use-package vecdb :ensure t)

(defun my-embed-chunks (chunks)
  "Return list of (vector . meta)."
  (mapcar (lambda (c)
            (cons (llm-embed c) `((text . ,c))))
          chunks))

(defun my-index-files (files)
  (let* ((chunks (mapcar #'f-read-text files))
         (vecs   (my-embed-chunks chunks)))
    (vecdb-insert-batch vecs)))

(defun my-semantic-query (q)
  (let ((qv (llm-embed q)))
    (vecdb-query qv :k 10)))
```

`llm` embeddings API + `vecdb` packaging: ([GitHub][3], [Repology][4])

---

# Reality check / pitfalls

* **Indexing cost & staleness:** Embeddings need re-runs when files change. Automate incremental indexing or scope to high-value dirs. $General vector-DB hygiene applies.$ ([insightsbase.com][16], [Stack Overflow][17])
* **OS build quirks:** `sem.el` is smoothest on Linux right now; others require manual steps. ([GitHub][2])
* **Don’t oversell LSP/CEDET as “semantic”**—they’re structural, not meaning-aware. Great, but different tool.

If you tell me your exact target (notes vs codebase; local-only vs OK with APIs; Linux/macOS), I’ll give you a tight, copy-paste config with sensible defaults and an indexing script that won’t rot.

is smoothest on Linux right now; others require manual steps. ([GitHub][2])
* **Don’t oversell LSP/CEDET as “semantic”**—they’re structural, not meaning-aware. Great, but different tool.

If you tell me your exact target (notes vs codebase; local-only vs OK with APIs; Linux/macOS), I’ll give you a tight, copy-paste config with sensible defaults and an indexing script that won’t rot.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- $i3-bluetooth-setup$$i3-bluetooth-setup.md$
- $Semantic-Code-Commit-Optimization$(2025.09.03.11.28.27.md)
## Sources
- $i3-bluetooth-setup — L101$$i3-bluetooth-setup.md#^ref-c7b8a045-101-0$ (line 101, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
