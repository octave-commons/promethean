(defn venv-site-packages [svc-dir]
  ;; glob .venv/lib/python*/site-packages
  (let [pattern (join svc-dir ".venv" "lib" "python*" "site-packages")
       hits (glob.glob pattern)]
       (if hits (get hits 0) None)))

(defn uv-venv [d]
  (sh "UV_VENV_IN_PROJECT=1 uv venv" :cwd d :shell True))
(defn uv-compile [d]
  (let [infile (reqs-file-for d)
       lockf  (lockfile-for d)]
       (if (= infile "requirements.gpu.in")
           (sh (.format
                "UV_VENV_IN_PROJECT=1 uv pip compile --index {} {} -o {} --index-strategy unsafe-best-match"
                TORCH_INDEX infile lockf)
               :cwd d :shell True)
           (sh (.format
                "UV_VENV_IN_PROJECT=1 uv pip compile --emit-index-url {} -o {}"
                infile lockf)
               :cwd d :shell True))))

(defn uv-sync [d]
  (let [lockf (lockfile-for d)]
       (sh (.format "UV_VENV_IN_PROJECT=1 uv pip sync {}" lockf) :cwd d :shell True)))

(defn inject-sitecustomize-into-venv [svc-dir]
  (let [src (join svc-dir "sitecustomize.py")
       dst-base (venv-site-packages svc-dir)]
       (when (and dst-base (isfile src))
         (copyfile src (join dst-base "sitecustomize.py"))
         (print "sitecustomize →" dst-base))))

(defn gpu-build? [svc-dir]
  (= (reqs-file-for svc-dir) "requirements.gpu.in"))

(defn cuda-probe [svc-dir]
  (when (gpu-build? svc-dir)
    (sh
     "UV_VENV_IN_PROJECT=1 uv run python - <<'PY'\nimport ctypes, sys\nlibs=('libcusparseLt.so.0','libcusparse.so.12','libcublasLt.so.12','libcublas.so.12','libcudnn.so.9')\nok=True\nfor n in libs:\n  try:\n    ctypes.CDLL(n); print('OK', n)\n  except OSError as e:\n    ok=False; print('MISS', n, '->', e)\nsys.exit(0 if ok else 1)\nPY"
     :cwd svc-dir :shell True)))

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
  (global TORCH-FLAVOR REQS-IN TORCH_CHANNEL TORCH_INDEX)
  (os.environ.__setitem__ "PROMETHEAN_TORCH" "cpu")
  (setv TORCH-FLAVOR "cpu")
  (setv REQS-IN "requirements.cpu.in")

  (setv TORCH_CHANNEL "cpu")
  (setv TORCH_INDEX (.format "https://download.pytorch.org/whl/{}" TORCH_CHANNEL))
  (for [d SERVICES_PY] (uv-compile d))
  (uv-compile "./shared/py"))

(defn-cmd lock-python-gpu []
  (global TORCH-FLAVOR REQS-IN TORCH_CHANNEL TORCH_INDEX)
  (os.environ.__setitem__ "PROMETHEAN_TORCH" "cu129")  ; or your default

  (setv TORCH-FLAVOR "cu129")
  (setv REQS-IN "requirements.gpu.in")
  (setv TORCH_CHANNEL "cu129")
  (setv TORCH_INDEX (.format "https://download.pytorch.org/whl/{}" TORCH_CHANNEL))

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
  (sh ["black"  "shared/py/"])
  )

(defn-cmd typecheck-python []
  (sh ["mypy"]))
