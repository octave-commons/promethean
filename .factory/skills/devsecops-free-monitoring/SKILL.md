---
name: devsecops-free-monitoring
description: "Find free monitoring, logging, APM, and observability tools for DevSecOps"
---

# Skill: DevSecOps Free Monitoring

## Goal
Identify free monitoring, logging, APM, and observability services suitable for development and security operations.

## Use This Skill When
- Setting up observability on a zero budget
- Comparing free tier monitoring platforms
- Building security monitoring into DevOps workflows

## Do Not Use This Skill When
- Enterprise SLA requirements
- Large-scale production monitoring

## Inputs
- Monitoring type (metrics, logs, traces, APM)
- Retention requirements
- Alert volume requirements
- Integration needs

## Steps

1. **Inventory Metrics/Monitoring**

   - **Prometheus**
     - Free, open source
     - Self-hosted time-series database
     - Grafana integration

   - **Grafana Cloud**
     - Free: 10K series, 14-day retention
     - Free: 3 users
     - Prometheus, Loki, Tempo included

   - **Datadog**
     - Free: 1 host, 1-day retention
     - 5 custom metrics

   - **New Relic**
     - Free: 100GB/month ingest
     - 1 user free forever
     - Full observability stack

   - **Signoz**
     - Free, open source
     - Self-hosted APM
     - OpenTelemetry based

   - **Better Stack**
     - Free: 3 monitors, 10 checks
     - Incident management

   - **UptimeRobot**
     - Free: 50 monitors
     - 5-minute intervals
     - Status pages

   - **Pingdom**
     - Free: 1 monitor
     - Basic uptime checks

   - **Healthchecks.io**
     - Free: 20 checks
     - Cron monitoring

2. **Inventory Log Management**

   - **Grafana Loki**
     - Free, open source
     - Self-hosted log aggregation
     - Grafana integration

   - **Logtail (Better Stack)**
     - Free: 1GB/month
     - SQL-based log queries

   - **Papertrail**
     - Free: 50MB/month, 7-day retention
     - 48 hours searchable

   - **LogDNA**
     - Free: 1GB/day, 7-day retention
     - Single user

   - **Humio**
     - Free: 16GB/day (single user)
     - Self-hosted option

3. **Inventory APM**

   - **Jaeger**
     - Free, open source
     - Distributed tracing
     - CNCF project

   - **Zipkin**
     - Free, open source
     - Distributed tracing

   - **Tempo (Grafana)**
     - Free, open source
     - Cost-effective tracing backend

   - **OpenTelemetry Collector**
     - Free, open source
     - Vendor-neutral observability

   - **Sentry**
     - Free: 5K errors/month
     - Application error tracking
     - Source maps

   - **Rollbar**
     - Free: 5K errors/month
     - Error monitoring

4. **Inventory Security Monitoring**

   - **Fail2Ban**
     - Free, open source
     - Intrusion prevention
     - Log-based bans

   - **Ossec/Wazuh**
     - Free, open source
     - Host-based IDS
     - SIEM capabilities

   - **Suricata**
     - Free, open source
     - Network IDS/IPS

5. **Inventory Incident Management**

   - **PagerDuty**
     - Free: Limited trial

   - **OpsGenie**
     - Free: 5 users
     - Basic incident management

   - **Uptime Kuma**
     - Free, open source
     - Self-hosted monitoring
     - Status pages

## Output
- Monitoring platform comparison
- Retention and volume limits
- Self-hosted vs SaaS recommendations
- Integration patterns for security

## Key Considerations
- Grafana Cloud offers excellent free tier
- OpenTelemetry provides vendor neutrality
- Self-hosted eliminates volume limits
- Error tracking free tiers often generous