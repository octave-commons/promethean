---
$$
uuid: ce37a9b8-5984-4fb8-b9e7-f72470314975
$$
$$
created_at: 2025.09.01.21.55.09.md
$$
filename: Fastify Static Files Plugin
$$
description: >-
$$
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
$$
related_to_uuid:
$$
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - f1add613-656e-4bec-b52b-193fd78c4642
  - 623a55f7-685c-486b-abaf-469da1bbbb69
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - e979c50f-69bb-48b0-8417-e1ee1b31c0c0
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
$$
related_to_title:
$$
  - Event Bus Projections Architecture
  - Pure TypeScript Search Microservice
  - Lisp-Compiler-Integration
  - ripple-propagation-demo
  - Post-Linguistic Transhuman Design Frameworks
  - sibilant-macro-targets
  - lisp-dsl-for-window-management
  - Dynamic Context Model for Web Components
  - Creative Moments
  - Operations
  - Shared
  - Window Management
  - Admin Dashboard for User Management
  - Debugging Broker Connections and Agent Behavior
  - DuckDuckGoSearchPipeline
  - Factorio AI with External Agents
references:
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 5
    col: 0
    score: 1
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 51
    col: 0
    score: 1
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 54
    col: 0
    score: 0.95
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 67
    col: 0
    score: 0.94
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

[1]: https://www.npmjs.com/package/%40fastify/static/v/8.0.4?utm_source=chatgpt.com$$
 "fastify/static"
$$
[2]: https://wiblok.com/en/nodejs/fastify/fastify-static-file-response-method/?utm_source=chatgpt.com "How to serve static files with Fastify - Wiblok"
[3]: https://github.com/fastify/fastify-static?utm_source=chatgpt.com "fastify/fastify-static: Plugin for serving static files as fast as ..."
[4]: https://www.reddit.com/r/webdev/comments/15tt6rn/serving_static_with_fastify/?utm_source=chatgpt.com "Serving static with fastify : r/webdev"<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- $[event-bus-projections-architecture|Event Bus Projections Architecture]$
- $[pure-typescript-search-microservice|Pure TypeScript Search Microservice]$
- $[lisp-compiler-integration]$
- $[docs/unique/ripple-propagation-demo|ripple-propagation-demo]$
- $[post-linguistic-transhuman-design-frameworks|Post-Linguistic Transhuman Design Frameworks]$
- $[sibilant-macro-targets]$
- $lisp-dsl-for-window-management$$lisp-dsl-for-window-management.md$
- $[dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]$
- $[creative-moments|Creative Moments]$
- [Operations]$chunks/operations.md$
- [Shared]$chunks/shared.md$
- [Window Management]$chunks/window-management.md$
- $[admin-dashboard-for-user-management|Admin Dashboard for User Management]$
- [Debugging Broker Connections and Agent Behavior]$debugging-broker-connections-and-agent-behavior.md$
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- $[factorio-ai-with-external-agents|Factorio AI with External Agents]$
## Sources
- $[event-bus-projections-architecture#^ref-cf6b9b17-5-0|Event Bus Projections Architecture — L5]$ (line 5, col 0, score 1)
- $[event-bus-projections-architecture#^ref-cf6b9b17-51-0|Event Bus Projections Architecture — L51]$ (line 51, col 0, score 1)
- $[event-bus-projections-architecture#^ref-cf6b9b17-54-0|Event Bus Projections Architecture — L54]$ (line 54, col 0, score 0.95)
- $[event-bus-projections-architecture#^ref-cf6b9b17-67-0|Event Bus Projections Architecture — L67]$ (line 67, col 0, score 0.94)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
