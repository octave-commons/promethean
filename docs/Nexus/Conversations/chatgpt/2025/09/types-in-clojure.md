---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Types in Clojure"
conversation_id: 68b6eee0-ab98-8331-b159-46e333728b3a
create_time: 09/02/2025 at 8:19 AM
update_time: 09/02/2025 at 9:39 AM
---

# Title: Types in Clojure

Created: 09/02/2025 at 8:19 AM
Last Updated: 09/02/2025 at 9:39 AM
Chat URL: https://chat.openai.com/c/68b6eee0-ab98-8331-b159-46e333728b3a


>[!nexus_user] **User** - 09/02/2025 at 8:19 AM
> types in clojure
<!-- UID: 195db911-d8ff-47d7-a19d-ad6ed5131fb4 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 8:19 AM
> ​Clojure is a dynamically typed language, but it offers several mechanisms to work with types, both at runtime and optionally at compile-time. Here's an overview:
> 
> ---
> 
> ## 🧱 Core Data Types in Clojure
> 
> Clojure provides a rich set of immutable data structures:
> 
> - **Numbers**: Integers, floats, ratios, and big integers.
> - **Strings**: Sequences of characters.
> - **Keywords**: Identifiers that evaluate to themselves, e.g., `:name`.
> - **Symbols**: Used to refer to variables and functions.
> - **Booleans**: `true` and `false`.
> - **nil**: Represents the absence of a value.
> - **Collections**:
>  - **Lists**: Ordered collections, e.g., `(1 2 3)`.
>  - **Vectors**: Indexed collections, e.g., `[1 2 3]`.
>  - **Maps**: Key-value pairs, e.g., `{:a 1, :b 2}`.
>  - **Sets**: Unordered collections of unique elements, e.g., `#{1 2 3}`.
> 
> These types are fundamental to Clojure's design and are used extensively throughout Clojure programs.
> 
> ---
> 
> ## 🧰 Type Hints and Reflection
> 
> While Clojure is dynamically typed, you can provide type hints to assist the compiler and avoid reflection, which can improve performance:
> 
> ```clojure
> (defn square [^Long x]
>  (* x x))
> ```
> 
> In this example, `^Long` is a type hint indicating that `x` is a `Long`. This helps the compiler generate more efficient bytecode by avoiding runtime type checks.
> 
> ---
> 
> ## 🧪 Optional Static Typing with Typed Clojure
> 
> For those who prefer static typing, Clojure offers optional type systems:
> 
> - **core.typed**: An optional type system for Clojure that allows you to add type annotations to your code. It supports features like occurrence typing and can help catch type errors at compile-time. cite
> 
> - **typed.clj**: A successor to `core.typed`, providing improved support for Clojure's dynamic features and better integration with the language. cite
> 
> These systems enable gradual typing, allowing you to add types where beneficial while retaining the flexibility of dynamic typing.
> 
> ---
> 
> ## 🧩 Data Modeling with `deftype`, `defrecord`, and `reify`
> 
> Clojure provides constructs for defining structured data types:
> 
> - **`defrecord`**: Defines a new record type with named fields and implements maps and other interfaces.
> 
>  
> ```clojure
>  (defrecord Person [name age])
>  (def john (->Person "John Doe" 30))
>  ```
> 
> - **`deftype`**: Defines a new type with specified fields and allows for custom implementations of interfaces.
> 
>  
> ```clojure
>  (deftype Point [x y])
>  ```
> 
> - **`reify`**: Creates an anonymous implementation of one or more interfaces or protocols.
> 
>  
> ```clojure
>  (reify
>  Runnable
>  (run [this] (println "Running")))
>  ```
> 
> These constructs are useful for modeling data and behavior in a structured way, especially when interoperability with Java or performance is a concern.
> 
> ---
> 
> ## 🧠 Summary
> 
> Clojure's dynamic typing offers flexibility, while optional type systems like `core.typed` and `typed.clj` provide tools for those who prefer or require static typing. Type hints can optimize performance by reducing reflection, and constructs like `defrecord` and `deftype` allow for structured data modeling. This blend of dynamic and optional static typing gives you the freedom to choose the right approach for your specific needs.
> 
> If you have further questions or need examples on any of these topics, feel free to ask!
<!-- UID: c39f572c-87ae-43d2-8039-4cb70174ebab -->

---




>[!nexus_user] **User** - 09/02/2025 at 8:23 AM
> clojurescript typescript
<!-- UID: 66bd7573-ab35-43df-b2b2-381fe36b6527 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 8:23 AM
> Alright, time to keep it real: **ClojureScript** and **TypeScript** are fundamentally different beasts. You're asking about “ClojureScript TypeScript”—which isn’t a single thing, but instead a whole spectrum of integration points and philosophical trade-offs.
> 
> Let’s lay it out plainly, step by step—so you can absorb, question, and implement on your own terms:
> 
> ---
> 
> ## 1. Mixing ClojureScript with TypeScript — It’s Possible, but Painful 
> 
> Leverage the fact both compile to JavaScript, but don’t expect seamless integration.
> 
> - You *can* compile ClojureScript to JavaScript and consume it from your TypeScript code. Build your CLJS output separately, create `d.ts` definitions manually, and import via:
> 
>  ```ts
>  import { foo } from "my-cljs-lib";
>  ```
> 
>  That works—but the inevitable friction from maintaining type definitions and synchronizing two build outputs is real. cite
> 
> - Tooling and module-level gluing (especially if you're using bundlers like Webpack) will require careful choreography. cite
> 
> **TL;DR**: Doable—but expect manual labor, especially around typing and build coordination.
> 
> ---
> 
> ## 2. Interop Capabilities — ClojureScript Plays Nicely with JS (and TS)
> 
> If you stick to ClojureScript and just interop with JavaScript or TypeScript modules, it’s way smoother:
> 
> - ClojureScript offers primitives like `(. js/obj -property)`, `(.. js/window -location -href)`, `#js {}`, `clj->js`, and more—straightforward, idiomatic, and flexible. cite
> 
> - Leveraging React libraries (e.g., TanStack Table) works beautifully via Shadow-CLJS or deps.edn. Converting maps, calling JS interop, and rendering via Reagent is clean and functional. cite
> 
> - In some developer experiences (like HN threads), folks have praised the REPL-driven development, hot-reloading, and functional-first setup—calling it *more productive than TypeScript and even Elm*. cite
> 
> ---
> 
> ## 3. Trade-offs & Developer Sentiment
> 
> Browsing community debates (like Reddit and Clojureverse) reveals nuanced perspectives:
> 
> - Some argue **TypeScript shines when you're heavily interoping with TS components**—because autocompletion, type safety, and strong tooling simplify understanding and using TS APIs. cite
> 
> - Others cherish what ClojureScript gives them: immutability, REPL-driven flow, consistent immutable data, concise syntax, and effortless JS library usage. Comments like:
> 
>  > “ClojureScript feels like a real front-end solution… TS feels like a bandaid.” 
>  > “The ClojureScript / JavaScript interop is just excellent.” cite
> 
> These aren’t nonsense idealizations—they come from devs wrestling daily with build systems, refactors, and collaborative codebases.
> 
> ---
> 
> ## 4. Optional Type Safety in ClojureScript 
> 
> There is no official TypeScript-like static typing.
> 
> - The core team instead pushes **`spec`** for runtime validation, schema checking, and self-documenting code. cite
> 
> - There’s **Typed Clojure** (`core.typed`) and **Spectrum**, but they’re niche, not widely adopted, and not part of the standard tooling. cite
> 
> Basically: if you want compile-time static typing, TypeScript is your tool. If you're going full-on ClojureScript, learning to trust spec and dynamic flow is part of the journey.
> 
> ---
> 
> ## Summary — The Practical, Skeptical View
> 
> | Scenario | Recommendation |
> |----------|-----------------|
> | You're primarily in **TypeScript land**, and want to dip a toe into ClojureScript | You can mix, but… **upgrade your willingness to handle manual type definitions and separate builds**. It’s messy. |
> | You're in **ClojureScript**, occasionally consuming JS/TS libraries | Go for it—interop is rich, expressive, and stable. Use `#js`, `clj->js`, dot forms. Shadow-CLJS + Reagent = joy. |
> | You need **strong typing and tooling** (autocompletion, compile-time safety) | Stick with **TypeScript**, or limit CLJS to internal logic without exposing APIs to TS. |
> | You want **full-stack Clojure logic, front and back** | Embrace ClojureScript. Share code via `cljc`, spec, data transformations. Expect a different, more REPL-centric tooling experience. |
> 
> ---
> 
> ### Final Take-home
> 
> If you're philosophically aligned with Clojure—functional, immutable, REPL-savvy—then ClojureScript is a powerful, satisfying choice. But if you're in TS-heavy ecosystems and crave type-safety, the friction of mixing may outweigh the benefits.
> 
> Rather than forcing a mash-up, lean into the strengths of *one* language. Build incremental bridges instead of tangled glue.
> 
> Want to prototype a mixed TS <—> CLJS example or set up a Shadow-CLJS interop repo? I’ll walk you through it step by step, functional mindset intact, with tests in **Ava-style TS** for any glue code.
<!-- UID: cf8f50a4-5b8c-415b-8306-7d509aae3de0 -->

---




>[!nexus_user] **User** - 09/02/2025 at 8:25 AM
> Compile clojure to typescript
<!-- UID: c34e6c4c-88f1-4b68-9ca3-f2ac1b568bad -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 8:26 AM
> Short answer: there is **no compiler that emits TypeScript from Clojure/ClojureScript**. CLJS compiles to JavaScript. If you need TS types, the practical route is: **compile CLJS → JS**, then **generate `.d.ts`** (or hand-write them) for consumption from TS. Sources back this up and show interop patterns, not “Clojure → TypeScript” compilation. cite
> 
> Here’s the least-pain plan that actually ships.
> 
> # Plan A — CLJS library consumed by TS with generated `.d.ts`
> 1. **Build your CLJS as an npm package** 
>  Use `shadow-cljs` to emit ES modules (or CJS) and publish/pack it. shadow gives solid JS/CLJS interop and npm-level packaging. cite
> 2. **Generate `.d.ts` from the emitted JS** 
>  TypeScript can emit declarations from JS *if* it sees JSDoc. Add a tiny JS “shim” (or JSDoc comments) alongside your compiled output, then run `tsc` with `allowJs` + `declaration` to spit out `.d.ts`. cite
> 
>  ```json
>  // tsconfig.json (in the package that wraps your CLJS output)
>  {
>  "compilerOptions": {
>  "declaration": true,
>  "emitDeclarationOnly": true,
>  "allowJs": true,
>  "checkJs": true,
>  "outDir": "types"
>  },
>  "include": ["dist/**/*.js", "shims/**/*.js"]
>  }
>  ```
> 
>  ```js
>  // shims/my-lib.js (JSDoc tells TS the shapes)
>  /**
>  * @typedef {{x: number, y: number}} Point
>  */
> 
>  /**
>  * @param {Point} p
>  * @returns {number}
>  */
>  export function distance(p) { /* calls into CLJS-exported function */ }
>  ```
>  Run `npx tsc` → you get `types/**/*.d.ts` which TS consumers will pick up.
> 
> 3. **Wire it for consumers** 
>  In your `package.json`:
>  ```json
>  {
>  "types": "types/index.d.ts",
>  "exports": {
>  ".": { "import": "./dist/index.js", "types": "./types/index.d.ts" }
>  }
>  }
>  ```
> 
> Why this route? Because CLJS’s output is JS; TS’s team officially supports generating declarations **from JS via JSDoc**, so you avoid maintaining hand-written `.d.ts` for everything. cite
> 
> # Plan B — Hand-rolled or generated definitions only where needed
> If your surface area is small, hand-write a thin `.d.ts` that describes just the public API. Keep the rest untyped. It’s boring but low-friction. Community threads reflect that mixed TS/CLJS repos succeed when you keep the interop seam small and explicit. cite
> 
> # What won’t work (or isn’t worth it)
> - **“Compile Clojure to TypeScript” tools.** They don’t exist in any maintained, credible form. CLJS → JS is the path. cite
> - **Rely on TS understanding Closure types directly.** The historical TS↔Closure bridge (`tsickle`) targets the *other* direction (TS → Closure); it doesn’t solve CLJS → TS typing. cite
> - **Expect a Clojure “TypeScript equivalent.”** Typed Clojure exists for Clojure/CLJS type checking, but it won’t emit `.d.ts` for TS. It’s for *your* safety, not TS consumers. cite
> 
> # Skeleton repo layout (works in practice)
> ```
> my-cljs-lib/
>  shadow-cljs.edn
>  src/my_lib/*.cljs
>  package.json # name, version, exports, types
>  dist/ # shadow build output (esm or cjs)
>  shims/ # tiny JS files w/ JSDoc for TS
>  types/ # generated .d.ts by tsc
>  tsconfig.json # allowJs + declaration + emitDeclarationOnly
> ```
> - Build CLJS: `npx shadow-cljs release :lib` → `dist/…` 
> - Generate types: `npx tsc` → `types/…` 
> - Publish or link locally; TS projects get autocompletion and checks off your `.d.ts`. cite
> 
> # When to *not* do any of this
> If your app is **TS-heavy and interop-dense**, community experience says the glue cost can outweigh benefits—either keep the CLJS boundary tiny or stick to TS. If you’re **CLJS-first**, interop with JS libs is excellent; add `.d.ts` only for the few APIs TS will call. cite
> 
> If you want, I can sketch a `shadow-cljs.edn` target plus a minimal shim that exports a couple of pure functions, and a tiny Ava test in TS to prove the types line up.
> 
> #hashtags
> #clojure #clojurescript #typescript #interop #shadowcljs #jsdoc #declarationfiles #build-system #promethean-dev
<!-- UID: 1ae498e1-05d4-4267-9670-9a37cbb35025 -->

---




>[!nexus_user] **User** - 09/02/2025 at 8:31 AM
> When working with AI, strong static typing helps catch many simple hallucinations, and the way the AI chooses to type the code gives you a strong idea of how confident it is that it will work, and how well it understands the tools it is using.
> 
> Is there *any* lisp that transpiles to typescript?
<!-- UID: 053538cf-6528-4c31-9fbb-cbd086b87271 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 8:31 AM
> You’re asking a sharp question—especially in AI-heavy workflows where static typing can act like a sanity check. Let’s cut straight: **Yes, there *are* Lisp-flavored languages that transpile to TypeScript**, and some experimental tools too. But they are niche, not mainstream, and the ecosystem is thin. Here's what I found:
> 
> ---
> 
> ## 1. Real Lisp-style languages that can compile to TypeScript
> 
> The **awesome-lisp-languages** list includes:
> 
> - **Wax** — a tiny, strongly-typed Lisp that **transpiles to C, C++, Java, TypeScript, Python, C#, Swift, Lua, WebAssembly** cite 
>  This is the most direct answer: Wax actually targets TypeScript among several languages. It's minimal, so expect limited features.
> 
> ---
> 
> ## 2. Experiment and toy projects
> 
> - **RacketScript**, **Parenscript**, and various others compile Lisp to JavaScript—but *not* TypeScript cite.
> - **nukata’s** “lisp-in-typescript”: A Lisp-1 interpreter written *in* TypeScript, *not* at all a Lisp → TS compiler cite.
> - **jlisp** (by pedroabelleira): Another Lisp interpreter implemented in TypeScript, again not a transpiler cite.
> 
> ---
> 
> ## 3. Online “converters” (not compilers)
> 
> - Tools like **“Lisp to TypeScript Converter”** on codeconvert.ai exist—but they’re essentially AI-backed snippet transformers. Think: paste Lisp, get TS. Not a compiler you’d trust or integrate seriously cite.
> 
> ---
> 
> ### Summary Table
> 
> | Approach | Available? | Status & Limitations |
> |-------------------------------------------|-------------------|--------------------------------------------------|
> | Proper Lisp → TypeScript | **Yes** (Wax) | Limited, minimal feature set, not widely used |
> | Lisp → JavaScript (common tools) | **Yes** | Mature ecosystem, but lacks TypeScript output |
> | Lisp written in TypeScript (interpreters)| **Yes** | Educational toys, not compilers |
> | AI-powered online converters | **Yes** | Shaky; not production-grade or dependable |
> 
> ---
> 
> ## Practical Advice
> 
> Let’s be blunt:
> 
> - If you need strong static typing in your AI tooling—especially to catch hallucinations—**Wax** is your best bet if you *really* want Lisp vibe plus TypeScript output.
> - But realistically, Wax is niche and not widely battle-tested.
> - More realistic and less painful: **Use Clojure/ClojureScript + Typed Clojure or spec** for logic, and **wrap it with a TS interface** via JSDoc or handwritten `.d.ts`. (That’s the hybrid approach we discussed earlier.)
> - Or embrace **PureScript**—which is Haskell-style but strongly typed, keeps you functional, and compiles to JavaScript. No Lisp syntax—but far richer typing and tooling cite. Might be more productive long-term.
> 
> ---
> 
> ### Straightening the path
> 
> Want to go deeper? I can help you:
> 
> - Explore **Wax**, set up a tiny example, see how serious the typing is.
> - Prototype a hybrid where AI-generated logic in Lisp-style or Clojure is checked/typed via TS interfaces.
> - Pivot to **PureScript** if static typing is your strategic priority over syntax preference.
> 
> I’d push back against assuming you need Lisp syntax—if your goal is trustworthy, typed AI pipelines, pick the tool that gives you that clearly. But if Lisp *is* non-negotiable, Wax is the only “real” path. Let me know where to aim next.
<!-- UID: 4ddf0c31-77e1-4f45-beeb-df961dabf1b8 -->

---




>[!nexus_user] **User** - 09/02/2025 at 8:33 AM
> purescript? yea I really just want a strongly typed lisp that can work in the js ecosystem
<!-- UID: 057910f1-66bd-4c0f-a4e4-6d2c373ce5ba -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 8:33 AM
> Short version: if you insist on “Lisp that **emits TypeScript**,” the only credible hit is **Wax** — a tiny, **strongly statically typed** Lisp-ish language whose toolchain can transpile to **TypeScript** (and a bunch of other targets). It’s niche, but it directly answers your ask. cite
> 
> Everything else in Lisp land that plays well with JS either:
> - compiles to **JavaScript** (not TypeScript) — e.g., RacketScript, Parenscript, Wisp, Dak, etc. (fun, but **not** typed for TS), cite
> - or is “typed Lisp” that **doesn’t** target TS (Typed Racket, Typed Clojure). cite
> 
> So your realistic options:
> 
> # What actually works (practical paths)
> 
> ## Option A — Kick the tires on **Wax**
> - Pros: Lisp-y syntax + **strong static types** + **TS output**. Proof that your “typed Lisp → TS” pipeline can exist. 
> - Cons: tiny ecosystem; expect to blaze trails. 
> Sources listing Wax’s capabilities: cite
> 
> ## Option B — Use a Lisp→**JS** compiler + generate **.d.ts**
> If you want mainstream libs and tooling, compile to **JS** (CLJS, Parenscript, Wisp, Dak, etc.) and then auto-generate TypeScript **declaration files** from the JS using **JSDoc + `tsc`** (`allowJs`, `checkJs`, `declaration`, `emitDeclarationOnly`). This gives you TS editor support and static checking at the seam. Official TS doc for generating `.d.ts` from JS: cite
> 
> > Reality check: there’s **no mature, widely-used** Lisp→TypeScript compiler besides Wax. If you want types in a JS ecosystem, the “JS + `.d.ts`” seam is the boring, reliable way. Community consensus also notes there’s no good auto-`.d.ts` from ClojureScript itself; you maintain the seam. cite
> 
> ## Option C — Abandon Lisp syntax, keep the spirit: **PureScript**, **ReScript**, **F#/Fable**
> Not Lisp, but they give you **sound types**, algebraic data types, effect tracking, and great JS interop. If your **goal is correctness under AI assistance** rather than parentheses, these are safer bets. (See “compile-to-JS languages” roundups noting PureScript & F#/Fable.) cite
> 
> # My take (no sugar, just strategy)
> - If Lisp **syntax** is non-negotiable **and** you want **TS output**, try **Wax** on a pilot. Treat it as experimental. cite 
> - If what you really want is **typed guarantees** to sandbag AI hallucinations in a JS world, go **Lisp→JS + `.d.ts`** or pick a **typed FP** that compiles to JS (PureScript/ReScript/Fable). These will scale with less pain. cite
> 
> If you want, I’ll sketch a tiny repo either way:
> - **Wax demo** (compile to TS, unit-test with Ava). 
> - **CLJS/Parenscript → JS** plus a **JSDoc shim** and `tsc` to emit `.d.ts`, proving the interop loop.
> 
> #hashtags
> #lisp #typescript #wax #clojurescript #purescript #rescript #fsharp #fable #typedclojure #racketscript #interop #js-ecosystem
<!-- UID: c7ea056e-776d-4618-8f84-2180135e7185 -->

---




>[!nexus_user] **User** - 09/02/2025 at 9:37 AM
> I'd be happy with any lisp with strong optional typing
<!-- UID: 30611f49-9496-4473-9534-147f70e35a9b -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 9:38 AM
> # Strongly-typed (optional) Lisps — the real options
> 
> You’ve got a few credible paths. Short list first, then quick trade-offs.
> 
> ## 1) Typed Racket (Racket)
> Gradually-typed (“optional”) with real teeth: occurrence typing, contracts, and solid docs. You can start untyped and layer types where it matters. If you want the strongest optional typing experience in a Lisp today, this is it. cite
> 
> **When to pick:** you want a first-class typed Lisp experience and don’t strictly need to target JS/TS directly.
> 
> ## 2) Typed Clojure (Clojure / ClojureScript)
> Optional static typing for Clojure, maintained as **typedclojure** (successor to `core.typed`). It brings compile-time checks to idiomatic Clojure; there’s guidance and minimal examples for Clojure **and** ClojureScript setups. cite
> 
> **When to pick:** you want Clojure/ClojureScript with optional types on the JVM/JS, and you’re fine living in the Clojure toolchain.
> 
> ## 3) Kawa Scheme (on the JVM)
> Scheme with **optional type declarations**, type inference, and good Java interop. You can add types to variables/params and get near-Java performance. Optional typing is baked into the compiler story. cite
> 
> **When to pick:** you want a Lisp on the JVM with optional types and tight access to Java libraries.
> 
> ## 4) Common Lisp (SBCL & friends)
> CL has **optional** type declarations (`declaim`, `the`) and runtime checks (`check-type`). Compilers like SBCL can issue compile-time warnings/errors and optimize based on your annotations. It’s not “a separate typed dialect,” but in practice you can get meaningful static checking. cite
> 
> **When to pick:** you want CL’s ecosystem and are OK with optional typing via declarations rather than a distinct typed language.
> 
> ## 5) Shen
> A Lisp with an **optional static type system** (sequent-calculus-based). It’s portable (multiple hosts) and gives you powerful type definitions, though the ecosystem is smaller. cite
> 
> **When to pick:** you want a Lisp whose design centers an optional static type theory, and you’re comfortable off the beaten path.
> 
> ---
> 
> ## Honorable mention (not “optional”)
> - **Carp** — statically typed Lisp with ownership/borrowing, compiles to C. Strong typing, but **not optional** (the whole language is statically typed). Great for systems/game dev trade-offs. cite
> 
> ---
> 
> # If you still care about the JS ecosystem
> 
> Two practical routes:
> 
> - **ClojureScript + Typed Clojure** for your logic, then export JS and add a tiny JSDoc shim to generate `.d.ts` for TS consumers. It’s boring, but it works and keeps your app typed at the seam. (Typed Clojure covers CLJ/CLJS; `.d.ts` generation is handled by TypeScript from JSDoc.) cite
> 
> - **RacketScript** exists to compile (untyped) Racket to JS, but it’s experimental and not a Typed-Racket→JS pipeline. Use only if you’re OK with experimental tooling and filling gaps yourself. cite
> 
> ---
> 
> ## My blunt recommendation
> 
> - If “optional typing in a Lisp” is the goal: **Typed Racket**.
> - If you want Lisp + the broader JVM/JS world: **Typed Clojure** (CLJ/CLJS).
> - If you want optional types + JVM interop but prefer Scheme: **Kawa Scheme**.
> - If you want CL and can live with declaration-based checking: **Common Lisp (SBCL)**.
> - If you want something more researchy: **Shen**.
> 
> If you want, say the word and I’ll sketch a minimal **Typed ClojureScript** + “export JS + generate `.d.ts`” pipeline so you get strong optional typing in Lisp *and* clean TypeScript ergonomics where it interfaces with the rest of your stack.
> 
> #tags
> #lisp #typed #gradualtyping #typedracket #typedclojure #kawa #commonlisp #shen #clojurescript #typescript #js-interop #promethean-dev
<!-- UID: 89794034-1fd0-4739-818f-707e56df6a31 -->

---


