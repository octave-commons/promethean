(require macros [ define-service-list defn-cmd ])

(import shutil [which])
(import util [sh run-dirs safe-rm-globs])
(import dotenv [load-dotenv])
(import os.path [isdir isfile join basename])
(import shutil [copyfile])

(import shutil)
(import platform)
(import glob)
(import os)
(import sys)

(load-dotenv)

(defmacro def [name value] `(setv ~name ~value))

(defmacro unless [ cond #* body] `(when (not ~cond) ~@body))

(defn gpu-present [] (or (isfile "/dev/nvidiactl") (= 0 (os.system "nvidia-smi >/dev/null 2>&1"))))

(setv TORCH-FLAVOR (or (os.environ.get "PROMETHEAN_TORCH")
                       (if (gpu-present) "cu129" "cpu")))
;; Choose which requirements.in to compile
(setv REQS-IN (if (= TORCH-FLAVOR "cpu") "requirements.cpu.in" "requirements.gpu.in"))

;; ---------- UV helpers (repo-local .venv like node_modules) ----------

(setv GPU_SERVICES #{"stt" "tts"})   ; only these may use GPU wheels

;; Allow override; default to cu129 per current PyTorch page
(setv TORCH_CHANNEL (or (os.environ.get "PROMETHEAN_TORCH_CHANNEL") "cu129"))
(setv TORCH_INDEX (.format "https://download.pytorch.org/whl/{}" TORCH_CHANNEL))
   ; only these Python services are allowed to use GPUs


(setv commands {})
(setv exceptions [])

;; -----------------------------------------------------------------------------
;; Service List Definitions
;; -----------------------------------------------------------------------------


(define-service-list SERVICES_HY "services/hy" (not (in  "templates" path)))
(define-service-list SERVICES_PY "services/py" (not (in  "templates" path)))
(define-service-list SERVICES_JS "services/js" (not (in  "templates" path)))
(define-service-list SERVICES_TS "services/ts" (not (in  "templates" path)))
(define-service-list SHARED_TS   "shared/ts"   (not (in  "templates" path)))

(defn define-patterns [#* groups]
      (lfor [lang commands] groups
            [action fn] commands
            [(+ action "-" lang "-service-") fn]))

(defn svc-name [svc-dir] (basename svc-dir))

(defn svc-name [svc-dir] (basename svc-dir))

(defn lockfile-for [d]
  (if (= (reqs-file-for d) "requirements.gpu.in")
      "requirements.gpu.lock"
      "requirements.cpu.lock"))




;; PROMETHEAN_TORCH env wins: "cpu" or "cu129" (or any cuXX)


(defn reqs-file-for [svc-dir]
  (if (and (= TORCH-FLAVOR "cu129") (in (svc-name svc-dir) GPU_SERVICES))
      "requirements.gpu.in"
      "requirements.cpu.in"))


(defn has-file* [d f] (isfile (join d f)))
(defn has-uv [] (not (= (shutil.which "uv") None)))
(defn has-pnpm [] (not (= (shutil.which "pnpm") None)))

(defn require-pnpm []
  (print "ERROR: pnpm is required for JS/TS tasks. Install via: corepack enable && corepack prepare pnpm@latest --activate, then re-run with pnpm.")
  (sys.exit 1))

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

(defn has-eslint-config [d]
  (> (+ (len (glob.glob (join d ".eslintrc*")))
        (len (glob.glob (join d "eslint.config.*")))) 0))

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
  (sh "if [ -d tests ]; then python -m pytest tests/; else echo 'no tests'; fi" :cwd (join "services/py" service) :shell True))

(defn-cmd test-python-services []
  ;; execute each service's tests without relying on pipenv
  (run-dirs SERVICES_PY "echo 'Running tests in $PWD...' && if [ -d tests ]; then python -m pytest tests/; else echo 'no tests'; fi" :shell True))

(defn-cmd test-shared-python []
  ;; shared python tests use the same direct invocation
  (sh "python -m pytest tests/" :cwd "shared/py" :shell True))

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
      (sh "pnpm test" :cwd (join "services/js" service) :shell True)
      (require-pnpm)))

(defn-cmd test-js-services []
  (if (has-pnpm)
      (run-dirs SERVICES_JS "echo 'Running tests in $PWD...' && pnpm test" :shell True)
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
;; Sibilant ------------------------------------------------------------------
(defn-cmd build-sibilant []
  (print "Transpiling Sibilant to JS... (not ready)"))

(defn-cmd setup-sibilant []
  (print "Setting up Sibilant services..."))

(defn-cmd setup-sibilant-service [service]
  (print (.format "Setting up Sibilant service: {}" service))
  (if (has-pnpm)
      (sh "pnpm dlx sibilant --install" :cwd (join "services" service) :shell True)
      (require-pnpm)))

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
        (sh "uv install mongodb" :shell True)
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

(defn-cmd board-sync []
  (sh ["python" "scripts/github_board_sync.py"]))

(defn-cmd kanban-from-tasks []
  (sh "python scripts/hashtags_to_kanban.py > docs/agile/boards/kanban.md" :shell True))

(defn-cmd kanban-to-hashtags []
  (sh ["python" "scripts/kanban_to_hashtags.py"]))

(defn-cmd kanban-to-issues []
  (sh ["python" "scripts/kanban_to_issues.py"]))

(defn-cmd lint-tasks []
  (sh ["python" "scripts/lint_tasks.py"]))

(defn-cmd simulate-ci []
  (if (os.environ.get "SIMULATE_CI_JOB")
      (sh ["python" "scripts/simulate_ci.py" "--job" (os.environ.get "SIMULATE_CI_JOB")])
      (sh ["python" "scripts/simulate_ci.py"])) )

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
