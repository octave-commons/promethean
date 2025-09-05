---
uuid: 3c43a0bb-006b-414a-b3e9-4f302c02be73
created_at: fastify-static-files-plugin.md
filename: Fastify Static Files Plugin
title: Fastify Static Files Plugin
description: >-
  The `@fastify/static` plugin enables serving static files from a directory in
  Fastify applications. It supports basic configuration like root directory and
  prefix, as well as advanced features such as caching, custom headers, and
  serving multiple directories with different prefixes.
tags:
  - Fastify
  - static files
  - plugin
  - node.js
  - web server
  - caching
  - custom headers
  - directory serving
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



In this setup, any files in the `public` directory can be accessed via URLs starting with `/public/`. For example, `public/index.html` would be available at `

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
