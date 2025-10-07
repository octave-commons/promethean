---
uuid: 0d89cdd7-1a6c-4477-9cbc-d12472564b58
title: "Web Crawler Agent → Hyperlink Graph → LLM Summaries/#Tags → Chroma Search (Dual-Sink)"
status: todo
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.523Z'
---
# Web Crawler Agent → Hyperlink Graph → LLM Summaries/#Tags → Chroma Search Dual-Sink
```
**Owner:** Codex / Agent
```
```
**Status:** Planned
```
**Labels:** #agents #crawler #llm #summarization #chroma #mongodb #etl #dual-sink #search #observability #promethean

---

## 🛠️ Description

Create an agent that:

1. **Crawls** the web (seeded) and builds a **hyperlink graph** nodes = pages, edges = hyperlinks.
2. Runs **separate LLM passes** per document for: a) concise summaries, b) #tag extraction Obsidian-style.
3. Indexes summaries + tags into **Chroma** for semantic search while persisting canonical docs/graph to **Mongo** **dual-sink**.
4. Ships a minimal **search API** and report dashboards.

No magic. Deterministic where it matters. Respect robots.txt. Idempotent by URL+content hash.

---

## 🎯 Goals

* Crawl N domains with polite rate-limits and **full robots compliance**.
* Build **Mongo-backed** hyperlink graph with normalized URLs + content hashes.
* Produce **LLM summaries** ≤ \~200–300 tokens + **#tags** 3–12 concise tokens, no spaces; use kebab\_case if needed.
* Persist to **Mongo (canonical)** and **Chroma (embeddings)** via **dual-sink** path with consistent IDs.
* Provide **Fastify** endpoints for query, node/edge retrieval, and health/metrics.
* Ship **runbooks + configs**. No internet writes in tests.

---

## 📦 Requirements / Definition of Done non-negotiable

* **Robots**: agent obeys `robots.txt` disallow, crawl-delay, sitemap parsing and honors per-host concurrency ≤ 1 unless `crawl-delay` permits.
* **Politeness**: global QPS + per-domain throttles, retry/backoff, and user-agent string configurable.
* **Safety**: block private IP ranges, login/checkout forms, and obvious traps `calendar`, infinite params via URL canonicalizer & deny-lists.
* **Idempotency**: dedupe by **canonical\_url** and **content\_sha256**. Re-crawls only when ETag/Last-Modified or max-age expires.
* **Dual-sink**: Mongo = source of truth (docs, graph, summaries, tags, embeddings meta). Chroma = embeddings (search). Atomic-ish write 2-phase best-effort + retry.
* **LLM passes separated**: summary pass ≠ tag pass distinct prompts, reproducible seeds/temperature=0 where possible.
* **Search**: cosine/inner-product over summaries in Chroma; metadata filterable by domain, tags.
* **Observability**: metrics, structured logs, integrity reports counts, orphans, embedding dim/model.
* **No new TS path aliases**. Use **@shared/ts/dist/** only.
* **Docs + runbooks** checked in.
* **CI**: fully offline mocked tests; no network calls.

---

## 🧱 Architecture high-level

* **services/ts/crawler** — polite fetcher + HTML parser + link extractor + robots manager.
* **services/ts/graph** — Mongo persistence for `pages`, `edges`, dedupe, versioning.
* **services/ts/summarizer** — LLM summaries Ollama/Qwen3 etc., deterministic prompts, batch-safe.
* **services/ts/tagger** — LLM tag extraction Obsidian-style `#tags`, policy checks.
* **services/ts/indexer** — dual-sink upserts → Mongo (canonical record) + Chroma (embeddings of summaries).
* **services/ts/search** — Fastify API for semantic + filter search, node/edge fetch.
* **shared/ts/** — URL canonicalizer, robots client, fetch middleware, content hashing, retry, backoff, instrumentation, dual-sink helpers.

**Data flow**: `seed → crawl(page) → parse → normalize+hash → store page → extract links → store edges → enqueue LLM summary → enqueue tags → index to Chroma → searchable`.

---

## 🗃️ Data Model (Mongo; sketch)

```ts
// pages
{
  _id: "<canonical_url_sha1>",
  url: "https://example.com/a?b=1#c",
  canonical_url: "https://example.com/a?b=1",
  domain: "example.com",
  first_seen_at: ISODate,
  last_crawled_at: ISODate,
  http: { status: 200, etag: "...", last_modified: "...", content_type: "text/html" },
  content_sha256: "<hex>",
  lang: "en",
  title: "Page title",
  text_excerpt: "First N chars...",
  summary: { text: "...", model: "qwen3-xxx", version: "yyy", ts: ISODate },
  tags: ["#ai", "#ethics", "#promethean"],
  embedding: { dim: 1536, model: "qwen2.5-embed:2025-08-01", sha256: "<vec-hash>" }, // optional cache
  flags: { blocked_by_robots: false, error: false, dynamic: false },
  meta: { ... },
  version: 3 // bump when schema changes
}

// edges
{
  _id: "<from_sha1>-><to_sha1>",
  from: "<page._id>",
  to: "<page._id>",
  rel: "a[href]",
  anchor_text: "read more",
  first_seen_at: ISODate,
  last_seen_at: ISODate
}
```
```
**Chroma** collection (e.g., `promethean_web_summaries`):
```
* `id` = `page._id`
* `document` = `summary.text`
* `metadata` = `{ url, domain, tags, lang, title }`
* `embedding` = vector for `summary.text` pin dim/model.

---

## 🔧 Configuration (envs)

```
SEEDS=https://example.com,https://news.ycombinator.com
USER_AGENT=PrometheanCrawler/1.0 (+https://your.site)
GLOBAL_QPS=0.5
PER_HOST_CONCURRENCY=1
TIMEOUT_MS=15000
MAX_PAGES=20000
MAX_DEPTH=5
ALLOW_DOMAINS=example.com,another.org
DENY_PATTERNS=/logout,/signin,/cart,*.pdf,*.zip
CRAWL_CACHE_TTL_H=72
SUMMARY_MODEL=qwen3:instruct
TAGGER_MODEL=qwen3:instruct
EMBED_MODEL=qwen2.5-embed:2025-08-01
EMBED_DIM=1536
DUAL_WRITE_ENABLED=true
CDC_ENABLED=false
```

---

## 📋 Tasks & Subtasks

### A) Foundations

* [ ] **URL Normalization & Hashing** `@shared/ts/dist/web/url`: strip fragments, sort query keys, drop tracking params `utm_*`, punycode, lower-host, collapse slashes. `content_sha256(buf|text)` helper.
* [ ] **Robots** `@shared/ts/dist/web/robots`: fetch/cache robots per host; `allowed(url)`, `crawlDelay(host)`, `sitemaps(host)`.
* [ ] **Fetcher** `@shared/ts/dist/web/fetcher`: HTTP(S) with retries, backoff, gzip/br, size caps, mime sniff, charset decode, ETag/Last-Modified handling, disallow private IPs.
* [ ] **Parser** `@shared/ts/dist/web/html`: JSDOM/cheerio; extract title, text (readability), links (absolute hrefs), lang, meta robots.

### B) Crawler Service `services/ts/crawler`

* [ ] Frontier queue w/ politeness: per-domain token bucket; persistent frontier in Mongo for crash-safe resume.
* [ ] Seed loader SEEDS + sitemaps.
* [ ] Visit loop: `fetch → parse → normalize+hash → upsert page shell → upsert edges → enqueue LLM jobs`.
* [ ] Dedup guard: skip if `content_sha256` unchanged and TTL not expired.
* [ ] Backoff on 4xx/5xx; classify 3xx, update canonical.
* [ ] Metrics: pages\_fetched, pages\_skipped, robots\_blocked, bytes\_downloaded, per-host timings.

### C) Graph Persistence `services/ts/graph`

* [ ] Upsert `pages` + `edges` with unique indexes.
* [ ] Track `first_seen_at`/`last_crawled_at`.
* [ ] Simple node degree stats for sanity.

### D) LLM Passes

* [ ] **Summarizer** `services/ts/summarizer`:

  * Deterministic prompt (temperature 0). Include safety: “no private data; cite URL domain if needed.”
  * Truncate long texts head+tail windows with ellipsis policy.
  * Store `summary.text`, model id, ts.
* [ ] **Tagger** `services/ts/tagger`:

  * Extract 3–12 topic tags; single tokens kebab\_case if multiword.
  * Enforce `#` prefix in Mongo; store also without `#` in metadata for Chroma filter.
  * Validate against deny-list (e.g., `#login`, `#home`).
* [ ] **Batching & Retries**; dead-letter queue for persistent failures; metrics.

### E) Indexer Dual-Sink `services/ts/indexer`

* [ ] Verify `EMBED_MODEL` + `EMBED_DIM` against Chroma collection metadata (hard fail on mismatch).
* [ ] Compute embedding of `summary.text` (not full page body).
* [ ] Upsert **Mongo** summary/tag/embedding metadata **first**; then Chroma upsert.
* [ ] Retry policy; reconciliation job to re-sync any `id`s missing in Chroma.

### F) Search API `services/ts/search`

* [ ] `/search?q=...&tags=...&domain=...` → semantic results from Chroma with Mongo hydration (title,url,tags).
* [ ] `/page/:id` → page doc, edges in/out, neighbors minimal.
* [ ] `/metrics`, `/healthz`.

### G) Observability & Integrity

* [ ] Counters/histograms: fetch latency, LLM latency, embed latency, queue sizes, failures.
* [ ] **Integrity report** job: Mongo count vs Chroma count, orphan detection, dim/model verification, top domains, degree distro.
* [ ] Reports saved under `docs/data/reports/*.json|.md`.

### H) Safety/Abuse Prevention

* [ ] Disallow forms by default; ignore `POST` links; skip URLs with session tokens.
* [ ] Block `.onion`, local/CGI, cloud metadata IP ranges.
* [ ] Strict size cap (e.g., 5MB) and content-type allow-list text/html, text/plain, application/xhtml+xml.
* [ ] Respect `noindex`, `nofollow` (configurable). Default: **follow** unless `nofollow`.

### I) CI & Tests

* [ ] Mock HTTP server + snapshots of pages; robots fixtures; crawl 10 pages; assert graph, summaries, tags.
* [ ] No external network.
* [ ] Pre-commit/CI lint to forbid unpinned models and floating configs (leverages your pins linter).

---

## ✅ Acceptance Criteria

* [ ] **Robots-compliant** crawl of a seeded test domain producing ≥ 100 pages & ≥ 300 edges with < 1% duplicate nodes by `canonical_url`.
* [ ] **Summaries** exist for ≥ 95% `text/html` pages; average length 60–200 tokens; **temperature=0**.
* [ ] **Tags** present (3–12 each), all prefixed `#`, kebab\_case if multiword.
* [ ] **Dual-sink**: Mongo pages count == Chroma ids count ± exclusions like robots-blocked. Integrity report saved.
* [ ] **Search API** returns relevant results for sample queries, filterable by tag/domain.
* [ ] **Observability**: metrics endpoints live; latency histograms populated.
* [ ] **Safety**: crawler never requests private networks in tests; rate limits enforce ≤ configured QPS; denies dangerous paths.
* [ ] **Docs**: architecture doc + runbooks committed and linked.

---

## 📂 Proposed Files/Paths

* `shared/ts/src/web/url.ts` — canonicalization, hash, deny-patterns
* `shared/ts/src/web/robots.ts` — robots client/cache
* `shared/ts/src/web/fetcher.ts` — retries, backoff, caps, MIME, safety
* `shared/ts/src/web/html.ts` — parse, readability, link extraction
* `shared/ts/src/dual_sink/index.ts` — helpers for Mongo+Chroma atomic-ish upserts
* `services/ts/crawler/main.ts` — frontier, politeness, crawl loop
* `services/ts/graph/store.ts` — Mongo upserts, indexes
* `services/ts/summarizer/main.ts` — summary jobs
* `services/ts/tagger/main.ts` — tag extraction jobs
* `services/ts/indexer/main.ts` — embed + chroma upsert
* `services/ts/search/server.ts` — Fastify endpoints
* `docs/agents/web-crawler.md` — architecture & config
* `docs/runbooks/crawler-ops.md` — operations, scaling, pause/resume
* `docs/data/reports/*.md|*.json` — integrity outputs

*Export via **@shared/ts/dist/**, no new aliases.*

---

## 🔌 Broker & Queues (optional but recommended)

* Topics:

  * `crawler.page.fetched`, `crawler.page.parsed`, `crawler.page.error`
  * `llm.summary.requested|completed`, `llm.tags.requested|completed`
  * `indexer.upsert.requested|completed|error`
* Backpressure with bounded queues; dead-letter for failures.

---

## 🧪 Prompt Sketches (deterministic)
```
**Summary (temperature 0):**
```
“Summarize the page at {url} concisely <= 8 sentences. No marketing fluff. Include key claims, entities, and any numbers. Output plain text.”
```
**Tags (temperature 0):**
```
“Extract 3–12 topic tags for the page at {url}. Single tokens only; use kebab\_case for multiword e.g., `ai-safety`. Return as a comma-separated list with leading `#`.”

---

## 🪪 Rate-Limit & Politeness

* Token bucket per domain; adjustable via robots crawl-delay if present.
* Global max concurrency; graceful pause/resume via control topic or REST.

---

## 🧯 Runbooks

* `seed → dry-run crawl (10 pages) → full crawl → LLM passes → index → integrity report → search smoke test`.
* Rollback: disable indexer; mark summaries stale; re-embed with corrected model; re-index.

---

## 🧱 Step 1–4 Milestones (your minimal format)

* [ ] **Step 1 — Foundations**: URL canonicalizer, robots client, fetcher, parser; Mongo schemas & indexes; integrity skeleton.
* [ ] **Step 2 — Crawl & Graph**: frontier, dedupe, edges, persistence, metrics; seed crawling against fixtures.
* [ ] **Step 3 — LLM Passes & Dual-Sink**: summarizer, tagger, embedder, Chroma upserts, reconciliation, integrity report.
* [ ] **Step 4 — Search & Ops**: Fastify search API, dashboards/metrics, docs/runbooks, CI offline tests.

---

## 🔍 Relevant Resources

* You might find \[this] useful while working on this task
  *point to your internal notes on URL canonicalization/robots and your existing dual-sink helpers*

---

## Comments

Append-only thread: record domain-specific deny-lists, prompt tweaks, and any integrity anomalies # of orphans, dim mismatches, etc.

\#tags #promethean #agent #crawler #hyperlink-graph #summarization #tags #obsidian #chroma #mongodb #dual-sink #fastify #ollama #qwen #readability #robots #search #observability

## Notes
- Tests or documentation are missing; acceptance criteria not fully met.
- Story Points: 8
```
#in-progress
```
