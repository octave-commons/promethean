(ns mk.commands
  (:require [mk.python :as py]
            [mk.node :as js]
            [mk.util :as u]
            [mk.configs :as cfg]
            [babashka.process :as p]
            [babashka.fs :as fs]))

;; Root tasks ---------------------------------------------------------------
(defn build []
  (js/build-js)
  (js/build-ts))

(defn clean []
  (js/clean-js)
  (js/clean-ts)
  (py/clean-python))

(defn distclean []
  (println "[distclean] Removing ignored files repo-wide via git clean -fdX")
  (u/sh! "git clean -fdX" {:shell true})
  (println "[distclean] Done. Tracked files untouched."))

(defn lint []
  (py/lint-python)
  (js/lint-js)
  (js/lint-ts))

(defn lint-topics []
  (if (u/has-pnpm?)
    (u/sh! "pnpm exec tsx scripts/lint-topics.ts" {:shell true})
    (u/sh! ["npx" "tsx" "scripts/lint-topics.ts"])) )

(defn test []
  (py/test-python)
  (js/test-js)
  (js/test-ts))

(defn test-integration []
  (u/sh! "python -m pytest tests/integration" {:shell true}))

(defn test-e2e []
  (if (u/has-cmd? "pipenv")
    (u/sh! "python -m pipenv run pytest tests/e2e || true" {:shell true})
    (u/sh! "pytest tests/e2e || true" {:shell true})))

(defn format-code []
  (py/format-python)
  (js/format-js)
  (js/format-ts))

(defn coverage []
  (py/coverage-python)
  (js/coverage-js)
  (js/coverage-ts))

(defn setup []
  (println "Setting up all services...")
  (py/setup-python)
  (js/setup-js)
  (js/setup-ts)
  (println "[note] sibilant setup not ported; skipping")
  (when-not (u/has-cmd? "pm2")
    (u/sh! ["npm" "install" "-g" "pm2"])) )

(defn setup-quick []
  (println "Quick setup using requirements.txt files...")
  (py/setup-python-quick)
  ;; Use pnpm workspace for efficient install
  (println "Installing all workspace dependencies...")
  (if (u/has-pnpm?)
    (do
      ;; Install all workspace deps at once
      (u/sh! "pnpm install" {:shell true})
      ;; Build shared TS to create bin files
      (u/sh! "pnpm -r --filter @shared/ts run build" {:shell true}))
    (u/require-pnpm))
  (println "[note] sibilant setup not ported; skipping")
  (when-not (u/has-cmd? "pm2")
    (u/sh! ["npm" "install" "-g" "pm2"])) )

(defn install []
  (try
    (setup-quick)
    (catch Throwable _
      (println "setup-quick failed; falling back to full setup")
      (setup))))

(defn install-gha-artifacts []
  (let [artifact-dir "gh-actions-artifacts"]
    (println "Downloading GitHub Actions artifacts...")
    (u/sh! (format "gh run download -R riatzukiza/promethean -n dist -D %s" artifact-dir) {:shell true})
    (doseq [wheel (fs/glob artifact-dir "*.whl")]
      (u/sh! ["pip" "install" (str wheel)]))
    (println "GitHub Actions artifact installation complete")))

(defn- gpu-build? [d]
  (= (cfg/reqs-file-for d) "requirements.gpu.in"))

(defn probe-python-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))
        d (str (fs/path "services/py" (or service "")))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (if (u/has-uv?)
      (u/cuda-probe d (gpu-build? d))
      (println "uv not found; probe requires uv"))))

(defn probe-python-services []
  (when (u/has-uv?)
    (doseq [d cfg/services-py]
      (u/cuda-probe d (gpu-build? d)))))

(defn system-deps []
  (if (System/getenv "SIMULATE_CI")
    (println "Skipping system dependency installation during CI simulation")
    (do (u/sh! "sudo apt-get update && sudo apt-get install -y libsndfile1" {:shell true})
        (u/sh! "sudo apt-get install -y ffmpeg" {:shell true})
        (u/sh! "curl -LsSf https://astral.sh/uv/install.sh | sh" {:shell true})
        (u/sh! "curl -fsSL https://ollama.com/install.sh | sh" {:shell true})
        (u/sh! "corepack enable && corepack prepare pnpm@latest --activate" {:shell true}))))

(defn install-mongodb []
  (let [os (System/getProperty "os.name")]
    (if (re-find #"Linux" os)
      (u/sh! (str "curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg --dearmor --yes -o /usr/share/keyrings/mongodb-server-7.0.gpg && "
                  "echo 'deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse' | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list && "
                  "sudo apt-get update && sudo apt-get install -y mongodb-org")
            {:shell true})
      (println "MongoDB installation is only supported on Linux"))))

(defn start [] (u/sh! ["pm2" "start" "ecosystem.config.js"]))
(defn stop [] (u/sh! "pm2 stop ecosystem.config.js || true" {:shell true}))
(defn start-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (u/sh! ["pm2" "start" "ecosystem.config.js" "--only" service])))
(defn stop-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (u/sh! (format "pm2 stop %s || true" service) {:shell true})))

(defn lint-tasks [] (u/sh! ["python" "scripts/lint_tasks.py"]))

(defn simulate-ci []
  (if-let [job (System/getenv "SIMULATE_CI_JOB")]
    (u/sh! ["python" "scripts/simulate_ci.py" "--job" job])
    (u/sh! ["python" "scripts/simulate_ci.py"])) )

(defn snapshot []
  (let [fmt (java.text.SimpleDateFormat. "yyyy.MM.dd")
        version (.format fmt (java.util.Date.))]
    (u/sh! (format "git tag -a snapshot-%s -m 'Snapshot %s'" version version) {:shell true})
    (when (System/getenv "PUSH")
      (u/sh! (format "git push origin snapshot-%s" version) {:shell true}))))

;; Pre-commit commands -------------------------------------------------------
(defn pre-commit-install []
  (u/sh! ["pre-commit" "install"]))

(defn pre-commit-run 
  ([] (u/sh! ["pre-commit" "run" "--all-files"]))
  ([hook-name] (u/sh! ["pre-commit" "run" hook-name "--all-files"])))

(defn pre-commit-run-changed []
  (u/sh! ["pre-commit" "run"]))

(defn pre-commit-update []
  (u/sh! ["pre-commit" "autoupdate"]))
