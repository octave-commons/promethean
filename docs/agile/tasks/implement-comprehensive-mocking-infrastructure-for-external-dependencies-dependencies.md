---
uuid: "e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b"
title: "Implement comprehensive mocking infrastructure for external dependencies -dependencies"
slug: "implement-comprehensive-mocking-infrastructure-for-external-dependencies-dependencies"
status: "incoming"
priority: "P1"
labels: ["external-dependencies", "infrastructure", "mocking", "testing"]
created_at: "2025-10-12T19:03:19.225Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




































































































































































#incoming

## 🛠️ Description

Many packages have network dependencies on external services (Discord API, LLM services, GitHub API) causing test instability and timeouts. Need comprehensive mocking infrastructure to eliminate external dependencies from tests.

**What changed?** Current tests rely on real external services causing timeouts, flaky behavior, and CI/CD instability.

**Where is the impact?** Multiple packages including cephalon, smartgpt-bridge, mcp, and others using external APIs.

**Why now?** Critical for test stability, CI/CD reliability, and development velocity. External service dependencies make tests unreliable and slow.

**Supporting context**: SmartGPT bridge tests timing out, MCP package making real GitHub API calls, Cephalon Discord.js integration without proper mocking.

## Goals

- Create comprehensive mock factories for all external services
- Eliminate network dependencies from unit and integration tests
- Ensure test execution is deterministic and fast
- Provide consistent mock behavior across all packages

## Requirements

- [ ] Mock factories for Discord.js, LLM services, GitHub API, and other external dependencies
- [ ] Centralized mock configuration with package-specific overrides
- [ ] Test isolation using deterministic mock responses
- [ ] Mock validation to ensure mocks match real API contracts
- [ ] Documentation for mock usage patterns

## Subtasks

1. Create centralized mock factory library (`packages/test-mocks/`)
2. Implement Discord.js mock factories (client, channels, users, voice connections)
3. Create LLM service mocks (OpenAI, Ollama, custom LLM endpoints)
4. Build GitHub API mock layer for MCP package tests
5. Implement generic HTTP client mocking for other external services
6. Create mock data generators for complex objects
7. Add mock contract validation to ensure mocks stay in sync with real APIs
8. Update existing tests to use new mock infrastructure
9. Add documentation and examples for mock usage

Estimate: 13

---

## 🔗 Related Epics

- [[testing-infrastructure-overhaul]]
- [[ci-cd-stability-improvements]]

---

## ⛓️ Blocked By

- None

## ⛓️ Blocks

- Fix SmartGPT bridge test timeouts
- Implement comprehensive AIAgent test coverage
- Resolve MCP package external dependency issues

---

## 🔍 Relevant Links

- Existing mock patterns: `packages/mcp/test/tools.github.apply-patch.test.ts`
- Discord integration: `packages/cephalon/src/bot.ts`
- LLM integration: `packages/cephalon/src/llm-service.ts`
- Test utilities: `packages/test-utils/`



































































































































































