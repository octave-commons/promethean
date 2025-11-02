---
uuid: 69bc285f-d63a-49ac-944b-e761d9a0d8ac
created_at: '2025-10-07T18:31:36Z'
title: 2025.10.07.18.31.36
filename: Pantheon_Packages_Integration_Guide
description: >-
  Guidelines for integrating new Pantheon packages into the Promethean monorepo,
  including build system configuration, documentation updates, and training
  workflows. Covers package registration, CLI usage, and versioning practices.
tags:
  - monorepo
  - Pantheon
  - build-system
  - CLI
  - documentation
  - versioning
  - training-workflow
---
I’m unable to re‑access the repository’s files via the API tool at the moment, so I can’t automatically edit your GitHub repo. However, based on the repository guidelines from AGENTS.md and the packages scaffolding already created, here is what you should do to properly integrate the new Pantheon packages into your Promethean monorepo and update the documentation accordingly:

Register the new packages in the monorepo’s build system.

Create entries in nx.json or your workspace configuration for each of the Pantheon subpackages (pantheon-core, pantheon-tools, pantheon-agents, pantheon-runner, pantheon-cli, and pantheon-report). These entries should specify the root, sourceRoot, and projectType fields so Nx can discover and build them.

Add scripts to the root package.json (e.g. npm run pantheon:run, npm run pantheon:report) that call into pantheon-cli. Use workspace linking (e.g. workspace:*) for dependencies between packages, and ensure all packages declare "license": "GPL-3.0-only" to follow your monorepo licensing rules
raw.githubusercontent.com
.

Update documentation (AGENTS.md and package docs).

In AGENTS.md under the section about package structure, add a subsection called Pantheon that lists the six new packages and describes their purpose:

pantheon-core: Zod-based type definitions, day/night policy, and deterministic tool loop.

pantheon-tools: Tools (e.g., write_file, run_biome, compute_diff) with strict schemas.

pantheon-agents: Specialized agents (front‑matter normalizer, code generator, test runner, reviewers, etc.) using the deterministic loop.

pantheon-runner: Orchestrator to execute flows as DAGs, enforce day/night policy, write artifacts.

pantheon-cli: Command‑line entry point for running flows, generating reports, and training.

pantheon-report: Simple Web Component to display morning summaries.

Mention that these packages adhere to existing guidelines: functional programming style, immutability, Zod for all IO types, AVA for tests, flat packages with native ESM, and no global shared state.

Add examples of running a flow (pantheon run flows/spec2code.json input.json) and generating a morning report.

Follow existing monorepo conventions.

Each package should live under packages/ with its own package.json using "type":"module" and "main":"src/index.ts"; this keeps module resolution consistent with the rest of the repo.

Tests belong in tests/pantheon-* using AVA; update the root test runner configuration so they are picked up.

For caching and state, use the monorepo’s recommended key‑value cache (e.g. Node’s Map or a local LevelDB) rather than ad‑hoc JSON files. AGENTS.md warns against using JSON files for intermediate data storage
raw.githubusercontent.com
.

Document training & deployment workflow.

Add a TRAINING.md or a section in the existing docs explaining how to collect traces from nightly runs, mine them for tool‑use pairs and outputs, and fine‑tune the small models with QLoRA. Emphasize that training is done on local hardware and there is no automatic cloud fallback—daytime supervision is required.

Describe how to schedule nightly queues and read morning reports. Include a note about sizing the queue and using vLLM or OpenVINO for local inference (continuous batching and PagedAttention help throughput).

Changelog & versioning.

Create a new entry in the changelog.d directory summarizing the addition of the Pantheon framework: package creation, CLI, runner, etc.

Version each Pantheon package with an initial version (e.g. 0.1.0), and update package.json dependencies accordingly.

Next steps.

After linking and documenting the new packages, gradually replace the stub logic with real implementations (model clients, tool calling, training scripts). Make sure to write tests for each new feature and update the docs when you evolve the agent interfaces or flows.

Run nx test and nx build to ensure everything compiles and tests pass across the monorepo.

This plan follows the Promethean repository’s conventions (functional TypeScript, AVA tests, Zod types, no global state) and describes how to integrate the Pantheon framework with existing packages and docs
raw.githubusercontent.com
.
