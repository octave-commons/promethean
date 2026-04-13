# ourllamas service home

This service is a **passive intake + disclosure-prep helper** for `our-gpus`.

What it does:
- Watches `inbox/` for source files such as Shodan-derived `ip:port` lists
- Uploads those files into the local `our-gpus` API
- Optionally triggers probing of newly discovered hosts
- Builds an RDAP-based contact report with registry abuse/security email addresses when available

What it does **not** do:
- It does **not** mass-scan public IPv4 space
- It does **not** perform nationality-based inclusion/exclusion

## Local compose
```bash
cd /home/err/devel/services/ourllamas
cp .env.example .env
docker compose up -d --build
docker compose ps
```

This service expects the local `our-gpus` compose stack to already be running, and joins its Docker network so it can talk to the API container directly.

Default local endpoint:
- API: `http://127.0.0.1:18134`

## Inbox workflow
Recommended source format is a plain text file containing one `ip:port` pair per line.

Example:
```text
1.2.3.4:11434
5.6.7.8:11434
```

Drop files into:
```text
services/ourllamas/inbox/
```

The watcher uploads them into `our-gpus` and then archives the processed file.

## Useful endpoints
- `GET /healthz` — service health and watcher state
- `POST /api/process-now` — run one inbox processing pass now
- `POST /api/contacts/refresh` — generate a fresh RDAP contact report
- `GET /api/contacts/report` — return the latest saved contact report

## Contact lookup behavior
Contact enrichment uses public RDAP lookups via `https://rdap.org/ip/<ip>` and extracts email fields from registry entity vCards when present.

Output reports are written to:
- `outbox/contact-report-latest.json`
- timestamped snapshots under `outbox/`

## Shodan handoff
Pair this with `../our-gpus/SHODAN.md`.

Example safe handoff flow:
```bash
shodan download our-gpus-port11434 'port:11434'
shodan parse --fields ip_str,port --separator : our-gpus-port11434.json.gz \
  > /home/err/devel/services/ourllamas/inbox/our-gpus-port11434.txt
```

The watcher will ingest that file automatically.
