(ns mk.node
  (:require [mk.util :as u]
            [mk.configs :as cfg]
            [babashka.fs :as fs]))

;; JavaScript helpers ---------------------------------------------------------
(defn lint-js-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (println (format "Linting JS service: %s" service))
    (if (u/has-pnpm?)
      (u/sh! "pnpm exec eslint ." {:dir (str (fs/path "services/js" service)) :shell true})
      (u/require-pnpm))))

(defn lint-js []
  (if (u/has-pnpm?)
    (u/run-dirs cfg/services-js "pnpm exec eslint ." {:shell true})
    (u/require-pnpm)))

(defn format-js []
  (if (u/has-pnpm?)
    (u/run-dirs cfg/services-js "pnpm exec prettier --write ." {:shell true})
    (u/require-pnpm)))

(defn setup-shared-js []
  (println "installing shared dependencies")
  (if (u/has-pnpm?)
    (u/sh! "pnpm install" {:shell true})
    (u/require-pnpm)))

(defn setup-js-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (println (format "Setting up JS service: %s" service))
    (setup-shared-js)
    (if (u/has-pnpm?)
      (u/sh! "pnpm install" {:dir (str (fs/path "services/js" service)) :shell true})
      (u/require-pnpm))))

(defn setup-js []
  (println "Setting up JavaScript services...")
  (setup-shared-js)
  (if (u/has-pnpm?)
    (u/run-dirs cfg/services-js "pnpm install" {:shell true})
    (u/require-pnpm)))

(defn test-js-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (println (format "Running tests for JS service: %s" service))
    (if (u/has-pnpm?)
      (u/sh! "SKIP_NETWORK_TESTS=1 pnpm test" {:dir (str (fs/path "services/js" service)) :shell true})
      (u/require-pnpm))))

(defn test-js-services []
  (if (u/has-pnpm?)
    (u/run-dirs cfg/services-js "echo 'Running tests in $PWD...' && SKIP_NETWORK_TESTS=1 pnpm test" {:shell true})
    (u/require-pnpm)))

(defn test-js [] (test-js-services))

(defn coverage-js-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (println (format "Running coverage for JS service: %s" service))
    (if (u/has-pnpm?)
      (u/sh! "pnpm run coverage && pnpm exec c8 report -r lcov" {:dir (str (fs/path "services/js" service)) :shell true})
      (u/require-pnpm))))

(defn coverage-js-services []
  (if (u/has-pnpm?)
    (u/run-dirs cfg/services-js "pnpm run coverage && pnpm exec c8 report -r lcov" {:shell true})
    (u/require-pnpm)))

(defn coverage-js [] (coverage-js-services))

(defn clean-js []
  (println "Cleaning JavaScript artifacts (git-aware)...")
  (u/safe-rm-globs "shared/js" ["node_modules" "dist" "build" ".turbo" ".parcel-cache" ".rollup.cache"])
  (doseq [d cfg/services-js]
    (u/safe-rm-globs d ["node_modules" "dist" "build" ".turbo" ".parcel-cache" ".rollup.cache"])))

(defn build-js [] (println "No build step for JavaScript services"))

;; TypeScript helpers ---------------------------------------------------------
(defn lint-ts-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (println (format "Linting TS service: %s" service))
    (if (u/has-pnpm?)
      (u/sh! "pnpm run lint" {:dir (str (fs/path "services/ts" service)) :shell true})
      (u/require-pnpm))))

(defn lint-ts []
  (doseq [d cfg/services-ts]
    (when (fs/exists? (fs/path d "package.json"))
      (if (u/has-pnpm?)
        (u/sh! "pnpm run lint" {:dir d :shell true})
        (u/require-pnpm))))
  (doseq [d cfg/shared-ts]
    (when (fs/exists? (fs/path d "package.json"))
      (if (u/has-pnpm?)
        (u/sh! "pnpm run lint" {:dir d :shell true})
        (u/require-pnpm)))))

(defn format-ts []
  (if (u/has-pnpm?)
    (do (u/run-dirs cfg/services-ts "pnpm exec @biomejs/biome format --write" {:shell true})
        (u/run-dirs cfg/shared-ts "pnpm exec @biomejs/biome format --write" {:shell true}))
    (u/require-pnpm)))

(defn setup-ts-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (println (format "Setting up TS service: %s" service))
    (setup-shared-js)
    (if (u/has-pnpm?)
      (u/sh! "pnpm install" {:dir (str (fs/path "services/ts" service)) :shell true})
      (u/require-pnpm))))

(defn setup-ts []
  (println "Setting up TypeScript services...")
  (setup-shared-js)
  (if (u/has-pnpm?)
    (do (u/run-dirs cfg/services-ts "pnpm install" {:shell true})
        (u/run-dirs cfg/shared-ts "pnpm install" {:shell true}))
    (u/require-pnpm)))

(defn test-ts-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (println (format "Running tests for TS service: %s" service))
    (setup-shared-js)
    (if (u/has-pnpm?)
      (u/sh! "pnpm test" {:dir (str (fs/path "services/ts" service)) :shell true})
      (u/require-pnpm))))

(defn test-ts-services []
  (if (u/has-pnpm?)
    (u/run-dirs cfg/services-ts "echo 'Running tests in $PWD...' && pnpm test" {:shell true})
    (u/require-pnpm)))

(defn test-ts []
  (test-ts-services)
  (if (u/has-pnpm?)
    (u/run-dirs cfg/shared-ts "echo 'Running tests in $PWD...' && pnpm test" {:shell true})
    (u/require-pnpm)))

(defn coverage-ts-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (println (format "Running coverage for TS service: %s" service))
    (if (u/has-pnpm?)
      (u/sh! "pnpm run coverage && pnpm exec c8 report -r lcov" {:dir (str (fs/path "services/ts" service)) :shell true})
      (u/require-pnpm))))

(defn coverage-ts-services []
  (if (u/has-pnpm?)
    (u/run-dirs cfg/services-ts "pnpm run coverage && pnpm exec c8 report -r lcov" {:shell true})
    (u/require-pnpm)))

(defn coverage-ts []
  (coverage-ts-services)
  (if (u/has-pnpm?)
    (u/run-dirs cfg/shared-ts "pnpm run coverage && pnpm exec c8 report -r lcov" {:shell true})
    (u/require-pnpm)))

(defn clean-ts []
  (println "Cleaning TypeScript artifacts (git-aware)...")
  (doseq [d cfg/services-ts]
    (u/safe-rm-globs d ["node_modules" "dist" "build" "*.tsbuildinfo" ".turbo" ".parcel-cache" ".rollup.cache"]))
  (doseq [d cfg/shared-ts]
    (u/safe-rm-globs d ["node_modules" "dist" "build" "*.tsbuildinfo" ".turbo" ".parcel-cache" ".rollup.cache"])) )

(defn build-shared-ts []
  (println "Building shared TypeScript (for bin symlinks)...")
  (if (u/has-pnpm?)
    (u/sh! "pnpm run build" {:dir "./shared/ts/" :shell true})
    (u/require-pnpm)))

(defn build-ts []
  (println "Transpiling TS to JS... (if we had any shared ts modules)")
  (build-shared-ts)
  (doseq [d cfg/services-ts]
    (when (fs/exists? (fs/path d "node_modules/.bin/tsc"))
      (if (u/has-pnpm?)
        (u/sh! "pnpm run build" {:dir d :shell true})
        (u/require-pnpm)))))

(defn ts-type-check []
  (println "checking shared typescript for type errors...")
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))
        run (fn [path]
              (if (and (fs/exists? (fs/path path "tsconfig.json"))
                       (fs/exists? (fs/path path "node_modules")))
                (if (u/has-pnpm?)
                  (u/sh! "pnpm exec tsc --noEmit" {:dir path :shell true})
                  (u/require-pnpm))
                (println "Skipping typecheck for" path)))]
    (if service
      (run (str (fs/path "services/ts" service)))
      (do (doseq [d cfg/services-ts] (run d))
          (doseq [d cfg/shared-ts] (run d))))))

