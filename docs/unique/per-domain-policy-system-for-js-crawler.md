---
uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
created_at: 2025.08.31.11.25.22.md
filename: Per-Domain Policy System for JS Crawler
description: >-
  A YAML-based policy system for configuring JS crawlers with per-domain rules,
  throttling, authentication, and resource blocking. Enables fine-grained
  control over crawling behavior without Python or SaaS dependencies.
tags:
  - policy
  - crawling
  - yaml
  - throttling
  - authentication
  - resource-blocking
  - domain-specific
related_to_title: []
related_to_uuid: []
references: []
---
Roger. Here’s a clean **per-domain policy system** wired into your JS crawler — no Python, no SaaS. You get a single YAML file to tune throttles, allow/deny rules, login steps, headers/cookies, extraction rules, proxy overrides (e.g., Tor via Privoxy), and per-domain limits. Drop these files in, set one env var, and go. ^ref-c03020e1-1-0

---

## 0) Compose tweak (point crawler at policies file)

Add one env var + mount (keeps your code immutable): ^ref-c03020e1-7-0

```yaml
  crawler-js:
    # ...
    environment:
      - POLICY_FILE=/workspace/policies.yaml
      # rest unchanged (PROXY_URL still works as global default)
    volumes:
      - ./infra/crawler-js:/workspace:rw
      - crawl_data:/data
      - crawl_storage:/workspace/storage
```
^ref-c03020e1-9-0

---

## 1) Policy file (YAML)

`infra/crawler-js/policies.yaml`
 ^ref-c03020e1-27-0
```yaml
# Global defaults (used when no domain match)
defaults:
  sameDomainOnly: true
  respectRobots: true
  concurrency: 4          # per crawler (we still cap globally)
  rpm: 120                # requests per minute cap
  maxPages: 200           # global cap (crawler’s maxRequestsPerCrawl)
  maxDepth: 3             # link hop depth (0 = only seed)
  delayMs: 250            # base delay between requests
  jitterMs: 200           # random +/- added to delay
  retries: 2              # per-request retries
  dedupNormalize: true
  sitemapDiscover: true
  rssDiscover: true
  blockResources: ["image", "media", "font", "stylesheet"]  # save bandwidth
  allow: []              # regex list (case-insensitive); empty = allow all
  deny: []               # regex list; any match = block
  headers:               # sent on every request for matching domains
    Accept-Language: "en-US,en;q=0.9"
  cookies: []            # [{ name, value, domain, path, httpOnly, secure }]
  proxy: ""              # override (e.g., http://privoxy:8118). Empty = use PROXY_URL env.
  extractor:
    mode: "article"      # 'article' | 'simple' | 'raw'
    keepHtml: false

# Domain-specific overrides (first match wins). domains: list of host globs or regex.
domains:

  - name: "Hacker News"
    domains: ["news.ycombinator.com"]
    sameDomainOnly: true
    rpm: 60
    concurrency: 2
    maxPages: 500
    allow: ["^https://news\\.ycombinator\\.com/"]
    deny: ["\\.gif$", "\\.png$", "\\.jpg$"]
    extractor:
      mode: "simple"
      keepHtml: false

  - name: "Example Blog with login"
    domains: ["blog.example.com", "/^sub\\d+\\.example\\.com$/"]
    rpm: 30
    concurrency: 2
    maxDepth: 2
    proxy: "http://privoxy:8118"         # force Tor just for this domain
    headers:
      User-Agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari"
    cookies:
      - name: "cookie_consent"
        value: "yes"
        domain: ".example.com"
        path: "/"
        httpOnly: false
        secure: false
    login:                                # run once per origin before crawling links
      steps:
        - goto: "https://blog.example.com/login"
        - type: { selector: "input[name='username']", text: "local_user" }
        - type: { selector: "input[name='password']", text: "local_pass" }
        - click: { selector: "button[type='submit']" }
        - waitForSelector: { selector: "nav .user-avatar", timeoutMs: 15000 }
    extractor:
      mode: "article"
      keepHtml: false

  - name: "Docs site (HTML only, no JS)"
    domains: ["docs.example.org"]
    blockResources: ["*"]  # block all non-doc requests
    sitemapDiscover: true
    rssDiscover: false
    extractor:
      mode: "raw"
      keepHtml: true

# Optional: explicit seeds (in addition to CRAWL_SEED env)
seeds:
  - "https://news.ycombinator.com/"
  - "https://docs.example.org/"
^ref-c03020e1-27-0
``` ^ref-c03020e1-109-0

**How matching works:** `domains[].domains` accepts either host globs (e.g., `*.example.com`) or regex strings delimited with `/.../`. First match wins.

---

## 2) Add a tiny YAML dep ^ref-c03020e1-115-0

`infra/crawler-js/package.json` — add `yaml` ^ref-c03020e1-117-0

```json
{
  "name": "crawler-js",
  "private": true,
  "type": "module",
  "scripts": { "start": "node src/crawl.js" },
  "dependencies": {
    "crawlee": "^3.9.2",
    "playwright": "^1.47.2",
    "robots-parser": "^3.0.1",
    "node-fetch": "^3.3.2",
    "fast-xml-parser": "^4.5.0",
    "p-limit": "^6.2.0",
    "yaml": "^2.5.1"
  }
^ref-c03020e1-117-0
}
```

---

## 3) Wire policies into the crawler
 ^ref-c03020e1-141-0
### `infra/crawler-js/src/utils.js` (additions)

```js
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export function loadPolicies(filePath) {
  const p = filePath || process.env.POLICY_FILE || '/workspace/policies.yaml';
  const raw = fs.readFileSync(p, 'utf8');
  const cfg = YAML.parse(raw);
  cfg.defaults ||= {};
  cfg.domains ||= [];
  cfg.seeds ||= [];
  // preprocess domain matchers
  for (const d of cfg.domains) {
    d._matchers = (d.domains || []).map(s => {
      if (s.startsWith('/') && s.endsWith('/')) return { type: 're', re: new RegExp(s.slice(1, -1), 'i') };
      // glob-ish → convert dots and * to regex
      const rx = '^' + s.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$';
      return { type: 'glob', re: new RegExp(rx, 'i') };
    });
  }
  return cfg;
}

export function matchPolicyFor(url, policies) {
  const host = new URL(url).hostname;
  for (const d of policies.domains) {
    if (d._matchers?.some(m => m.re.test(host))) return d;
  }
  return policies.defaults || {};
}

export function compileRegexList(csvOrList) {
  if (!csvOrList) return [];
  const items = Array.isArray(csvOrList) ? csvOrList : String(csvOrList).split(',');
^ref-c03020e1-141-0
  return items.map(s => s.trim()).filter(Boolean).map(s => new RegExp(s, 'i')); ^ref-c03020e1-180-0
}
```

(Keep your previous helpers like `sleep`, `normalizeUrlForDedup`, `buildRobotsForOrigin`, `decideUrl`—they still apply, just feed them policy-specific values.) ^ref-c03020e1-184-0

### `infra/crawler-js/src/crawl.js` (replaced core with policy-aware flow)

```js
import { PlaywrightCrawler, KeyValueStore, Dataset, log, Configuration } from 'crawlee';
import fs from 'node:fs';
import path from 'node:path';
import { Agent as HttpProxyAgent } from 'node:http';
import { Agent as HttpsProxyAgent } from 'node:https';
import { XMLParser } from 'fast-xml-parser';
import fetch from 'node-fetch';
import uaPool from './ua.json' assert { type: 'json' };
import { sleep, compileRegexList, normalizeUrlForDedup, buildRobotsForOrigin, decideUrl, loadPolicies, matchPolicyFor } from './utils.js';
import { sinkToOpenSearch, sinkToMeili } from './sinks.js';

const policies = loadPolicies();
const globalDefaults = policies.defaults || {};
const envSeed = process.env.CRAWL_SEED;
const initialSeeds = new Set([].concat(policies.seeds || [], envSeed ? [envSeed] : []));

const outputDir = process.env.OUTPUT_DIR || '/data';
fs.mkdirSync(outputDir, { recursive: true });
const outPath = path.join(outputDir, 'out.jsonl');
const appendJSONL = (o) => fs.appendFileSync(outPath, JSON.stringify(o) + '\n');

// sinks (still optional/local)
const OS_URL = process.env.SINK_OPENSEARCH_URL || '';
const OS_INDEX = process.env.SINK_OPENSEARCH_INDEX || 'documents';
const MEILI_URL = process.env.SINK_MEILI_URL || '';
const MEILI_KEY = process.env.SINK_MEILI_KEY || '';
const MEILI_INDEX = process.env.SINK_MEILI_INDEX || 'documents';

function rotateUA(i) {
  return uaPool[i % uaPool.length] || uaPool[0];
}

function buildProxyAgents(url, policy) {
  const override = policy.proxy && policy.proxy.trim() ? policy.proxy.trim() : (process.env.PROXY_URL || '').trim();
  if (!override) return { httpAgent: undefined, httpsAgent: undefined, proxyUrl: '' };
  return {
    httpAgent: new HttpProxyAgent(override),
    httpsAgent: new HttpsProxyAgent(override),
    proxyUrl: override
  };
}

async function discoverSitemaps(origin, agents, enable) {
  if (!enable) return [];
  try {
    const res = await fetch(`${origin}/sitemap.xml`, { agent: origin.startsWith('https') ? agents.httpsAgent : agents.httpAgent, timeout: 10000 });
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

async function discoverRSS(origin, agents, enable) {
  if (!enable) return [];
  try {
    const res = await fetch(origin, { agent: origin.startsWith('https') ? agents.httpsAgent : agents.httpAgent, timeout: 10000 });
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

function extractByMode(mode, keepHtml, page) {
  return page.content().then(async html => {
    if (mode === 'raw') return keepHtml ? { html } : { text: html.replace(/\s+/g, ' ').slice(0, 500000) };
    if (mode === 'simple') {
      const title = await page.title().catch(()=> '');
      const text = await page.$eval('body', el => el.innerText).catch(()=> '');
      return keepHtml ? { title, html } : { title, text };
    }
    // 'article' heuristic (cheap)
    const title = await page.title().catch(()=> '');
    const meta = {};
    for (const n of ['og:title','og:description','description','article:author','author','og:site_name','article:published_time']) {
      try {
        meta[n] = await page.$eval(`meta[property="${n}"],meta[name="${n}"]`, el => el.content);
      } catch {}
    }
    const mainText = await page.$eval('main', el => el.innerText).catch(async () =>
      page.$eval('article', el => el.innerText).catch(async () =>
        page.$eval('body', el => el.innerText).catch(()=> '')
      )
    );
    return keepHtml ? { title, meta, html } : { title, meta, text: mainText };
  });
}

// cache: per-origin login done
const loginDone = new Set();

Configuration.set({ persistStorage: true, storageDir: './storage' });

const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: +(process.env.CRAWL_MAX_PAGES || globalDefaults.maxPages || 200),
  maxConcurrency: +(process.env.CRAWL_CONCURRENCY || globalDefaults.concurrency || 4),
  maxRequestsPerMinute: +(process.env.CRAWL_REQS_PER_MIN || globalDefaults.rpm || 120),
  headless: true,
  requestHandlerTimeoutSecs: 90,
  launchContext: { launchOptions: { args: ['--no-sandbox', '--disable-dev-shm-usage'] } },

  async preNavigationHooks([{ request, page, session }, gotoOptions]) {
    const pol = matchPolicyFor(request.url, policies);
    const seedOrigin = new URL(request.url).origin;
    const allow = compileRegexList(pol.allow || globalDefaults.allow || []);
    const deny = compileRegexList(pol.deny || globalDefaults.deny || []);
    const sameDomainOnly = pol.sameDomainOnly ?? globalDefaults.sameDomainOnly ?? true;
    const respectRobots = pol.respectRobots ?? globalDefaults.respectRobots ?? true;
    const dedupNormalize = pol.dedupNormalize ?? globalDefaults.dedupNormalize ?? true;

    const agents = buildProxyAgents(request.url, pol);
    const urlToFetch = dedupNormalize ? normalizeUrlForDedup(request.url) : request.url;

    if (!decideUrl(urlToFetch, { sameDomainOnly, seedOrigin, allow, deny })) {
      request.noRetry = true; throw new Error('Filtered: allow/deny or cross-domain');
    }

    if (respectRobots) {
      const rb = await buildRobotsForOrigin(new URL(urlToFetch).origin, urlToFetch.startsWith('https') ? agents.httpsAgent : agents.httpAgent);
      if (!rb.isAllowed(urlToFetch, 'PrometheanCrawler')) {
        request.noRetry = true; throw new Error('Robots disallow');
      }
    }

    // headers and cookies
    const headers = { ...(globalDefaults.headers||{}), ...(pol.headers||{}) };
    request.headers = { ...(request.headers||{}), ...headers, 'User-Agent': request.headers?.['User-Agent'] || (session?.id ? rotateUA(parseInt(session.id,10)) : rotateUA(Math.floor(Math.random()*1000))) };

    if ((pol.cookies && pol.cookies.length) || (globalDefaults.cookies && globalDefaults.cookies.length)) {
      const cookies = [...(globalDefaults.cookies || []), ...(pol.cookies || [])];
      if (cookies.length) await page.context().addCookies(cookies);
    }

    // resource blocking
    const blockRules = (pol.blockResources?.length ? pol.blockResources : globalDefaults.blockResources) || [];
    if (blockRules.length) {
      await page.route('**/*', route => {
        const req = route.request();
        const type = req.resourceType();
        if (blockRules.includes('*') || blockRules.includes(type)) return route.abort();
        return route.continue();
      });
    }

    // per-domain login (once per origin)
    if (pol.login && !loginDone.has(seedOrigin)) {
      await page.context().clearCookies().catch(()=>{});
      for (const step of pol.login.steps || []) {
        if (step.goto) await page.goto(step.goto, { waitUntil: 'domcontentloaded', timeout: 30000 });
        if (step.type) await page.fill(step.type.selector, step.type.text, { timeout: 15000 });
        if (step.click) await page.click(step.click.selector, { timeout: 15000 });
        if (step.waitForSelector) await page.waitForSelector(step.waitForSelector.selector, { timeout: step.waitForSelector.timeoutMs || 15000 });
      }
      loginDone.add(seedOrigin);
    }

    // delay/jitter
    const base = +(pol.delayMs ?? globalDefaults.delayMs ?? 0);
    const jit = +(pol.jitterMs ?? globalDefaults.jitterMs ?? 0);
    if (base || jit) await new Promise(r => setTimeout(r, base + Math.floor(Math.random() * (jit + 1))));

    // proxy
    if (agents.proxyUrl) gotoOptions.proxy = { server: agents.proxyUrl };

    gotoOptions.waitUntil = 'domcontentloaded';
  },

  async requestHandler({ request, page, enqueueLinks }) {
    const pol = matchPolicyFor(request.url, policies);
    const dedupNormalize = pol.dedupNormalize ?? globalDefaults.dedupNormalize ?? true;

    const url = dedupNormalize ? normalizeUrlForDedup(request.url) : request.url;
    const title = await page.title().catch(()=>'');
    const now = new Date().toISOString();

    // extraction
    const mode = pol.extractor?.mode || globalDefaults.extractor?.mode || 'article';
    const keepHtml = pol.extractor?.keepHtml ?? globalDefaults.extractor?.keepHtml ?? false;
    const body = await extractByMode(mode, keepHtml, page);

    const doc = { url, title, fetched_at: now, ...body };

    appendJSONL(doc);
    await Dataset.pushData(doc);
    await sinkToOpenSearch([doc], { url: OS_URL, index: OS_INDEX });
    await sinkToMeili([doc], { url: MEILI_URL, index: MEILI_INDEX, apiKey: MEILI_KEY });

    // depth-aware enqueuing
    const sameDomainOnly = pol.sameDomainOnly ?? globalDefaults.sameDomainOnly ?? true;
    const allow = compileRegexList(pol.allow || globalDefaults.allow || []);
    const deny = compileRegexList(pol.deny || globalDefaults.deny || []);
    const maxDepth = +(pol.maxDepth ?? globalDefaults.maxDepth ?? 3);

    const { depth = 0 } = request.userData || {};
    if (depth < maxDepth) {
      await enqueueLinks({
        strategy: sameDomainOnly ? 'same-domain' : 'all',
        transformRequestFunction: (req) => {
          // filter by allow/deny as we queue
          if (!decideUrl(req.url, { sameDomainOnly, seedOrigin: new URL(request.url).origin, allow, deny })) return null;
          const next = dedupNormalize ? normalizeUrlForDedup(req.url) : req.url;
          return { url: next, userData: { depth: depth + 1 } };
        }
      });
    }
  },

  async failedRequestHandler({ request, error }) {
    appendJSONL({ url: request.url, error: String(error), failed_at: new Date().toISOString() });
  }
});

// bootstrap queue with policy seeds + env seed + optional sitemap/rss per domain
const rq = await KeyValueStore.open();
await rq.setValue('__meta__', { seeds: [...initialSeeds], started_at: new Date().toISOString() });

const seeds = new Set(initialSeeds);
for (const s of seeds) {
  const pol = matchPolicyFor(s, policies);
  const agents = buildProxyAgents(s, pol);
  const origin = new URL(s).origin;
  const sm = await discoverSitemaps(origin, agents, pol.sitemapDiscover ?? globalDefaults.sitemapDiscover ?? true);
  const rss = await discoverRSS(origin, agents, pol.rssDiscover ?? globalDefaults.rssDiscover ?? true);
  for (const u of sm) seeds.add(u);
  for (const u of rss) seeds.add(u);
}

^ref-c03020e1-184-0
log.setLevel(log.LEVELS.INFO);
await crawler.run([...seeds]);
console.log(`JSONL: ${outPath}`);
```
 ^ref-c03020e1-437-0
---
 ^ref-c03020e1-439-0
## 4) Run examples

**Local, no Tor:**
^ref-c03020e1-439-0
 ^ref-c03020e1-444-0
```bash
POLICY_FILE=./infra/crawler-js/policies.yaml \
docker compose --profile crawl-js up --build crawler-js
```
^ref-c03020e1-446-0

**Through Tor/Privoxy (for matching domains only):**
^ref-c03020e1-446-0

```bash
docker compose --profile crawl-js --profile tor up -d tor privoxy
POLICY_FILE=./infra/crawler-js/policies.yaml \
docker compose --profile crawl-js up --build crawler-js
```
 ^ref-c03020e1-458-0 ^ref-c03020e1-459-0
(Any domain stanza with `proxy: "http://privoxy:8118"` will route via Tor. Everything else follows `PROXY_URL` if set, otherwise direct.) ^ref-c03020e1-459-0 ^ref-c03020e1-460-0
 ^ref-c03020e1-460-0 ^ref-c03020e1-461-0
--- ^ref-c03020e1-461-0 ^ref-c03020e1-462-0
 ^ref-c03020e1-462-0 ^ref-c03020e1-463-0
## 5) Why this setup won’t fight you ^ref-c03020e1-463-0

* **Single source of truth**: `policies.yaml` controls throttles, RPM, depth, allow/deny, robots, headers, cookies, **login**, extract mode, and per-domain proxy.
* **Login once** per origin using deterministic steps (goto/type/click/wait). ^ref-c03020e1-467-0
* **Bandwidth sane**: resource blocking per domain (e.g., kill images/fonts on docs sites). ^ref-c03020e1-467-0
* **Extraction modes**: `article` (cheap heuristic), `simple` (title + body text), `raw` (HTML). ^ref-c03020e1-469-0
* **No surprise egress**: explicit proxy override per domain; keep the rest local. ^ref-c03020e1-469-0
* **No Python.** All Node, all the time. ^ref-c03020e1-471-0
 ^ref-c03020e1-471-0 ^ref-c03020e1-472-0
If you want, I can add a **domain-local JavaScript extractor hook** in YAML (e.g., `extractor.script: "return document.querySelector('article')?.innerText || ''"`) that we `page.evaluate()` — gives you surgical control without editing code. ^ref-c03020e1-472-0

\#webcrawling #javascript #playwright #crawlee #docker #tor #privoxy #selfhosted #opensearch #meilisearch #config-as-code #policies<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Shared Package Structure](shared-package-structure.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [DSL](chunks/dsl.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [archetype-ecs](archetype-ecs.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Services](chunks/services.md)
- [JavaScript](chunks/javascript.md)
- [Diagrams](chunks/diagrams.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Event Bus MVP](event-bus-mvp.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Tooling](chunks/tooling.md)
- [Window Management](chunks/window-management.md)
- [field-interaction-equations](field-interaction-equations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [EidolonField](eidolonfield.md)
- [graph-ds](graph-ds.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Creative Moments](creative-moments.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Operations](chunks/operations.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [refactor-relations](refactor-relations.md)
- [Refactor 05-footers.ts](refactor-05-footers-ts.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [smart-chatgpt-thingy](smart-chatgpt-thingy.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [promethean-requirements](promethean-requirements.md)
- [parenthetical-extraction](parenthetical-extraction.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
## Sources
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-130-0) (line 130, col 0, score 0.71)
- [api-gateway-versioning — L303](api-gateway-versioning.md#^ref-0580dcd3-303-0) (line 303, col 0, score 0.76)
- [Chroma-Embedding-Refactor — L327](chroma-embedding-refactor.md#^ref-8b256935-327-0) (line 327, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L174](chroma-toolkit-consolidation-plan.md#^ref-5020e892-174-0) (line 174, col 0, score 0.71)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#^ref-008f2ac0-134-0) (line 134, col 0, score 0.71)
- [i3-config-validation-methods — L82](i3-config-validation-methods.md#^ref-d28090ac-82-0) (line 82, col 0, score 0.76)
- [Migrate to Provider-Tenant Architecture — L267](migrate-to-provider-tenant-architecture.md#^ref-54382370-267-0) (line 267, col 0, score 0.76)
- [prom-lib-rate-limiters-and-replay-api — L391](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-391-0) (line 391, col 0, score 0.76)
- [Promethean Agent Config DSL — L333](promethean-agent-config-dsl.md#^ref-2c00ce45-333-0) (line 333, col 0, score 0.76)
- [Promethean Event Bus MVP v0.1 — L906](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-906-0) (line 906, col 0, score 0.79)
- [Chroma Toolkit Consolidation Plan — L10](chroma-toolkit-consolidation-plan.md#^ref-5020e892-10-0) (line 10, col 0, score 0.73)
- [Promethean Event Bus MVP v0.1 — L857](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-857-0) (line 857, col 0, score 0.67)
- [Promethean Agent Config DSL — L146](promethean-agent-config-dsl.md#^ref-2c00ce45-146-0) (line 146, col 0, score 0.65)
- [plan-update-confirmation — L744](plan-update-confirmation.md#^ref-b22d79c6-744-0) (line 744, col 0, score 0.65)
- [plan-update-confirmation — L773](plan-update-confirmation.md#^ref-b22d79c6-773-0) (line 773, col 0, score 0.65)
- [Promethean-native config design — L74](promethean-native-config-design.md#^ref-ab748541-74-0) (line 74, col 0, score 0.64)
- [universal-intention-code-fabric — L420](universal-intention-code-fabric.md#^ref-c14edce7-420-0) (line 420, col 0, score 0.64)
- [Promethean Agent Config DSL — L299](promethean-agent-config-dsl.md#^ref-2c00ce45-299-0) (line 299, col 0, score 0.64)
- [js-to-lisp-reverse-compiler — L404](js-to-lisp-reverse-compiler.md#^ref-58191024-404-0) (line 404, col 0, score 0.64)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L389](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-389-0) (line 389, col 0, score 0.73)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L9](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-9-0) (line 9, col 0, score 0.72)
- [AI-Centric OS with MCP Layer — L185](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-185-0) (line 185, col 0, score 0.71)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L223](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-223-0) (line 223, col 0, score 0.97)
- [AI-Centric OS with MCP Layer — L176](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-176-0) (line 176, col 0, score 0.64)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L412](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-412-0) (line 412, col 0, score 0.61)
- [observability-infrastructure-setup — L189](observability-infrastructure-setup.md#^ref-b4e64f8c-189-0) (line 189, col 0, score 0.66)
- [AI-Centric OS with MCP Layer — L8](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-8-0) (line 8, col 0, score 0.73)
- [Promethean Web UI Setup — L44](promethean-web-ui-setup.md#^ref-bc5172ca-44-0) (line 44, col 0, score 0.62)
- [RAG UI Panel with Qdrant and PostgREST — L81](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-81-0) (line 81, col 0, score 0.68)
- [Pure TypeScript Search Microservice — L46](pure-typescript-search-microservice.md#^ref-d17d3a96-46-0) (line 46, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L80](dynamic-context-model-for-web-components.md#^ref-f7702bf8-80-0) (line 80, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.65)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L514](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-514-0) (line 514, col 0, score 0.64)
- [prom-lib-rate-limiters-and-replay-api — L256](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-256-0) (line 256, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L146](chroma-toolkit-consolidation-plan.md#^ref-5020e892-146-0) (line 146, col 0, score 0.63)
- [Promethean Agent Config DSL — L163](promethean-agent-config-dsl.md#^ref-2c00ce45-163-0) (line 163, col 0, score 0.65)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L211](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-211-0) (line 211, col 0, score 0.64)
- [smart-chatgpt-thingy — L10](smart-chatgpt-thingy.md#^ref-2facccf8-10-0) (line 10, col 0, score 0.66)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L130](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-130-0) (line 130, col 0, score 0.67)
- [RAG UI Panel with Qdrant and PostgREST — L50](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-50-0) (line 50, col 0, score 0.65)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.68)
- [Promethean Pipelines: Local TypeScript-First Workflow — L3](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-3-0) (line 3, col 0, score 0.64)
- [promethean-requirements — L4](promethean-requirements.md#^ref-95205cd3-4-0) (line 4, col 0, score 0.63)
- [Pure TypeScript Search Microservice — L378](pure-typescript-search-microservice.md#^ref-d17d3a96-378-0) (line 378, col 0, score 0.67)
- [Promethean Pipelines — L44](promethean-pipelines.md#^ref-8b8e6103-44-0) (line 44, col 0, score 0.65)
- [Mongo Outbox Implementation — L538](mongo-outbox-implementation.md#^ref-9c1acd1e-538-0) (line 538, col 0, score 0.63)
- [parenthetical-extraction — L3](parenthetical-extraction.md#^ref-51a4e477-3-0) (line 3, col 0, score 0.63)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L178](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-178-0) (line 178, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L137](chroma-toolkit-consolidation-plan.md#^ref-5020e892-137-0) (line 137, col 0, score 0.67)
- [Promethean-Copilot-Intent-Engine — L5](promethean-copilot-intent-engine.md#^ref-ae24a280-5-0) (line 5, col 0, score 0.67)
- [Promethean-Copilot-Intent-Engine — L10](promethean-copilot-intent-engine.md#^ref-ae24a280-10-0) (line 10, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L156](migrate-to-provider-tenant-architecture.md#^ref-54382370-156-0) (line 156, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L35](dynamic-context-model-for-web-components.md#^ref-f7702bf8-35-0) (line 35, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.95)
- [Migrate to Provider-Tenant Architecture — L38](migrate-to-provider-tenant-architecture.md#^ref-54382370-38-0) (line 38, col 0, score 0.93)
- [Migrate to Provider-Tenant Architecture — L98](migrate-to-provider-tenant-architecture.md#^ref-54382370-98-0) (line 98, col 0, score 0.92)
- [Migrate to Provider-Tenant Architecture — L100](migrate-to-provider-tenant-architecture.md#^ref-54382370-100-0) (line 100, col 0, score 0.89)
- [eidolon-field-math-foundations — L105](eidolon-field-math-foundations.md#^ref-008f2ac0-105-0) (line 105, col 0, score 0.83)
- [Chroma-Embedding-Refactor — L26](chroma-embedding-refactor.md#^ref-8b256935-26-0) (line 26, col 0, score 0.83)
- [Migrate to Provider-Tenant Architecture — L101](migrate-to-provider-tenant-architecture.md#^ref-54382370-101-0) (line 101, col 0, score 0.79)
- [Prometheus Observability Stack — L496](prometheus-observability-stack.md#^ref-e90b5a16-496-0) (line 496, col 0, score 0.77)
- [Sibilant Meta-Prompt DSL — L158](sibilant-meta-prompt-dsl.md#^ref-af5d2824-158-0) (line 158, col 0, score 0.71)
- [Promethean Infrastructure Setup — L558](promethean-infrastructure-setup.md#^ref-6deed6ac-558-0) (line 558, col 0, score 0.74)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L107](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-107-0) (line 107, col 0, score 1)
- [Promethean Infrastructure Setup — L287](promethean-infrastructure-setup.md#^ref-6deed6ac-287-0) (line 287, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L149](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-149-0) (line 149, col 0, score 1)
- [eidolon-field-math-foundations — L155](eidolon-field-math-foundations.md#^ref-008f2ac0-155-0) (line 155, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L309](migrate-to-provider-tenant-architecture.md#^ref-54382370-309-0) (line 309, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L440](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-440-0) (line 440, col 0, score 1)
- [Promethean Infrastructure Setup — L578](promethean-infrastructure-setup.md#^ref-6deed6ac-578-0) (line 578, col 0, score 1)
- [Promethean Web UI Setup — L605](promethean-web-ui-setup.md#^ref-bc5172ca-605-0) (line 605, col 0, score 1)
- [Prometheus Observability Stack — L507](prometheus-observability-stack.md#^ref-e90b5a16-507-0) (line 507, col 0, score 1)
- [Pure TypeScript Search Microservice — L178](pure-typescript-search-microservice.md#^ref-d17d3a96-178-0) (line 178, col 0, score 0.77)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.74)
- [Language-Agnostic Mirror System — L127](language-agnostic-mirror-system.md#^ref-d2b3628c-127-0) (line 127, col 0, score 0.73)
- [Refactor 05-footers.ts — L9](refactor-05-footers-ts.md#^ref-80d4d883-9-0) (line 9, col 0, score 0.72)
- [universal-intention-code-fabric — L186](universal-intention-code-fabric.md#^ref-c14edce7-186-0) (line 186, col 0, score 0.72)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.67)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.69)
- [Event Bus MVP — L457](event-bus-mvp.md#^ref-534fe91d-457-0) (line 457, col 0, score 0.71)
- [Mongo Outbox Implementation — L263](mongo-outbox-implementation.md#^ref-9c1acd1e-263-0) (line 263, col 0, score 0.71)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.7)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.7)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.7)
- [Mongo Outbox Implementation — L187](mongo-outbox-implementation.md#^ref-9c1acd1e-187-0) (line 187, col 0, score 0.7)
- [Chroma-Embedding-Refactor — L66](chroma-embedding-refactor.md#^ref-8b256935-66-0) (line 66, col 0, score 0.7)
- [zero-copy-snapshots-and-workers — L202](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-202-0) (line 202, col 0, score 0.7)
- [Local-First Intention→Code Loop with Free Models — L127](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-127-0) (line 127, col 0, score 0.68)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L107](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-107-0) (line 107, col 0, score 0.67)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.64)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.66)
- [markdown-to-org-transpiler — L7](markdown-to-org-transpiler.md#^ref-ab54cdd8-7-0) (line 7, col 0, score 0.65)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.65)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.64)
- [WebSocket Gateway Implementation — L56](websocket-gateway-implementation.md#^ref-e811123d-56-0) (line 56, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.66)
- [js-to-lisp-reverse-compiler — L397](js-to-lisp-reverse-compiler.md#^ref-58191024-397-0) (line 397, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L325](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-325-0) (line 325, col 0, score 0.64)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L40](migrate-to-provider-tenant-architecture.md#^ref-54382370-40-0) (line 40, col 0, score 0.73)
- [Chroma Toolkit Consolidation Plan — L12](chroma-toolkit-consolidation-plan.md#^ref-5020e892-12-0) (line 12, col 0, score 0.72)
- [Functional Embedding Pipeline Refactor — L23](functional-embedding-pipeline-refactor.md#^ref-a4a25141-23-0) (line 23, col 0, score 0.69)
- [Promethean Dev Workflow Update — L47](promethean-dev-workflow-update.md#^ref-03a5578f-47-0) (line 47, col 0, score 0.65)
- [Language-Agnostic Mirror System — L510](language-agnostic-mirror-system.md#^ref-d2b3628c-510-0) (line 510, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L207](migrate-to-provider-tenant-architecture.md#^ref-54382370-207-0) (line 207, col 0, score 0.64)
- [Shared Package Structure — L56](shared-package-structure.md#^ref-66a72fc3-56-0) (line 56, col 0, score 0.64)
- [Self-Agency in AI Interaction — L3](self-agency-in-ai-interaction.md#^ref-49a9a860-3-0) (line 3, col 0, score 0.62)
- [Promethean Infrastructure Setup — L471](promethean-infrastructure-setup.md#^ref-6deed6ac-471-0) (line 471, col 0, score 0.77)
- [api-gateway-versioning — L79](api-gateway-versioning.md#^ref-0580dcd3-79-0) (line 79, col 0, score 0.66)
- [AI-Centric OS with MCP Layer — L279](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-279-0) (line 279, col 0, score 0.69)
- [Promethean Infrastructure Setup — L456](promethean-infrastructure-setup.md#^ref-6deed6ac-456-0) (line 456, col 0, score 0.69)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L1](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-1-0) (line 1, col 0, score 0.72)
- [Promethean Infrastructure Setup — L224](promethean-infrastructure-setup.md#^ref-6deed6ac-224-0) (line 224, col 0, score 0.68)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.7)
- [Promethean Agent DSL TS Scaffold — L568](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-568-0) (line 568, col 0, score 0.7)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.63)
- [Promethean Agent DSL TS Scaffold — L362](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-362-0) (line 362, col 0, score 0.69)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.69)
- [Promethean-native config design — L160](promethean-native-config-design.md#^ref-ab748541-160-0) (line 160, col 0, score 0.68)
- [Pure TypeScript Search Microservice — L306](pure-typescript-search-microservice.md#^ref-d17d3a96-306-0) (line 306, col 0, score 0.67)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.67)
- [Promethean Full-Stack Docker Setup — L169](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-169-0) (line 169, col 0, score 0.68)
- [AI-Centric OS with MCP Layer — L359](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-359-0) (line 359, col 0, score 0.68)
- [Promethean Infrastructure Setup — L415](promethean-infrastructure-setup.md#^ref-6deed6ac-415-0) (line 415, col 0, score 0.68)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L415](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-415-0) (line 415, col 0, score 0.67)
- [markdown-to-org-transpiler — L219](markdown-to-org-transpiler.md#^ref-ab54cdd8-219-0) (line 219, col 0, score 0.64)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.65)
- [Promethean Web UI Setup — L415](promethean-web-ui-setup.md#^ref-bc5172ca-415-0) (line 415, col 0, score 0.68)
- [Pure TypeScript Search Microservice — L227](pure-typescript-search-microservice.md#^ref-d17d3a96-227-0) (line 227, col 0, score 0.63)
- [schema-evolution-workflow — L243](schema-evolution-workflow.md#^ref-d8059b6a-243-0) (line 243, col 0, score 0.62)
- [Obsidian Templating Plugins Integration Guide — L62](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-62-0) (line 62, col 0, score 0.62)
- [schema-evolution-workflow — L9](schema-evolution-workflow.md#^ref-d8059b6a-9-0) (line 9, col 0, score 0.61)
- [polymorphic-meta-programming-engine — L32](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-32-0) (line 32, col 0, score 0.7)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.66)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.64)
- [polymorphic-meta-programming-engine — L19](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-19-0) (line 19, col 0, score 0.68)
- [schema-evolution-workflow — L393](schema-evolution-workflow.md#^ref-d8059b6a-393-0) (line 393, col 0, score 0.68)
- [Promethean Agent Config DSL — L19](promethean-agent-config-dsl.md#^ref-2c00ce45-19-0) (line 19, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L3](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-3-0) (line 3, col 0, score 0.65)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.7)
- [Promethean Agent DSL TS Scaffold — L647](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-647-0) (line 647, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L510](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-510-0) (line 510, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L389](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-389-0) (line 389, col 0, score 0.64)
- [lisp-dsl-for-window-management — L186](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-186-0) (line 186, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L518](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-518-0) (line 518, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L604](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-604-0) (line 604, col 0, score 0.63)
- [Provider-Agnostic Chat Panel Implementation — L183](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-183-0) (line 183, col 0, score 0.69)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.69)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.68)
- [schema-evolution-workflow — L98](schema-evolution-workflow.md#^ref-d8059b6a-98-0) (line 98, col 0, score 0.66)
- [Pure TypeScript Search Microservice — L5](pure-typescript-search-microservice.md#^ref-d17d3a96-5-0) (line 5, col 0, score 0.7)
- [Agent Tasks: Persistence Migration to DualStore — L109](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-109-0) (line 109, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L72](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-72-0) (line 72, col 0, score 0.62)
- [Local-Only-LLM-Workflow — L1](local-only-llm-workflow.md#^ref-9a8ab57e-1-0) (line 1, col 0, score 0.62)
- [Provider-Agnostic Chat Panel Implementation — L140](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-140-0) (line 140, col 0, score 0.6)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L416](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-416-0) (line 416, col 0, score 0.6)
- [Promethean Infrastructure Setup — L542](promethean-infrastructure-setup.md#^ref-6deed6ac-542-0) (line 542, col 0, score 0.6)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L91](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-91-0) (line 91, col 0, score 0.6)
- [aionian-circuit-math — L17](aionian-circuit-math.md#^ref-f2d83a77-17-0) (line 17, col 0, score 0.59)
- [aionian-circuit-math — L40](aionian-circuit-math.md#^ref-f2d83a77-40-0) (line 40, col 0, score 0.59)
- [aionian-circuit-math — L66](aionian-circuit-math.md#^ref-f2d83a77-66-0) (line 66, col 0, score 0.59)
- [aionian-circuit-math — L85](aionian-circuit-math.md#^ref-f2d83a77-85-0) (line 85, col 0, score 0.59)
- [aionian-circuit-math — L105](aionian-circuit-math.md#^ref-f2d83a77-105-0) (line 105, col 0, score 0.59)
- [ecs-offload-workers — L443](ecs-offload-workers.md#^ref-6498b9d7-443-0) (line 443, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L14](migrate-to-provider-tenant-architecture.md#^ref-54382370-14-0) (line 14, col 0, score 0.63)
- [obsidian-ignore-node-modules-regex — L3](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-3-0) (line 3, col 0, score 0.62)
- [Interop and Source Maps — L505](interop-and-source-maps.md#^ref-cdfac40c-505-0) (line 505, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.62)
- [Voice Access Layer Design — L162](voice-access-layer-design.md#^ref-543ed9b3-162-0) (line 162, col 0, score 0.62)
- [Promethean Documentation Pipeline Overview — L154](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-154-0) (line 154, col 0, score 0.62)
- [Pure TypeScript Search Microservice — L62](pure-typescript-search-microservice.md#^ref-d17d3a96-62-0) (line 62, col 0, score 0.77)
- [RAG UI Panel with Qdrant and PostgREST — L71](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-71-0) (line 71, col 0, score 0.77)
- [Promethean Infrastructure Setup — L545](promethean-infrastructure-setup.md#^ref-6deed6ac-545-0) (line 545, col 0, score 0.74)
- [Promethean Web UI Setup — L563](promethean-web-ui-setup.md#^ref-bc5172ca-563-0) (line 563, col 0, score 0.73)
- [Promethean Full-Stack Docker Setup — L388](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-388-0) (line 388, col 0, score 0.72)
- [Prometheus Observability Stack — L500](prometheus-observability-stack.md#^ref-e90b5a16-500-0) (line 500, col 0, score 0.71)
- [Local-Offline-Model-Deployment-Strategy — L255](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-255-0) (line 255, col 0, score 0.71)
- [Promethean Infrastructure Setup — L536](promethean-infrastructure-setup.md#^ref-6deed6ac-536-0) (line 536, col 0, score 0.71)
- [observability-infrastructure-setup — L357](observability-infrastructure-setup.md#^ref-b4e64f8c-357-0) (line 357, col 0, score 0.7)
- [Promethean Infrastructure Setup — L93](promethean-infrastructure-setup.md#^ref-6deed6ac-93-0) (line 93, col 0, score 0.7)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L73](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-73-0) (line 73, col 0, score 0.69)
- [Promethean Infrastructure Setup — L5](promethean-infrastructure-setup.md#^ref-6deed6ac-5-0) (line 5, col 0, score 0.69)
- [RAG UI Panel with Qdrant and PostgREST — L316](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-316-0) (line 316, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L95](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-95-0) (line 95, col 0, score 0.65)
- [obsidian-ignore-node-modules-regex — L6](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-6-0) (line 6, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L79](migrate-to-provider-tenant-architecture.md#^ref-54382370-79-0) (line 79, col 0, score 0.62)
- [Promethean Agent Config DSL — L116](promethean-agent-config-dsl.md#^ref-2c00ce45-116-0) (line 116, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.61)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.61)
- [Promethean Infrastructure Setup — L560](promethean-infrastructure-setup.md#^ref-6deed6ac-560-0) (line 560, col 0, score 0.61)
- [AI-Centric OS with MCP Layer — L30](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-30-0) (line 30, col 0, score 0.65)
- [observability-infrastructure-setup — L334](observability-infrastructure-setup.md#^ref-b4e64f8c-334-0) (line 334, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L1](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-1-0) (line 1, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L18](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-18-0) (line 18, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L23](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-23-0) (line 23, col 0, score 0.64)
- [Promethean Agent Config DSL — L292](promethean-agent-config-dsl.md#^ref-2c00ce45-292-0) (line 292, col 0, score 0.64)
- [Protocol_0_The_Contradiction_Engine — L37](protocol-0-the-contradiction-engine.md#^ref-9a93a756-37-0) (line 37, col 0, score 0.64)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.63)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L419](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-419-0) (line 419, col 0, score 0.65)
- [Provider-Agnostic Chat Panel Implementation — L14](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-14-0) (line 14, col 0, score 0.63)
- [Layer1SurvivabilityEnvelope — L84](layer1survivabilityenvelope.md#^ref-64a9f9f9-84-0) (line 84, col 0, score 0.61)
- [Promethean-native config design — L355](promethean-native-config-design.md#^ref-ab748541-355-0) (line 355, col 0, score 0.6)
- [Local-First Intention→Code Loop with Free Models — L120](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-120-0) (line 120, col 0, score 0.6)
- [shared-package-layout-clarification — L126](shared-package-layout-clarification.md#^ref-36c8882a-126-0) (line 126, col 0, score 0.59)
- [Performance-Optimized-Polyglot-Bridge — L10](performance-optimized-polyglot-bridge.md#^ref-f5579967-10-0) (line 10, col 0, score 0.59)
- [Promethean Event Bus MVP v0.1 — L182](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-182-0) (line 182, col 0, score 0.59)
- [prom-lib-rate-limiters-and-replay-api — L88](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-88-0) (line 88, col 0, score 0.59)
- [plan-update-confirmation — L474](plan-update-confirmation.md#^ref-b22d79c6-474-0) (line 474, col 0, score 0.58)
- [polymorphic-meta-programming-engine — L111](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-111-0) (line 111, col 0, score 0.58)
- [plan-update-confirmation — L370](plan-update-confirmation.md#^ref-b22d79c6-370-0) (line 370, col 0, score 0.58)
- [plan-update-confirmation — L540](plan-update-confirmation.md#^ref-b22d79c6-540-0) (line 540, col 0, score 0.58)
- [Interop and Source Maps — L507](interop-and-source-maps.md#^ref-cdfac40c-507-0) (line 507, col 0, score 0.58)
- [AI-Centric OS with MCP Layer — L178](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-178-0) (line 178, col 0, score 0.63)
- [Board Walk – 2025-08-11 — L60](board-walk-2025-08-11.md#^ref-7aa1eb92-60-0) (line 60, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L393](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-393-0) (line 393, col 0, score 0.62)
- [Promethean-native config design — L82](promethean-native-config-design.md#^ref-ab748541-82-0) (line 82, col 0, score 0.62)
- [Promethean Documentation Pipeline Overview — L15](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-15-0) (line 15, col 0, score 0.67)
- [Model Selection for Lightweight Conversational Tasks — L55](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-55-0) (line 55, col 0, score 0.65)
- [RAG UI Panel with Qdrant and PostgREST — L327](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-327-0) (line 327, col 0, score 0.64)
- [Pure TypeScript Search Microservice — L3](pure-typescript-search-microservice.md#^ref-d17d3a96-3-0) (line 3, col 0, score 0.64)
- [universal-intention-code-fabric — L393](universal-intention-code-fabric.md#^ref-c14edce7-393-0) (line 393, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L173](dynamic-context-model-for-web-components.md#^ref-f7702bf8-173-0) (line 173, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L171](dynamic-context-model-for-web-components.md#^ref-f7702bf8-171-0) (line 171, col 0, score 0.63)
- [AI-Centric OS with MCP Layer — L14](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-14-0) (line 14, col 0, score 0.67)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L20](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-20-0) (line 20, col 0, score 0.65)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L490](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-490-0) (line 490, col 0, score 0.65)
- [Promethean Web UI Setup — L40](promethean-web-ui-setup.md#^ref-bc5172ca-40-0) (line 40, col 0, score 0.63)
- [set-assignment-in-lisp-ast — L56](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-56-0) (line 56, col 0, score 0.63)
- [Shared Package Structure — L148](shared-package-structure.md#^ref-66a72fc3-148-0) (line 148, col 0, score 0.63)
- [Universal Lisp Interface — L174](universal-lisp-interface.md#^ref-b01856b4-174-0) (line 174, col 0, score 0.69)
- [pm2-orchestration-patterns — L9](pm2-orchestration-patterns.md#^ref-51932e7b-9-0) (line 9, col 0, score 0.68)
- [Promethean Infrastructure Setup — L33](promethean-infrastructure-setup.md#^ref-6deed6ac-33-0) (line 33, col 0, score 0.68)
- [ecs-offload-workers — L5](ecs-offload-workers.md#^ref-6498b9d7-5-0) (line 5, col 0, score 0.66)
- [polymorphic-meta-programming-engine — L48](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-48-0) (line 48, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L373](performance-optimized-polyglot-bridge.md#^ref-f5579967-373-0) (line 373, col 0, score 0.64)
- [obsidian-ignore-node-modules-regex — L8](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-8-0) (line 8, col 0, score 0.64)
- [obsidian-ignore-node-modules-regex — L14](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-14-0) (line 14, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L11](performance-optimized-polyglot-bridge.md#^ref-f5579967-11-0) (line 11, col 0, score 0.64)
- [Matplotlib Animation with Async Execution — L33](matplotlib-animation-with-async-execution.md#^ref-687439f9-33-0) (line 33, col 0, score 0.64)
- [Factorio AI with External Agents — L26](factorio-ai-with-external-agents.md#^ref-a4d90289-26-0) (line 26, col 0, score 0.64)
- [Board Walk – 2025-08-11 — L151](board-walk-2025-08-11.md#^ref-7aa1eb92-151-0) (line 151, col 0, score 0.63)
- [DSL — L14](chunks/dsl.md#^ref-e87bc036-14-0) (line 14, col 0, score 0.63)
- [Services — L24](chunks/services.md#^ref-75ea4a6a-24-0) (line 24, col 0, score 0.63)
- [Shared — L16](chunks/shared.md#^ref-623a55f7-16-0) (line 16, col 0, score 0.63)
- [Simulation Demo — L19](chunks/simulation-demo.md#^ref-557309a3-19-0) (line 19, col 0, score 0.63)
- [Tooling — L15](chunks/tooling.md#^ref-6cb4943e-15-0) (line 15, col 0, score 0.63)
- [Window Management — L24](chunks/window-management.md#^ref-9e8ae388-24-0) (line 24, col 0, score 0.63)
- [compiler-kit-foundations — L629](compiler-kit-foundations.md#^ref-01b21543-629-0) (line 629, col 0, score 0.63)
- [Cross-Language Runtime Polymorphism — L240](cross-language-runtime-polymorphism.md#^ref-c34c36a6-240-0) (line 240, col 0, score 0.63)
- [Cross-Target Macro System in Sibilant — L203](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-203-0) (line 203, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L429](dynamic-context-model-for-web-components.md#^ref-f7702bf8-429-0) (line 429, col 0, score 0.63)
- [ecs-offload-workers — L461](ecs-offload-workers.md#^ref-6498b9d7-461-0) (line 461, col 0, score 0.63)
- [ecs-scheduler-and-prefabs — L393](ecs-scheduler-and-prefabs.md#^ref-c62a1815-393-0) (line 393, col 0, score 0.63)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L421](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-421-0) (line 421, col 0, score 0.91)
- [AI-Centric OS with MCP Layer — L397](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-397-0) (line 397, col 0, score 0.77)
- [AI-Centric OS with MCP Layer — L10](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-10-0) (line 10, col 0, score 0.72)
- [Pure TypeScript Search Microservice — L530](pure-typescript-search-microservice.md#^ref-d17d3a96-530-0) (line 530, col 0, score 1)
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
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-406-0) (line 406, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L214](cross-language-runtime-polymorphism.md#^ref-c34c36a6-214-0) (line 214, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 1)
- [i3-config-validation-methods — L56](i3-config-validation-methods.md#^ref-d28090ac-56-0) (line 56, col 0, score 1)
- [js-to-lisp-reverse-compiler — L412](js-to-lisp-reverse-compiler.md#^ref-58191024-412-0) (line 412, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L146](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-146-0) (line 146, col 0, score 1)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [i3-config-validation-methods — L61](i3-config-validation-methods.md#^ref-d28090ac-61-0) (line 61, col 0, score 1)
- [Mongo Outbox Implementation — L572](mongo-outbox-implementation.md#^ref-9c1acd1e-572-0) (line 572, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L455](performance-optimized-polyglot-bridge.md#^ref-f5579967-455-0) (line 455, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
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
- [api-gateway-versioning — L293](api-gateway-versioning.md#^ref-0580dcd3-293-0) (line 293, col 0, score 1)
- [eidolon-field-math-foundations — L168](eidolon-field-math-foundations.md#^ref-008f2ac0-168-0) (line 168, col 0, score 1)
- [i3-config-validation-methods — L75](i3-config-validation-methods.md#^ref-d28090ac-75-0) (line 75, col 0, score 1)
- [Local-Only-LLM-Workflow — L200](local-only-llm-workflow.md#^ref-9a8ab57e-200-0) (line 200, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L325](migrate-to-provider-tenant-architecture.md#^ref-54382370-325-0) (line 325, col 0, score 1)
- [observability-infrastructure-setup — L377](observability-infrastructure-setup.md#^ref-b4e64f8c-377-0) (line 377, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L434](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-434-0) (line 434, col 0, score 1)
- [Promethean Infrastructure Setup — L583](promethean-infrastructure-setup.md#^ref-6deed6ac-583-0) (line 583, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [AI-Centric OS with MCP Layer — L401](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-401-0) (line 401, col 0, score 1)
- [api-gateway-versioning — L296](api-gateway-versioning.md#^ref-0580dcd3-296-0) (line 296, col 0, score 1)
- [i3-bluetooth-setup — L110](i3-bluetooth-setup.md#^ref-5e408692-110-0) (line 110, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L291](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-291-0) (line 291, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L279](migrate-to-provider-tenant-architecture.md#^ref-54382370-279-0) (line 279, col 0, score 1)
- [Mongo Outbox Implementation — L574](mongo-outbox-implementation.md#^ref-9c1acd1e-574-0) (line 574, col 0, score 1)
- [observability-infrastructure-setup — L359](observability-infrastructure-setup.md#^ref-b4e64f8c-359-0) (line 359, col 0, score 1)
- [plan-update-confirmation — L996](plan-update-confirmation.md#^ref-b22d79c6-996-0) (line 996, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-134-0) (line 134, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L164](chroma-toolkit-consolidation-plan.md#^ref-5020e892-164-0) (line 164, col 0, score 1)
- [Services — L18](chunks/services.md#^ref-75ea4a6a-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L230](cross-language-runtime-polymorphism.md#^ref-c34c36a6-230-0) (line 230, col 0, score 1)
- [ecs-offload-workers — L483](ecs-offload-workers.md#^ref-6498b9d7-483-0) (line 483, col 0, score 1)
- [eidolon-field-math-foundations — L148](eidolon-field-math-foundations.md#^ref-008f2ac0-148-0) (line 148, col 0, score 1)
- [Event Bus MVP — L549](event-bus-mvp.md#^ref-534fe91d-549-0) (line 549, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L282](migrate-to-provider-tenant-architecture.md#^ref-54382370-282-0) (line 282, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [plan-update-confirmation — L1022](plan-update-confirmation.md#^ref-b22d79c6-1022-0) (line 1022, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
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
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L66](promethean-copilot-intent-engine.md#^ref-ae24a280-66-0) (line 66, col 0, score 1)
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
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-529-0) (line 529, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L138](protocol-0-the-contradiction-engine.md#^ref-9a93a756-138-0) (line 138, col 0, score 1)
- [Board Walk – 2025-08-11 — L132](board-walk-2025-08-11.md#^ref-7aa1eb92-132-0) (line 132, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L166](chroma-toolkit-consolidation-plan.md#^ref-5020e892-166-0) (line 166, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L207](cross-language-runtime-polymorphism.md#^ref-c34c36a6-207-0) (line 207, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L193](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-193-0) (line 193, col 0, score 1)
- [Dynamic Context Model for Web Components — L381](dynamic-context-model-for-web-components.md#^ref-f7702bf8-381-0) (line 381, col 0, score 1)
- [Exception Layer Analysis — L154](exception-layer-analysis.md#^ref-21d5cc09-154-0) (line 154, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L265](migrate-to-provider-tenant-architecture.md#^ref-54382370-265-0) (line 265, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L130](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-130-0) (line 130, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L39](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-39-0) (line 39, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L38](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-38-0) (line 38, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L135](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-135-0) (line 135, col 0, score 1)
- [ecs-offload-workers — L481](ecs-offload-workers.md#^ref-6498b9d7-481-0) (line 481, col 0, score 1)
- [ecs-scheduler-and-prefabs — L418](ecs-scheduler-and-prefabs.md#^ref-c62a1815-418-0) (line 418, col 0, score 1)
- [eidolon-node-lifecycle — L49](eidolon-node-lifecycle.md#^ref-938eca9c-49-0) (line 49, col 0, score 1)
- [Event Bus MVP — L545](event-bus-mvp.md#^ref-534fe91d-545-0) (line 545, col 0, score 1)
- [Event Bus Projections Architecture — L148](event-bus-projections-architecture.md#^ref-cf6b9b17-148-0) (line 148, col 0, score 1)
- [Fnord Tracer Protocol — L242](fnord-tracer-protocol.md#^ref-fc21f824-242-0) (line 242, col 0, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#^ref-5e408692-104-0) (line 104, col 0, score 1)
- [layer-1-uptime-diagrams — L173](layer-1-uptime-diagrams.md#^ref-4127189a-173-0) (line 173, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L147](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-147-0) (line 147, col 0, score 1)
- [Admin Dashboard for User Management — L43](admin-dashboard-for-user-management.md#^ref-2901a3e9-43-0) (line 43, col 0, score 1)
- [api-gateway-versioning — L300](api-gateway-versioning.md#^ref-0580dcd3-300-0) (line 300, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L305](migrate-to-provider-tenant-architecture.md#^ref-54382370-305-0) (line 305, col 0, score 1)
- [observability-infrastructure-setup — L399](observability-infrastructure-setup.md#^ref-b4e64f8c-399-0) (line 399, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L165](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-165-0) (line 165, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L266](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-266-0) (line 266, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L436](performance-optimized-polyglot-bridge.md#^ref-f5579967-436-0) (line 436, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L504](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-504-0) (line 504, col 0, score 1)
- [polymorphic-meta-programming-engine — L244](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-244-0) (line 244, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L91](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-91-0) (line 91, col 0, score 1)
- [Chroma-Embedding-Refactor — L326](chroma-embedding-refactor.md#^ref-8b256935-326-0) (line 326, col 0, score 1)
- [i3-config-validation-methods — L67](i3-config-validation-methods.md#^ref-d28090ac-67-0) (line 67, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L274](migrate-to-provider-tenant-architecture.md#^ref-54382370-274-0) (line 274, col 0, score 1)
- [Promethean Agent Config DSL — L326](promethean-agent-config-dsl.md#^ref-2c00ce45-326-0) (line 326, col 0, score 1)
- [Promethean Infrastructure Setup — L579](promethean-infrastructure-setup.md#^ref-6deed6ac-579-0) (line 579, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L441](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-441-0) (line 441, col 0, score 1)
- [shared-package-layout-clarification — L164](shared-package-layout-clarification.md#^ref-36c8882a-164-0) (line 164, col 0, score 1)
- [Vectorial Exception Descent — L175](vectorial-exception-descent.md#^ref-d771154e-175-0) (line 175, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L175](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-175-0) (line 175, col 0, score 1)
- [AI-Centric OS with MCP Layer — L409](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-409-0) (line 409, col 0, score 1)
- [api-gateway-versioning — L295](api-gateway-versioning.md#^ref-0580dcd3-295-0) (line 295, col 0, score 1)
- [eidolon-field-math-foundations — L166](eidolon-field-math-foundations.md#^ref-008f2ac0-166-0) (line 166, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L293](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-293-0) (line 293, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L307](migrate-to-provider-tenant-architecture.md#^ref-54382370-307-0) (line 307, col 0, score 1)
- [observability-infrastructure-setup — L364](observability-infrastructure-setup.md#^ref-b4e64f8c-364-0) (line 364, col 0, score 1)
- [Promethean Infrastructure Setup — L587](promethean-infrastructure-setup.md#^ref-6deed6ac-587-0) (line 587, col 0, score 1)
- [promethean-system-diagrams — L207](promethean-system-diagrams.md#^ref-b51e19b4-207-0) (line 207, col 0, score 1)
- [Promethean Web UI Setup — L633](promethean-web-ui-setup.md#^ref-bc5172ca-633-0) (line 633, col 0, score 1)
- [Promethean Workflow Optimization — L20](promethean-workflow-optimization.md#^ref-d614d983-20-0) (line 20, col 0, score 1)
- [Prometheus Observability Stack — L543](prometheus-observability-stack.md#^ref-e90b5a16-543-0) (line 543, col 0, score 1)
- [Prompt_Folder_Bootstrap — L216](prompt-folder-bootstrap.md#^ref-bd4f0976-216-0) (line 216, col 0, score 1)
- [prompt-programming-language-lisp — L116](prompt-programming-language-lisp.md#^ref-d41a06d1-116-0) (line 116, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L156](protocol-0-the-contradiction-engine.md#^ref-9a93a756-156-0) (line 156, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L238](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-238-0) (line 238, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L445](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-445-0) (line 445, col 0, score 1)
- [Shared Package Structure — L195](shared-package-structure.md#^ref-66a72fc3-195-0) (line 195, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [Language-Agnostic Mirror System — L538](language-agnostic-mirror-system.md#^ref-d2b3628c-538-0) (line 538, col 0, score 1)
- [layer-1-uptime-diagrams — L178](layer-1-uptime-diagrams.md#^ref-4127189a-178-0) (line 178, col 0, score 1)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#^ref-cfee6d36-550-0) (line 550, col 0, score 1)
- [lisp-dsl-for-window-management — L223](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-223-0) (line 223, col 0, score 1)
- [Lispy Macros with syntax-rules — L406](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-406-0) (line 406, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L168](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-168-0) (line 168, col 0, score 1)
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [markdown-to-org-transpiler — L323](markdown-to-org-transpiler.md#^ref-ab54cdd8-323-0) (line 323, col 0, score 1)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
- [schema-evolution-workflow — L492](schema-evolution-workflow.md#^ref-d8059b6a-492-0) (line 492, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L181](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-181-0) (line 181, col 0, score 1)
- [AI-Centric OS with MCP Layer — L429](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-429-0) (line 429, col 0, score 1)
- [api-gateway-versioning — L317](api-gateway-versioning.md#^ref-0580dcd3-317-0) (line 317, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L186](chroma-toolkit-consolidation-plan.md#^ref-5020e892-186-0) (line 186, col 0, score 1)
- [Dynamic Context Model for Web Components — L433](dynamic-context-model-for-web-components.md#^ref-f7702bf8-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L555](event-bus-mvp.md#^ref-534fe91d-555-0) (line 555, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L150](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-150-0) (line 150, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L290](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-290-0) (line 290, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L298](migrate-to-provider-tenant-architecture.md#^ref-54382370-298-0) (line 298, col 0, score 1)
- [AI-Centric OS with MCP Layer — L408](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-408-0) (line 408, col 0, score 1)
- [api-gateway-versioning — L316](api-gateway-versioning.md#^ref-0580dcd3-316-0) (line 316, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L213](chroma-toolkit-consolidation-plan.md#^ref-5020e892-213-0) (line 213, col 0, score 1)
- [Event Bus MVP — L581](event-bus-mvp.md#^ref-534fe91d-581-0) (line 581, col 0, score 1)
- [i3-bluetooth-setup — L101](i3-bluetooth-setup.md#^ref-5e408692-101-0) (line 101, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L178](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-178-0) (line 178, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L303](migrate-to-provider-tenant-architecture.md#^ref-54382370-303-0) (line 303, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L140](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-140-0) (line 140, col 0, score 1)
- [Mongo Outbox Implementation — L585](mongo-outbox-implementation.md#^ref-9c1acd1e-585-0) (line 585, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
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
- [Cross-Language Runtime Polymorphism — L231](cross-language-runtime-polymorphism.md#^ref-c34c36a6-231-0) (line 231, col 0, score 1)
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
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L138](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-138-0) (line 138, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L193](chroma-toolkit-consolidation-plan.md#^ref-5020e892-193-0) (line 193, col 0, score 1)
- [Diagrams — L43](chunks/diagrams.md#^ref-45cd25b5-43-0) (line 43, col 0, score 1)
- [Services — L41](chunks/services.md#^ref-75ea4a6a-41-0) (line 41, col 0, score 1)
- [ecs-scheduler-and-prefabs — L417](ecs-scheduler-and-prefabs.md#^ref-c62a1815-417-0) (line 417, col 0, score 1)
- [eidolon-node-lifecycle — L62](eidolon-node-lifecycle.md#^ref-938eca9c-62-0) (line 62, col 0, score 1)
- [Event Bus MVP — L583](event-bus-mvp.md#^ref-534fe91d-583-0) (line 583, col 0, score 1)
- [Event Bus Projections Architecture — L182](event-bus-projections-architecture.md#^ref-cf6b9b17-182-0) (line 182, col 0, score 1)
- [Fnord Tracer Protocol — L266](fnord-tracer-protocol.md#^ref-fc21f824-266-0) (line 266, col 0, score 1)
- [i3-bluetooth-setup — L128](i3-bluetooth-setup.md#^ref-5e408692-128-0) (line 128, col 0, score 1)
- [layer-1-uptime-diagrams — L193](layer-1-uptime-diagrams.md#^ref-4127189a-193-0) (line 193, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L154](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-154-0) (line 154, col 0, score 1)
- [Local-Only-LLM-Workflow — L179](local-only-llm-workflow.md#^ref-9a8ab57e-179-0) (line 179, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L304](migrate-to-provider-tenant-architecture.md#^ref-54382370-304-0) (line 304, col 0, score 1)
- [observability-infrastructure-setup — L398](observability-infrastructure-setup.md#^ref-b4e64f8c-398-0) (line 398, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L184](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-184-0) (line 184, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L452](performance-optimized-polyglot-bridge.md#^ref-f5579967-452-0) (line 452, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L527](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-527-0) (line 527, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L90](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-90-0) (line 90, col 0, score 1)
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
