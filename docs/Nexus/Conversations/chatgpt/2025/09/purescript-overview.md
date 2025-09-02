---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "PureScript overview"
conversation_id: 68b6f592-96d4-832d-9993-89882736db81
create_time: 09/02/2025 at 8:48 AM
update_time: 09/02/2025 at 8:59 AM
---

# Title: PureScript overview

Created: 09/02/2025 at 8:48 AM
Last Updated: 09/02/2025 at 8:59 AM
Chat URL: https://chat.openai.com/c/68b6f592-96d4-832d-9993-89882736db81


>[!nexus_user] **User** - 09/02/2025 at 8:48 AM
> purescript
<!-- UID: 0b4ff86b-8f58-47ea-beda-db3a700d6762 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 8:48 AM
> ​PureScript is a strongly-typed, purely functional programming language that compiles to JavaScript. It offers a robust type system, drawing inspiration from Haskell, and is designed for building reliable and maintainable web applications. Here's an overview of its key features and considerations:
> 
> ---
> 
> ### 🔍 What is PureScript?
> 
> PureScript is a statically typed language, meaning that a correct program can be given a type by the compiler, which indicates its behavior. Conversely, programs that cannot be given a type are incorrect programs and will be rejected by the compiler. It features lightweight syntax, allowing for expressive and readable code, and uses a rich type system to support powerful abstractions. cite
> 
> ---
> 
> ### ⚙️ Core Features
> 
> - **Strict Evaluation**: Unlike Haskell's lazy evaluation, PureScript uses strict evaluation, which can lead to more predictable performance characteristics.
> 
> - **Row Polymorphism**: This feature allows for flexible and type-safe manipulation of records, making it easier to work with structured data. cite
> 
> - **Interoperability with JavaScript**: PureScript provides a Foreign Function Interface (FFI) that enables seamless integration with existing JavaScript codebases. cite
> 
> - **Tooling**: The recommended build tool is Spago, which manages dependencies and project builds. Editor support is available through plugins and language servers, enhancing the development experience. cite
> 
> ---
> 
> ### 🚀 Getting Started
> 
> To begin experimenting with PureScript:
> 
> 1. **Install the Compiler**: Use npm to install PureScript globally:
> 
>  ```bash
>  npm install -g purescript
>  ```
> 
> 2. **Set Up a Project**: Initialize a new project using Spago:
> 
>  ```bash
>  npm install -g spago
>  spago init
>  ```
> 
> 3. **Write Code**: Create a `Main.purs` file with the following content:
> 
>  ```purescript
>  module Main where
> 
>  import Effect.Console (log)
> 
>  main = log "Hello, PureScript!"
>  ```
> 
> 4. **Build and Run**: Use Spago to build and run your project:
> 
>  ```bash
>  spago build
>  spago run
>  ```
> 
> Alternatively, you can try PureScript directly in your browser using the [Try PureScript](https://try.purescript.org/) online editor.
> 
> ---
> 
> ### 📚 Learning Resources
> 
> - **Official Website**: Provides comprehensive documentation and to community resources. cite
> 
> - **PureScript by Example**: An in-depth book introducing PureScript concepts through practical examples. cite
> 
> - **Pursuit**: A searchable database of PureScript packages and their documentation.
> 
> - **Community Forums**: Engage with the PureScript community on [Discourse](https://discourse.purescript.org/) and [Discord](https://discord.com/invite/R7ZVn7a).
> 
> ---
> 
> ### 🤔 Considerations
> 
> While PureScript offers powerful features for functional programming, it does come with a learning curve, especially for those new to strong static typing or functional paradigms. Additionally, the ecosystem is smaller compared to more mainstream languages, which might affect the availability of libraries and community support.
> 
> ---
> 
> If you're interested in exploring PureScript further or have specific questions about its features or ecosystem, feel free to ask!
<!-- UID: 5efcec2b-ffa0-4e4e-86f5-be3983c7bd14 -->

---




>[!nexus_user] **User** - 09/02/2025 at 8:51 AM
> show me some examples
<!-- UID: d5ddbea1-e785-42fa-9c77-927f5bd3cc26 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 8:51 AM
> Alright—let’s get real and cut through the fluff. You asked for PureScript examples, not for another fluff fest. Here’s a practical, no-B-s breakdown:
> 
> ---
> 
> ## Solid, Real-World PureScript Examples
> 
> ### 1. **Minimal “Hello, World!”**
> 
> ```purescript
> module Main where
> 
> import Effect.Console (log)
> 
> main = log "Hello, World!"
> ```
> 
> This is the standard minimal entry point in PureScript, demonstrating how `main` is an effectful action logged to the console.cite
> 
> ---
> 
> ### 2. **Idiomatic Examples from "Learn X in Y Minutes"**
> 
> This resource walks you through practical snippets runnable in the PSCi REPL. For instance:
> 
> ```purescript
> -- Numbers and arithmetic
> 1.0 + 7.2 * 5.5 :: Number
> 1 + 2 * 5 :: Int
> -- Strings
> "Hello" :: String
> "such " <> "amaze" -- string concatenation
> -- Arrays
> [1,2,3] :: Array Int
> 1 : [2,4,3] -- cons operator
> head [1,2,3] -- Maybe Int
> ```
> 
> It’s gems like this—bite-sized, testable examples that force you to focus on data transformations, not ceremony.cite
> 
> ---
> 
> ### 3. **Building a Moving Box (DOM & Effects)**
> 
> A tutorial that walks you step-by-step to manipulate the DOM with PureScript without frameworks:
> 
> - Initialize tools (`purs`, `pulp`, `bower`)
> - Setup and move a colored box using `purescript-web-dom` APIs—purely functional style manipulating effects.
> 
> Great for grasping how you can control UI with functional purity, no magic involved.cite
> 
> ---
> 
> ### 4. **Fractal Tree with Canvas**
> 
> This one’s a thinker—not about UI frameworks, but about planning through pure functions and data:
> 
> ```purescript
> data Line = Line { x :: Number, y :: Number, angle :: Number, length :: Number, width :: Number }
> 
> endpoint :: forall r. { x :: Number, y :: Number, angle :: Number, length :: Number | r } -> Tuple Number Number
> endpoint line =
>  Tuple
>  (line.x + line.length * cos line.angle)
>  (-(-line.y + line.length * sin line.angle))
> ```
> 
> Separated data (the tree shape) from effects (drawing to canvas)—a solid FP design.cite
> 
> ---
> 
> ### 5. **A Simple Game: Snake**
> 
> This project is tough enough to actually teach you things. It carries:
> 
> - A `Model-Update-View-Signal` architecture (akin to Elm)
> - Array manipulations, state management, randomness, rendering
> 
> If you want to wrestle with a non-trivial example that isn’t academic sugar, this is it.cite
> 
> ---
> 
> ### 6. **“Real World” Level Projects**
> 
> If you want context on how PureScript looks at scale:
> 
> - **RealWorld Halogen** — a Medium clone using Halogen components, CRUD logic, state management, type classescite 
> - **PureScript Registry**, **Spago**, **purs-tidy**, and others — real, production-level tooling and services built with PureScript. Frankly, they’re not meant as tutorials—they’re complex, messy, and enlightening.cite
> 
> ---
> 
> ## How to Tackle This with Your Systems-Designer Brain
> 
> I get it: you don't just want answers—you want to understand how they fit into a system.
> 
> 1. **Pick something manageable**, like the moving box or the fractal tree. These are confined, understandable problems.
> 2. **Break it down yourself**: What are the data transformations? How are effects isolated?
> 3. **Avoid mutation**: Write small, composable pure functions first. Only wrap with Effect when necessary.
> 4. **Test with PSCi or Spago + QuickCheck**: turn those tiny functions into proofs of behavior.
> 
> ---
> 
> ## Recap Table
> 
> | Example | What It Teaches |
> |-----------------------------|--------------------------------------------------|
> | Hello World | Basics and effects wiring |
> | REPL examples (“Y minutes”) | Language fundamentals & REPL tinkering |
> | Moving Box | DOM manipulation, functional effects |
> | Fractal Tree | Pure data modeling + canvas rendering |
> | Snake Game | Stateful logic, signals, and architecture |
> | Real-Word Projects | Large-scale patterns & tooling frameworks |
> 
> ---
> 
> Want to go deeper into one? Pick your poison—I can guide you step by step, including designing testable modules and using ava for tests. Your call.
<!-- UID: 4ae73d4d-1e9e-4ece-acd3-6cd37578a7ba -->

---




>[!nexus_user] **User** - 09/02/2025 at 8:58 AM
> spacemacs purescript layer
<!-- UID: c4dc291c-f6b0-4361-b6aa-6f096c515af2 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 8:58 AM
> Alright, let’s go straight to the practical essentials—Spacemacs has a dedicated **PureScript layer** that brings solid tooling support straight into your editor. No fluff, no partisan fluff—just what you need.
> 
> ---
> 
> ## What the PureScript Layer Does
> 
> From the official Spacemacs docs, here’s what the `+lang/purescript` layer offers:
> 
> - **Syntax highlighting** via `purescript-mode` 
> - **Automatic import insertion** powered by `psc-ide-emacs` 
> - **REPL support** via PSci 
> - **Syntax checking** with `flycheck` 
> - **Autocomplete** via `company` 
> cite
> 
> ---
> 
> ## How to Install and Configure It
> 
> Add the PureScript layer in your `~/.spacemacs` file:
> 
> ```elisp
> dotspacemacs-configuration-layers
> '(
>  ;; other layers...
>  purescript
> )
> ```
> 
> Then reload your config with `SPC f e R`.
> 
> ---
> 
> ### Optional Variables You Should Know
> 
> You can fine-tune the layer with these variables:
> 
> | Feature | Purpose | Default |
> |--------|---------|---------|
> | `purescript-fmt-tool` | Formatter to use (`purs-tidy` by default) | `'purs-tidy` |
> | `purescript-fmt-on-save` | Automatically format on save | `nil` |
> | `purescript-add-import-on-completion` | Auto-insert imports when completing | `t` |
> | `node-add-modules-path` | Add `node_modules/.bin` to path (for local purs/pulp) | `nil` |
> | `purescript-enable-rebuild-on-save` | Show error popups on save instead of flycheck | `nil` |
> | `purescript-backend` | Choose backend—`psc-ide` or `lsp` | `psc-ide` |
> 
> Example initializer:
> 
> ```elisp
> (purescript
>  :variables
>  purescript-fmt-tool 'purs-tidy
>  purescript-fmt-on-save t
>  purescript-backend 'lsp)
> ```
> 
> If you're going full IDE, set up `lsp` backend—just make sure you install `purescript-language-server` globally with:
> 
> ```bash
> npm install -g purescript-language-server
> ```
> 
> Then the LSP layer hands you code navigation, autocompletion, and more like other LSP-backed modes. 
> cite
> 
> ---
> 
> ## Key Bindings That Actually Matter
> 
> Here’s what you can do with PureScript mode once it's running:
> 
> **Imports**
> 
> | Shortcut | Action |
> |-----------------|--------|
> | `SPC m i =` | Format imports |
> | `SPC m i a` | Align imports |
> | `SPC m i n` | Navigate imports |
> | `SPC m i \`` | Return to previous editing point |
> 
> **psc-ide (default backend)**
> 
> | Shortcut | Action |
> |------------------|--------|
> | `SPC m m s` | Start psc-ide-server |
> | `SPC m m q` | Quit server |
> | `SPC m m l` | Load project modules |
> | `SPC m m b` | Rebuild file + warnings/errors |
> | `SPC m m t` | Add clause per signature |
> | `SPC m m c` | Case split at cursor |
> | `SPC m m L` | Load specific module for debugging |
> 
> These are excellent leverage points—don’t overengineer. 
> cite
> 
> ---
> 
> ## Formatter: `purs-tidy`
> 
> The layer uses `purs-tidy` by default:
> 
> - Install it globally: `npm install -g purs-tidy` 
> - Supports customizable formatting—indentation, arrow placement, unicode, etc. via `.tidyrc.json` or CLI flags 
> - You can also generate operator precedence tables if needed—handy for larger projects 
> cite
> 
> ---
> 
> ## Next Steps—Break It Down
> 
> 1. **Enable the layer** in your `~/.spacemacs` and reload.
> 2. **Pick your backend**:
>  - `psc-ide` for lightweight setup,
>  - `lsp` for modern IDE-style features.
> 3. **Install `purs-tidy`**, optionally enable auto-format on save.
> 4. **Learn the key bindings**—they unclog your workflow.
> 5. **Tweak only when needed**—the defaults already deliver sanity.
> 
> ---
> 
> ### Final Thoughts (No-Nonsense Edition)
> 
> Spacemacs lets you mask over the setup complexity: once you activate the PureScript layer, you're immediately in a functional, interactive environment. Default configs deliver basic yet powerful support—if you're looking for robust tooling with minimal ceremony, you're in the right place.
> 
> If you're ready for deeper integration—test harnesses, CI formatting rules, highly customized LSP settings—let me know. We can walk through designing a dev pipeline step by step.
<!-- UID: cf21bc32-748d-4d2d-b117-c44ca1580e83 -->

---




>[!nexus_user] **User** - 09/02/2025 at 8:59 AM
> purescript file extension
<!-- UID: a728b30d-0706-42a3-837a-14d39b3d74d9 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 8:59 AM
> You asked about the **PureScript file extension**—let’s keep it straightforward and practical.
> 
> ---
> 
> ## File Extension for PureScript
> 
> PureScript source files use the **`.purs`** extension—short for "PureScript." Every module, whether it's in `src/`, `test/`, or elsewhere, should end with `.purs`. 
> This is confirmed by sources like Wikipedia: `"Filename extensions: .purs"` cite, and FileInfo specifies that a `.purs` file contains PureScript source code cite.
> 
> ---
> 
> ### Why This Matters (and Why It’s Not a Corner Case)
> 
> - **Tooling expects it**: Spago, the standard build tool, generates files like `src/Main.purs`. Editors (VS Code, Vim, Emacs) recognize syntax highlighting, REPL activation, and language server functionality based on that extension. You’ll see that in examples where people create `test/Main.purs` cite or `src/Main.purs` cite.
> 
> ---
> 
> ### TL;DR – No Sugar-Coating
> 
> - **Always use `.purs`** for PureScript source files.
> - It's the only right extension recognized by the ecosystem.
> - Anything else—and most tools, including the compiler, will ignore or reject it.
> 
> ---
> 
> I didn't sugarcoat it: extension matters. Stick to `.purs`, and your tooling won’t backstab you later. Want to talk about how this flows into your build pipeline, code editors, or testing setup? I’m ready when you are.
<!-- UID: c50a3e42-906b-4ac3-8e08-86eb003948e7 -->

---


