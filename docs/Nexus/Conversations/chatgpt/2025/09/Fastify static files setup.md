---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Fastify static files setup"
conversation_id: 68b65b26-2308-8328-834b-79d26e626043
create_time: 09/01/2025 at 9:49 PM
update_time: 09/01/2025 at 9:55 PM
---

# Title: Fastify static files setup

Created: 09/01/2025 at 9:49 PM
Last Updated: 09/01/2025 at 9:55 PM
Chat URL: https://chat.openai.com/c/68b65b26-2308-8328-834b-79d26e626043


>[!nexus_user] **User** - 09/01/2025 at 9:49 PM
> fastify static files
<!-- UID: 32050476-2b72-432c-811c-c63a09166778 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 9:49 PM
> ​To serve static files in Fastify, you can use the `@fastify/static` plugin. Here's how to set it up:
> 
> ### Installation
> 
> First, install the plugin:
> 
> ```bash
> npm install @fastify/static
> ```
> 
> ### Basic Usage
> 
> Here's a simple example of how to serve static files from a directory named `public`:
> 
> ```javascript
> import Fastify from 'fastify';
> import path from 'path';
> import fastifyStatic from '@fastify/static';
> 
> const fastify = Fastify({ logger: true });
> 
> fastify.register(fastifyStatic, {
>  root: path.join(__dirname, 'public'),
>  prefix: '/public/', // optional: default '/'
> });
> 
> fastify.listen({ port: 3000 }, (err, address) => {
>  if (err) throw err;
>  console.log(`Server listening at ${address}`);
> });
> ```
> 
> In this setup, any files in the `public` directory can be accessed via URLs starting with `/public/`. For example, `public/index.html` would be available at `http://localhost:3000/public/index.html`.
> 
> ### Serving Specific Files
> 
> If you want to serve specific files, such as `index.html` at the root URL, you can use the `reply.sendFile` method:
> 
> ```javascript
> fastify.get('/', (request, reply) => {
>  return reply.sendFile('index.html'); // serving path.join(__dirname, 'public', 'index.html')
> });
> ```
> 
> This method uses the `root` directory specified during plugin registration to locate the file.
> 
> ### Advanced Configuration
> 
> The `@fastify/static` plugin offers several options for advanced configurations:
> 
> - **Multiple Directories**: You can serve multiple directories under different prefixes.
> 
>  
> ```javascript
>  fastify.register(fastifyStatic, {
>  root: path.join(__dirname, 'public'),
>  prefix: '/public/',
>  });
> 
>  fastify.register(fastifyStatic, {
>  root: path.join(__dirname, 'assets'),
>  prefix: '/assets/',
>  decorateReply: false, // prevent overriding the previous reply.sendFile
>  });
>  ```
> 
> - **Caching**: Control caching behavior with options like `maxAge` and `immutable`.
> 
>  
> ```javascript
>  fastify.register(fastifyStatic, {
>  root: path.join(__dirname, 'public'),
>  maxAge: '1d',
>  immutable: true,
>  });
>  ```
> 
> - **Custom Headers**: Set custom headers for responses.
> 
>  
> ```javascript
>  fastify.register(fastifyStatic, {
>  root: path.join(__dirname, 'public'),
>  setHeaders: (res, pathName) => {
>  res.setHeader('X-Custom-Header', 'value');
>  },
>  });
>  ```
> 
> For more detailed information and additional options, refer to the official documentation: link
> 
> If you have specific requirements or need further assistance with configuring static file serving in Fastify, feel free to ask!
<!-- UID: 25a8abbb-2e8d-456b-bf0b-8c7002a9841f -->

---


