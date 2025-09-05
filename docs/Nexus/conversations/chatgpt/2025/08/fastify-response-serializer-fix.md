---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Fastify response serializer fix"
conversation_id: 68aa59a2-a9dc-8332-a1c0-7b4e47ee81ab
create_time: 08/23/2025 at 7:15 PM
update_time: 08/23/2025 at 7:27 PM
---

# Title: Fastify response serializer fix

Created: 08/23/2025 at 7:15 PM
Last Updated: 08/23/2025 at 7:27 PM
Chat URL: https://chat.openai.com/c/68aa59a2-a9dc-8332-a1c0-7b4e47ee81ab


>[!nexus_user] **User** - 08/23/2025 at 7:15 PM
> This endpoint won't work when tree=true:
> 
> ```
>  v1.get('/files', {
>  preHandler: [v1.authUser, v1.requirePolicy('read', () => 'files')],
>  schema: {
>  summary: 'List files in a directory or tree',
>  operationId: 'listFiles',
>  tags: ['Files'],
>  querystring: {
>  type: 'object',
>  properties: {
>  path: { type: 'string', default: '.' },
>  hidden: { type: 'boolean', default: false },
>  type: { type: 'string', enum: ['file', 'dir'] },
>  depth: { type: 'integer', minimum: 0, default: 2 },
>  tree: { type: 'boolean', default: false },
>  },
>  },
>  response: {
>  200: {
>  oneOf: [
>  {
>  type: 'object',
>  properties: {
>  ok: { type: 'boolean' },
>  base: { type: 'string' },
>  entries: {
>  type: 'array',
>  items: {
>  type: 'object',
>  properties: {
>  name: { type: 'string' },
>  path: { type: 'string' },
>  type: { type: 'string' },
>  size: { type: ['integer', 'null'] },
>  mtimeMs: { type: ['number', 'null'] },
>  },
>  },
>  },
>  },
>  },
>  {
>  type: 'object',
>  properties: {
>  ok: { type: 'boolean' },
>  base: { type: 'string' },
>  tree: { 
>  type: 'object',
>  properties: {
>  name: { type: 'string' },
>  path: { type: 'string' },
>  type: { type: 'string' },
>  size: { type: ['integer', 'null'] },
>  mtimeMs: { type: ['number', 'null'] },
>  children: { type: 'array', items: { type: 'object' } }
>  }
>  },
>  },
>  },
>  ],
>  },
>  },
>  },
>  async handler(req, reply) {
>  const q = req.query || {};
>  const dir = String(q.path || '.');
>  const hidden = String(q.hidden || 'false').toLowerCase() === 'true';
>  const type = q.type ? String(q.type) : undefined;
>  const depth = typeof q.depth === 'number' ? q.depth : Number(q.depth || 2);
>  const wantTree = String(q.tree || 'false').toLowerCase() === 'true';
>  try {
>  const ROOT_PATH = process.env.ROOT_PATH || process.cwd();
>  const { treeDirectory } = await import('../files.js');
>  if (wantTree) {
>  const treeResult = await treeDirectory(ROOT_PATH, dir, {
>  includeHidden: hidden,
>  depth,
>  type,
>  });
>  reply.send({
>  ok: true,
>  base: treeResult.base,
>  tree: treeResult.tree,
>  });
>  } else {
>  // flat recursive listing up to depth
>  const treeResult = await treeDirectory(ROOT_PATH, dir, {
>  includeHidden: hidden,
>  depth,
>  type,
>  });
>  const flat = [];
>  function walkFlat(node) {
>  if (node.path !== undefined && node.type !== undefined) {
>  // skip root node if it's "."
>  if (node.path !== '.' && node.path !== '')
>  flat.push({
>  name: node.name,
>  path: node.path,
>  type: node.type,
>  size: node.size ?? null,
>  mtimeMs: node.mtimeMs ?? null,
>  });
>  }
>  if (Array.isArray(node.children)) {
>  for (const child of node.children) walkFlat(child);
>  }
>  }
>  walkFlat(treeResult.tree);
>  reply.send({ ok: true, base: treeResult.base, entries: flat });
>  }
>  } catch (e) {
>  reply.code(400).send({ ok: false, error: String(e?.message || e) });
>  }
>  },
>  });
> ```
> 
> We get:
> ```
> {
>  "ok": true,
>  "base": "."
> }
> ```
<!-- UID: ea070ba0-8646-4cfa-a8c0-6693f339d53b -->




>[!nexus_agent] **Assistant** - 08/23/2025 at 7:15 PM
> You’re running into Fastify’s response serializer with `oneOf`. Since both variants “match” (they both allow `{ ok, base }`), the serializer picks the first schema and drops any fields it doesn’t know about—so `tree` disappears, leaving just:
> 
> ```json
> { "ok": true, "base": "." }
> ```
> 
> Two fixes:
> 
> ## 1) Discriminate the `oneOf` (quickest)
> Make each branch require the field that distinguishes it. Also give `children` a proper schema so nested nodes don’t get stripped to `{}`.
> 
> ```ts
> v1.get('/files', {
>  preHandler: [v1.authUser, v1.requirePolicy('read', () => 'files')],
>  schema: {
>  summary: 'List files in a directory or tree',
>  operationId: 'listFiles',
>  tags: ['Files'],
>  querystring: {
>  type: 'object',
>  properties: {
>  path: { type: 'string', default: '.' },
>  hidden: { type: 'boolean', default: false },
>  type: { type: 'string', enum: ['file', 'dir'] },
>  depth: { type: 'integer', minimum: 0, default: 2 },
>  tree: { type: 'boolean', default: false },
>  },
>  },
>  response: {
>  200: {
>  oneOf: [
>  {
>  type: 'object',
>  required: ['ok', 'base', 'entries'], // ⟵ discriminator
>  properties: {
>  ok: { type: 'boolean' },
>  base: { type: 'string' },
>  entries: {
>  type: 'array',
>  items: {
>  type: 'object',
>  required: ['name', 'path', 'type'],
>  properties: {
>  name: { type: 'string' },
>  path: { type: 'string' },
>  type: { type: 'string' },
>  size: { type: ['integer', 'null'] },
>  mtimeMs: { type: ['number', 'null'] },
>  },
>  additionalProperties: false
>  },
>  },
>  },
>  additionalProperties: false
>  },
>  {
>  type: 'object',
>  required: ['ok', 'base', 'tree'], // ⟵ discriminator
>  properties: {
>  ok: { type: 'boolean' },
>  base: { type: 'string' },
>  tree: {
>  type: 'object',
>  required: ['name', 'path', 'type'],
>  properties: {
>  name: { type: 'string' },
>  path: { type: 'string' },
>  type: { type: 'string' },
>  size: { type: ['integer', 'null'] },
>  mtimeMs: { type: ['number', 'null'] },
>  // define children nodes with the same shape (non-recursive inline)
>  children: {
>  type: 'array',
>  items: {
>  type: 'object',
>  required: ['name', 'path', 'type'],
>  properties: {
>  name: { type: 'string' },
>  path: { type: 'string' },
>  type: { type: 'string' },
>  size: { type: ['integer', 'null'] },
>  mtimeMs: { type: ['number', 'null'] },
>  children: { type: 'array', items: { type: 'object' } }
>  },
>  additionalProperties: false
>  }
>  }
>  },
>  additionalProperties: false
>  },
>  },
>  additionalProperties: false
>  },
>  ],
>  },
>  },
>  },
>  async handler(req, reply) {
>  // …your existing handler unchanged…
>  },
> });
> ```
> 
> This forces Fastify to choose the correct branch when `tree` is present, so it won’t strip it.
> 
> ## 2) (Better) Use a recursive schema with `$id`/`$ref`
> Fastify + fast-json-stringify handle recursive types if you define them once and `$ref` them. This avoids the “empty object” issue for deep `children`.
> 
> Register once, e.g. near your route definitions:
> 
> ```ts
> fastify.addSchema({
>  $id: 'FsNode',
>  type: 'object',
>  required: ['name', 'path', 'type'],
>  properties: {
>  name: { type: 'string' },
>  path: { type: 'string' },
>  type: { type: 'string' },
>  size: { type: ['integer', 'null'] },
>  mtimeMs: { type: ['number', 'null'] },
>  children: {
>  type: 'array',
>  items: { $ref: 'FsNode#' }
>  }
>  },
>  additionalProperties: false
> });
> ```
> 
> Then your response becomes:
> 
> ```ts
> response: {
>  200: {
>  oneOf: [
>  {
>  type: 'object',
>  required: ['ok', 'base', 'entries'],
>  properties: {
>  ok: { type: 'boolean' },
>  base: { type: 'string' },
>  entries: {
>  type: 'array',
>  items: {
>  type: 'object',
>  required: ['name', 'path', 'type'],
>  properties: {
>  name, path, type,
>  size: { type: ['integer', 'null'] },
>  mtimeMs: { type: ['number', 'null'] }
>  },
>  additionalProperties: false
>  }
>  }
>  },
>  additionalProperties: false
>  },
>  {
>  type: 'object',
>  required: ['ok', 'base', 'tree'],
>  properties: {
>  ok: { type: 'boolean' },
>  base: { type: 'string' },
>  tree: { $ref: 'FsNode#' } // ✅ recursive tree
>  },
>  additionalProperties: false
>  }
>  ]
>  }
> }
> ```
> 
> ---
> 
> ### Why this fixes it
> 
> - **`oneOf` selection**: By adding `required` fields (`entries` vs `tree`) you give the serializer a clear discriminator so it chooses the correct branch and preserves `tree`.
> - **Nested objects**: Defining properties (or using a `$ref` recursive schema) prevents `children` nodes from being collapsed to `{}`.
> 
> After either change, your `tree=true` responses should include the full `tree` structure.
<!-- UID: b2339825-4b3b-4b95-8d1d-800d40732043 -->

---




>[!nexus_user] **User** - 08/23/2025 at 7:26 PM
> {
>  "statusCode": 500,
>  "error": "Internal Server Error",
>  "message": "The value of '#' does not match schema definition."
> }
<!-- UID: a0a2e780-8dd9-45c1-a93f-2c836b4b2fea -->




>[!nexus_agent] **Assistant** - 08/23/2025 at 7:26 PM
> That error is Ajv/Fastify telling you the **root value (“#”) doesn’t match any branch** of your `response` schema. This usually happens when:
> 
> - a `$ref` can’t be resolved (e.g., schema wasn’t registered before the route), or 
> - the selected `oneOf` branch doesn’t match the actual payload (often because of `required`/`additionalProperties`), or 
> - recursive `$ref` is declared incorrectly.
> 
> Here’s a **known‑good setup** that fixes the `tree=true` case and avoids the “# does not match” error.
> 
> ### 1) Register the recursive node schema **before** the route
> ```ts
> // do this once, before defining the route
> fastify.addSchema({
>  $id: 'FsNode',
>  type: 'object',
>  additionalProperties: false,
>  required: ['name', 'path', 'type'],
>  properties: {
>  name: { type: 'string' },
>  path: { type: 'string' },
>  type: { type: 'string', enum: ['file', 'dir'] }, // adjust if you use other values
>  size: { type: ['number', 'null'] }, // Node’s fs stats are numbers
>  mtimeMs: { type: ['number', 'null'] },
>  children: {
>  type: 'array',
>  items: { $ref: 'FsNode#' } // recursive
>  }
>  }
> });
> ```
> 
> ### 2) Make the response schema branches unambiguous and $ref the node
> ```ts
> schema: {
>  // ... your querystring stays the same ...
>  response: {
>  200: {
>  oneOf: [
>  {
>  type: 'object',
>  additionalProperties: false,
>  required: ['ok', 'base', 'entries'],
>  properties: {
>  ok: { type: 'boolean' },
>  base: { type: 'string' },
>  // flat listing: items shaped like FsNode (children is optional)
>  entries: {
>  type: 'array',
>  items: { $ref: 'FsNode#' }
>  }
>  }
>  },
>  {
>  type: 'object',
>  additionalProperties: false,
>  required: ['ok', 'base', 'tree'],
>  properties: {
>  ok: { type: 'boolean' },
>  base: { type: 'string' },
>  // tree listing: a single FsNode as the root
>  tree: { $ref: 'FsNode#' }
>  }
>  }
>  ]
>  }
>  }
> }
> ```
> 
> ### 3) Common gotchas checklist
> - ✅ **Register** `addSchema({ $id: 'FsNode', ... })` **before** the route that uses `$ref: 'FsNode#'`. 
> - ✅ Do **not** use `$ref: '#/definitions/...'` here; use the exact `$id` with a trailing `#` as shown. 
> - ✅ Ensure your handler returns **exactly** one of the two shapes:
>  - `{ ok, base, entries: [...] }` (flat)
>  - `{ ok, base, tree: {...} }` (tree)
> - ✅ If you have `additionalProperties: false`, don’t include extra fields (e.g., `count`, `duration`, etc.) unless they’re in `properties`.
> - ✅ `type` values must match your enum (e.g., `'file' | 'dir'`).
> 
> With the above, `tree=true` responses like:
> ```json
> {
>  "ok": true,
>  "base": ".",
>  "tree": {
>  "name": ".",
>  "path": ".",
>  "type": "dir",
>  "children": [ { "name": "src", "path": "src", "type": "dir", "children": [] } ]
>  }
> }
> ```
> validate cleanly and serialize without stripping.
<!-- UID: 7d701f19-a36d-4d28-beba-d3f8de691950 -->

---


