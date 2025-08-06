(import shutil)
(import util [sh run-dirs])
(import dotenv [load-dotenv])
(import os.path [isdir join])
(import platform)
(load-dotenv)
(require macros [ define-service-list defn-cmd ])

(defn define-patterns [#* groups]
      (lfor [lang commands] groups
            [action fn] commands
            [(+ action "-" lang "-service-") fn]))
(import glob)

(import os.path [isdir])
(import sys)
(defmacro unless [ cond #* body]
  `(when (not ~cond)
     ~@body
     ))

;; -----------------------------------------------------------------------------
;; Service List Definitions
;; -----------------------------------------------------------------------------


(define-service-list SERVICES_PY "services/py")
(define-service-list SERVICES_JS "services/js")
(define-service-list SERVICES_TS "services/ts")
(setv commands {})

(defn has-eslint-config [d]
  (> (+ (len (glob.glob (join d ".eslintrc*")))
        (len (glob.glob (join d "eslint.config.*")))) 0))

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
  (sh "python -m pipenv requirements | grep -Ev '^nvidia-[a-z0-9\\-]+-cu[0-9]+(\\.[0-9]+)?' > requirements.txt" :cwd "shared/py" :shell True))

(defn-cmd generate-python-services-requirements []
  (print "Generating requirements.txt for Python services...")
  (for [d SERVICES_PY]
       (sh "python -m pipenv requirements | grep -Ev '^nvidia-[a-z0-9\\-]+-cu[0-9]+(\\.[0-9]+)?' > requirements.txt" :cwd d :shell True)))

(defn-cmd generate-requirements-service [service]
  (sh "python -m pipenv requirements | grep -Ev '^nvidia-[a-z0-9\\-]+-cu[0-9]+(\\.[0-9]+)?' > requirements.txt" :cwd (join "services/py" service) :shell True))

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

(defn-cmd test-hy-service [service]
  (print (.format "Running tests for Hy service: {}" service))
  (sh "hy -m pytest tests/" :cwd (join "services/hy" service) :shell True))

(defn-cmd test-hy-services []
  (run-dirs SERVICES_HY "echo 'Running tests in $PWD...' && hy -m pytest tests/" :shell True))

(defn-cmd test-hy []
  (test-hy-services))


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

(defn-cmd compile-hy []
  (sh ["python" "scripts/compile_hy.py"]))

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

(setv patterns (define-patterns
  ["python"
   [["setup" setup-python-service]
    ["setup-quick-service" (fn [service]
                             (generate-requirements-service service)
                             (sh ["python" "-m" "pip" "install" "--user" "-r" "requirements.txt"] :cwd (join "services/py" service)))]
    ["setup-quick-shared" setup-shared-python-quick]
    ["test" test-python-service]
    ["test-shared" test-shared-python]
    ["coverage" coverage-python-service]
    ["coverage-shared" coverage-shared-python]
    ["test-quick-service" test-python-service] ;; same as normal test
    ["test-quick-shared" test-shared-python]   ;; no change in quick variant
    ["coverage-quick-service" coverage-python-service]
    ["coverage-quick-shared" coverage-shared-python]]]

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

(defn-cmd generate-makefile []
  (setv header
        "# Auto-generated Makefile. DO NOT EDIT MANUALLY.\n\n"
        command-section
        "COMMANDS := \\\n  all build clean lint format test setup setup-quick install install-mongodb \\\n  install-gha-artifacts system-deps start stop \\\n  start-tts start-stt stop-tts stop-stt \\\n  board-sync kanban-from-tasks kanban-to-hashtags kanban-to-issues \\\n  coverage coverage-python coverage-js coverage-ts simulate-ci \\\n  docker-build docker-up docker-down \\\n  typecheck-python test-e2e typecheck-ts build-ts build-js \\\n  setup-pipenv compile-hy \\\n  setup-python setup-python-quick setup-js setup-ts setup-hy \\\n  test-python test-js test-ts test-hy test-integration \\\n  generate-requirements generate-python-services-requirements generate-makefile\n\n")

  ;; Group rules by prefix for PHONY
  (setv phony-lines []
        rule-lines [])

  (for [[prefix func] patterns]
    (when (not (= prefix ""))
      (setv target (.replace prefix "%" "%"))
      (unless (in target phony-lines)
        (+= phony-lines [target])
        (+= rule-lines [(+ target "%:\n\t@hy Makefile.hy $@")])))
  )

  (setv static-phony ".PHONY: \\\n  $(COMMANDS) \\\n  "
        phony-block (.join " \\\n  " phony-lines)
        rules (.join "\n\n" rule-lines))

  (with [f (open "Makefile" "w")]
    (.write f header)
    (.write f command-section)
    (.write f static-phony)
    (.write f phony-block)
    (.write f "\n\n")
    (.write f "$(COMMANDS):\n\t@hy Makefile.hy $@\n\n")
    (.write f rules)
    (.write f "\n")))



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
  ;; (print (str (. commands [0] [0])))
  (print "patterns" patterns)
  (main))
