(require mk.macros [defn-cmd])
(import mk.configs [SERVICES-PY])
(import mk.util [uv-env uv-compile ])


(defn-cmd setup-python-services []
  (print "Setting up Python services (uv preferred)...")
  (for [d SERVICES_PY]
       (if (has-uv)
           (do
            (uv-venv d)
            (uv-compile d)
             (uv-sync d)
             (inject-sitecustomize-into-venv d))
           (do
            (print "uv not found → falling back to pipenv in" d)
            (sh "python -m pipenv sync --dev" :cwd d :shell True)))))

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
(defn-cmd lock-python-cpu []
  (os.environ.__setitem__ "PROMETHEAN_TORCH" "cpu")
  (for [d SERVICES_PY] (uv-compile d))
  (uv-compile "./shared/py"))

(defn-cmd lock-python-gpu []
  (os.environ.__setitem__ "PROMETHEAN_TORCH" "cu129")  ; or your default
  (for [d SERVICES_PY] (uv-compile d))
  (uv-compile "./shared/py"))

(defn-cmd setup-shared-python-quick []
  (setv d "./shared/py/")
  (if (has-uv)
      (do
       (uv-venv d)
       ;; quick path = trust existing lock if present; else compile it
       (if (has-file* d (lockfile-for d))
           (uv-sync d)
           (do (uv-compile d) (uv-sync d)))
        (inject-sitecustomize-into-venv d))
      (do
       (print "uv not found → pip --user fallback in" d)
       (generate-requirements-service (.split (os.path.relpath d "services/py") "/") 0)
        (sh ["python" "-m" "pip" "install" "--user" "-r" "requirements.txt"] :cwd d))))

(defn-cmd setup-python-services-quick []
  (print "Quick Python setup (uv preferred)...")
  (for [d SERVICES_PY]
       (if (has-uv)
           (do
            (uv-venv d)
            ;; quick path = trust existing lock if present; else compile it
            (if (has-file* d (lockfile-for d))
                (uv-sync d)
                (do (uv-compile d) (uv-sync d)))
             (inject-sitecustomize-into-venv d))
           (do
            (print "uv not found → pip --user fallback in" d)
            (generate-requirements-service (.split (os.path.relpath d "services/py") "/") 0)
             (sh ["python" "-m" "pip" "install" "--user" "-r" "requirements.txt"] :cwd d)))))

(defn-cmd setup-python []
  (setup-python-services)
  (setup-shared-python))

(defn-cmd setup-python-quick []
  (setup-python-services-quick)
  (setup-shared-python-quick))

(defn-cmd build-python []
  (print "No build step for Python services"))

(defn-cmd clean-python []
  (print "Cleaning Python artifacts (git-aware)...")
  (for [d SERVICES_PY]
    (safe-rm-globs d [".venv" "__pycache__" ".pytest_cache" "*.pyc" "requirements.*.lock"]))
  (safe-rm-globs "shared/py" [".venv" "__pycache__" ".pytest_cache" "*.pyc" "requirements.*.lock"]))

(defn-cmd setup-python-service [service]
  (print (.format "Setting up Python service: {}" service))
  (if (os.environ.get "SIMULATE_CI")
      (print "Skipping pipenv sync during CI simulation")
      (sh "python -m pipenv sync --dev" :cwd (join "services/py" service) :shell True)))

(defn-cmd test-python-service [service]
  (print (.format "Running tests for Python service: {}" service))
  ;; run tests directly with the system Python environment
  (sh "if [ -d tests ]; then SKIP_NETWORK_TESTS=1 python -m pytest tests/; else echo 'no tests'; fi" :cwd (join "services/py" service) :shell True))

(defn-cmd test-python-services []
  ;; execute each service's tests without relying on pipenv
  (run-dirs SERVICES_PY "echo 'Running tests in $PWD...' && if [ -d tests ]; then SKIP_NETWORK_TESTS=1 python -m pytest tests/; else echo 'no tests'; fi" :shell True))

(defn-cmd test-shared-python []
  ;; shared python tests use the same direct invocation
  (sh "python -m pytest tests/" :cwd "shared/py" :shell True))

(defn-cmd test-python []
  (test-python-services)
  (test-shared-python))
(defn-cmd coverage-python-service [service]
  (print (.format "Running coverage for Python service: {}" service))
  ;; Run with coverage only if pytest-cov is available in the env
  (sh
   "python -m pipenv run bash -lc '\nset -e\nif python - <<\"PY\"\nimport importlib.util, sys\nsys.exit(0 if importlib.util.find_spec(\"pytest_cov\") else 1)\nPY\nthen\n  echo \"[coverage] pytest-cov found → using coverage flags\"\n  pytest tests/ --cov=./ --cov-report=xml --cov-report=term\nelse\n  echo \"[coverage] pytest-cov not found → running tests without coverage\"\n  pytest tests/\nfi'"
   :cwd (join "services/py" service) :shell True))

(defn-cmd coverage-python-services []
  (run-dirs SERVICES_PY "echo 'Generating coverage in $PWD...' && python -m pipenv run bash -lc '\nset -e\nif python - <<\"PY\"\nimport importlib.util, sys\nsys.exit(0 if importlib.util.find_spec(\"pytest_cov\") else 1)\nPY\nthen\n  echo \"[coverage] pytest-cov found → using coverage flags\"\n  pytest tests/ --cov=./ --cov-report=xml --cov-report=term\nelse\n  echo \"[coverage] pytest-cov not found → running tests without coverage\"\n  pytest tests/\nfi'" :shell True))

(defn-cmd coverage-shared-python []
  (sh
   "python -m pipenv run bash -lc '\nset -e\nif python - <<\"PY\"\nimport importlib.util, sys\nsys.exit(0 if importlib.util.find_spec(\"pytest_cov\") else 1)\nPY\nthen\n  echo \"[coverage] pytest-cov found → using coverage flags\"\n  pytest tests/ --cov=./ --cov-report=xml --cov-report=term\nelse\n  echo \"[coverage] pytest-cov not found → running tests without coverage\"\n  pytest tests/\nfi'"
   :cwd "shared/py" :shell True))

(defn-cmd coverage-python []
  (coverage-python-services)
  (coverage-shared-python))

(defn-cmd lint-python-service [service]
  (print (.format "Linting Python service: {}" service))
  (sh ["flake8" (join "services" "py" service)]))

(defn-cmd lint-python []
  (sh ["flake8" "services/py" "shared/py/"]))

(defn-cmd format-python []
  (sh ["black" "services/py" "shared/py/"])
  (sh ["black"  "shared/py/"]))

(defn-cmd typecheck-python []
  (sh ["mypy"]))

(defn-cmd generate-python-requirements []
  (generate-python-services-requirements)
  (generate-python-shared-requirements))

(defn-cmd generate-requirements []
  (generate-python-requirements))