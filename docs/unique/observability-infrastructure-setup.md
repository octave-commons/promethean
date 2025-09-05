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
