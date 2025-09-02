---
uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
created_at: 2025.08.31.11.21.12.md
filename: Pure-Node Crawl Stack with Playwright and Crawlee
description: >-
  A local, self-hosted JavaScript crawling solution using Playwright and Crawlee
  for data extraction. Supports optional local proxy for traffic control and
  integrates with Meilisearch/OpenSearch for indexing via HTTP.
tags:
  - JavaScript
  - Playwright
  - Crawlee
  - Meilisearch
  - OpenSearch
  - Local Proxy
  - Data Extraction
  - Self-Hosted
related_to_title: []
related_to_uuid: []
references: []
---
Heard. JS or bust. Here’s a **pure-Node** crawling stack: Playwright + Crawlee, no Python anywhere, no SaaS, no tokens. Local proxy optional. Data lands as JSONL and (optionally) streams into Meilisearch/OpenSearch—both via HTTP from Node. ^ref-d527c05d-1-0

---

# `docker-compose.yml` (crawl-only, JS)

Drop this into your compose (or a standalone file) and run with the `crawl-js` profile. ^ref-d527c05d-7-0

```yaml
version: "3.9"

networks:
  prom-net:
    driver: bridge

volumes:
  crawl_data:
  crawl_storage:     # crawlee request queue + dataset persistence
  crawl_workspace:

services:
  # Optional local proxy (good for central throttle/egress control)
  squid:
    profiles: ["crawl-js","proxy"]
    image: squidfunk/squid:latest
    ports: ["3128:3128"]
    volumes:
      - ./infra/squid/squid.conf:/etc/squid/squid.conf:ro
    networks: [prom-net]
    restart: unless-stopped

  # JS crawler (Playwright chromium baked in)
  crawler-js:
    profiles: ["crawl-js"]
    image: mcr.microsoft.com/playwright:v1.47.2-jammy
    working_dir: /workspace
    environment:
      # --- core crawl knobs (override via env or .env) ---
      - CRAWL_SEED=https://example.org
      - CRAWL_MAX_PAGES=200
      - CRAWL_CONCURRENCY=6
      - CRAWL_REQS_PER_MIN=120
      - RESPECT_ROBOTS=true
      - SAME_DOMAIN_ONLY=true
      - ALLOW_LIST= # comma-separated regex; empty = allow all
      - DENY_LIST=  # comma-separated regex; empty = deny none
      - PROXY_URL=http://squid:3128
      - OUTPUT_DIR=/data
      - SITEMAP_DISCOVER=true
      - RSS_DISCOVER=true
      - DEDUP_NORMALIZE=true
      # --- sinks (all local, optional) ---
      - SINK_OPENSEARCH_URL=        # e.g. http://opensearch:9200
      - SINK_OPENSEARCH_INDEX=documents
      - SINK_MEILI_URL=             # e.g. http://meilisearch:7700
      - SINK_MEILI_KEY=             # optional local master key
      - SINK_MEILI_INDEX=documents
    command: bash -lc "npm ci && node src/crawl.js"
    volumes:
      - ./infra/crawler-js:/workspace:rw        # your code
      - crawl_data:/data                        # JSONL output
      - crawl_storage:/workspace/storage        # Crawlee persistence
    depends_on:
      - squid
    networks: [prom-net]
    restart: "no"
```
^ref-d527c05d-9-0

---

# File tree
 ^ref-d527c05d-73-0
```
infra/
├─ squid/
│  └─ squid.conf
└─ crawler-js/
   ├─ package.json
   ├─ package-lock.json      # optional
   └─ src/
      ├─ crawl.js
      ├─ sinks.js
      ├─ utils.js
      └─ ua.json            # small rotating UA set
^ref-d527c05d-73-0
```

---

# `infra/squid/squid.conf` (LAN-only, no caching) ^ref-d527c05d-91-0

```conf
http_port 3128
acl localnet src 10.0.0.0/8 172.16.0.0/12 192.168.0.0/16
http_access allow localnet
http_access deny all
dns_v4_first on
pipeline_prefetch off
request_header_access Authorization deny all
reply_header_access Server deny all
^ref-d527c05d-91-0
cache deny all
```

---
 ^ref-d527c05d-107-0
# `infra/crawler-js/package.json`

```json
{
  "name": "crawler-js",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node src/crawl.js"
  },
  "dependencies": {
    "crawlee": "^3.9.2",
    "playwright": "^1.47.2",
    "robots-parser": "^3.0.1",
    "node-fetch": "^3.3.2",
    "fast-xml-parser": "^4.5.0",
    "p-limit": "^6.2.0"
^ref-d527c05d-107-0
  }
}
```

--- ^ref-d527c05d-130-0

# `infra/crawler-js/src/utils.js`

```js
import robotsParser from 'robots-parser';
import fetch from 'node-fetch';

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export function compileRegexList(csv) {
  if (!csv) return [];
  return csv.split(',').map(s => s.trim()).filter(Boolean).map(s => new RegExp(s, 'i'));
}

export function normalizeUrlForDedup(url) {
  try {
    const u = new URL(url);
    u.hash = '';
    u.searchParams.sort();
    // Strip common tracking params
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','igshid','fbclid'].forEach(p => u.searchParams.delete(p));
    return u.toString();
  } catch { return url; }
}

export async function buildRobotsForOrigin(origin, proxyAgent) {
  const robotsUrl = `${origin}/robots.txt`;
  try {
    const res = await fetch(robotsUrl, { agent: proxyAgent, timeout: 10000 });
    const txt = res.ok ? await res.text() : '';
    return robotsParser(robotsUrl, txt);
  } catch {
    return robotsParser(robotsUrl, '');
  }
}

export function decideUrl(url, { sameDomainOnly, seedOrigin, allow, deny }) {
  try {
    const u = new URL(url);
    if (sameDomainOnly && u.origin !== seedOrigin) return false;
    if (deny.some(rx => rx.test(url))) return false;
    if (allow.length && !allow.some(rx => rx.test(url))) return false;
^ref-d527c05d-130-0
    return true;
  } catch { return false; }
}
```
 ^ref-d527c05d-178-0
---

# `infra/crawler-js/src/sinks.js`

```js
import fetch from 'node-fetch';

export async function sinkToOpenSearch(docs, { url, index }) {
  if (!url || !index || docs.length === 0) return;
  const nd = docs.flatMap(d => [{ index: { _index: index } }, d]).map(x => JSON.stringify(x)).join('\n') + '\n';
  const res = await fetch(`${url}/_bulk`, { method: 'POST', headers: { 'Content-Type': 'application/x-ndjson' }, body: nd });
  if (!res.ok) {
    const t = await res.text().catch(()=>'');
    console.error('OpenSearch bulk failed', res.status, t.slice(0, 400));
  }
}

export async function sinkToMeili(docs, { url, index, apiKey }) {
  if (!url || !index || docs.length === 0) return;
  const res = await fetch(`${url}/indexes/${index}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}) },
    body: JSON.stringify(docs)
  });
  if (!res.ok) {
^ref-d527c05d-178-0
    const t = await res.text().catch(()=>'');
    console.error('Meili push failed', res.status, t.slice(0, 400));
  }
}
``` ^ref-d527c05d-209-0

--- ^ref-d527c05d-211-0

# `infra/crawler-js/src/ua.json`

Small list keeps it simple (rotate per request). Add your own.

```json
^ref-d527c05d-211-0
[
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36"
]
```
^ref-d527c05d-223-0

---

# `infra/crawler-js/src/crawl.js`

```js
import { PlaywrightCrawler, KeyValueStore, Dataset, log, Configuration } from 'crawlee';
import fs from 'node:fs';
import path from 'node:path';
import { Agent as HttpProxyAgent } from 'node:http';
import { Agent as HttpsProxyAgent } from 'node:https';
import { XMLParser } from 'fast-xml-parser';
import fetch from 'node-fetch';
import uaPool from './ua.json' assert { type: 'json' };
import { sleep, compileRegexList, normalizeUrlForDedup, buildRobotsForOrigin, decideUrl } from './utils.js';
import { sinkToOpenSearch, sinkToMeili } from './sinks.js';

const seed = process.env.CRAWL_SEED || 'https://example.org';
const maxPages = +process.env.CRAWL_MAX_PAGES || 200;
const concurrency = +process.env.CRAWL_CONCURRENCY || 6;
const rpm = +process.env.CRAWL_REQS_PER_MIN || 120;
const respectRobots = String(process.env.RESPECT_ROBOTS || 'true') === 'true';
const sameDomainOnly = String(process.env.SAME_DOMAIN_ONLY || 'true') === 'true';
const allow = compileRegexList(process.env.ALLOW_LIST || '');
const deny = compileRegexList(process.env.DENY_LIST || '');
const outputDir = process.env.OUTPUT_DIR || '/data';
const sitemapDiscover = String(process.env.SITEMAP_DISCOVER || 'true') === 'true';
const rssDiscover = String(process.env.RSS_DISCOVER || 'true') === 'true';
const dedupNormalize = String(process.env.DEDUP_NORMALIZE || 'true') === 'true';

const OS_URL = process.env.SINK_OPENSEARCH_URL || '';
const OS_INDEX = process.env.SINK_OPENSEARCH_INDEX || 'documents';
const MEILI_URL = process.env.SINK_MEILI_URL || '';
const MEILI_KEY = process.env.SINK_MEILI_KEY || '';
const MEILI_INDEX = process.env.SINK_MEILI_INDEX || 'documents';

fs.mkdirSync(outputDir, { recursive: true });
const outPath = path.join(outputDir, 'out.jsonl');
const appendJSONL = (o) => fs.appendFileSync(outPath, JSON.stringify(o) + '\n');

const seedUrl = new URL(seed);
const seedOrigin = seedUrl.origin;

const proxyUrl = process.env.PROXY_URL || '';
const httpAgent = proxyUrl ? new HttpProxyAgent(proxyUrl) : undefined;
const httpsAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

let robotsByOrigin = {};

async function maybeRobots(url) {
  const origin = new URL(url).origin;
  if (!respectRobots) return { isAllowed: () => true };
  if (!robotsByOrigin[origin]) robotsByOrigin[origin] = await buildRobotsForOrigin(origin, url.startsWith('https') ? httpsAgent : httpAgent);
  return robotsByOrigin[origin];
}

async function discoverSitemaps(origin) {
  if (!sitemapDiscover) return [];
  try {
    const res = await fetch(`${origin}/sitemap.xml`, { agent: origin.startsWith('https') ? httpsAgent : httpAgent, timeout: 10000 });
    if (!res.ok) return [];
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const j = parser.parse(xml);
    const urls = [];
    if (j.urlset?.url) {
      const arr = Array.isArray(j.urlset.url) ? j.urlset.url : [j.urlset.url];
      for (const u of arr) if (u.loc) urls.push(u.loc);
    }
    if (j.sitemapindex?.sitemap) {
      const arr = Array.isArray(j.sitemapindex.sitemap) ? j.sitemapindex.sitemap : [j.sitemapindex.sitemap];
      for (const sm of arr) if (sm.loc) urls.push(sm.loc);
    }
    return urls;
  } catch { return []; }
}

async function discoverRSS(origin) {
  if (!rssDiscover) return [];
  try {
    const res = await fetch(origin, { agent: origin.startsWith('https') ? httpsAgent : httpAgent, timeout: 10000 });
    if (!res.ok) return [];
    const html = await res.text();
    const matches = [...html.matchAll(/<link[^>]+type=['"]application\/(rss\+xml|atom\+xml)['"][^>]*>/gi)];
    const urls = [];
    for (const m of matches) {
      const href = (m[0].match(/href=['"]([^'"]+)['"]/i) || [])[1];
      if (href) urls.push(new URL(href, origin).toString());
    }
    return urls;
  } catch { return []; }
}

function rotateUA(i) {
  return uaPool[i % uaPool.length] || uaPool[0];
}

Configuration.set({ persistStorage: true, storageDir: './storage' });

const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: maxPages,
  maxConcurrency: concurrency,
  maxRequestsPerMinute: rpm,
  headless: true,
  requestHandlerTimeoutSecs: 60,
  launchContext: { launchOptions: { args: ['--no-sandbox', '--disable-dev-shm-usage'] } },
  async preNavigationHooks([{ request, session }, gotoOptions]) {
    // robots + allow/deny checks
    const urlToFetch = dedupNormalize ? normalizeUrlForDedup(request.url) : request.url;
    if (!decideUrl(urlToFetch, { sameDomainOnly, seedOrigin, allow, deny })) {
      request.noRetry = true; throw new Error('Filtered: allow/deny or cross-domain');
    }
    const rb = await maybeRobots(urlToFetch);
    if (!rb.isAllowed(urlToFetch, 'PrometheanCrawler')) {
      request.noRetry = true; throw new Error('Robots disallow');
    }
    // polite headers
    request.headers ??= {};
    request.headers['User-Agent'] = rotateUA(session?.id ? parseInt(session.id, 10) : Math.floor(Math.random() * 1000));
    request.headers['Accept-Language'] = 'en-US,en;q=0.9';
    if (proxyUrl) gotoOptions.proxy = { server: proxyUrl };
    gotoOptions.waitUntil = 'domcontentloaded';
  },
  async requestHandler({ request, page, enqueueLinks }) {
    const url = dedupNormalize ? normalizeUrlForDedup(request.url) : request.url;

    // content capture
    const title = await page.title().catch(()=>'');
    const content = await page.content().catch(()=>'');
    const now = new Date().toISOString();

    const doc = { url, title, content, fetched_at: now };

    appendJSONL(doc);
    await Dataset.pushData(doc);

    // Optional sinks (batch every N items in real life)
    await sinkToOpenSearch([doc], { url: OS_URL, index: OS_INDEX });
    await sinkToMeili([doc], { url: MEILI_URL, index: MEILI_INDEX, apiKey: MEILI_KEY });

    // enqueue same-domain links (or external if you toggled sameDomainOnly=false + allow rules)
    await enqueueLinks({
      strategy: sameDomainOnly ? 'same-domain' : 'all',
      transformRequestFunction: (req) => {
        req.url = dedupNormalize ? normalizeUrlForDedup(req.url) : req.url;
        return req;
      }
    });
  },
  async failedRequestHandler({ request, error }) {
    appendJSONL({ url: request.url, error: String(error), failed_at: new Date().toISOString() });
  }
});

// bootstrap queue with seed + sitemaps + rss
const rq = await KeyValueStore.open();
await rq.setValue('__meta__', { seed, started_at: new Date().toISOString() });

const initialUrls = new Set([seed]);
^ref-d527c05d-223-0
if (sitemapDiscover) for (const u of await discoverSitemaps(seedOrigin)) initialUrls.add(u);
if (rssDiscover) for (const u of await discoverRSS(seedOrigin)) initialUrls.add(u);

log.setLevel(log.LEVELS.INFO);
await crawler.run([...initialUrls]);
console.log(`JSONL: ${outPath}`);
^ref-d527c05d-389-0
```
^ref-d527c05d-389-0

---

# Run it

```bash
# bring up the proxy (optional) + crawler
docker compose --profile crawl-js up --build crawler-js

^ref-d527c05d-389-0
# tweak via env (examples) ^ref-d527c05d-402-0
CRAWL_SEED=https://news.ycombinator.com \
ALLOW_LIST="^https://news.ycombinator.com/,^https://ycombinator\.com/" \ ^ref-d527c05d-404-0
CRAWL_MAX_PAGES=500 \
CRAWL_CONCURRENCY=8 \
CRAWL_REQS_PER_MIN=240 \
^ref-d527c05d-404-0
^ref-d527c05d-402-0
docker compose --profile crawl-js up --build crawler-js ^ref-d527c05d-412-0
^ref-d527c05d-413-0 ^ref-d527c05d-414-0
^ref-d527c05d-412-0 ^ref-d527c05d-415-0
^ref-d527c05d-404-0 ^ref-d527c05d-416-0
^ref-d527c05d-402-0 ^ref-d527c05d-417-0
``` ^ref-d527c05d-413-0
^ref-d527c05d-413-0 ^ref-d527c05d-419-0
^ref-d527c05d-412-0
^ref-d527c05d-404-0 ^ref-d527c05d-421-0
^ref-d527c05d-402-0
^ref-d527c05d-400-0
 ^ref-d527c05d-414-0 ^ref-d527c05d-419-0
**Outputs** ^ref-d527c05d-415-0
 ^ref-d527c05d-412-0 ^ref-d527c05d-416-0 ^ref-d527c05d-421-0
* JSONL at `./crawl_data/out.jsonl` (volume) ^ref-d527c05d-413-0 ^ref-d527c05d-417-0
* Crawlee persistent storage (queue/dataset) at `./crawl_storage/` for resumability ^ref-d527c05d-414-0
 ^ref-d527c05d-415-0 ^ref-d527c05d-419-0
--- ^ref-d527c05d-416-0
 ^ref-d527c05d-417-0 ^ref-d527c05d-421-0
## Why this is solid (and stays JS) ^ref-d527c05d-432-0
 ^ref-d527c05d-419-0 ^ref-d527c05d-433-0
* Playwright + Crawlee = fast, headless, resilient, tested.
* Robots.txt respected, **allow/deny** regex gates, **same-domain** toggle. ^ref-d527c05d-421-0
* **UA rotation**, **rate limiting** (RPM), **concurrency** caps. ^ref-d527c05d-436-0
* **Dedup normalization** avoids re-crawling tracker variants. ^ref-d527c05d-432-0
* **Sitemap + RSS discovery** to fan out intelligently. ^ref-d527c05d-433-0
* **Local sinks** only (Meili/OpenSearch) — no external calls.
* Fully reproducible in Docker; no Python creep.
 ^ref-d527c05d-436-0 ^ref-d527c05d-441-0
Want me to add a **simple DOM extractor** (meta tags, visible text, main article heuristics) or a **per-domain config file** so you can override throttles/parsers without changing code? I can drop both in quickly. ^ref-d527c05d-432-0
 ^ref-d527c05d-433-0
\#webcrawling #javascript #playwright #crawlee #docker #airgapped #selfhosted #meilisearch #opensearch #obsidian<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Shared Package Structure](shared-package-structure.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Services](chunks/services.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [archetype-ecs](archetype-ecs.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [JavaScript](chunks/javascript.md)
- [Diagrams](chunks/diagrams.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Tooling](chunks/tooling.md)
- [Window Management](chunks/window-management.md)
- [field-interaction-equations](field-interaction-equations.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [EidolonField](eidolonfield.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [DSL](chunks/dsl.md)
- [Shared](chunks/shared.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Creative Moments](creative-moments.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [template-based-compilation](template-based-compilation.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [refactor-relations](refactor-relations.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Promethean State Format](promethean-state-format.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Refactor 05-footers.ts](refactor-05-footers-ts.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [i3-layout-saver](i3-layout-saver.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [promethean-requirements](promethean-requirements.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
## Sources
- [AI-Centric OS with MCP Layer — L1](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-1-0) (line 1, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L149](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-149-0) (line 149, col 0, score 0.69)
- [eidolon-field-math-foundations — L155](eidolon-field-math-foundations.md#^ref-008f2ac0-155-0) (line 155, col 0, score 0.69)
- [Migrate to Provider-Tenant Architecture — L309](migrate-to-provider-tenant-architecture.md#^ref-54382370-309-0) (line 309, col 0, score 0.69)
- [Per-Domain Policy System for JS Crawler — L469](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-469-0) (line 469, col 0, score 0.69)
- [Promethean Full-Stack Docker Setup — L440](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-440-0) (line 440, col 0, score 0.69)
- [Promethean Infrastructure Setup — L578](promethean-infrastructure-setup.md#^ref-6deed6ac-578-0) (line 578, col 0, score 0.69)
- [Promethean Web UI Setup — L605](promethean-web-ui-setup.md#^ref-bc5172ca-605-0) (line 605, col 0, score 0.69)
- [Prometheus Observability Stack — L507](prometheus-observability-stack.md#^ref-e90b5a16-507-0) (line 507, col 0, score 0.73)
- [Local-First Intention→Code Loop with Free Models — L81](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-81-0) (line 81, col 0, score 0.65)
- [Promethean-native config design — L355](promethean-native-config-design.md#^ref-ab748541-355-0) (line 355, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L196](dynamic-context-model-for-web-components.md#^ref-f7702bf8-196-0) (line 196, col 0, score 0.65)
- [Promethean-native config design — L330](promethean-native-config-design.md#^ref-ab748541-330-0) (line 330, col 0, score 0.64)
- [Per-Domain Policy System for JS Crawler — L446](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-446-0) (line 446, col 0, score 0.86)
- [Promethean-native config design — L52](promethean-native-config-design.md#^ref-ab748541-52-0) (line 52, col 0, score 0.62)
- [Prometheus Observability Stack — L1](prometheus-observability-stack.md#^ref-e90b5a16-1-0) (line 1, col 0, score 0.61)
- [i3-layout-saver — L82](i3-layout-saver.md#^ref-31f0166e-82-0) (line 82, col 0, score 0.6)
- [i3-layout-saver — L1](i3-layout-saver.md#^ref-31f0166e-1-0) (line 1, col 0, score 0.59)
- [Promethean Infrastructure Setup — L536](promethean-infrastructure-setup.md#^ref-6deed6ac-536-0) (line 536, col 0, score 0.59)
- [Agent Reflections and Prompt Evolution — L53](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-53-0) (line 53, col 0, score 0.59)
- [Promethean-native config design — L41](promethean-native-config-design.md#^ref-ab748541-41-0) (line 41, col 0, score 0.59)
- [Promethean Web UI Setup — L574](promethean-web-ui-setup.md#^ref-bc5172ca-574-0) (line 574, col 0, score 0.59)
- [Prometheus Observability Stack — L7](prometheus-observability-stack.md#^ref-e90b5a16-7-0) (line 7, col 0, score 0.61)
- [AI-Centric OS with MCP Layer — L185](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-185-0) (line 185, col 0, score 0.7)
- [Promethean Infrastructure Setup — L93](promethean-infrastructure-setup.md#^ref-6deed6ac-93-0) (line 93, col 0, score 0.69)
- [Per-Domain Policy System for JS Crawler — L9](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-9-0) (line 9, col 0, score 0.65)
- [Pure TypeScript Search Microservice — L14](pure-typescript-search-microservice.md#^ref-d17d3a96-14-0) (line 14, col 0, score 0.73)
- [Per-Domain Policy System for JS Crawler — L27](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-27-0) (line 27, col 0, score 0.59)
- [Per-Domain Policy System for JS Crawler — L467](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-467-0) (line 467, col 0, score 0.91)
- [Promethean Full-Stack Docker Setup — L404](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-404-0) (line 404, col 0, score 0.71)
- [AI-Centric OS with MCP Layer — L33](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-33-0) (line 33, col 0, score 0.73)
- [AI-Centric OS with MCP Layer — L13](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-13-0) (line 13, col 0, score 0.68)
- [AI-Centric OS with MCP Layer — L12](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-12-0) (line 12, col 0, score 0.66)
- [Interop and Source Maps — L13](interop-and-source-maps.md#^ref-cdfac40c-13-0) (line 13, col 0, score 0.64)
- [ecs-offload-workers — L443](ecs-offload-workers.md#^ref-6498b9d7-443-0) (line 443, col 0, score 0.63)
- [Local-Offline-Model-Deployment-Strategy — L240](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-240-0) (line 240, col 0, score 0.63)
- [Promethean Web UI Setup — L9](promethean-web-ui-setup.md#^ref-bc5172ca-9-0) (line 9, col 0, score 0.61)
- [Model Selection for Lightweight Conversational Tasks — L105](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-105-0) (line 105, col 0, score 0.61)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.61)
- [Per-Domain Policy System for JS Crawler — L117](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-117-0) (line 117, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L439](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-439-0) (line 439, col 0, score 0.82)
- [AI-Centric OS with MCP Layer — L8](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-8-0) (line 8, col 0, score 0.71)
- [api-gateway-versioning — L276](api-gateway-versioning.md#^ref-0580dcd3-276-0) (line 276, col 0, score 0.67)
- [Promethean Infrastructure Setup — L553](promethean-infrastructure-setup.md#^ref-6deed6ac-553-0) (line 553, col 0, score 0.67)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.97)
- [observability-infrastructure-setup — L7](observability-infrastructure-setup.md#^ref-b4e64f8c-7-0) (line 7, col 0, score 0.67)
- [Promethean Infrastructure Setup — L471](promethean-infrastructure-setup.md#^ref-6deed6ac-471-0) (line 471, col 0, score 0.68)
- [Promethean Pipelines — L16](promethean-pipelines.md#^ref-8b8e6103-16-0) (line 16, col 0, score 0.66)
- [Promethean Infrastructure Setup — L287](promethean-infrastructure-setup.md#^ref-6deed6ac-287-0) (line 287, col 0, score 0.69)
- [AI-Centric OS with MCP Layer — L279](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-279-0) (line 279, col 0, score 0.7)
- [Pure TypeScript Search Microservice — L46](pure-typescript-search-microservice.md#^ref-d17d3a96-46-0) (line 46, col 0, score 0.65)
- [observability-infrastructure-setup — L44](observability-infrastructure-setup.md#^ref-b4e64f8c-44-0) (line 44, col 0, score 0.63)
- [Promethean Infrastructure Setup — L61](promethean-infrastructure-setup.md#^ref-6deed6ac-61-0) (line 61, col 0, score 0.63)
- [api-gateway-versioning — L7](api-gateway-versioning.md#^ref-0580dcd3-7-0) (line 7, col 0, score 0.62)
- [observability-infrastructure-setup — L304](observability-infrastructure-setup.md#^ref-b4e64f8c-304-0) (line 304, col 0, score 0.61)
- [observability-infrastructure-setup — L267](observability-infrastructure-setup.md#^ref-b4e64f8c-267-0) (line 267, col 0, score 0.61)
- [Promethean Web UI Setup — L44](promethean-web-ui-setup.md#^ref-bc5172ca-44-0) (line 44, col 0, score 0.68)
- [Promethean Full-Stack Docker Setup — L169](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-169-0) (line 169, col 0, score 0.64)
- [Exception Layer Analysis — L23](exception-layer-analysis.md#^ref-21d5cc09-23-0) (line 23, col 0, score 0.61)
- [AI-Centric OS with MCP Layer — L21](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-21-0) (line 21, col 0, score 0.61)
- [RAG UI Panel with Qdrant and PostgREST — L81](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-81-0) (line 81, col 0, score 0.64)
- [Promethean Infrastructure Setup — L415](promethean-infrastructure-setup.md#^ref-6deed6ac-415-0) (line 415, col 0, score 0.71)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.72)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L557](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-557-0) (line 557, col 0, score 0.71)
- [Promethean Agent DSL TS Scaffold — L488](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-488-0) (line 488, col 0, score 0.71)
- [Promethean Agent DSL TS Scaffold — L738](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-738-0) (line 738, col 0, score 0.7)
- [Promethean Infrastructure Setup — L439](promethean-infrastructure-setup.md#^ref-6deed6ac-439-0) (line 439, col 0, score 0.7)
- [Chroma-Embedding-Refactor — L66](chroma-embedding-refactor.md#^ref-8b256935-66-0) (line 66, col 0, score 0.71)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.7)
- [prom-lib-rate-limiters-and-replay-api — L106](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-106-0) (line 106, col 0, score 0.66)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.67)
- [TypeScript Patch for Tool Calling Support — L35](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-35-0) (line 35, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L380](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-380-0) (line 380, col 0, score 0.68)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.68)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.68)
- [Pure TypeScript Search Microservice — L378](pure-typescript-search-microservice.md#^ref-d17d3a96-378-0) (line 378, col 0, score 0.68)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.65)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L132](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-132-0) (line 132, col 0, score 0.67)
- [RAG UI Panel with Qdrant and PostgREST — L140](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-140-0) (line 140, col 0, score 0.67)
- [Pure TypeScript Search Microservice — L306](pure-typescript-search-microservice.md#^ref-d17d3a96-306-0) (line 306, col 0, score 0.68)
- [Pure TypeScript Search Microservice — L227](pure-typescript-search-microservice.md#^ref-d17d3a96-227-0) (line 227, col 0, score 0.73)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.72)
- [Promethean Infrastructure Setup — L456](promethean-infrastructure-setup.md#^ref-6deed6ac-456-0) (line 456, col 0, score 0.67)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.71)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.67)
- [Cross-Target Macro System in Sibilant — L107](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-107-0) (line 107, col 0, score 0.65)
- [Pure TypeScript Search Microservice — L178](pure-typescript-search-microservice.md#^ref-d17d3a96-178-0) (line 178, col 0, score 0.7)
- [Cross-Target Macro System in Sibilant — L121](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-121-0) (line 121, col 0, score 0.7)
- [Promethean Pipelines — L87](promethean-pipelines.md#^ref-8b8e6103-87-0) (line 87, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L10](performance-optimized-polyglot-bridge.md#^ref-f5579967-10-0) (line 10, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.63)
- [Lisp-Compiler-Integration — L521](lisp-compiler-integration.md#^ref-cfee6d36-521-0) (line 521, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L26](chroma-embedding-refactor.md#^ref-8b256935-26-0) (line 26, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.61)
- [Agent Reflections and Prompt Evolution — L103](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-103-0) (line 103, col 0, score 0.61)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L31](dynamic-context-model-for-web-components.md#^ref-f7702bf8-31-0) (line 31, col 0, score 0.61)
- [Promethean Pipelines — L38](promethean-pipelines.md#^ref-8b8e6103-38-0) (line 38, col 0, score 0.61)
- [sibilant-metacompiler-overview — L49](sibilant-metacompiler-overview.md#^ref-61d4086b-49-0) (line 49, col 0, score 0.61)
- [AI-Centric OS with MCP Layer — L14](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-14-0) (line 14, col 0, score 0.61)
- [universal-intention-code-fabric — L393](universal-intention-code-fabric.md#^ref-c14edce7-393-0) (line 393, col 0, score 0.61)
- [Unique Info Dump Index — L45](unique-info-dump-index.md#^ref-30ec3ba6-45-0) (line 45, col 0, score 0.55)
- [ecs-scheduler-and-prefabs — L398](ecs-scheduler-and-prefabs.md#^ref-c62a1815-398-0) (line 398, col 0, score 0.47)
- [Local-Only-LLM-Workflow — L184](local-only-llm-workflow.md#^ref-9a8ab57e-184-0) (line 184, col 0, score 0.47)
- [Migrate to Provider-Tenant Architecture — L323](migrate-to-provider-tenant-architecture.md#^ref-54382370-323-0) (line 323, col 0, score 0.47)
- [Model Selection for Lightweight Conversational Tasks — L148](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-148-0) (line 148, col 0, score 0.47)
- [mystery-lisp-search-session — L125](mystery-lisp-search-session.md#^ref-513dc4c7-125-0) (line 125, col 0, score 0.47)
- [obsidian-ignore-node-modules-regex — L71](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-71-0) (line 71, col 0, score 0.47)
- [Obsidian Templating Plugins Integration Guide — L116](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-116-0) (line 116, col 0, score 0.47)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L180](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-180-0) (line 180, col 0, score 0.47)
- [Optimizing Command Limitations in System Design — L42](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-42-0) (line 42, col 0, score 0.47)
- [api-gateway-versioning — L79](api-gateway-versioning.md#^ref-0580dcd3-79-0) (line 79, col 0, score 0.65)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.69)
- [Event Bus MVP — L370](event-bus-mvp.md#^ref-534fe91d-370-0) (line 370, col 0, score 0.68)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.67)
- [Promethean Agent DSL TS Scaffold — L647](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-647-0) (line 647, col 0, score 0.67)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.68)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.67)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.65)
- [schema-evolution-workflow — L98](schema-evolution-workflow.md#^ref-d8059b6a-98-0) (line 98, col 0, score 0.66)
- [TypeScript Patch for Tool Calling Support — L189](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-189-0) (line 189, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.67)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.67)
- [Promethean Web UI Setup — L563](promethean-web-ui-setup.md#^ref-bc5172ca-563-0) (line 563, col 0, score 0.72)
- [Pure TypeScript Search Microservice — L62](pure-typescript-search-microservice.md#^ref-d17d3a96-62-0) (line 62, col 0, score 0.72)
- [Per-Domain Policy System for JS Crawler — L1](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-1-0) (line 1, col 0, score 0.71)
- [Promethean Full-Stack Docker Setup — L388](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-388-0) (line 388, col 0, score 0.7)
- [Local-Offline-Model-Deployment-Strategy — L255](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-255-0) (line 255, col 0, score 0.7)
- [prompt-programming-language-lisp — L33](prompt-programming-language-lisp.md#^ref-d41a06d1-33-0) (line 33, col 0, score 0.78)
- [heartbeat-simulation-snippets — L29](heartbeat-simulation-snippets.md#^ref-23e221e9-29-0) (line 29, col 0, score 0.72)
- [polymorphic-meta-programming-engine — L147](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-147-0) (line 147, col 0, score 0.68)
- [Promethean-Copilot-Intent-Engine — L40](promethean-copilot-intent-engine.md#^ref-ae24a280-40-0) (line 40, col 0, score 0.67)
- [lisp-dsl-for-window-management — L156](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-156-0) (line 156, col 0, score 0.67)
- [markdown-to-org-transpiler — L245](markdown-to-org-transpiler.md#^ref-ab54cdd8-245-0) (line 245, col 0, score 0.65)
- [sibilant-metacompiler-overview — L16](sibilant-metacompiler-overview.md#^ref-61d4086b-16-0) (line 16, col 0, score 0.65)
- [Promethean Agent Config DSL — L143](promethean-agent-config-dsl.md#^ref-2c00ce45-143-0) (line 143, col 0, score 0.64)
- [layer-1-uptime-diagrams — L46](layer-1-uptime-diagrams.md#^ref-4127189a-46-0) (line 46, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L149](dynamic-context-model-for-web-components.md#^ref-f7702bf8-149-0) (line 149, col 0, score 0.63)
- [template-based-compilation — L60](template-based-compilation.md#^ref-f8877e5e-60-0) (line 60, col 0, score 0.62)
- [Cross-Language Runtime Polymorphism — L119](cross-language-runtime-polymorphism.md#^ref-c34c36a6-119-0) (line 119, col 0, score 0.61)
- [Refactor 05-footers.ts — L3](refactor-05-footers-ts.md#^ref-80d4d883-3-0) (line 3, col 0, score 0.61)
- [Refactor Frontmatter Processing — L4](refactor-frontmatter-processing.md#^ref-cfbdca2f-4-0) (line 4, col 0, score 0.61)
- [refactor-relations — L3](refactor-relations.md#^ref-41ce0216-3-0) (line 3, col 0, score 0.61)
- [Cross-Language Runtime Polymorphism — L20](cross-language-runtime-polymorphism.md#^ref-c34c36a6-20-0) (line 20, col 0, score 0.58)
- [AI-Centric OS with MCP Layer — L177](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-177-0) (line 177, col 0, score 0.58)
- [plan-update-confirmation — L585](plan-update-confirmation.md#^ref-b22d79c6-585-0) (line 585, col 0, score 0.57)
- [api-gateway-versioning — L270](api-gateway-versioning.md#^ref-0580dcd3-270-0) (line 270, col 0, score 0.57)
- [Model Selection for Lightweight Conversational Tasks — L116](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-116-0) (line 116, col 0, score 0.56)
- [TypeScript Patch for Tool Calling Support — L175](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-175-0) (line 175, col 0, score 0.64)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.64)
- [Pure TypeScript Search Microservice — L513](pure-typescript-search-microservice.md#^ref-d17d3a96-513-0) (line 513, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L85](migrate-to-provider-tenant-architecture.md#^ref-54382370-85-0) (line 85, col 0, score 0.62)
- [2d-sandbox-field — L209](2d-sandbox-field.md#^ref-c710dc93-209-0) (line 209, col 0, score 0.61)
- [Agent Reflections and Prompt Evolution — L143](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-143-0) (line 143, col 0, score 0.61)
- [AI-Centric OS with MCP Layer — L417](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-417-0) (line 417, col 0, score 0.61)
- [aionian-circuit-math — L159](aionian-circuit-math.md#^ref-f2d83a77-159-0) (line 159, col 0, score 0.61)
- [AI-Centric OS with MCP Layer — L10](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-10-0) (line 10, col 0, score 0.76)
- [Per-Domain Policy System for JS Crawler — L458](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-458-0) (line 458, col 0, score 0.63)
- [AI-Centric OS with MCP Layer — L30](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-30-0) (line 30, col 0, score 0.64)
- [AI-Centric OS with MCP Layer — L178](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-178-0) (line 178, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L18](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-18-0) (line 18, col 0, score 0.65)
- [Local-Only-LLM-Workflow — L161](local-only-llm-workflow.md#^ref-9a8ab57e-161-0) (line 161, col 0, score 0.64)
- [AI-Centric OS with MCP Layer — L397](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-397-0) (line 397, col 0, score 0.73)
- [Per-Domain Policy System for JS Crawler — L444](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-444-0) (line 444, col 0, score 0.63)
- [Per-Domain Policy System for JS Crawler — L109](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-109-0) (line 109, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.62)
- [Performance-Optimized-Polyglot-Bridge — L13](performance-optimized-polyglot-bridge.md#^ref-f5579967-13-0) (line 13, col 0, score 0.64)
- [layer-1-uptime-diagrams — L143](layer-1-uptime-diagrams.md#^ref-4127189a-143-0) (line 143, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L144](migrate-to-provider-tenant-architecture.md#^ref-54382370-144-0) (line 144, col 0, score 0.59)
- [Mongo Outbox Implementation — L544](mongo-outbox-implementation.md#^ref-9c1acd1e-544-0) (line 544, col 0, score 0.6)
- [Layer1SurvivabilityEnvelope — L137](layer1survivabilityenvelope.md#^ref-64a9f9f9-137-0) (line 137, col 0, score 0.59)
- [Functional Embedding Pipeline Refactor — L25](functional-embedding-pipeline-refactor.md#^ref-a4a25141-25-0) (line 25, col 0, score 0.58)
- [Layer1SurvivabilityEnvelope — L38](layer1survivabilityenvelope.md#^ref-64a9f9f9-38-0) (line 38, col 0, score 0.58)
- [Dynamic Context Model for Web Components — L45](dynamic-context-model-for-web-components.md#^ref-f7702bf8-45-0) (line 45, col 0, score 0.58)
- [Layer1SurvivabilityEnvelope — L84](layer1survivabilityenvelope.md#^ref-64a9f9f9-84-0) (line 84, col 0, score 0.57)
- [Layer1SurvivabilityEnvelope — L11](layer1survivabilityenvelope.md#^ref-64a9f9f9-11-0) (line 11, col 0, score 0.57)
- [Promethean-native config design — L354](promethean-native-config-design.md#^ref-ab748541-354-0) (line 354, col 0, score 0.57)
- [Dynamic Context Model for Web Components — L199](dynamic-context-model-for-web-components.md#^ref-f7702bf8-199-0) (line 199, col 0, score 0.68)
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 0.61)
- [Fnord Tracer Protocol — L142](fnord-tracer-protocol.md#^ref-fc21f824-142-0) (line 142, col 0, score 0.6)
- [Board Walk – 2025-08-11 — L114](board-walk-2025-08-11.md#^ref-7aa1eb92-114-0) (line 114, col 0, score 0.6)
- [Board Walk – 2025-08-11 — L101](board-walk-2025-08-11.md#^ref-7aa1eb92-101-0) (line 101, col 0, score 0.59)
- [Fnord Tracer Protocol — L151](fnord-tracer-protocol.md#^ref-fc21f824-151-0) (line 151, col 0, score 0.59)
- [Migrate to Provider-Tenant Architecture — L253](migrate-to-provider-tenant-architecture.md#^ref-54382370-253-0) (line 253, col 0, score 0.58)
- [promethean-requirements — L4](promethean-requirements.md#^ref-95205cd3-4-0) (line 4, col 0, score 0.58)
- [Lispy Macros with syntax-rules — L393](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-393-0) (line 393, col 0, score 0.62)
- [Interop and Source Maps — L505](interop-and-source-maps.md#^ref-cdfac40c-505-0) (line 505, col 0, score 0.62)
- [Interop and Source Maps — L3](interop-and-source-maps.md#^ref-cdfac40c-3-0) (line 3, col 0, score 0.6)
- [Interop and Source Maps — L12](interop-and-source-maps.md#^ref-cdfac40c-12-0) (line 12, col 0, score 0.59)
- [Mongo Outbox Implementation — L538](mongo-outbox-implementation.md#^ref-9c1acd1e-538-0) (line 538, col 0, score 0.59)
- [Promethean-Copilot-Intent-Engine — L28](promethean-copilot-intent-engine.md#^ref-ae24a280-28-0) (line 28, col 0, score 0.58)
- [Local-Offline-Model-Deployment-Strategy — L1](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-1-0) (line 1, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L72](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-72-0) (line 72, col 0, score 0.64)
- [Local-Only-LLM-Workflow — L1](local-only-llm-workflow.md#^ref-9a8ab57e-1-0) (line 1, col 0, score 0.63)
- [AI-Centric OS with MCP Layer — L271](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-271-0) (line 271, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L109](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-109-0) (line 109, col 0, score 0.61)
- [universal-intention-code-fabric — L426](universal-intention-code-fabric.md#^ref-c14edce7-426-0) (line 426, col 0, score 0.61)
- [Pure TypeScript Search Microservice — L6](pure-typescript-search-microservice.md#^ref-d17d3a96-6-0) (line 6, col 0, score 0.67)
- [observability-infrastructure-setup — L357](observability-infrastructure-setup.md#^ref-b4e64f8c-357-0) (line 357, col 0, score 0.67)
- [Promethean Full-Stack Docker Setup — L432](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-432-0) (line 432, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L175](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-175-0) (line 175, col 0, score 1)
- [AI-Centric OS with MCP Layer — L409](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-409-0) (line 409, col 0, score 1)
- [api-gateway-versioning — L295](api-gateway-versioning.md#^ref-0580dcd3-295-0) (line 295, col 0, score 1)
- [eidolon-field-math-foundations — L166](eidolon-field-math-foundations.md#^ref-008f2ac0-166-0) (line 166, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L293](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-293-0) (line 293, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L307](migrate-to-provider-tenant-architecture.md#^ref-54382370-307-0) (line 307, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L461](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-461-0) (line 461, col 0, score 0.65)
- [Local-First Intention→Code Loop with Free Models — L139](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-139-0) (line 139, col 0, score 0.64)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.64)
- [RAG UI Panel with Qdrant and PostgREST — L358](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-358-0) (line 358, col 0, score 0.63)
- [markdown-to-org-transpiler — L1](markdown-to-org-transpiler.md#^ref-ab54cdd8-1-0) (line 1, col 0, score 0.63)
- [Optimizing Command Limitations in System Design — L26](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-26-0) (line 26, col 0, score 0.62)
- [Promethean Documentation Pipeline Overview — L157](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-157-0) (line 157, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-130-0) (line 130, col 0, score 1)
- [api-gateway-versioning — L303](api-gateway-versioning.md#^ref-0580dcd3-303-0) (line 303, col 0, score 1)
- [Chroma-Embedding-Refactor — L327](chroma-embedding-refactor.md#^ref-8b256935-327-0) (line 327, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L174](chroma-toolkit-consolidation-plan.md#^ref-5020e892-174-0) (line 174, col 0, score 1)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#^ref-008f2ac0-134-0) (line 134, col 0, score 1)
- [i3-config-validation-methods — L82](i3-config-validation-methods.md#^ref-d28090ac-82-0) (line 82, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L267](migrate-to-provider-tenant-architecture.md#^ref-54382370-267-0) (line 267, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L391](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-391-0) (line 391, col 0, score 1)
- [Promethean Agent Config DSL — L333](promethean-agent-config-dsl.md#^ref-2c00ce45-333-0) (line 333, col 0, score 1)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [i3-config-validation-methods — L61](i3-config-validation-methods.md#^ref-d28090ac-61-0) (line 61, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-472-0) (line 472, col 0, score 1)
- [AI-Centric OS with MCP Layer — L401](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-401-0) (line 401, col 0, score 1)
- [api-gateway-versioning — L296](api-gateway-versioning.md#^ref-0580dcd3-296-0) (line 296, col 0, score 1)
- [i3-bluetooth-setup — L110](i3-bluetooth-setup.md#^ref-5e408692-110-0) (line 110, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L291](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-291-0) (line 291, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L279](migrate-to-provider-tenant-architecture.md#^ref-54382370-279-0) (line 279, col 0, score 1)
- [Mongo Outbox Implementation — L574](mongo-outbox-implementation.md#^ref-9c1acd1e-574-0) (line 574, col 0, score 1)
- [observability-infrastructure-setup — L359](observability-infrastructure-setup.md#^ref-b4e64f8c-359-0) (line 359, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L477](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-477-0) (line 477, col 0, score 1)
- [api-gateway-versioning — L293](api-gateway-versioning.md#^ref-0580dcd3-293-0) (line 293, col 0, score 1)
- [eidolon-field-math-foundations — L168](eidolon-field-math-foundations.md#^ref-008f2ac0-168-0) (line 168, col 0, score 1)
- [i3-config-validation-methods — L75](i3-config-validation-methods.md#^ref-d28090ac-75-0) (line 75, col 0, score 1)
- [Local-Only-LLM-Workflow — L200](local-only-llm-workflow.md#^ref-9a8ab57e-200-0) (line 200, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L325](migrate-to-provider-tenant-architecture.md#^ref-54382370-325-0) (line 325, col 0, score 1)
- [observability-infrastructure-setup — L377](observability-infrastructure-setup.md#^ref-b4e64f8c-377-0) (line 377, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L475](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-475-0) (line 475, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L434](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-434-0) (line 434, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [api-gateway-versioning — L286](api-gateway-versioning.md#^ref-0580dcd3-286-0) (line 286, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L44](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L410](dynamic-context-model-for-web-components.md#^ref-f7702bf8-410-0) (line 410, col 0, score 1)
- [observability-infrastructure-setup — L373](observability-infrastructure-setup.md#^ref-b4e64f8c-373-0) (line 373, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L65](promethean-copilot-intent-engine.md#^ref-ae24a280-65-0) (line 65, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L438](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-438-0) (line 438, col 0, score 1)
- [Promethean Infrastructure Setup — L582](promethean-infrastructure-setup.md#^ref-6deed6ac-582-0) (line 582, col 0, score 1)
- [Promethean Web UI Setup — L601](promethean-web-ui-setup.md#^ref-bc5172ca-601-0) (line 601, col 0, score 1)
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 1)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 1)
- [Board Automation Improvements — L18](board-automation-improvements.md#^ref-ac60a1d6-18-0) (line 18, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [compiler-kit-foundations — L640](compiler-kit-foundations.md#^ref-01b21543-640-0) (line 640, col 0, score 1)
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [ecs-offload-workers — L478](ecs-offload-workers.md#^ref-6498b9d7-478-0) (line 478, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [i3-bluetooth-setup — L123](i3-bluetooth-setup.md#^ref-5e408692-123-0) (line 123, col 0, score 1)
- [i3-config-validation-methods — L78](i3-config-validation-methods.md#^ref-d28090ac-78-0) (line 78, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L194](sibilant-meta-prompt-dsl.md#^ref-af5d2824-194-0) (line 194, col 0, score 1)
- [AI-Centric OS with MCP Layer — L408](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-408-0) (line 408, col 0, score 1)
- [api-gateway-versioning — L316](api-gateway-versioning.md#^ref-0580dcd3-316-0) (line 316, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L213](chroma-toolkit-consolidation-plan.md#^ref-5020e892-213-0) (line 213, col 0, score 1)
- [Event Bus MVP — L581](event-bus-mvp.md#^ref-534fe91d-581-0) (line 581, col 0, score 1)
- [i3-bluetooth-setup — L101](i3-bluetooth-setup.md#^ref-5e408692-101-0) (line 101, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L178](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-178-0) (line 178, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L303](migrate-to-provider-tenant-architecture.md#^ref-54382370-303-0) (line 303, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L140](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-140-0) (line 140, col 0, score 1)
- [Mongo Outbox Implementation — L585](mongo-outbox-implementation.md#^ref-9c1acd1e-585-0) (line 585, col 0, score 1)
- [observability-infrastructure-setup — L364](observability-infrastructure-setup.md#^ref-b4e64f8c-364-0) (line 364, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L492](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-492-0) (line 492, col 0, score 1)
- [eidolon-field-math-foundations — L158](eidolon-field-math-foundations.md#^ref-008f2ac0-158-0) (line 158, col 0, score 1)
- [observability-infrastructure-setup — L375](observability-infrastructure-setup.md#^ref-b4e64f8c-375-0) (line 375, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L435](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-435-0) (line 435, col 0, score 1)
- [Promethean Infrastructure Setup — L576](promethean-infrastructure-setup.md#^ref-6deed6ac-576-0) (line 576, col 0, score 1)
- [Promethean Web UI Setup — L602](promethean-web-ui-setup.md#^ref-bc5172ca-602-0) (line 602, col 0, score 1)
- [Prometheus Observability Stack — L518](prometheus-observability-stack.md#^ref-e90b5a16-518-0) (line 518, col 0, score 1)
- [Pure TypeScript Search Microservice — L520](pure-typescript-search-microservice.md#^ref-d17d3a96-520-0) (line 520, col 0, score 1)
- [shared-package-layout-clarification — L188](shared-package-layout-clarification.md#^ref-36c8882a-188-0) (line 188, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [Admin Dashboard for User Management — L43](admin-dashboard-for-user-management.md#^ref-2901a3e9-43-0) (line 43, col 0, score 1)
- [api-gateway-versioning — L300](api-gateway-versioning.md#^ref-0580dcd3-300-0) (line 300, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L305](migrate-to-provider-tenant-architecture.md#^ref-54382370-305-0) (line 305, col 0, score 1)
- [observability-infrastructure-setup — L399](observability-infrastructure-setup.md#^ref-b4e64f8c-399-0) (line 399, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L79](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-79-0) (line 79, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L165](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-165-0) (line 165, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L266](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-266-0) (line 266, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L488](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-488-0) (line 488, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L436](performance-optimized-polyglot-bridge.md#^ref-f5579967-436-0) (line 436, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L504](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-504-0) (line 504, col 0, score 1)
- [polymorphic-meta-programming-engine — L244](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-244-0) (line 244, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L91](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-91-0) (line 91, col 0, score 1)
- [Chroma-Embedding-Refactor — L326](chroma-embedding-refactor.md#^ref-8b256935-326-0) (line 326, col 0, score 1)
- [i3-config-validation-methods — L67](i3-config-validation-methods.md#^ref-d28090ac-67-0) (line 67, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L274](migrate-to-provider-tenant-architecture.md#^ref-54382370-274-0) (line 274, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L489](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-489-0) (line 489, col 0, score 1)
- [Promethean Agent Config DSL — L326](promethean-agent-config-dsl.md#^ref-2c00ce45-326-0) (line 326, col 0, score 1)
- [Promethean Infrastructure Setup — L579](promethean-infrastructure-setup.md#^ref-6deed6ac-579-0) (line 579, col 0, score 1)
- [shared-package-layout-clarification — L164](shared-package-layout-clarification.md#^ref-36c8882a-164-0) (line 164, col 0, score 1)
- [Vectorial Exception Descent — L175](vectorial-exception-descent.md#^ref-d771154e-175-0) (line 175, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [api-gateway-versioning — L310](api-gateway-versioning.md#^ref-0580dcd3-310-0) (line 310, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [Diagrams — L23](chunks/diagrams.md#^ref-45cd25b5-23-0) (line 23, col 0, score 1)
- [DSL — L27](chunks/dsl.md#^ref-e87bc036-27-0) (line 27, col 0, score 1)
- [JavaScript — L29](chunks/javascript.md#^ref-c1618c66-29-0) (line 29, col 0, score 1)
- [Math Fundamentals — L39](chunks/math-fundamentals.md#^ref-c6e87433-39-0) (line 39, col 0, score 1)
- [Shared — L28](chunks/shared.md#^ref-623a55f7-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L29](chunks/simulation-demo.md#^ref-557309a3-29-0) (line 29, col 0, score 1)
- [Tooling — L14](chunks/tooling.md#^ref-6cb4943e-14-0) (line 14, col 0, score 1)
- [promethean-system-diagrams — L207](promethean-system-diagrams.md#^ref-b51e19b4-207-0) (line 207, col 0, score 1)
- [Promethean Web UI Setup — L633](promethean-web-ui-setup.md#^ref-bc5172ca-633-0) (line 633, col 0, score 1)
- [Promethean Workflow Optimization — L20](promethean-workflow-optimization.md#^ref-d614d983-20-0) (line 20, col 0, score 1)
- [Prometheus Observability Stack — L543](prometheus-observability-stack.md#^ref-e90b5a16-543-0) (line 543, col 0, score 1)
- [Prompt_Folder_Bootstrap — L216](prompt-folder-bootstrap.md#^ref-bd4f0976-216-0) (line 216, col 0, score 1)
- [prompt-programming-language-lisp — L116](prompt-programming-language-lisp.md#^ref-d41a06d1-116-0) (line 116, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L156](protocol-0-the-contradiction-engine.md#^ref-9a93a756-156-0) (line 156, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L238](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-238-0) (line 238, col 0, score 1)
- [Shared Package Structure — L195](shared-package-structure.md#^ref-66a72fc3-195-0) (line 195, col 0, score 1)
- [sibilant-macro-targets — L178](sibilant-macro-targets.md#^ref-c5c9a5c6-178-0) (line 178, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L181](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-181-0) (line 181, col 0, score 1)
- [AI-Centric OS with MCP Layer — L429](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-429-0) (line 429, col 0, score 1)
- [api-gateway-versioning — L317](api-gateway-versioning.md#^ref-0580dcd3-317-0) (line 317, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L186](chroma-toolkit-consolidation-plan.md#^ref-5020e892-186-0) (line 186, col 0, score 1)
- [Dynamic Context Model for Web Components — L433](dynamic-context-model-for-web-components.md#^ref-f7702bf8-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L555](event-bus-mvp.md#^ref-534fe91d-555-0) (line 555, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L150](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-150-0) (line 150, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L290](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-290-0) (line 290, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L298](migrate-to-provider-tenant-architecture.md#^ref-54382370-298-0) (line 298, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Math Fundamentals — L31](chunks/math-fundamentals.md#^ref-c6e87433-31-0) (line 31, col 0, score 1)
- [Tooling — L19](chunks/tooling.md#^ref-6cb4943e-19-0) (line 19, col 0, score 1)
- [compiler-kit-foundations — L634](compiler-kit-foundations.md#^ref-01b21543-634-0) (line 634, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L212](cross-language-runtime-polymorphism.md#^ref-c34c36a6-212-0) (line 212, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L180](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-180-0) (line 180, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L56](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-56-0) (line 56, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L45](ducks-self-referential-perceptual-loop.md#^ref-71726f04-45-0) (line 45, col 0, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#^ref-f7702bf8-384-0) (line 384, col 0, score 1)
- [ecs-offload-workers — L468](ecs-offload-workers.md#^ref-6498b9d7-468-0) (line 468, col 0, score 1)
- [ecs-scheduler-and-prefabs — L413](ecs-scheduler-and-prefabs.md#^ref-c62a1815-413-0) (line 413, col 0, score 1)
- [Eidolon Field Abstract Model — L214](eidolon-field-abstract-model.md#^ref-5e8b2388-214-0) (line 214, col 0, score 1)
- [DuckDuckGoSearchPipeline — L10](duckduckgosearchpipeline.md#^ref-e979c50f-10-0) (line 10, col 0, score 1)
- [Event Bus Projections Architecture — L169](event-bus-projections-architecture.md#^ref-cf6b9b17-169-0) (line 169, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L63](model-upgrade-calm-down-guide.md#^ref-db74343f-63-0) (line 63, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L10](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-10-0) (line 10, col 0, score 1)
- [observability-infrastructure-setup — L391](observability-infrastructure-setup.md#^ref-b4e64f8c-391-0) (line 391, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L111](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-111-0) (line 111, col 0, score 1)
- [OpenAPI Validation Report — L29](openapi-validation-report.md#^ref-5c152b08-29-0) (line 29, col 0, score 1)
- [Optimizing Command Limitations in System Design — L36](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-36-0) (line 36, col 0, score 1)
- [plan-update-confirmation — L1013](plan-update-confirmation.md#^ref-b22d79c6-1013-0) (line 1013, col 0, score 1)
- [pm2-orchestration-patterns — L252](pm2-orchestration-patterns.md#^ref-51932e7b-252-0) (line 252, col 0, score 1)
- [Admin Dashboard for User Management — L55](admin-dashboard-for-user-management.md#^ref-2901a3e9-55-0) (line 55, col 0, score 1)
- [AI-Centric OS with MCP Layer — L414](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-414-0) (line 414, col 0, score 1)
- [Board Automation Improvements — L15](board-automation-improvements.md#^ref-ac60a1d6-15-0) (line 15, col 0, score 1)
- [Operations — L7](chunks/operations.md#^ref-f1add613-7-0) (line 7, col 0, score 1)
- [Creative Moments — L7](creative-moments.md#^ref-10d98225-7-0) (line 7, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L210](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-210-0) (line 210, col 0, score 1)
- [DuckDuckGoSearchPipeline — L11](duckduckgosearchpipeline.md#^ref-e979c50f-11-0) (line 11, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L44](ducks-self-referential-perceptual-loop.md#^ref-71726f04-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L96](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-96-0) (line 96, col 0, score 1)
- [Promethean Agent Config DSL — L348](promethean-agent-config-dsl.md#^ref-2c00ce45-348-0) (line 348, col 0, score 1)
- [Promethean Chat Activity Report — L22](promethean-chat-activity-report.md#^ref-18344cf9-22-0) (line 22, col 0, score 1)
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 1)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 1)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 1)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 1)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 1)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 1)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L305](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-305-0) (line 305, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L331](migrate-to-provider-tenant-architecture.md#^ref-54382370-331-0) (line 331, col 0, score 1)
- [Mindful Prioritization — L9](mindful-prioritization.md#^ref-40185d05-9-0) (line 9, col 0, score 1)
- [MindfulRobotIntegration — L7](mindfulrobotintegration.md#^ref-5f65dfa5-7-0) (line 7, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L66](model-upgrade-calm-down-guide.md#^ref-db74343f-66-0) (line 66, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L13](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-13-0) (line 13, col 0, score 1)
- [observability-infrastructure-setup — L393](observability-infrastructure-setup.md#^ref-b4e64f8c-393-0) (line 393, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L59](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-59-0) (line 59, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L56](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-56-0) (line 56, col 0, score 1)
- [AI-Centric OS with MCP Layer — L427](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-427-0) (line 427, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [archetype-ecs — L480](archetype-ecs.md#^ref-8f4c1e86-480-0) (line 480, col 0, score 1)
- [balanced-bst — L301](balanced-bst.md#^ref-d3e7db72-301-0) (line 301, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L178](chroma-toolkit-consolidation-plan.md#^ref-5020e892-178-0) (line 178, col 0, score 1)
- [Diagrams — L39](chunks/diagrams.md#^ref-45cd25b5-39-0) (line 39, col 0, score 1)
- [DSL — L41](chunks/dsl.md#^ref-e87bc036-41-0) (line 41, col 0, score 1)
- [JavaScript — L40](chunks/javascript.md#^ref-c1618c66-40-0) (line 40, col 0, score 1)
- [Math Fundamentals — L40](chunks/math-fundamentals.md#^ref-c6e87433-40-0) (line 40, col 0, score 1)
- [Services — L38](chunks/services.md#^ref-75ea4a6a-38-0) (line 38, col 0, score 1)
- [Lisp-Compiler-Integration — L547](lisp-compiler-integration.md#^ref-cfee6d36-547-0) (line 547, col 0, score 1)
- [Lispy Macros with syntax-rules — L408](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-408-0) (line 408, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L182](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-182-0) (line 182, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L307](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-307-0) (line 307, col 0, score 1)
- [Local-Only-LLM-Workflow — L210](local-only-llm-workflow.md#^ref-9a8ab57e-210-0) (line 210, col 0, score 1)
- [markdown-to-org-transpiler — L320](markdown-to-org-transpiler.md#^ref-ab54cdd8-320-0) (line 320, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L272](migrate-to-provider-tenant-architecture.md#^ref-54382370-272-0) (line 272, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L136](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-136-0) (line 136, col 0, score 1)
- [Mongo Outbox Implementation — L583](mongo-outbox-implementation.md#^ref-9c1acd1e-583-0) (line 583, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L48](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-48-0) (line 48, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L109](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-109-0) (line 109, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L154](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-154-0) (line 154, col 0, score 1)
- [Local-Only-LLM-Workflow — L179](local-only-llm-workflow.md#^ref-9a8ab57e-179-0) (line 179, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L304](migrate-to-provider-tenant-architecture.md#^ref-54382370-304-0) (line 304, col 0, score 1)
- [observability-infrastructure-setup — L398](observability-infrastructure-setup.md#^ref-b4e64f8c-398-0) (line 398, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L184](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-184-0) (line 184, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L506](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-506-0) (line 506, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L452](performance-optimized-polyglot-bridge.md#^ref-f5579967-452-0) (line 452, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L527](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-527-0) (line 527, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L159](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-159-0) (line 159, col 0, score 1)
- [AI-Centric OS with MCP Layer — L400](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-400-0) (line 400, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L197](chroma-toolkit-consolidation-plan.md#^ref-5020e892-197-0) (line 197, col 0, score 1)
- [Diagrams — L45](chunks/diagrams.md#^ref-45cd25b5-45-0) (line 45, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L222](cross-language-runtime-polymorphism.md#^ref-c34c36a6-222-0) (line 222, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L167](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-167-0) (line 167, col 0, score 1)
- [Dynamic Context Model for Web Components — L385](dynamic-context-model-for-web-components.md#^ref-f7702bf8-385-0) (line 385, col 0, score 1)
- [i3-config-validation-methods — L86](i3-config-validation-methods.md#^ref-d28090ac-86-0) (line 86, col 0, score 1)
- [js-to-lisp-reverse-compiler — L408](js-to-lisp-reverse-compiler.md#^ref-58191024-408-0) (line 408, col 0, score 1)
- [Lisp-Compiler-Integration — L542](lisp-compiler-integration.md#^ref-cfee6d36-542-0) (line 542, col 0, score 1)
- [lisp-dsl-for-window-management — L227](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-227-0) (line 227, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L133](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-133-0) (line 133, col 0, score 1)
- [template-based-compilation — L117](template-based-compilation.md#^ref-f8877e5e-117-0) (line 117, col 0, score 1)
- [Universal Lisp Interface — L205](universal-lisp-interface.md#^ref-b01856b4-205-0) (line 205, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L26](sibilant-meta-prompt-dsl.md#^ref-af5d2824-26-0) (line 26, col 0, score 0.73)
- [Sibilant Meta-Prompt DSL — L146](sibilant-meta-prompt-dsl.md#^ref-af5d2824-146-0) (line 146, col 0, score 0.7)
- [Sibilant Meta-Prompt DSL — L147](sibilant-meta-prompt-dsl.md#^ref-af5d2824-147-0) (line 147, col 0, score 0.7)
- [Universal Lisp Interface — L173](universal-lisp-interface.md#^ref-b01856b4-173-0) (line 173, col 0, score 0.69)
- [Sibilant Meta-Prompt DSL — L93](sibilant-meta-prompt-dsl.md#^ref-af5d2824-93-0) (line 93, col 0, score 0.67)
- [Sibilant Meta-Prompt DSL — L139](sibilant-meta-prompt-dsl.md#^ref-af5d2824-139-0) (line 139, col 0, score 0.65)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
