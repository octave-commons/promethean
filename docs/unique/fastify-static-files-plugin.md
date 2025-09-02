---
uuid: ce37a9b8-5984-4fb8-b9e7-f72470314975
created_at: 2025.09.01.21.55.09.md
filename: Fastify Static Files Plugin
description: >-
  This guide explains how to configure and use the `@fastify/static` plugin for
  serving static files in Fastify. It covers installation, basic usage, serving
  specific files, and advanced configurations like multiple directories,
  caching, and custom headers.
tags:
  - Fastify
  - static files
  - node.js
  - plugin
  - file serving
  - caching
  - custom headers
related_to_uuid:
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - 8b8e6103-30a4-4d66-b5f2-87db1612b587
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - 0b872af2-4197-46f3-b631-afb4e6135585
  - 1c4046b5-742d-4004-aec6-b47251fef5d6
  - 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
  - 43bfe9dd-d433-42ca-9777-f4c40eaba791
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
  - 9b694a91-dec5-4708-9462-3f71000ba925
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - 5c152b08-6b69-4bb8-a1a7-66745789c169
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - d614d983-7795-491f-9437-09f3a43f72cf
  - 59b5670f-36d3-4d34-8985-f3144b15347a
  - 40185d05-010e-45e7-8c2d-2f879bf14218
  - 95205cd3-c3d5-4047-9c33-9c5ca2b49597
  - 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - 18344cf9-0c49-4a71-b6c8-b8d84d660fca
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - 91295f3a-a2af-4050-a2b8-4777ea70c32c
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - e2135d9f-c69d-47ee-9b17-0b05e98dc748
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 9413237f-2537-4bbf-8768-db6180970e36
  - c0392040-16a2-41e8-bd54-75110319e3c0
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 9a93a756-6d33-45d1-aca9-51b74f2b33d2
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 5a02283e-4281-4930-9ca7-e27849de11bd
  - 1d3d6c3a-039e-4b96-93c1-95854945e248
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - b3555ede-324a-4d24-a885-b0721e74babf
  - db74343f-8f84-43a3-adb2-499c6f00be1c
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - 13951643-1741-46bb-89dc-1beebb122633
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - e87bc036-1570-419e-a558-f45b9c0db698
  - f1add613-656e-4bec-b52b-193fd78c4642
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - 623a55f7-685c-486b-abaf-469da1bbbb69
  - 557309a3-c906-4e97-8867-89ffe151790c
  - cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - e979c50f-69bb-48b0-8417-e1ee1b31c0c0
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 6cb4943e-8267-4e27-8618-2ce0a464d173
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 54382370-1931-4a19-a634-46735708a9ea
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - 86a691ec-ca1f-4350-824c-0ded1f8ebe70
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
related_to_title:
  - obsidian-ignore-node-modules-regex
  - Promethean Pipelines
  - Pure TypeScript Search Microservice
  - Promethean Documentation Update
  - Promethean Notes
  - Promethean Documentation Pipeline Overview
  - Provider-Agnostic Chat Panel Implementation
  - Prometheus Observability Stack
  - ParticleSimulationWithCanvasAndFFmpeg
  - Obsidian ChatGPT Plugin Integration
  - Obsidian Task Generation
  - Obsidian Templating Plugins Integration Guide
  - OpenAPI Validation Report
  - Promethean State Format
  - Promethean Workflow Optimization
  - Reawakening Duck
  - Mindful Prioritization
  - promethean-requirements
  - Optimizing Command Limitations in System Design
  - i3-bluetooth-setup
  - Promethean Dev Workflow Update
  - Per-Domain Policy System for JS Crawler
  - windows-tiling-with-autohotkey
  - Promethean Chat Activity Report
  - Stateful Partitions and Rebalancing
  - sibilant-macro-targets
  - Promethean-Copilot-Intent-Engine
  - Synchronicity Waves and Web
  - Factorio AI with External Agents
  - zero-copy-snapshots-and-workers
  - field-interaction-equations
  - Fnord Tracer Protocol
  - Pipeline Enhancements
  - Post-Linguistic Transhuman Design Frameworks
  - polyglot-repl-interface-layer
  - Promethean Data Sync Protocol
  - eidolon-node-lifecycle
  - field-dynamics-math-blocks
  - field-node-diagram-outline
  - field-node-diagram-set
  - field-node-diagram-visualizations
  - Functional Embedding Pipeline Refactor
  - Promethean Documentation Overview
  - Model Selection for Lightweight Conversational Tasks
  - Protocol_0_The_Contradiction_Engine
  - ripple-propagation-demo
  - Tracing the Signal
  - Unique Info Dump Index
  - Event Bus Projections Architecture
  - NPU Voice Code and Sensory Integration
  - Obsidian ChatGPT Plugin Integration Guide
  - Prompt_Folder_Bootstrap
  - Redirecting Standard Error
  - Model Upgrade Calm-Down Guide
  - Performance-Optimized-Polyglot-Bridge
  - plan-update-confirmation
  - Diagrams
  - Duck's Attractor States
  - eidolon-field-math-foundations
  - Creative Moments
  - DSL
  - Operations
  - Services
  - Shared
  - Simulation Demo
  - Docops Feature Updates
  - DuckDuckGoSearchPipeline
  - Duck's Self-Referential Perceptual Loop
  - Eidolon Field Abstract Model
  - Tooling
  - Dynamic Context Model for Web Components
  - Migrate to Provider-Tenant Architecture
  - Layer1SurvivabilityEnvelope
  - Mathematical Samplers
  - Window Management
  - Debugging Broker Connections and Agent Behavior
  - JavaScript
  - Math Fundamentals
  - Admin Dashboard for User Management
references:
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 5
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 724
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 198
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 192
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 240
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 489
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 48
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 44
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 61
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 99
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 80
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 405
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 216
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 189
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 172
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 175
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 90
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 298
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 48
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 377
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 112
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 205
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 300
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 718
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 196
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 243
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 481
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 56
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 74
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 75
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 104
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 46
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 64
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 40
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 137
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 82
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 454
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 320
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 538
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 446
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 64
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1051
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 225
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 114
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 124
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 74
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 277
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 730
    col: 0
    score: 1
---
To serve static files in Fastify, you can use the `@fastify/static` plugin. Here's how to set it up:([npm][1])

### Installation

First, install the plugin:

```bash
npm install @fastify/static
```



### Basic Usage

Here's a simple example of how to serve static files from a directory named `public`:

```javascript
import Fastify from 'fastify';
import path from 'path';
import fastifyStatic from '@fastify/static';

const fastify = Fastify({ logger: true });

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/public/', // optional: default '/'
});

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
  console.log(`Server listening at ${address}`);
});
```



In this setup, any files in the `public` directory can be accessed via URLs starting with `/public/`. For example, `public/index.html` would be available at `http://localhost:3000/public/index.html`.([wiblok.com][2])

### Serving Specific Files

If you want to serve specific files, such as `index.html` at the root URL, you can use the `reply.sendFile` method:([GitHub][3])

```javascript
fastify.get('/', (request, reply) => {
  return reply.sendFile('index.html'); // serving path.join(__dirname, 'public', 'index.html')
});
```



This method uses the `root` directory specified during plugin registration to locate the file.([Reddit][4])

### Advanced Configuration

The `@fastify/static` plugin offers several options for advanced configurations:([npm][1])

* **Multiple Directories**: You can serve multiple directories under different prefixes.([npm][1])

```javascript
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    prefix: '/public/',
  });

  fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'assets'),
    prefix: '/assets/',
    decorateReply: false, // prevent overriding the previous reply.sendFile
  });
```



* **Caching**: Control caching behavior with options like `maxAge` and `immutable`.([GitHub][3])

```javascript
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    maxAge: '1d',
    immutable: true,
  });
```



* **Custom Headers**: Set custom headers for responses.([GitHub][3])

```javascript
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    setHeaders: (res, pathName) => {
      res.setHeader('X-Custom-Header', 'value');
    },
  });
```



For more detailed information and additional options, refer to the official documentation: ([GitHub][3])

If you have specific requirements or need further assistance with configuring static file serving in Fastify, feel free to ask!

[1]: https://www.npmjs.com/package/%40fastify/static/v/8.0.4?utm_source=chatgpt.com "fastify/static"
[2]: https://wiblok.com/en/nodejs/fastify/fastify-static-file-response-method/?utm_source=chatgpt.com "How to serve static files with Fastify - Wiblok"
[3]: https://github.com/fastify/fastify-static?utm_source=chatgpt.com "fastify/fastify-static: Plugin for serving static files as fast as ..."
[4]: https://www.reddit.com/r/webdev/comments/15tt6rn/serving_static_with_fastify/?utm_source=chatgpt.com "Serving static with fastify : r/webdev"<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Promethean Documentation Update](promethean-documentation-update.txt)
- [Promethean Notes](promethean-notes.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian Task Generation](obsidian-task-generation.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Promethean State Format](promethean-state-format.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Reawakening Duck](reawakening-duck.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [promethean-requirements](promethean-requirements.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Pipeline Enhancements](pipeline-enhancements.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Promethean Data Sync Protocol](promethean-data-sync-protocol.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Promethean Documentation Overview](promethean-documentation-overview.md)
- [Promethean Documentation Update](promethean-documentation-update.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Tracing the Signal](tracing-the-signal.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Diagrams](chunks/diagrams.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Creative Moments](creative-moments.md)
- [DSL](chunks/dsl.md)
- [Operations](chunks/operations.md)
- [Services](chunks/services.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Docops Feature Updates](docops-feature-updates-2.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Tooling](chunks/tooling.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Mathematical Samplers](mathematical-samplers.md)
- [Window Management](chunks/window-management.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [JavaScript](chunks/javascript.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
## Sources
- [Event Bus Projections Architecture — L5](event-bus-projections-architecture.md#^ref-cf6b9b17-5-0) (line 5, col 0, score 1)
- [Stateful Partitions and Rebalancing — L724](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-724-0) (line 724, col 0, score 1)
- [Synchronicity Waves and Web — L198](synchronicity-waves-and-web.md#^ref-91295f3a-198-0) (line 198, col 0, score 1)
- [Unique Info Dump Index — L192](unique-info-dump-index.md#^ref-30ec3ba6-192-0) (line 192, col 0, score 1)
- [windows-tiling-with-autohotkey — L240](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-240-0) (line 240, col 0, score 1)
- [zero-copy-snapshots-and-workers — L489](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-489-0) (line 489, col 0, score 1)
- [DSL — L48](chunks/dsl.md#^ref-e87bc036-48-0) (line 48, col 0, score 1)
- [Docops Feature Updates — L44](docops-feature-updates-2.md#^ref-cdbd21ee-44-0) (line 44, col 0, score 1)
- [Docops Feature Updates — L61](docops-feature-updates.md#^ref-2792d448-61-0) (line 61, col 0, score 1)
- [Duck's Attractor States — L99](ducks-attractor-states.md#^ref-13951643-99-0) (line 99, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L80](ducks-self-referential-perceptual-loop.md#^ref-71726f04-80-0) (line 80, col 0, score 1)
- [Dynamic Context Model for Web Components — L405](dynamic-context-model-for-web-components.md#^ref-f7702bf8-405-0) (line 405, col 0, score 1)
- [Eidolon Field Abstract Model — L216](eidolon-field-abstract-model.md#^ref-5e8b2388-216-0) (line 216, col 0, score 1)
- [Factorio AI with External Agents — L189](factorio-ai-with-external-agents.md#^ref-a4d90289-189-0) (line 189, col 0, score 1)
- [field-interaction-equations — L172](field-interaction-equations.md#^ref-b09141b7-172-0) (line 172, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L175](layer1survivabilityenvelope.md#^ref-64a9f9f9-175-0) (line 175, col 0, score 1)
- [Mathematical Samplers — L90](mathematical-samplers.md#^ref-86a691ec-90-0) (line 90, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L298](migrate-to-provider-tenant-architecture.md#^ref-54382370-298-0) (line 298, col 0, score 1)
- [Promethean Chat Activity Report — L48](promethean-chat-activity-report.md#^ref-18344cf9-48-0) (line 48, col 0, score 1)
- [Fnord Tracer Protocol — L377](fnord-tracer-protocol.md#^ref-fc21f824-377-0) (line 377, col 0, score 1)
- [Pipeline Enhancements — L112](pipeline-enhancements.md#^ref-e2135d9f-112-0) (line 112, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L205](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-205-0) (line 205, col 0, score 1)
- [sibilant-macro-targets — L300](sibilant-macro-targets.md#^ref-c5c9a5c6-300-0) (line 300, col 0, score 1)
- [Stateful Partitions and Rebalancing — L718](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-718-0) (line 718, col 0, score 1)
- [Synchronicity Waves and Web — L196](synchronicity-waves-and-web.md#^ref-91295f3a-196-0) (line 196, col 0, score 1)
- [windows-tiling-with-autohotkey — L243](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-243-0) (line 243, col 0, score 1)
- [zero-copy-snapshots-and-workers — L481](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-481-0) (line 481, col 0, score 1)
- [Tooling — L56](chunks/tooling.md#^ref-6cb4943e-56-0) (line 56, col 0, score 1)
- [Window Management — L74](chunks/window-management.md#^ref-9e8ae388-74-0) (line 74, col 0, score 1)
- [Creative Moments — L75](creative-moments.md#^ref-10d98225-75-0) (line 75, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L104](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-104-0) (line 104, col 0, score 1)
- [Docops Feature Updates — L46](docops-feature-updates-2.md#^ref-cdbd21ee-46-0) (line 46, col 0, score 1)
- [Docops Feature Updates — L64](docops-feature-updates.md#^ref-2792d448-64-0) (line 64, col 0, score 1)
- [DuckDuckGoSearchPipeline — L40](duckduckgosearchpipeline.md#^ref-e979c50f-40-0) (line 40, col 0, score 1)
- [Duck's Attractor States — L137](ducks-attractor-states.md#^ref-13951643-137-0) (line 137, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L82](ducks-self-referential-perceptual-loop.md#^ref-71726f04-82-0) (line 82, col 0, score 1)
- [Dynamic Context Model for Web Components — L454](dynamic-context-model-for-web-components.md#^ref-f7702bf8-454-0) (line 454, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L320](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-320-0) (line 320, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L538](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-538-0) (line 538, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L446](performance-optimized-polyglot-bridge.md#^ref-f5579967-446-0) (line 446, col 0, score 1)
- [Pipeline Enhancements — L64](pipeline-enhancements.md#^ref-e2135d9f-64-0) (line 64, col 0, score 1)
- [plan-update-confirmation — L1051](plan-update-confirmation.md#^ref-b22d79c6-1051-0) (line 1051, col 0, score 1)
- [polyglot-repl-interface-layer — L225](polyglot-repl-interface-layer.md#^ref-9c79206d-225-0) (line 225, col 0, score 1)
- [Promethean Chat Activity Report — L114](promethean-chat-activity-report.md#^ref-18344cf9-114-0) (line 114, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L124](promethean-copilot-intent-engine.md#^ref-ae24a280-124-0) (line 124, col 0, score 1)
- [Promethean Data Sync Protocol — L74](promethean-data-sync-protocol.md#^ref-9fab9e76-74-0) (line 74, col 0, score 1)
- [windows-tiling-with-autohotkey — L277](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-277-0) (line 277, col 0, score 1)
- [Pure TypeScript Search Microservice — L730](pure-typescript-search-microservice.md#^ref-d17d3a96-730-0) (line 730, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
