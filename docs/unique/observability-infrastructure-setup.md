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
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 13951643-1741-46bb-89dc-1beebb122633
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 1d3d6c3a-039e-4b96-93c1-95854945e248
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
  - cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
related_to_title:
  - Obsidian Templating Plugins Integration Guide
  - Creative Moments
  - Duck's Attractor States
  - eidolon-field-math-foundations
  - zero-copy-snapshots-and-workers
  - typed-struct-compiler
  - Unique Concepts
  - Unique Info Dump Index
  - Canonical Org-Babel Matplotlib Animation Template
  - Mongo Outbox Implementation
  - homeostasis-decay-formulas
  - Layer1SurvivabilityEnvelope
  - i3-bluetooth-setup
  - Obsidian ChatGPT Plugin Integration Guide
  - obsidian-ignore-node-modules-regex
  - Ice Box Reorganization
  - Fnord Tracer Protocol
  - komorebi-group-window-hack
  - Obsidian ChatGPT Plugin Integration
  - Docops Feature Updates
  - prom ui bootstrap
  - Promethean Infrastructure Setup
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - universal-intention-code-fabric
  - api-gateway-versioning
references:
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 5495
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1016
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 175
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1221
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1058
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 515
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 251
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 559
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1033
    col: 0
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 610
    col: 0
    score: 0.93
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 442
    col: 0
    score: 0.91
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 328
    col: 0
    score: 0.91
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 189
    col: 0
    score: 0.91
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 4742
    col: 0
    score: 0.91
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 6074
    col: 0
    score: 0.91
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 3301
    col: 0
    score: 0.91
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 4353
    col: 0
    score: 0.91
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 4105
    col: 0
    score: 0.91
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 5171
    col: 0
    score: 0.91
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 3156
    col: 0
    score: 0.91
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 3645
    col: 0
    score: 0.91
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 2883
    col: 0
    score: 0.91
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 3204
    col: 0
    score: 0.91
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 64
    col: 0
    score: 0.9
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 491
    col: 0
    score: 0.9
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 7
    col: 0
    score: 0.89
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 307
    col: 0
    score: 0.88
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 129
    col: 0
    score: 0.88
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 190
    col: 0
    score: 0.88
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 416
    col: 0
    score: 0.88
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 84
    col: 0
    score: 0.87
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 590
    col: 0
    score: 0.87
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 132
    col: 0
    score: 0.86
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 150
    col: 0
    score: 0.86
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 44
    col: 0
    score: 0.86
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 187
    col: 0
    score: 0.86
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 279
    col: 0
    score: 0.86
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 120
    col: 0
    score: 0.86
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 158
    col: 0
    score: 0.86
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 275
    col: 0
    score: 0.86
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 268
    col: 0
    score: 0.86
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 149
    col: 0
    score: 0.85
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 99
    col: 0
    score: 0.85
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 388
    col: 0
    score: 0.85
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 89
    col: 0
    score: 0.85
  - uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
    line: 232
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
