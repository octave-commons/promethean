# Webcrawler Service

Polite Markdown-saving web crawler that respects `robots.txt` and persists fetched pages as Markdown files in a configurable output directory.

## Packages

### `WebCrawler`

Programmatic crawler that accepts a seed list and writes Markdown to the configured output directory.

```ts
import { WebCrawler } from "@promethean/webcrawler-service";

const crawler = new WebCrawler({
  seeds: ["https://example.com"],
  outputDir: "/tmp/crawler",
});

await crawler.crawl();
```

### `CrawlerOrchestrator`

Stateful orchestrator that manages crawler lifecycles and exposes REST helpers.

```ts
import { CrawlerOrchestrator, createOrchestratorServer } from "@promethean/webcrawler-service";

const orchestrator = new CrawlerOrchestrator({ outputDir: "/tmp/crawler" });
const server = createOrchestratorServer(orchestrator);

await server.listen({ port: 3000 });
```

The HTTP surface supports:

- `POST /add { url }`
- `POST /remove { url }`
- `POST /start`
- `POST /end`
- `GET /status`

All routes respond with structured JSON status payloads that mirror the orchestrator return types.
