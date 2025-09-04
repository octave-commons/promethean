(ns mk.commands
  (:require [mk.node :as js]
            [mk.util :as u]
            [babashka.fs :as fs]))

;; Root tasks ---------------------------------------------------------------
(defn build []
  (js/build-js)
  (js/build-ts))

(defn clean []
  (js/clean-js)
  (js/clean-ts)
  )

(defn distclean []
  (println "[distclean] Removing ignored files repo-wide via git clean -fdX")
  (u/sh! "git clean -fdX" {:shell true})
  (println "[distclean] Done. Tracked files untouched."))

(defn lint []

  (js/lint-js)
  (js/lint-ts))

(defn lint-topics []
  (if (u/has-pnpm?)
    (u/sh! "pnpm exec tsx scripts/lint-topics.ts" {:shell true})
    (u/sh! ["npx" "tsx" "scripts/lint-topics.ts"])) )

(defn test []
  (js/test-js)
  (js/test-ts))


(defn format-code []
  (js/format-js)
  (js/format-ts))

(defn coverage []
  (js/coverage-js)
  (js/coverage-ts))

(defn setup []
  (println "Setting up all services...")
  (js/setup-js)
  (js/setup-ts)
  (println "[note] sibilant setup not ported; skipping")
  (when-not (u/has-cmd? "pm2")
    (u/sh! ["npm" "install" "-g" "pm2"])) )

(defn setup-quick []
  (println "Quick setup using requirements.txt files...")
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

(defn lint-tasks [] (u/sh! ["pnpm" "lint:tasks"]))

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
