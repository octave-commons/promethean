---
uuid: c2ba3d27-5b24-4345-9cf2-5cf296f8b03d
created_at: observability-infrastructure-setup.md
filename: observability-infrastructure-setup
title: observability-infrastructure-setup
description: >-
  Ready-to-boot Docker Compose configuration for observability stack
  (Prometheus, Grafana, Loki, Tempo) with reverse proxy and starter dashboards.
  Deploy by pasting configs into `./infra/**` and running `docker compose
  --profile observability up -d` for dashboards and logs on first boot.
tags:
  - docker-compose
  - observability
  - prometheus
  - grafana
  - loki
  - tempo
  - reverse-proxy
  - logs
  - metrics
  - dashboards
related_to_uuid:
  - 7842d43c-7d13-46f0-bdf1-561f5e4c6f53
  - 1fcb8421-46eb-4813-ba66-f79b25ef5db7
  - 792a343e-674c-4bb4-8435-b3f8c163349d
  - 672da53b-d8ac-48cd-9cb3-e3fa9915dd6a
  - e4317155-7fa6-44e8-8aee-b72384581790
  - 99c6d380-a2a6-4d8e-a391-f4bc0c9a631f
  - 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
  - d65e5b6c-29ed-458f-bf9b-94bf0d48fa79
  - 177c260c-39b2-4450-836d-1e87c0bd0035
  - 972c820f-63a8-49c6-831f-013832195478
  - 004a0f06-3808-4421-b9e1-41b5b41ebcb8
  - 150f8bb4-4322-4bb9-8a5f-9c2e3b233e05
  - a28a39dd-8c17-463c-9050-2ffe9b56e8bc
  - cfa2be7b-13fd-404b-aaa4-80abc4fa8cd2
  - b25be760-256e-4a8a-b34d-867281847ccb
  - 10780cdc-5036-4e8a-9599-a11703bc30c9
  - e0d3201b-826a-4976-ab01-36aae28882be
  - 06ef038a-e195-49c1-898f-a50cc117c59a
  - 9a7799ff-78bf-451d-9066-24555d8eb209
  - cce2f5f9-557e-4d35-9dff-5c29ca71efd2
  - 740bbd1c-c039-405c-8a32-4baeddfb5637
  - fd753d3a-84cb-4bdd-ae93-8c5b09617e3b
  - 5becb573-0a78-486b-8d3c-199b3c7a79ec
  - 0c501d52-ba38-42aa-ad25-2d78425dfaff
  - bdca8ded-0e64-417b-a258-4528829c4704
related_to_title:
  - promethean-infrastructure-setup
  - api-gateway-versioning
  - windows-tiling-with-autohotkey
  - Factorio AI with External Agents
  - TypeScript Patch for Tool Calling Support
  - Layer 1 Survivability Envelope
  - Universal Lisp Interface
  - sibilant-macro-targets
  - universal-intention-code-fabric
  - archetype-ecs
  - ecs-offload-workers
  - i3-layout-saver
  - AI-Centric OS with MCP Layer
  - prompt-folder-bootstrap
  - ripple-propagation-demo
  - Eidolon Field Abstract Model
  - Field Node Diagrams
  - 2d-sandbox-field
  - Sibilant Meta-Prompt DSL
  - ollama-llm-provider-for-pseudo-code-transpiler
  - heartbeat-fragment-demo
  - polyglot-repl-interface-layer
  - Agent Reflections and Prompt Evolution
  - dynamic-context-model-for-web-components
  - Pure TypeScript Search Microservice
references:
  - uuid: 7842d43c-7d13-46f0-bdf1-561f5e4c6f53
    line: 64
    col: 0
    score: 0.9
  - uuid: 1fcb8421-46eb-4813-ba66-f79b25ef5db7
    line: 7
    col: 0
    score: 0.89
  - uuid: 792a343e-674c-4bb4-8435-b3f8c163349d
    line: 96
    col: 0
    score: 0.88
  - uuid: e4317155-7fa6-44e8-8aee-b72384581790
    line: 32
    col: 0
    score: 0.85
  - uuid: 672da53b-d8ac-48cd-9cb3-e3fa9915dd6a
    line: 89
    col: 0
    score: 0.85
  - uuid: 99c6d380-a2a6-4d8e-a391-f4bc0c9a631f
    line: 149
    col: 0
    score: 0.85
---
alright err — here are **ready-to-boot** infra configs to drop under `./infra/**`. they match the compose I gave you. paste ’em in, `docker compose --profile observability up -d`, and you’ll have dashboards + logs on first boot. ^ref-b4e64f8c-1-0

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
^ref-b4e64f8c-7-0
 ^ref-b4e64f8c-31-0
> note: since `node_exporter` is `network_mode: host`, Prometheus needs a route to the host. add to your **prometheus service** in compose:
 ^ref-b4e64f8c-33-0
```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
^ref-b4e64f8c-33-0
```

---

## nginx: reverse proxy (simple)

`infra/nginx/nginx.conf` ^ref-b4e64f8c-44-0

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
      proxy_pass 
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
    # prometheus
    location /prom/ {
      proxy_pass 
      proxy_set_header Host $host;
    }
    # loki
    location /loki/ {
      proxy_pass 
      proxy_set_header Host $host;
    }
    # tempo (otlp http / traces api)
    location /tempo/ {
      proxy_pass 
      proxy_set_header Host $host;
    }

    # default landing
    location = / {
      return 302 /grafana/;
    }
  }
^ref-b4e64f8c-44-0
}
```
^ref-b4e64f8c-46-0 ^ref-b4e64f8c-92-0

---

## grafana: datasources provisioning
 ^ref-b4e64f8c-96-0 ^ref-b4e64f8c-97-0
`infra/grafana/provisioning/datasources/datasources.yml`

```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: 
    isDefault: true
  - name: Loki
    type: loki
    access: proxy
    url: 
  - name: Tempo
    type: tempo
    access: proxy
    url: 
    jsonData:
      nodeGraph:
        enabled: true
      tracesToLogs:
        datasourceUid: Loki
^ref-b4e64f8c-96-0
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
 ^ref-b4e64f8c-138-0
### starter dashboard (containers + node) ^ref-b4e64f8c-138-0

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
^ref-b4e64f8c-138-0
  ],
  "time": {"from": "now-1h", "to": "now"}
}
```

---
 ^ref-b4e64f8c-189-0
## prometheus: scrape config

`infra/prometheus/prometheus.yml`

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
^ref-b4e64f8c-189-0
  - job_name: 'tempo'
    metrics_path: /metrics
    static_configs:
      - targets: ['tempo:3200']
```
 ^ref-b4e64f8c-229-0
--- ^ref-b4e64f8c-229-0

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

^ref-b4e64f8c-229-0
ruler:
  alertmanager_url: 

analytics:
  reporting_enabled: false
```
 ^ref-b4e64f8c-267-0
---

## promtail: docker + system logs

`infra/promtail/config.yaml`

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

clients:
  - url: 

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
^ref-b4e64f8c-267-0
  - job_name: varlogs
    static_configs:
      - targets: [localhost]
        labels:
          job: varlogs
          __path__: /var/log/*.log
```
^ref-b4e64f8c-304-0

---

## tempo: traces (single-process)

`infra/tempo/tempo.yaml`

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
^ref-b4e64f8c-304-0
      path: /var/tempo/traces
    wal:
      path: /var/tempo/wal

compactor:
  compaction:
    block_retention: 48h
^ref-b4e64f8c-334-0
```
^ref-b4e64f8c-334-0

---

## mosquitto: minimal mqtt

`infra/mosquitto/mosquitto.conf`

^ref-b4e64f8c-334-0
```conf
listener 1883 0.0.0.0
persistence true
persistence_location /mosquitto/data/
allow_anonymous true ^ref-b4e64f8c-348-0
# for websockets (if you exposed 9001)
# listener 9001
^ref-b4e64f8c-352-0
^ref-b4e64f8c-348-0
# protocol websockets ^ref-b4e64f8c-355-0
^ref-b4e64f8c-355-0 ^ref-b4e64f8c-357-0
^ref-b4e64f8c-352-0
^ref-b4e64f8c-348-0 ^ref-b4e64f8c-359-0
^ref-b4e64f8c-360-0
^ref-b4e64f8c-359-0 ^ref-b4e64f8c-362-0
^ref-b4e64f8c-357-0 ^ref-b4e64f8c-363-0
^ref-b4e64f8c-355-0 ^ref-b4e64f8c-364-0
^ref-b4e64f8c-352-0 ^ref-b4e64f8c-365-0
^ref-b4e64f8c-348-0
^ref-b4e64f8c-347-0
``` ^ref-b4e64f8c-352-0 ^ref-b4e64f8c-360-0 ^ref-b4e64f8c-368-0
^ref-b4e64f8c-348-0
 ^ref-b4e64f8c-357-0 ^ref-b4e64f8c-369-0
--- ^ref-b4e64f8c-362-0 ^ref-b4e64f8c-370-0
 ^ref-b4e64f8c-355-0 ^ref-b4e64f8c-359-0 ^ref-b4e64f8c-363-0 ^ref-b4e64f8c-371-0
### bring-up checklist ^ref-b4e64f8c-360-0 ^ref-b4e64f8c-364-0
 ^ref-b4e64f8c-357-0 ^ref-b4e64f8c-365-0 ^ref-b4e64f8c-373-0
1. add `extra_hosts` to Prometheus service (as noted) so it can scrape `node_exporter`. ^ref-b4e64f8c-362-0
2. `docker compose --profile observability up -d` ^ref-b4e64f8c-359-0 ^ref-b4e64f8c-363-0 ^ref-b4e64f8c-375-0
3. hit ` → you should get redirected to Grafana ^ref-b4e64f8c-360-0 ^ref-b4e64f8c-364-0 ^ref-b4e64f8c-368-0 ^ref-b4e64f8c-376-0
 ^ref-b4e64f8c-365-0 ^ref-b4e64f8c-369-0 ^ref-b4e64f8c-377-0
   * Prometheus, Loki, Tempo are pre-wired ^ref-b4e64f8c-362-0 ^ref-b4e64f8c-370-0 ^ref-b4e64f8c-378-0
   * Starter dashboard is available under Dashboards ^ref-b4e64f8c-363-0 ^ref-b4e64f8c-371-0
 ^ref-b4e64f8c-364-0 ^ref-b4e64f8c-368-0
want me to also drop **Traefik label snippets** and a **prebaked Haystack pipeline** (`infra/haystack/default.yaml`) so your RAG layer is one `--profile rag` away? I can hand you a minimal one that talks to Meili/OpenSearch and Postgres. ^ref-b4e64f8c-365-0 ^ref-b4e64f8c-369-0 ^ref-b4e64f8c-373-0 ^ref-b4e64f8c-381-0
 ^ref-b4e64f8c-370-0
\#docker #docker-compose #observability #grafana #prometheus #loki #tempo #promtail #nginx #mosquitto #infrastructure #ops #sre
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

^ref-b4e64f8c-229-0
ruler:
  alertmanager_url: 

analytics:
  reporting_enabled: false
```
 ^ref-b4e64f8c-267-0
---

## promtail: docker + system logs

`infra/promtail/config.yaml`

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

clients:
  - url: 

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
^ref-b4e64f8c-267-0
  - job_name: varlogs
    static_configs:
      - targets: [localhost]
        labels:
          job: varlogs
          __path__: /var/log/*.log
```
^ref-b4e64f8c-304-0

---

## tempo: traces (single-process)

`infra/tempo/tempo.yaml`

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
^ref-b4e64f8c-304-0
      path: /var/tempo/traces
    wal:
      path: /var/tempo/wal

compactor:
  compaction:
    block_retention: 48h
^ref-b4e64f8c-334-0
```
^ref-b4e64f8c-334-0

---

## mosquitto: minimal mqtt

`infra/mosquitto/mosquitto.conf`

^ref-b4e64f8c-334-0
```conf
listener 1883 0.0.0.0
persistence true
persistence_location /mosquitto/data/
allow_anonymous true ^ref-b4e64f8c-348-0
# for websockets (if you exposed 9001)
# listener 9001
^ref-b4e64f8c-352-0
^ref-b4e64f8c-348-0
# protocol websockets ^ref-b4e64f8c-355-0
^ref-b4e64f8c-355-0 ^ref-b4e64f8c-357-0
^ref-b4e64f8c-352-0
^ref-b4e64f8c-348-0 ^ref-b4e64f8c-359-0
^ref-b4e64f8c-360-0
^ref-b4e64f8c-359-0 ^ref-b4e64f8c-362-0
^ref-b4e64f8c-357-0 ^ref-b4e64f8c-363-0
^ref-b4e64f8c-355-0 ^ref-b4e64f8c-364-0
^ref-b4e64f8c-352-0 ^ref-b4e64f8c-365-0
^ref-b4e64f8c-348-0
^ref-b4e64f8c-347-0
``` ^ref-b4e64f8c-352-0 ^ref-b4e64f8c-360-0 ^ref-b4e64f8c-368-0
^ref-b4e64f8c-348-0
 ^ref-b4e64f8c-357-0 ^ref-b4e64f8c-369-0
--- ^ref-b4e64f8c-362-0 ^ref-b4e64f8c-370-0
 ^ref-b4e64f8c-355-0 ^ref-b4e64f8c-359-0 ^ref-b4e64f8c-363-0 ^ref-b4e64f8c-371-0
### bring-up checklist ^ref-b4e64f8c-360-0 ^ref-b4e64f8c-364-0
 ^ref-b4e64f8c-357-0 ^ref-b4e64f8c-365-0 ^ref-b4e64f8c-373-0
1. add `extra_hosts` to Prometheus service (as noted) so it can scrape `node_exporter`. ^ref-b4e64f8c-362-0
2. `docker compose --profile observability up -d` ^ref-b4e64f8c-359-0 ^ref-b4e64f8c-363-0 ^ref-b4e64f8c-375-0
3. hit ` → you should get redirected to Grafana ^ref-b4e64f8c-360-0 ^ref-b4e64f8c-364-0 ^ref-b4e64f8c-368-0 ^ref-b4e64f8c-376-0
 ^ref-b4e64f8c-365-0 ^ref-b4e64f8c-369-0 ^ref-b4e64f8c-377-0
   * Prometheus, Loki, Tempo are pre-wired ^ref-b4e64f8c-362-0 ^ref-b4e64f8c-370-0 ^ref-b4e64f8c-378-0
   * Starter dashboard is available under Dashboards ^ref-b4e64f8c-363-0 ^ref-b4e64f8c-371-0
 ^ref-b4e64f8c-364-0 ^ref-b4e64f8c-368-0
want me to also drop **Traefik label snippets** and a **prebaked Haystack pipeline** (`infra/haystack/default.yaml`) so your RAG layer is one `--profile rag` away? I can hand you a minimal one that talks to Meili/OpenSearch and Postgres. ^ref-b4e64f8c-365-0 ^ref-b4e64f8c-369-0 ^ref-b4e64f8c-373-0 ^ref-b4e64f8c-381-0
 ^ref-b4e64f8c-370-0
\#docker #docker-compose #observability #grafana #prometheus #loki #tempo #promtail #nginx #mosquitto #infrastructure #ops #sre
