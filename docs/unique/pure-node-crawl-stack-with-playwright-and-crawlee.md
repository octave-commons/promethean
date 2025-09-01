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
related_to_title:
  - Per-Domain Policy System for JS Crawler
  - Promethean Infrastructure Setup
  - Prometheus Observability Stack
  - Promethean Web UI Setup
  - AI-Centric OS with MCP Layer
  - Dynamic Context Model for Web Components
  - Pure TypeScript Search Microservice
  - api-gateway-versioning
  - observability-infrastructure-setup
  - Migrate to Provider-Tenant Architecture
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Local-Offline-Model-Deployment-Strategy
  - Promethean Full-Stack Docker Setup
  - RAG UI Panel with Qdrant and PostgREST
  - eidolon-field-math-foundations
  - Debugging Broker Connections and Agent Behavior
  - ecs-offload-workers
  - Local-Only-LLM-Workflow
  - Shared Package Structure
related_to_uuid:
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - 54382370-1931-4a19-a634-46735708a9ea
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
references: []
---
Heard. JS or bust. Here’s a **pure-Node** crawling stack: Playwright + Crawlee, no Python anywhere, no SaaS, no tokens. Local proxy optional. Data lands as JSONL and (optionally) streams into Meilisearch/OpenSearch—both via HTTP from Node.

---

# `docker-compose.yml` (crawl-only, JS)

Drop this into your compose (or a standalone file) and run with the `crawl-js` profile.

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

---

# File tree

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
```

---

# `infra/squid/squid.conf` (LAN-only, no caching)

```conf
http_port 3128
acl localnet src 10.0.0.0/8 172.16.0.0/12 192.168.0.0/16
http_access allow localnet
http_access deny all
dns_v4_first on
pipeline_prefetch off
request_header_access Authorization deny all
reply_header_access Server deny all
cache deny all
```

---

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
  }
}
```

---

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
    return true;
  } catch { return false; }
}
```

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
    const t = await res.text().catch(()=>'');
    console.error('Meili push failed', res.status, t.slice(0, 400));
  }
}
```

---

# `infra/crawler-js/src/ua.json`

Small list keeps it simple (rotate per request). Add your own.

```json
[
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36"
]
```

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
if (sitemapDiscover) for (const u of await discoverSitemaps(seedOrigin)) initialUrls.add(u);
if (rssDiscover) for (const u of await discoverRSS(seedOrigin)) initialUrls.add(u);

log.setLevel(log.LEVELS.INFO);
await crawler.run([...initialUrls]);
console.log(`JSONL: ${outPath}`);
```

---

# Run it

```bash
# bring up the proxy (optional) + crawler
docker compose --profile crawl-js up --build crawler-js

# tweak via env (examples)
CRAWL_SEED=https://news.ycombinator.com \
ALLOW_LIST="^https://news.ycombinator.com/,^https://ycombinator\.com/" \
CRAWL_MAX_PAGES=500 \
CRAWL_CONCURRENCY=8 \
CRAWL_REQS_PER_MIN=240 \
docker compose --profile crawl-js up --build crawler-js
```

**Outputs**

* JSONL at `./crawl_data/out.jsonl` (volume)
* Crawlee persistent storage (queue/dataset) at `./crawl_storage/` for resumability

---

## Why this is solid (and stays JS)

* Playwright + Crawlee = fast, headless, resilient, tested.
* Robots.txt respected, **allow/deny** regex gates, **same-domain** toggle.
* **UA rotation**, **rate limiting** (RPM), **concurrency** caps.
* **Dedup normalization** avoids re-crawling tracker variants.
* **Sitemap + RSS discovery** to fan out intelligently.
* **Local sinks** only (Meili/OpenSearch) — no external calls.
* Fully reproducible in Docker; no Python creep.

Want me to add a **simple DOM extractor** (meta tags, visible text, main article heuristics) or a **per-domain config file** so you can override throttles/parsers without changing code? I can drop both in quickly.

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
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
