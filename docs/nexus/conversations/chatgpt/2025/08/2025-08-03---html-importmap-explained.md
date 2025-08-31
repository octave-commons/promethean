---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "HTML importmap explained"
conversation_id: 688fa723-0994-832a-9a9f-c22254e3fefe
create_time: 08/03/2025 at 1:15 PM
update_time: 08/03/2025 at 1:15 PM
---

# Title: HTML importmap explained

Created: 08/03/2025 at 1:15 PM
Last Updated: 08/03/2025 at 1:15 PM
Chat URL: https://chat.openai.com/c/688fa723-0994-832a-9a9f-c22254e3fefe


>[!nexus_agent] **Assistant** - 08/03/2025 at 1:15 PM
> `<script type="importmap">` is a way to **define module import paths directly in HTML**, primarily used with **JavaScript ES Modules** in the browser. It tells the browser how to **resolve bare module specifiers** (like `react`, `lodash`, etc.) that would otherwise not be valid in browser-based imports.
> 
> ---
> 
> ## 🧠 Why it exists
> 
> In the browser, ES modules require import paths to be **relative or absolute**. This means something like this **won’t work**:
> 
> ```js
> import _ from 'lodash'; // ❌ Error in browser!
> ```
> 
> But Node.js or a bundler like Vite/Webpack can resolve that using `node_modules`.
> 
> `importmap` lets the browser do the same thing by telling it **what `'lodash'` refers to**.
> 
> ---
> 
> ## ✅ Syntax
> 
> ```html
> <script type="importmap">
> {
>  "imports": {
>  "lodash": "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.js",
>  "app/": "/static/js/app/"
>  }
> }
> </script>
> ```
> 
> Then in your JS:
> 
> ```js
> import _ from 'lodash';
> import { foo } from 'app/foo.js';
> ```
> 
> This **just works** if your browser supports import maps (currently [modern Chrome, Firefox, Edge, Safari]).
> 
> ---
> 
> ## 🧱 Parts
> 
> ### `imports`
> - Maps **bare import names** (like `'lodash'`) to **URLs**.
> - Can also map prefixes (`"app/"`) for **module namespaces**.
> 
> ### `scopes` (optional)
> - Provides **scoped overrides**—only used when the import is made from a specific parent module.
> - Useful for dependency versioning or sandboxing.
> 
> ```json
> "scopes": {
>  "/app/": {
>  "lodash": "https://cdn.example.com/lodash-custom.js"
>  }
> }
> ```
> 
> ---
> 
> ## 📦 Example in Action
> 
> ```html
> <!DOCTYPE html>
> <html>
>  <head>
>  <script type="importmap">
>  {
>  "imports": {
>  "lit": "https://unpkg.com/lit@3.1.0/index.js"
>  }
>  }
>  </script>
>  <script type="module">
>  import { html, render } from 'lit';
>  render(html`<p>Hello import maps</p>`, document.body);
>  </script>
>  </head>
> </html>
> ```
> 
> ---
> 
> ## ⚠️ Limitations
> 
> - Not supported in all browsers (especially older ones).
> - Can only define **one** `<script type="importmap">` per document.
> - Must be in the **HTML document** before modules are imported.
> 
> For wider support, people use **polyfills** like [es-module-shims](https://github.com/guybedford/es-module-shims).
> 
> ---
> 
> ## 🔧 With `es-module-shims`
> 
> If you want to support older or non-compliant browsers:
> 
> ```html
> <script async src="https://ga.jspm.io/npm:es-module-shims@1.5.0/dist/es-module-shims.js"></script>
> <script type="importmap-shim">
> {
>  "imports": {
>  "three": "https://cdn.skypack.dev/three"
>  }
> }
> </script>
> <script type="module-shim">
>  import * as THREE from 'three';
>  console.log(THREE);
> </script>
> ```
> 
> ---
> 
> ## #hashtags for Obsidian
> 
> #webdev #javascript #html #esmodules #importmap #modernjs #browsermodules
> 
> ---
> 
> Want to see how this could integrate into your Promethean or Cephalon workflow? Could be useful for loading modular agents or utilities in a browser-friendly context without bundling.
<!-- UID: 7d5f3cd6-57bf-46e8-bca4-f014c537a95f -->

---




>[!nexus_user] **User** - 08/03/2025 at 1:15 PM
> explain to me html script type importmap
<!-- UID: a3038c35-7234-4194-9b87-54cd355f5c46 -->


