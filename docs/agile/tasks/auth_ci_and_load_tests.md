Auth: CI and load tests

Goal: Add CI tests and basic load testing for the auth service.

Scope:
- Unit tests for token issuance/validation edge cases.
- Integration test issuing token and calling a protected endpoint (bridge stub).
- Minimal k6 or autocannon script to issue tokens at rate; ensure perf targets (p95 latency, CPU/mem).

Exit Criteria:
- CI green; performance baseline recorded in docs.

#auth #testing #performance #breakdown

