User asks for help installing, building, and testing a bb (Babashka) project that now depends on a Java Tree-sitter library for Emacs Lisp parsing via Clojure. They are new to Clojure. They want a guided workflow to set up, install dependencies, build AOT, lint, and run tests, using the existing bb scripts and clj tooling. They asked to use the prepare_for_conversation tool; we prepared a handover memory summary for the next person with the goal to provide concrete steps to:
- Install Babashka and Clojure CLI tools
- Install Tree-sitter Java bindings as per packages/clj-hacks/deps.edn
- Run bb tasks: prepare, build, lint, test
- Run Clojure verify with clojure -A:verify packages/clj-hacks/fixtures/generated.el
- Explain how to troubleshoot common failures (dependency resolution, classpath, AOT, generated artifacts)
- Offer to inspect specific files (bb/src/clj_hacks/tasks.clj, deps.edn, fixtures/generated.el) if asked.