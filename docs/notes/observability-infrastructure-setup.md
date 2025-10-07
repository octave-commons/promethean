---
```
uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
```
```
created_at: 2025.08.31.11.07.29.md
```
```
filename: observability-infrastructure-setup
```
```
description: >-
```
  Ready-to-boot Docker Compose configuration for observability stack
  (Prometheus, Grafana, Loki, Tempo, Nginx) with reverse proxy and dashboard
  provisioning. Includes starter dashboards and config templates for seamless
  deployment.
tags:
  - docker
  - observability
  - prometheus
  - grafana
  - loki
  - tempo
  - nginx
  - reverse-proxy
  - dashboards
  - config
```
related_to_title:
```
  - Prometheus Observability Stack
  - Promethean Infrastructure Setup
  - api-gateway-versioning
  - Mongo Outbox Implementation
  - Local-Offline-Model-Deployment-Strategy
  - Promethean Full-Stack Docker Setup
  - Migrate to Provider-Tenant Architecture
  - AI-Centric OS with MCP Layer
  - ecs-offload-workers
  - Event Bus MVP
  - Debugging Broker Connections and Agent Behavior
  - Dynamic Context Model for Web Components
  - Services
  - prom-lib-rate-limiters-and-replay-api
  - Pure TypeScript Search Microservice
  - eidolon-field-math-foundations
  - RAG UI Panel with Qdrant and PostgREST
  - shared-package-layout-clarification
```
related_to_uuid:
```
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - 54382370-1931-4a19-a634-46735708a9ea
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - 36c8882a-badc-4e18-838d-2c54d7038141
references:
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 61
    col: 1
    score: 0.9
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 7
    col: 1
    score: 0.89
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 500
    col: 1
    score: 0.9
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 403
    col: 1
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 403
    col: 3
    score: 1
  - uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
    line: 293
    col: 1
    score: 1
  - uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
    line: 293
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 281
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 281
    col: 3
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 439
    col: 1
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 439
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 284
    col: 1
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 284
    col: 3
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 40
    col: 1
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 40
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 384
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 384
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 458
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 458
    col: 3
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 41
    col: 1
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 41
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 385
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 385
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 568
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 568
    col: 3
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 524
    col: 1
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 524
    col: 3
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 13
    col: 1
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 13
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 467
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 467
    col: 3
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 549
    col: 1
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 549
    col: 3
    score: 1
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 387
    col: 1
    score: 1
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 387
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 291
    col: 1
    score: 0.99
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 291
    col: 3
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 153
    col: 1
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 153
    col: 3
    score: 0.99
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 369
    col: 1
    score: 0.99
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 369
    col: 3
    score: 0.99
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 178
    col: 1
    score: 0.99
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 178
    col: 3
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 593
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 593
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 596
    col: 1
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 596
    col: 3
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 595
    col: 1
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 595
    col: 3
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 608
    col: 1
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 608
    col: 3
    score: 0.99
---
alright err — here are **ready-to-boot** infra configs to drop under `./infra/**`. they match the compose I gave you. paste ’em in, `docker compose --profile observability up -d`, and you’ll have dashboards + logs on first boot.

---

## file tree

```
infra/
├─ nginx/
│  ├─ nginx.conf
│  └─ secrets/               # optional (tls, basic auth, etc.)
├─ grafana/
│  └─ provisioning/
│     ├─ datasources/
│     │  └─ datasources.yml
│     └─ dashboards/
│        ├─ dashboards.yml
│        └─ node_container.json    # starter board
├─ prometheus/
│  └─ prometheus.yml
├─ loki/
│  └─ loki-config.yaml
├─ promtail/
│  └─ config.yaml
├─ tempo/
│  └─ tempo.yaml
└─ mosquitto/
   └─ mosquitto.conf
```

> note: since `node_exporter` is `network_mode: host`, Prometheus needs a route to the host. add to your **prometheus service** in compose:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

---

## nginx: reverse proxy (simple)
```
`infra/nginx/nginx.conf`
```
```nginx
worker_processes auto;
events { worker_connections 1024; }

http {
  sendfile on;
  # upstreams
  upstream grafana { server grafana:3000; }
  upstream prometheus { server prometheus:9090; }
  upstream loki { server loki:3100; }
  upstream tempo { server tempo:3200; }

  server {
    listen 80;
    server_name _;

    # grafana
    location /grafana/ {
      proxy_pass http://grafana/;
      proxy_set_header Host host;
      proxy_set_header X-Real-IP remote_addr;
    }
    # prometheus
    location /prom/ {
      proxy_pass http://prometheus/;
      proxy_set_header Host host;
    }
    # loki
    location /loki/ {
      proxy_pass http://loki/;
      proxy_set_header Host host;
    }
    # tempo (otlp http / traces api)
    location /tempo/ {
      proxy_pass http://tempo/;
      proxy_set_header Host host;
    }

    # default landing
    location = / {
      return 302 /grafana/;
    }
  }
}
```

---

## grafana: datasources provisioning

`infra/grafana/provisioning/datasources/datasources.yml`

```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
  - name: Tempo
    type: tempo
    access: proxy
    url: http://tempo:3200
    jsonData:
      nodeGraph:
        enabled: true
      tracesToLogs:
        datasourceUid: Loki
        mappedTags: ["container", "compose_service"]
        mapTagNamesEnabled: true
```

`infra/grafana/provisioning/dashboards/dashboards.yml`

```yaml
apiVersion: 1
providers:
  - name: default
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    options:
      path: /etc/grafana/provisioning/dashboards
```

### starter dashboard containers + node

`infra/grafana/provisioning/dashboards/node_container.json`

```json
{
  "title": "Node + Containers (Starter)",
  "uid": "node-cont-starter",
  "schemaVersion": 39,
  "version": 1,
  "panels": [
    {
      "type": "stat",
      "title": "Host CPU %",
      "datasource": "Prometheus",
      "targets": [
        {"expr": "100 - (avg by (instance)(irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)"}
      ]
    },
    {
      "type": "graph",
      "title": "Container CPU (Top 5)",
      "datasource": "Prometheus",
      "targets": [
        {"expr": "topk(5, rate(container_cpu_usage_seconds_total{image!=\"\"}[5m]))"}
      ]
    },
    {
      "type": "graph",
      "title": "Container Memory",
      "datasource": "Prometheus",
      "targets": [
        {"expr": "sum by (name) (container_memory_usage_bytes{image!=\"\"})"}
      ]
    },
    {
      "type": "logs",
      "title": "Container Logs (Loki)",
      "datasource": "Loki",
      "options": {"showLabels": true},
      "targets": [
        {"expr": "{compose_project=~\".+\"}"}
      ]
    }
  ],
  "time": {"from": "now-1h", "to": "now"}
}
```

---

## prometheus: scrape config
```
`infra/prometheus/prometheus.yml`
```
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # prometheus itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['prometheus:9090']

  # cadvisor (container metrics)
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  # node_exporter on the host (requires extra_hosts trick in compose)
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['host.docker.internal:9100']

  # loki internal metrics
  - job_name: 'loki'
    metrics_path: /metrics
    static_configs:
      - targets: ['loki:3100']

  # tempo internal metrics
  - job_name: 'tempo'
    metrics_path: /metrics
    static_configs:
      - targets: ['tempo:3200']
```

---

## loki: single-node filesystem

`infra/loki/loki-config.yaml`

```yaml
server:
  http_listen_port: 3100

common:
  instance_addr: 127.0.0.1
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2020-10-15
      store: boltdb-shipper
      object_store: filesystem
      schema: v13
      index:
        prefix: loki_index_
        period: 24h

ruler:
  alertmanager_url: http://alertmanager:9093

analytics:
  reporting_enabled: false
```

---

## promtail: docker + system logs
```
`infra/promtail/config.yaml`
```
```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

clients:
  - url: http://loki:3100/loki/api/v1/push

positions:
  filename: /tmp/positions.yaml

scrape_configs:
  # docker containers
  - job_name: docker
    static_configs:
      - targets: [localhost]
        labels:
          job: docker
          __path__: /var/lib/docker/containers/*/*-json.log
    pipeline_stages:
      - docker: {}

  # host syslog (optional)
  - job_name: varlogs
    static_configs:
      - targets: [localhost]
        labels:
          job: varlogs
          __path__: /var/log/*.log
```

---

## tempo: traces single-process
```
`infra/tempo/tempo.yaml`
```
```yaml
server:
  http_listen_port: 3200

distributor:
  receivers:
    otlp:
      protocols:
        http:
        grpc:

storage:
  trace:
    backend: local
    local:
      path: /var/tempo/traces
    wal:
      path: /var/tempo/wal

compactor:
  compaction:
    block_retention: 48h
```

---

## mosquitto: minimal mqtt
```
`infra/mosquitto/mosquitto.conf`
```
```conf
listener 1883 0.0.0.0
persistence true
persistence_location /mosquitto/data/
allow_anonymous true
# for websockets (if you exposed 9001)
# listener 9001
# protocol websockets
```

---

### bring-up checklist

1. add `extra_hosts` to Prometheus service (as noted) so it can scrape `node_exporter`.
2. `docker compose --profile observability up -d`
3. hit `http://localhost/` → you should get redirected to Grafana

   * Prometheus, Loki, Tempo are pre-wired
   * Starter dashboard is available under Dashboards

want me to also drop **Traefik label snippets** and a **prebaked Haystack pipeline** `infra/haystack/default.yaml` so your RAG layer is one `--profile rag` away? I can hand you a minimal one that talks to Meili/OpenSearch and Postgres.

\#docker #docker-compose #observability #grafana #prometheus #loki #tempo #promtail #nginx #mosquitto #infrastructure #ops #sre
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [prometheus-observability-stack|Prometheus Observability Stack]
- [promethean-infrastructure-setup|Promethean Infrastructure Setup]
- [api-gateway-versioning]
- [mongo-outbox-implementation|Mongo Outbox Implementation]
- [local-offline-model-deployment-strategy]
- [promethean-full-stack-docker-setup|Promethean Full-Stack Docker Setup]
- [migrate-to-provider-tenant-architecture|Migrate to Provider-Tenant Architecture]
- [ai-centric-os-with-mcp-layer|AI-Centric OS with MCP Layer]
- [docs/unique/ecs-offload-workers|ecs-offload-workers]
- [docs/unique/event-bus-mvp|Event Bus MVP]
- [Debugging Broker Connections and Agent Behavior]debugging-broker-connections-and-agent-behavior.md
- [dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]
- [Services]chunks/services.md
- [prom-lib-rate-limiters-and-replay-api]
- [pure-typescript-search-microservice|Pure TypeScript Search Microservice]
- [docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]
- [rag-ui-panel-with-qdrant-and-postgrest|RAG UI Panel with Qdrant and PostgREST]
- [shared-package-layout-clarification]

## Sources
- [promethean-infrastructure-setup#L61|Promethean Infrastructure Setup — L61] (line 61, col 1, score 0.9)
- [api-gateway-versioning#L7|api-gateway-versioning — L7] (line 7, col 1, score 0.89)
- [prometheus-observability-stack#L500|Prometheus Observability Stack — L500] (line 500, col 1, score 0.9)
- [ai-centric-os-with-mcp-layer#L403|AI-Centric OS with MCP Layer — L403] (line 403, col 1, score 1)
- [ai-centric-os-with-mcp-layer#L403|AI-Centric OS with MCP Layer — L403] (line 403, col 3, score 1)
- [local-offline-model-deployment-strategy#L293|Local-Offline-Model-Deployment-Strategy — L293] (line 293, col 1, score 1)
- [local-offline-model-deployment-strategy#L293|Local-Offline-Model-Deployment-Strategy — L293] (line 293, col 3, score 1)
- [migrate-to-provider-tenant-architecture#L281|Migrate to Provider-Tenant Architecture — L281] (line 281, col 1, score 1)
- [migrate-to-provider-tenant-architecture#L281|Migrate to Provider-Tenant Architecture — L281] (line 281, col 3, score 1)
- [promethean-full-stack-docker-setup#L439|Promethean Full-Stack Docker Setup — L439] (line 439, col 1, score 1)
- [promethean-full-stack-docker-setup#L439|Promethean Full-Stack Docker Setup — L439] (line 439, col 3, score 1)
- [api-gateway-versioning#L284|api-gateway-versioning — L284] (line 284, col 1, score 1)
- [api-gateway-versioning#L284|api-gateway-versioning — L284] (line 284, col 3, score 1)
- [Debugging Broker Connections and Agent Behavior — L40]debugging-broker-connections-and-agent-behavior.md#L40 (line 40, col 1, score 1)
- [Debugging Broker Connections and Agent Behavior — L40]debugging-broker-connections-and-agent-behavior.md#L40 (line 40, col 3, score 1)
- [dynamic-context-model-for-web-components#L384|Dynamic Context Model for Web Components — L384] (line 384, col 1, score 1)
- [dynamic-context-model-for-web-components#L384|Dynamic Context Model for Web Components — L384] (line 384, col 3, score 1)
- [docs/unique/ecs-offload-workers#L458|ecs-offload-workers — L458] (line 458, col 1, score 1)
- [docs/unique/ecs-offload-workers#L458|ecs-offload-workers — L458] (line 458, col 3, score 1)
- [Debugging Broker Connections and Agent Behavior — L41]debugging-broker-connections-and-agent-behavior.md#L41 (line 41, col 1, score 1)
- [Debugging Broker Connections and Agent Behavior — L41]debugging-broker-connections-and-agent-behavior.md#L41 (line 41, col 3, score 1)
- [dynamic-context-model-for-web-components#L385|Dynamic Context Model for Web Components — L385] (line 385, col 1, score 1)
- [dynamic-context-model-for-web-components#L385|Dynamic Context Model for Web Components — L385] (line 385, col 3, score 1)
- [promethean-infrastructure-setup#L568|Promethean Infrastructure Setup — L568] (line 568, col 1, score 1)
- [promethean-infrastructure-setup#L568|Promethean Infrastructure Setup — L568] (line 568, col 3, score 1)
- [pure-typescript-search-microservice#L524|Pure TypeScript Search Microservice — L524] (line 524, col 1, score 1)
- [pure-typescript-search-microservice#L524|Pure TypeScript Search Microservice — L524] (line 524, col 3, score 1)
- [Services — L13]chunks/services.md#L13 (line 13, col 1, score 1)
- [Services — L13]chunks/services.md#L13 (line 13, col 3, score 1)
- [docs/unique/ecs-offload-workers#L467|ecs-offload-workers — L467] (line 467, col 1, score 1)
- [docs/unique/ecs-offload-workers#L467|ecs-offload-workers — L467] (line 467, col 3, score 1)
- [docs/unique/event-bus-mvp#L549|Event Bus MVP — L549] (line 549, col 1, score 1)
- [docs/unique/event-bus-mvp#L549|Event Bus MVP — L549] (line 549, col 3, score 1)
- [prom-lib-rate-limiters-and-replay-api#L387|prom-lib-rate-limiters-and-replay-api — L387] (line 387, col 1, score 1)
- [prom-lib-rate-limiters-and-replay-api#L387|prom-lib-rate-limiters-and-replay-api — L387] (line 387, col 3, score 1)
- [api-gateway-versioning#L291|api-gateway-versioning — L291] (line 291, col 1, score 0.99)
- [api-gateway-versioning#L291|api-gateway-versioning — L291] (line 291, col 3, score 0.99)
- [docs/unique/eidolon-field-math-foundations#L153|eidolon-field-math-foundations — L153] (line 153, col 1, score 0.99)
- [docs/unique/eidolon-field-math-foundations#L153|eidolon-field-math-foundations — L153] (line 153, col 3, score 0.99)
- [rag-ui-panel-with-qdrant-and-postgrest#L369|RAG UI Panel with Qdrant and PostgREST — L369] (line 369, col 1, score 0.99)
- [rag-ui-panel-with-qdrant-and-postgrest#L369|RAG UI Panel with Qdrant and PostgREST — L369] (line 369, col 3, score 0.99)
- [shared-package-layout-clarification#L178|shared-package-layout-clarification — L178] (line 178, col 1, score 0.99)
- [shared-package-layout-clarification#L178|shared-package-layout-clarification — L178] (line 178, col 3, score 0.99)
- [promethean-infrastructure-setup#L593|Promethean Infrastructure Setup — L593] (line 593, col 1, score 1)
- [promethean-infrastructure-setup#L593|Promethean Infrastructure Setup — L593] (line 593, col 3, score 1)
- [promethean-infrastructure-setup#L596|Promethean Infrastructure Setup — L596] (line 596, col 1, score 0.99)
- [promethean-infrastructure-setup#L596|Promethean Infrastructure Setup — L596] (line 596, col 3, score 0.99)
- [promethean-infrastructure-setup#L595|Promethean Infrastructure Setup — L595] (line 595, col 1, score 0.99)
- [promethean-infrastructure-setup#L595|Promethean Infrastructure Setup — L595] (line 595, col 3, score 0.99)
- [promethean-infrastructure-setup#L608|Promethean Infrastructure Setup — L608] (line 608, col 1, score 0.99)
- [promethean-infrastructure-setup#L608|Promethean Infrastructure Setup — L608] (line 608, col 3, score 0.99)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
