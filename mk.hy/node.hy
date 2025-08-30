(require mk.macros [defn-cmd])
;; JavaScript helpers ---------------------------------------------------------
(defn-cmd lint-js-service [service]
  (print (.format "Linting JS service: {}" service))
  (if (has-pnpm)
      (sh "pnpm exec eslint ." :cwd (join "services/js" service) :shell True)
      (require-pnpm)))

(defn-cmd lint-js []
  (if (has-pnpm)
      (run-dirs SERVICES_JS "pnpm exec eslint ." :shell True)
      (require-pnpm)))

(defn-cmd format-js []
  (if (has-pnpm)
      (run-dirs SERVICES_JS "pnpm exec prettier --write ." :shell True)
      (require-pnpm)))

(defn-cmd setup-shared-js []
  (print (.format "installing shared dependencies"))
  (if (has-pnpm)
      (sh "pnpm install" :shell True)
      (require-pnpm))
  )
(defn-cmd setup-js-service [service]
  (print (.format "Setting up JS service: {}" service))
  (setup-shared-js)
  (if (has-pnpm)
      (sh "pnpm install" :cwd (join "services/js" service) :shell True)
      (require-pnpm)))

(defn-cmd setup-js []
  (print "Setting up JavaScript services...")
  (setup-shared-js)
  (if (has-pnpm)
      (run-dirs SERVICES_JS "pnpm install" :shell True)
      (require-pnpm)))

(defn-cmd test-js-service [service]

  (print (.format "Running tests for JS service: {}" service))
  (if (has-pnpm)
      ;; In CI/sandboxes, network listeners may be blocked. Allow JS tests to opt-out.
      (sh "SKIP_NETWORK_TESTS=1 pnpm test" :cwd (join "services/js" service) :shell True)
      (require-pnpm)))

(defn-cmd test-js-services []
  (if (has-pnpm)
      (run-dirs SERVICES_JS "echo 'Running tests in $PWD...' && SKIP_NETWORK_TESTS=1 pnpm test" :shell True)
      (require-pnpm)))

(defn-cmd test-js []
  (test-js-services))

(defn-cmd coverage-js-service [service]
  (print (.format "Running coverage for JS service: {}" service))
  (if (has-pnpm)
      (sh "pnpm run coverage && pnpm exec c8 report -r lcov" :cwd (join "services/js" service) :shell True)
      (require-pnpm)))

(defn-cmd coverage-js-services []
  (if (has-pnpm)
      (run-dirs SERVICES_JS "pnpm run coverage && pnpm exec c8 report -r lcov" :shell True)
      (require-pnpm)))

(defn-cmd coverage-js []
  (coverage-js-services))

(defn-cmd clean-js []
  (print "Cleaning JavaScript artifacts (git-aware)...")
  (safe-rm-globs "shared/js" ["node_modules" "dist" "build" ".turbo" ".parcel-cache" ".rollup.cache"])
  (for [d SERVICES_JS]
    (safe-rm-globs d ["node_modules" "dist" "build" ".turbo" ".parcel-cache" ".rollup.cache"])))

(defn-cmd build-js []
  (print "No build step for JavaScript services"))

;; TypeScript helpers ---------------------------------------------------------

(defn-cmd lint-ts-service [service]
  (print (.format "Linting TS service: {}" service))
  (if (has-pnpm)
      (sh "pnpm run lint" :cwd (join "services/ts" service) :shell True)
      (require-pnpm)))

(defn-cmd lint-ts []
  (for [d SERVICES_TS]
       (when (isfile (join d "package.json"))
         (if (has-pnpm)
             (sh "pnpm run lint" :cwd d :shell True)
             (require-pnpm))))
  (for [d SHARED_TS]
       (when (isfile (join d "package.json"))
         (if (has-pnpm)
             (sh "pnpm run lint" :cwd d :shell True)
             (require-pnpm)))))

(defn-cmd format-ts []
  (if (has-pnpm)
      (do
        (run-dirs SERVICES_TS "pnpm exec @biomejs/biome format --write"  :shell True)
        (run-dirs SHARED_TS "pnpm exec @biomejs/biome format --write"  :shell True))
      (require-pnpm)))


(defn-cmd setup-ts-service [service]
  (print (.format "Setting up TS service: {}" service))
  (setup-shared-js)
  (if (has-pnpm)
      (sh "pnpm install" :cwd (join "services/ts" service) :shell True)
      (require-pnpm)))

(defn-cmd setup-ts []
  (print "Setting up TypeScript services...")
  (setup-shared-js)
  (if (has-pnpm)
      (do
        (run-dirs SERVICES_TS "pnpm install" :shell True)
        (run-dirs SHARED_TS "pnpm install" :shell True))
      (require-pnpm)))

(defn-cmd test-ts-service [service]
  (print (.format "Running tests for TS service: {}" service))

  (setup-shared-js)
  (if (has-pnpm)
      (sh "pnpm test" :cwd (join "services/ts" service) :shell True)
      (require-pnpm)))

(defn-cmd test-ts-services []
  (if (has-pnpm)
      (run-dirs SERVICES_TS "echo 'Running tests in $PWD...' && pnpm test" :shell True)
      (require-pnpm)))

(defn-cmd test-ts []
  (test-ts-services)
  (if (has-pnpm)
      (run-dirs SHARED_TS "echo 'Running tests in $PWD...' && pnpm test" :shell True)
      (require-pnpm)))

(defn-cmd coverage-ts-service [service]
  (print (.format "Running coverage for TS service: {}" service))
  (if (has-pnpm)
      (sh "pnpm run coverage && pnpm exec c8 report -r lcov" :cwd (join "services/ts" service) :shell True)
      (require-pnpm)))

(defn-cmd coverage-ts-services []
  (if (has-pnpm)
      (run-dirs SERVICES_TS "pnpm run coverage && pnpm exec c8 report -r lcov" :shell True)
      (require-pnpm)))

(defn-cmd coverage-ts []
  (coverage-ts-services)
  (if (has-pnpm)
      (run-dirs SHARED_TS "pnpm run coverage && pnpm exec c8 report -r lcov" :shell True)
      (require-pnpm)))

(defn-cmd clean-ts []
  (print "Cleaning TypeScript artifacts (git-aware)...")
  ;; Only remove ignored stuff; never touch tracked files like ecosystem.config.js
  (for [d SERVICES_TS]
    (safe-rm-globs d ["node_modules" "dist" "build" "*.tsbuildinfo" ".turbo" ".parcel-cache" ".rollup.cache"]))
  ;; shared TS
  (for [d SHARED_TS]
    (safe-rm-globs d ["node_modules" "dist" "build" "*.tsbuildinfo" ".turbo" ".parcel-cache" ".rollup.cache"]))
  )

(defn-cmd build-ts []
  (print "Transpiling TS to JS... (if we had any shared ts modules)")

  (if (has-pnpm)
      (sh "pnpm run build" :cwd "./shared/ts/" :shell True)
      (require-pnpm))
  (for [d SERVICES_TS]
       (when (isfile (join d "node_modules/.bin/tsc"))
         (if (has-pnpm)
             (sh "pnpm run build" :cwd d :shell True)
             (require-pnpm))))
  )

(defn-cmd ts-type-check []
  (print "checking shared typescript for type errors...")
  (setv path "./shared/ts/")
  (try (if (has-pnpm)
           (do (sh "pnpm exec tsc --noEmit" :cwd path :shell True))
           (requir e-pnpm))
       (for [d SERVICES_TS]
            (setv path d)
            (if (has-pnpm)
                (do (print "checking types in" d)
                    (sh "pnpm exec tsc --noEmit" :cwd path :shell True))
                (require-pnpm)))
       (except [e Exception ]
               (print "TypeScript type check failed in" path "with:" e )
               (raise e))
       )

  )
