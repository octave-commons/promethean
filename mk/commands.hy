(require mk.macros [ define-service-list defn-cmd ])

(import shutil [which])
(import mk.util [sh run-dirs safe-rm-globs])
(import dotenv [load-dotenv])
(import os.path [isdir isfile join basename])
(import shutil [copyfile])

(import shutil)
(import platform)
(import glob)
(import os)
(import sys)
(import mk.configs [commands exceptions TORCH_INDEX TORCH_CHANNEL fs])

(load-dotenv)

(defmacro def [name value] `(setv ~name ~value))

(defmacro unless [ cond #* body] `(when (not ~cond) ~@body))



;; Root targets ---------------------------------------------------------------
(defn-cmd build []
  (build-js)
  (build-ts))

(defn-cmd clean []
  (clean-js)
  (clean-ts)
  (clean-python))

(defn-cmd distclean []
  (print "[distclean] Removing ignored files repo-wide via git clean -fdX")
  (sh "git clean -fdX" :shell True)
  (print "[distclean] Done. Tracked files untouched."))

(defn-cmd lint []
  (lint-python)
  (lint-js)
  (lint-ts))

(defn-cmd lint-topics []
  (if (has-pnpm)
      (sh "pnpm exec tsx scripts/lint-topics.ts" :shell True)
      (sh ["npx" "tsx" "scripts/lint-topics.ts"])) )

(defn-cmd test []
  (test-python)
  (test-hy)
  (test-js)
  (test-ts))

(defn-cmd test-integration []
  (sh "python -m pytest tests/integration" :shell True))
(defn-cmd test-e2e []
  (if (shutil.which "pipenv")
      (sh "python -m pipenv run pytest tests/e2e || true" :shell True)
      (sh "pytest tests/e2e || true" :shell True)))

(defn-cmd format []
  (format-python)
  (format-js)
  (format-ts))

(defn-cmd coverage []
  (coverage-python)
  (coverage-js)
  (coverage-ts))

(defn-cmd setup []
  (print "Setting up all services...")
  (setup-python)
  (setup-js)
  (setup-ts)
  (setup-hy)
  (setup-sibilant)
  (when (not (shutil.which "pm2"))
    (sh ["npm" "install" "-g" "pm2"]))
  )

(defn-cmd setup-quick []
  (print "Quick setup using requirements.txt files...")
  (setup-python-quick)
  (setup-js)
  (setup-ts)
  (setup-hy)
  (setup-sibilant)
  (when (not (shutil.which "pm2"))
    (sh ["npm" "install" "-g" "pm2"]))
  )

(defn-cmd install []
  (try
   (setup-quick)        ;; will hit setup-python-quick → uv path
   (except [Exception]
           (print "setup-quick failed; falling back to full setup")
           (setup))))

(defn-cmd install-gha-artifacts []
  "Download and install build artifacts from the latest GitHub Actions run."
  (let [artifact-dir "gh-actions-artifacts"]
       (print "Downloading GitHub Actions artifacts...")
       (sh (.format "gh run download -R riatzukiza/promethean -n dist -D {}" artifact-dir) :shell True)
       (for [wheel (glob.glob (join artifact-dir "*.whl"))]
            (sh ["pip" "install" wheel]))
       (print "GitHub Actions artifact installation complete")))
(defn-cmd probe-python-service [service]
  (let [d (join "services/py" service)]
       (if (has-uv)
           (cuda-probe d)
           (print "uv not found; probe requires uv"))))

(defn-cmd probe-python-services []
  (for [d SERVICES_PY]
       (when (has-uv) (cuda-probe d))))
(defn-cmd system-deps []
  (if (os.environ.get "SIMULATE_CI")
      (print "Skipping system dependency installation during CI simulation")
      (do (sh "sudo apt-get update && sudo apt-get install -y libsndfile1" :shell True)
          (sh "sudo apt-get install -y ffmpeg" :shell True)
        (sh "curl -LsSf https://astral.sh/uv/install.sh | sh" :shell True)
        (sh "curl -fsSL https://ollama.com/install.sh | sh" :shell True)
        (sh "corepack enable && corepack prepare pnpm@latest --activate" :shell True))))

(defn-cmd install-mongodb []
  (if (= (platform.system) "Linux")
      (sh "curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg --dearmor --yes -o /usr/share/keyrings/mongodb-server-7.0.gpg && echo 'deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse' | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list && sudo apt-get update && sudo apt-get install -y mongodb-org" :shell True)
      (print "MongoDB installation is only supported on Linux")))

(defn-cmd start []
  (sh ["pm2" "start" "ecosystem.config.js"]))

(defn-cmd stop []
  (sh "pm2 stop ecosystem.config.js || true" :shell True))

(defn-cmd start-service [service]
  (sh ["pm2" "start" "ecosystem.config.js" "--only" service]))

(defn-cmd stop-service [service]
  (sh (.format "pm2 stop {} || true" service) :shell True))


(defn-cmd lint-tasks []
  (sh ["python" "scripts/lint_tasks.py"]))

(defn-cmd simulate-ci []
  (if (os.environ.get "SIMULATE_CI_JOB")
      (sh ["python" "scripts/simulate_ci.py" "--job" (os.environ.get "SIMULATE_CI_JOB")])
      (sh ["python" "scripts/simulate_ci.py"])) )


(defn-cmd snapshot []
  (import datetime [datetime])
  (setv version (.strftime (datetime.now) "%Y.%m.%d"))
  (sh (.format "git tag -a snapshot-{} -m 'Snapshot {}'" version version) :shell True)
  (when (os.environ.get "PUSH")
    (sh (.format "git push origin snapshot-{}" version) :shell True)))

(setv patterns (define-patterns
                   ["python"
                 [ ["uv-setup" (fn [service]
                                 (let [d (join "services/py" service)]
                                      (uv-venv d) (uv-compile d) (uv-sync d) (inject-sitecustomize-into-venv d)))]
                                      ["probe" probe-python-service]
                                      ;; keep your existing actions...
                 ["setup" setup-python-service]
                 ["setup-quick-service" (fn [service]
                                            (generate-requirements-service service)
                                            (sh ["python" "-m" "pip" "install" "--user" "-r" "requirements.txt"] :cwd (join "services/py" service)))]
                 ["setup-quick-shared" setup-shared-python-quick]
                 ["test" test-python-service]
                 ["test-shared" test-shared-python]
                 ["coverage" coverage-python-service]
                 ["coverage-shared" coverage-shared-python]
                 ["lint" lint-python-service]
                 ["test-quick-service" test-python-service] ;; same as normal test
                 ["test-quick-shared" test-shared-python]   ;; no change in quick variant
                 ["coverage-quick-service" coverage-python-service]
                 ["coverage-quick-shared" coverage-shared-python]
                 ["lint" lint-python-service]]]

                 ["js"
                 [["setup" setup-js-service]
                 ["test" test-js-service]
                 ["coverage" coverage-js-service]
                 ["lint" lint-js-service]
                 ["test-quick-service" test-js-service]
                 ["coverage-quick-service" coverage-js-service]]]

                 ["ts"
                 [["setup" setup-ts-service]
                 ["test" test-ts-service]
                 ["coverage" coverage-ts-service]
                 ["lint" lint-ts-service]
                 ["test-quick-service" test-ts-service]
                 ["coverage-quick-service" coverage-ts-service]]]

                 ["hy"
                 [["setup" setup-hy-service]
                 ["test" test-hy-service]
                 ["test-quick-service" test-hy-service]]]

                 ["sibilant"
                 [["setup" setup-sibilant-service]]]

                 ["" ;; root
                 [["start" start-service]
                 ["stop" stop-service]
                 ["generate-requirements" generate-requirements-service]]]))

(defn load []
  {"commands" commands
   "patterns" patterns
   "exceptions" exceptions})
