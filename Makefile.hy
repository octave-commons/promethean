(import subprocess)
(import shutil)
(import glob)
(import os.path [isdir join])
(import sys)

(setv SERVICES_PY ["services/py/stt" "services/py/tts" "services/py/discord_indexer" "services/py/discord_attachment_indexer" "services/py/discord_attachment_embedder" "services/py/stt_ws" "services/py/whisper_stream_ws"])
(setv SERVICES_JS ["services/js/vision" "services/js/heartbeat"])
(setv SERVICES_TS ["services/ts/cephalon" "services/ts/discord-embedder" "services/ts/llm" "services/ts/voice" "services/ts/file-watcher"])

(defn sh [cmd [cwd None] [shell False]]
  (import subprocess os)
  (setv env (os.environ.copy))
  (setv (get env "PIPENV_NOSPIN") "1")
  (if shell
      (do (print (.format "Running in {}: {}" (or cwd ".") cmd))
          (subprocess.run cmd :cwd cwd :check True :shell True))
      (do (print (.format "Running in {}: {}" (or cwd ".") (.join " " cmd)))
          (subprocess.run cmd :cwd cwd :check True))))

(defn run-dirs [dirs cmd [shell False]]
  (for [d dirs]
    (if (isdir d)
      (sh cmd :cwd d :shell shell)
      (print (.format "Skipping {} (not found)" d)))))

(defn has-eslint-config [d]
  (> (+ (len (glob.glob (join d ".eslintrc*")))
        (len (glob.glob (join d "eslint.config.*")))) 0))



;; Python helpers --------------------------------------------------------------
(defn setup-pipenv []
  (if (shutil.which "pipenv")
      (print "pipenv already installed, skipping")
      (do
        (sh ["python" "-m" "pip" "install" "--upgrade" "pip"])
        (print "installing pipenv")
        (sh ["python" "-m" "pip" "install" "pipenv"]))))

(defn setup-python-services []
  (print "Setting up Python services...")
  (run-dirs SERVICES_PY "python -m pipenv sync --dev" :shell True))

(defn generate-python-shared-requirements []
  (sh "python -m pipenv requirements > requirements.txt" :cwd "shared/py" :shell True))

(defn generate-python-services-requirements []
  (print "Generating requirements.txt for Python services...")
  (for [d SERVICES_PY]
    (sh "python -m pipenv requirements > requirements.txt" :cwd d :shell True)))

(defn generate-requirements-service [service]
  (sh "python -m pipenv requirements > requirements.txt" :cwd (join "services/py" service) :shell True))

(defn setup-shared-python []
  (sh ["python" "-m" "pipenv" "install" "--dev"] :cwd "shared/py"))

(defn setup-shared-python-quick []
  (generate-python-shared-requirements)
  (sh ["python" "-m" "pip" "install" "--user" "-r" "requirements.txt"] :cwd "shared/py"))

(defn setup-python-services-quick []
  (generate-python-services-requirements)
  (for [d SERVICES_PY]
    (sh ["python" "-m" "pip" "install" "--user" "-r" "requirements.txt"] :cwd d)))

(defn setup-python []
  (setup-pipenv)
  (setup-python-services)
  (setup-shared-python))

(defn setup-python-quick []
  (setup-pipenv)
  (setup-python-services-quick)
  (setup-shared-python-quick))

(defn build-python []
  (print "No build step for Python services"))

(defn clean-python []
  (print "Cleaning Python artifacts..."))

(defn setup-python-service [service]
  (print (.format "Setting up Python service: {}" service))
  (sh "python -m pipenv sync --dev" :cwd (join "services/py" service) :shell True))

(defn test-python-service [service]
  (print (.format "Running tests for Python service: {}" service))
  (sh "python -m pipenv run pytest tests/" :cwd (join "services/py" service) :shell True))

(defn test-python-services []
  (run-dirs SERVICES_PY "echo 'Running tests in $PWD...' && python -m pipenv run pytest tests/" :shell True))

(defn test-shared-python []
  (sh "python -m pipenv run pytest tests/" :cwd "shared/py" :shell True))

(defn test-python []
  (test-python-services)
  (test-shared-python))

(defn coverage-python-service [service]
  (print (.format "Running coverage for Python service: {}" service))
  (sh "python -m pipenv run pytest tests/ --cov=./ --cov-report=xml --cov-report=term" :cwd (join "services/py" service) :shell True))

(defn coverage-python-services []
  (run-dirs SERVICES_PY "echo 'Generating coverage in $PWD...' && python -m pipenv run pytest tests/ --cov=./ --cov-report=xml --cov-report=term" :shell True))

(defn coverage-shared-python []
  (sh "python -m pipenv run pytest tests/ --cov=./ --cov-report=xml --cov-report=term" :cwd "shared/py" :shell True))

(defn coverage-python []
  (coverage-python-services)
  (coverage-shared-python))

(defn lint-python-service [service]
  (print (.format "Linting Python service: {}" service))
  (sh ["flake8" (join "services" "py" service)]))

(defn lint-python []
  (sh ["flake8" "services/" "shared/py/"]))

(defn format-python []
  (sh ["black" "services/" "shared/py/"]))

(defn typecheck-python []
  (sh ["mypy" "services/" "shared/py/"]))

;; JavaScript helpers ---------------------------------------------------------
(defn lint-js-service [service]
  (print (.format "Linting JS service: {}" service))
  (sh "npx eslint --ext .js,.ts . " :cwd (join "services/js" service) :shell True))

(defn lint-js []
  (run-dirs SERVICES_JS "npx eslint --ext .js,.ts . " :shell True))

(defn format-js []
  (run-dirs SERVICES_JS "npx prettier --write ." :shell True))

(defn setup-js-service [service]
  (print (.format "Setting up JS service: {}" service))
  (sh "npm install --no-package-lock" :cwd (join "services/js" service) :shell True))

(defn setup-js []
  (print "Setting up JavaScript services...")
  (run-dirs SERVICES_JS "npm install --no-package-lock" :shell True))

(defn test-js-service [service]
  (print (.format "Running tests for JS service: {}" service))
  (sh "npm test" :cwd (join "services/js" service) :shell True))

(defn test-js-services []
  (run-dirs SERVICES_JS "echo 'Running tests in $PWD...' && npm test" :shell True))

(defn test-js []
  (test-js-services))

(defn coverage-js-service [service]
  (print (.format "Running coverage for JS service: {}" service))
  (sh "npm run coverage && npx c8 report -r lcov" :cwd (join "services/js" service) :shell True))

(defn coverage-js-services []
  (run-dirs SERVICES_JS "npm run coverage && npx c8 report -r lcov" :shell True))

(defn coverage-js []
  (coverage-js-services))

(defn clean-js []
  (sh "rm -rf shared/js/*" :shell True))

(defn build-js []
  (print "No build step for JavaScript services"))

;; TypeScript helpers ---------------------------------------------------------
(defn lint-ts-service [service]
  (print (.format "Linting TS service: {}" service))
  (sh "npx eslint  --ext .js,.ts . " :cwd (join "services/ts" service) :shell True))

(defn lint-ts []
  (for [d (list (filter has-eslint-config SERVICES_TS))]
    (try
      (sh "npx eslint . --no-warn-ignored --ext .js,.ts" :cwd d :shell True)
      (except [subprocess.CalledProcessError]
        (print (.format "Skipping {} (eslint failed)" d))))))

(defn format-ts []
  (run-dirs SERVICES_TS "npx prettier --write ." :shell True))

(defn typecheck-ts []
  (run-dirs SERVICES_TS "npx tsc --noEmit" :shell True))

(defn setup-ts-service [service]
  (print (.format "Setting up TS service: {}" service))
  (sh "npm install --no-package-lock" :cwd (join "services/ts" service) :shell True))

(defn setup-ts []
  (print "Setting up TypeScript services...")
  (run-dirs SERVICES_TS "npm install" :shell True))

(defn test-ts-service [service]
  (print (.format "Running tests for TS service: {}" service))
  (sh "npm test" :cwd (join "services/ts" service) :shell True))

(defn test-ts-services []
  (run-dirs SERVICES_TS "echo 'Running tests in $PWD...' && npm test" :shell True))

(defn test-ts []
  (test-ts-services))

(defn coverage-ts-service [service]
  (print (.format "Running coverage for TS service: {}" service))
  (sh "npm run coverage && npx c8 report -r lcov" :cwd (join "services/ts" service) :shell True))

(defn coverage-ts-services []
  (run-dirs SERVICES_TS "npm run coverage && npx c8 report -r lcov" :shell True))

(defn coverage-ts []
  (coverage-ts-services))

(defn clean-ts []
  (run-dirs SERVICES_TS "npm run clean >/dev/null" :shell True)
  (sh "rm -rf shared/js/*" :shell True))

(defn build-ts []
  (print "Transpiling TS to JS... (if we had any shared ts modules)")
  (run-dirs SERVICES_TS "npm run build" :shell True))

;; Sibilant ------------------------------------------------------------------
(defn build-sibilant []
  (print "Transpiling Sibilant to JS... (not ready)"))

(defn setup-sibilant []
  (print "Setting up Sibilant services..."))

(defn setup-sibilant-service [service]
  (print (.format "Setting up Sibilant service: {}" service))
  (sh "npx sibilant --install" :cwd (join "services" service) :shell True))

;; Hy ------------------------------------------------------------------------
(defn setup-hy []
  (print "Setting up Hy services..."))

(defn setup-hy-service [service]
  (print (.format "Setting up Hy service: {}" service))
  (sh ["pipenv" "install" "--dev"] :cwd (join "services" service)))

;; Root targets ---------------------------------------------------------------
(defn build []
  (build-js)
  (build-ts))

(defn clean []
  (clean-js)
  (clean-ts))

(defn lint []
  (lint-python)
  (lint-js)
  (lint-ts))

(defn test []
  (test-python)
  (test-js)
  (test-ts))

(defn format []
  (format-python)
  (format-js)
  (format-ts))

(defn coverage []
  (coverage-python)
  (coverage-js)
  (coverage-ts))

(defn setup []
  (print "Setting up all services...")
  (setup-python)
  (setup-js)
  (setup-ts)
    (setup-hy)
    (setup-sibilant)
    (when (not (shutil.which "pm2"))
      (sh ["npm" "install" "-g" "pm2"]))
    )

(defn setup-quick []
  (print "Quick setup using requirements.txt files...")
  (setup-python-quick)
  (setup-js)
  (setup-ts)
    (setup-hy)
    (setup-sibilant)
    (when (not (shutil.which "pm2"))
      (sh ["npm" "install" "-g" "pm2"]))
    )

(defn install []
  (try
    (setup-quick)
    (except [Exception]
      (print "setup-quick failed; falling back to full setup")
      (setup))))

(defn install-gha-artifacts []
  "Download and install build artifacts from the latest GitHub Actions run."
  (let [artifact-dir "gh-actions-artifacts"]
    (print "Downloading GitHub Actions artifacts...")
    (sh (.format "gh run download -R riatzukiza/promethean -n dist -D {}" artifact-dir) :shell True)
    (for [wheel (glob.glob (join artifact-dir "*.whl"))]
      (sh ["pip" "install" wheel]))
    (print "GitHub Actions artifact installation complete")))

(defn system-deps []
  (sh "sudo apt-get update && sudo apt-get install -y libsndfile1" :shell True))

(defn start []
  (sh ["pm2" "start" "ecosystem.config.js"]))

(defn stop []
  (sh "pm2 stop ecosystem.config.js || true" :shell True))

(defn start-service [service]
  (sh ["pm2" "start" "ecosystem.config.js" "--only" service]))

(defn stop-service [service]
  (sh (.format "pm2 stop {} || true" service) :shell True))

(defn board-sync []
  (sh ["python" "scripts/github_board_sync.py"]))

(defn kanban-from-tasks []
  (sh "python scripts/hashtags_to_kanban.py > docs/agile/boards/kanban.md" :shell True))

(defn kanban-to-hashtags []
  (sh ["python" "scripts/kanban_to_hashtags.py"]))

(defn kanban-to-issues []
  (sh ["python" "scripts/kanban_to_issues.py"]))

(defn simulate-ci []
  (sh ["python" "scripts/simulate_ci.py"]))

(defn docker-build []
  (sh ["docker" "compose" "build"]))

(defn docker-up []
  (sh ["docker" "compose" "up" "-d"]))

(defn docker-down []
  (sh ["docker" "compose" "down"]))

(defn generate-python-requirements []
  (generate-python-services-requirements)
  (generate-python-shared-requirements))

(defn generate-requirements []
  (generate-python-requirements))

;; Dispatch -------------------------------------------------------------------
(setv commands
      {
       "all" build
       "build" build
       "clean" clean
       "lint" lint
       "format" format
       "test" test
       "coverage" coverage
       "setup" setup
       "setup-quick" setup-quick
       "install" install
       "install-gha-artifacts" install-gha-artifacts
       "system-deps" system-deps
       "start" start
       "stop" stop
       "board-sync" board-sync
       "kanban-from-tasks" kanban-from-tasks
       "kanban-to-hashtags" kanban-to-hashtags
       "kanban-to-issues" kanban-to-issues
       "simulate-ci" simulate-ci
       "docker-build" docker-build
       "docker-up" docker-up
       "docker-down" docker-down
       "setup-hy" setup-hy
       "lint-python" lint-python
       "lint-js" lint-js
       "lint-ts" lint-ts
       "format-python" format-python
       "format-js" format-js
       "format-ts" format-ts
       "test-python" test-python
       "test-js" test-js
       "test-ts" test-ts
       "coverage-python" coverage-python
       "coverage-js" coverage-js
       "coverage-ts" coverage-ts
       "build-js" build-js
       "build-ts" build-ts
       "clean-js" clean-js
       "clean-ts" clean-ts
       "setup-python" setup-python
       "setup-js" setup-js
       "setup-ts" setup-ts
       
       "typecheck-python" typecheck-python
       "typecheck-ts" typecheck-ts
       "setup-python-quick" setup-python-quick
       "generate-requirements" generate-requirements
       "setup-pipenv" setup-pipenv
       })

(setv patterns [
  ["setup-python-service-" setup-python-service]
  ["test-python-service-" test-python-service]
  ["coverage-python-service-" coverage-python-service]
  ["lint-python-service-" lint-python-service]
  ["setup-js-service-" setup-js-service]
  ["lint-js-service-" lint-js-service]
  ["test-js-service-" test-js-service]
  ["coverage-js-service-" coverage-js-service]
  ["setup-ts-service-" setup-ts-service]
  ["lint-ts-service-" lint-ts-service]
  ["test-ts-service-" test-ts-service]
  ["coverage-ts-service-" coverage-ts-service]
  ["setup-hy-service-" setup-hy-service]
  ["setup-sibilant-service-" setup-sibilant-service]
  ["start-" start-service]
  ["stop-" stop-service]
  ["generate-requirements-service-" generate-requirements-service]
])

(defn main []
  (if (< (len sys.argv) 2)
      (do (print "No command provided") (sys.exit 1))
      (let [cmd (get sys.argv 1)]
        (if (in cmd commands)
            ((get commands cmd))
            (do
              (setv handled False)
              (for [[prefix func] patterns]
                (when (.startswith cmd prefix)
                  (func (.replace cmd prefix "" 1))
                  (setv handled True)
                  (break)))
              (unless handled
                (print (.format "Unknown command: {}" cmd))
                (sys.exit 1)))))))

(when (= __name__ "__main__")
  (main))
