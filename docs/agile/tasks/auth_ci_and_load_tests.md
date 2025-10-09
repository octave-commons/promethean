---
uuid: "2c3e3772-e388-4383-a3be-d56fd11b766e"
title: "auth ci and load tests"
slug: "auth_ci_and_load_tests"
status: "incoming"
priority: "P3"
labels: ["auth", "tests", "load", "testing"]
created_at: "2025-10-07T20:25:05.643Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

Auth: CI and load tests

Goal: Add CI tests and basic load testing for the auth service.

Scope:
- Unit tests for token issuance/validation edge cases.
- Integration test issuing token and calling a protected endpoint (bridge stub).
- Minimal k6 or autocannon script to issue tokens at rate; ensure perf targets p95 latency, CPU/mem.

Exit Criteria:
- CI green; performance baseline recorded in docs.

#incoming #auth #testing #performance
