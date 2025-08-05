(import shutil)
(import util [sh run-dirs])
(require macros [define-patterns define-service-list defn-cmd list-comp])

(import glob)

(import os.path [isdir])
(import sys)


;; -----------------------------------------------------------------------------
;; Service List Definitions
;; -----------------------------------------------------------------------------


(define-service-list SERVICES_PY "services/py")
(define-service-list SERVICES_JS "services/js")
(define-service-list SERVICES_TS "services/ts")
(setv commands [])


(defn-cmd setup-python-services []
  (print "Setting up Python services...")
  (run-dirs SERVICES_PY "python -m pipenv sync --dev" :shell True))


;; Python helpers --------------------------------------------------------------
(defn-cmd setup-pipenv []
  (if (shutil.which "pipenv")
      (print "pipenv already installed, skipping")
      (do
        (sh ["python" "-m" "pip" "install" "--upgrade" "pip"])
        (print "installing pipenv")
        (sh ["python" "-m" "pip" "install" "pipenv"]))))

(defn-cmd generate-python-shared-requirements []
  (sh "python -m pipenv requirements > requirements.txt" :cwd "shared/py" :shell True))

(defn-cmd generate-python-services-requirements []
  (print "Generating requirements.txt for Python services...")
  (for [d SERVICES_PY]
    (sh "python -m pipenv requirements > requirements.txt" :cwd d :shell True)))

(defn-cmd generate-requirements-service [service]
  (sh "python -m pipenv requirements > requirements.txt" :cwd (join "services/py" service) :shell True))

(defn-cmd setup-shared-python []
  (sh ["python" "-m" "pipenv" "install" "--dev"] :cwd "shared/py"))

(defn-cmd setup-shared-python-quick []
  (generate-python-shared-requirements)
  (sh ["python" "-m" "pip" "install" "--user" "-r" "requirements.txt"] :cwd "shared/py"))

(defn-cmd setup-python-services-quick []
  (generate-python-services-requirements)
  (for [d SERVICES_PY]
    (sh ["python" "-m" "pip" "install" "--user" "-r" "requirements.txt"] :cwd d)))

(defn-cmd setup-python []
  (setup-pipenv)
  (setup-python-services)
  (setup-shared-python))

(defn-cmd setup-python-quick []
  (setup-pipenv)
  (setup-python-services-quick)
  (setup-shared-python-quick))

(defn-cmd build-python []
  (print "No build step for Python services"))

(defn-cmd clean-python []
  (print "Cleaning Python artifacts..."))

(defn-cmd setup-python-service [service]
  (print (.format "Setting up Python service: {}" service))
  (sh "python -m pipenv sync --dev" :cwd (join "services/py" service) :shell True))

(defn-cmd test-python-service [service]
  (print (.format "Running tests for Python service: {}" service))
  (sh "python -m pipenv run pytest tests/" :cwd (join "services/py" service) :shell True))

(defn-cmd test-python-services []
  (run-dirs SERVICES_PY "echo 'Running tests in $PWD...' && python -m pipenv run pytest tests/" :shell True))

(defn-cmd test-shared-python []
  (sh "python -m pipenv run pytest tests/" :cwd "shared/py" :shell True))

(defn-cmd test-python []
  (test-python-services)
  (test-shared-python))

(defn-cmd coverage-python-service [service]
  (print (.format "Running coverage for Python service: {}" service))
  (sh "python -m pipenv run pytest tests/ --cov=./ --cov-report=xml --cov-report=term" :cwd (join "services/py" service) :shell True))

(defn-cmd coverage-python-services []
  (run-dirs SERVICES_PY "echo 'Generating coverage in $PWD...' && python -m pipenv run pytest tests/ --cov=./ --cov-report=xml --cov-report=term" :shell True))

(defn-cmd coverage-shared-python []
  (sh "python -m pipenv run pytest tests/ --cov=./ --cov-report=xml --cov-report=term" :cwd "shared/py" :shell True))

(defn-cmd coverage-python []
  (coverage-python-services)
  (coverage-shared-python))

(defn-cmd lint-python-service [service]
  (print (.format "Linting Python service: {}" service))
  (sh ["flake8" (join "services" "py" service)]))

(defn-cmd lint-python []
  (sh ["flake8" "services/" "shared/py/"]))

(defn-cmd format-python []
  (sh ["black" "services/" "shared/py/"]))

(defn-cmd typecheck-python []
  (sh ["mypy" "services/" "shared/py/"]))

;; JavaScript helpers ---------------------------------------------------------
(defn-cmd lint-js-service [service]
  (print (.format "Linting JS service: {}" service))
  (sh "npx eslint --ext .js,.ts . " :cwd (join "services/js" service) :shell True))

(defn-cmd lint-js []
  (run-dirs SERVICES_JS "npx eslint --ext .js,.ts . " :shell True))

(defn-cmd format-js []
  (run-dirs SERVICES_JS "npx prettier --write ." :shell True))

(defn-cmd setup-js-service [service]
  (print (.format "Setting up JS service: {}" service))
  (sh "npm install --no-package-lock" :cwd (join "services/js" service) :shell True))

(defn-cmd setup-js []
  (print "Setting up JavaScript services...")
  (run-dirs SERVICES_JS "npm install --no-package-lock" :shell True))

(defn-cmd test-js-service [service]
  (print (.format "Running tests for JS service: {}" service))
  (sh "npm test" :cwd (join "services/js" service) :shell True))

(defn-cmd test-js-services []
  (run-dirs SERVICES_JS "echo 'Running tests in $PWD...' && npm test" :shell True))

(defn-cmd test-js []
  (test-js-services))

(defn-cmd coverage-js-service [service]
  (print (.format "Running coverage for JS service: {}" service))
  (sh "npm run coverage && npx c8 report -r lcov" :cwd (join "services/js" service) :shell True))

(defn-cmd coverage-js-services []
  (run-dirs SERVICES_JS "npm run coverage && npx c8 report -r lcov" :shell True))

(defn-cmd coverage-js []
  (coverage-js-services))

(defn-cmd clean-js []
  (sh "rm -rf shared/js/*" :shell True))

(defn-cmd build-js []
  (print "No build step for JavaScript services"))

;; TypeScript helpers ---------------------------------------------------------
(defn-cmd lint-ts-service [service]
  (print (.format "Linting TS service: {}" service))
  (sh "npx eslint  --ext .js,.ts . " :cwd (join "services/ts" service) :shell True))

(defn-cmd lint-ts []
  (run-dirs SERVICES_TS "npx eslint . --no-warn-ignored --ext .js,.ts" :shell True))

(defn-cmd format-ts []
  (run-dirs SERVICES_TS "npx prettier --write ." :shell True))

(defn-cmd typecheck-ts []
  (run-dirs SERVICES_TS "npx tsc --noEmit" :shell True))

(defn-cmd setup-ts-service [service]
  (print (.format "Setting up TS service: {}" service))
  (sh "npm install --no-package-lock" :cwd (join "services/ts" service) :shell True))

(defn-cmd setup-ts []
  (print "Setting up TypeScript services...")
  (run-dirs SERVICES_TS "npm install" :shell True))

(defn-cmd test-ts-service [service]
  (print (.format "Running tests for TS service: {}" service))
  (sh "npm test" :cwd (join "services/ts" service) :shell True))

(defn-cmd test-ts-services []
  (run-dirs SERVICES_TS "echo 'Running tests in $PWD...' && npm test" :shell True))

(defn-cmd test-ts []
  (test-ts-services))

(defn-cmd coverage-ts-service [service]
  (print (.format "Running coverage for TS service: {}" service))
  (sh "npm run coverage && npx c8 report -r lcov" :cwd (join "services/ts" service) :shell True))

(defn-cmd coverage-ts-services []
  (run-dirs SERVICES_TS "npm run coverage && npx c8 report -r lcov" :shell True))

(defn-cmd coverage-ts []
  (coverage-ts-services))

(defn-cmd clean-ts []
  (run-dirs SERVICES_TS "npm run clean >/dev/null" :shell True)
  (sh "rm -rf shared/js/*" :shell True))

(defn-cmd build-ts []
  (print "Transpiling TS to JS... (if we had any shared ts modules)")
  (run-dirs SERVICES_TS "npm run build" :shell True))

;; Sibilant ------------------------------------------------------------------
(defn-cmd build-sibilant []
  (print "Transpiling Sibilant to JS... (not ready)"))

(defn-cmd setup-sibilant []
  (print "Setting up Sibilant services..."))

(defn-cmd setup-sibilant-service [service]
  (print (.format "Setting up Sibilant service: {}" service))
  (sh "npx sibilant --install" :cwd (join "services" service) :shell True))

;; Hy ------------------------------------------------------------------------
(defn-cmd setup-hy []
  (print "Setting up Hy services..."))

(defn-cmd setup-hy-service [service]
  (print (.format "Setting up Hy service: {}" service))
  (sh ["pipenv" "install" "--dev"] :cwd (join "services" service)))

;; Root targets ---------------------------------------------------------------
(defn-cmd build []
  (build-js)
  (build-ts))

(defn-cmd clean []
  (clean-js)
  (clean-ts))

(defn-cmd lint []
  (lint-python)
  (lint-js)
  (lint-ts))

(defn-cmd test []
  (test-python)
  (test-js)
  (test-ts))

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
    (setup-quick)
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

(defn-cmd system-deps []
  (sh "sudo apt-get update && sudo apt-get install -y libsndfile1" :shell True))

(defn-cmd start []
  (sh ["pm2" "start" "ecosystem.config.js"]))

(defn-cmd stop []
  (sh "pm2 stop ecosystem.config.js || true" :shell True))

(defn-cmd start-service [service]
  (sh ["pm2" "start" "ecosystem.config.js" "--only" service]))

(defn-cmd stop-service [service]
  (sh (.format "pm2 stop {} || true" service) :shell True))

(defn-cmd board-sync []
  (sh ["python" "scripts/github_board_sync.py"]))

(defn-cmd kanban-from-tasks []
  (sh "python scripts/hashtags_to_kanban.py > docs/agile/boards/kanban.md" :shell True))

(defn-cmd kanban-to-hashtags []
  (sh ["python" "scripts/kanban_to_hashtags.py"]))

(defn-cmd kanban-to-issues []
  (sh ["python" "scripts/kanban_to_issues.py"]))

(defn-cmd simulate-ci []
  (sh ["python" "scripts/simulate_ci.py"]))

(defn-cmd docker-build []
  (sh ["docker" "compose" "build"]))

(defn-cmd docker-up []
  (sh ["docker" "compose" "up" "-d"]))

(defn-cmd docker-down []
  (sh ["docker" "compose" "down"]))

(defn-cmd generate-python-requirements []
  (generate-python-services-requirements)
  (generate-python-shared-requirements))

(defn-cmd generate-requirements []
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


(define-patterns
  ["python"
   [["setup" setup-python-service]
    ["test" test-python-service]
    ["coverage" coverage-python-service]
    ["lint" lint-python-service]]]

  ["js"
   [["setup" setup-js-service]
    ["test" test-js-service]
    ["coverage" coverage-js-service]
    ["lint" lint-js-service]]]

  ["ts"
   [["setup" setup-ts-service]
    ["test" test-ts-service]
    ["coverage" coverage-ts-service]
    ["lint" lint-ts-service]]]

  ["hy"
   [["setup" setup-hy-service]]]

  ["sibilant"
   [["setup" setup-sibilant-service]]]

  [""
   [["start" start-service]
    ["stop" stop-service]
    ["generate-requirements" generate-requirements-service]]])

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
