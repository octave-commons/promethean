(import shutil)
(import util [sh run-dirs])
(import dotenv [load-dotenv])
(import os)
(import os.path [isdir isfile join])
(import platform)
(import os)
(import shutil [which])
(import glob)
(import shutil [copyfile])

(import os.path [basename])
(load-dotenv)
(require macros [ define-service-list defn-cmd ])

(defmacro def [name value] `(setv ~name ~value))
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


(define-service-list SERVICES_HY "services/hy")
(define-service-list SERVICES_PY "services/py")
(define-service-list SERVICES_JS "services/js")
(define-service-list SERVICES_TS "services/ts")
(define-service-list SHARED_TS "shared/ts")
(setv commands {})
(import os.path [basename])
(setv GPU_SERVICES #{"stt" "tts"})   ; only these Python services are allowed to use GPUs

(defn svc-name [svc-dir]
  (basename svc-dir))



(defn gpu-present []
  (or (isfile "/dev/nvidiactl")
      (= 0 (os.system "nvidia-smi >/dev/null 2>&1"))))

;; PROMETHEAN_TORCH env wins: "cpu" or "cu129" (or any cuXX)
(setv TORCH-FLAVOR (or (os.environ.get "PROMETHEAN_TORCH")
                       (if (gpu-present) "cu129" "cpu")))
;; Choose which requirements.in to compile
(setv REQS-IN (if (= TORCH-FLAVOR "cpu") "requirements.cpu.in" "requirements.gpu.in"))

;; ---------- UV helpers (repo-local .venv like node_modules) ----------

(setv GPU_SERVICES #{"stt" "tts"})   ; only these may use GPU wheels

(defn svc-name [svc-dir]
  (basename svc-dir))

(defn reqs-file-for [svc-dir]
  (if (in (svc-name svc-dir) GPU_SERVICES)
      "requirements.gpu.in"
      "requirements.cpu.in"))

;; Allow override; default to cu129 per current PyTorch page
(setv TORCH_CHANNEL (or (os.environ.get "PROMETHEAN_TORCH_CHANNEL") "cu129"))
(setv TORCH_INDEX (.format "https://download.pytorch.org/whl/{}" TORCH_CHANNEL))
   ; only these Python services are allowed to use GPUs


(def TORCH_INDEX "https://download.pytorch.org/whl/cu129")

(defn has-file* [d f] (isfile (join d f)))
(defn has-uv [] (not (= (shutil.which "uv") None)))
(defn has-pnpm [] (not (= (shutil.which "pnpm") None)))

(defn venv-site-packages [svc-dir]
  ;; glob .venv/lib/python*/site-packages
  (let [pattern (join svc-dir ".venv" "lib" "python*" "site-packages")
       hits (glob.glob pattern)]
       (if hits (get hits 0) None)))

(defn uv-venv [d]
  (sh "UV_VENV_IN_PROJECT=1 uv venv" :cwd d :shell True))
;; PROMETHEAN_TORCH=cpu in CI forces CPU everywhere




;; (defn uv-compile [d]
;;   (let [infile (reqs-file-for d)]
;;        (if (= infile "requirements.gpu.in")
;;            ;; GPU builds: keep PyPI as primary; add Torch index as extra
;;            (sh (.format
;;                 "UV_VENV_IN_PROJECT=1 uv pip compile --extra-index-url {} {} -o requirements.lock"
;;                 TORCH_INDEX infile)
;;                :cwd d :shell True)
;;            ;; CPU builds: compile from PyPI only
;;            (sh (.format
;;                 "UV_VENV_IN_PROJECT=1 uv pip compile {} -o requirements.lock"
;;                 infile)
;;                :cwd d :shell True))))
(defn uv-compile [d]
  (let [infile (reqs-file-for d)]
       (if (= infile "requirements.gpu.in")
           ;; GPU: keep PyPI as primary; add Torch index. Emit index URLs into the lock.
           (sh (.format
                "UV_VENV_IN_PROJECT=1 uv pip compile  --index {} {} -o requirements.lock --index-strategy unsafe-best-match"
                TORCH_INDEX infile)
               :cwd d :shell True)
           ;; CPU: PyPI only, still emit index URLs (useful for auditing)
           (sh (.format
                "UV_VENV_IN_PROJECT=1 uv pip compile   --emit-index-url {} -o requirements.lock "
                infile)
               :cwd d :shell True))))




(defn uv-sync [d]
  (sh "UV_VENV_IN_PROJECT=1 uv pip sync requirements.lock" :cwd d :shell True))

;; (defn inject-sitecustomize-into-venv [svc-dir]
;;   (let [src (join svc-dir "sitecustomize.py")
;;        dst-base (venv-site-packages svc-dir)]
;;        (when (and (dst-base src) (isfile src))
;;          (copyfile src (join dst-base "sitecustomize.py"))
;;          (print "sitecustomize →" dst-base))))

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

(defn-cmd setup-shared-python-quick []
  (setv d "./shared/py/")
  (if (has-uv)
      (do
       (uv-venv d)
       ;; quick path = trust existing lock if present; else compile it
       (if (has-file* d "requirements.lock")
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
            (if (has-file* d "requirements.lock")
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
  (print "Cleaning Python artifacts..."))

(defn-cmd setup-python-service [service]
  (print (.format "Setting up Python service: {}" service))
  (if (os.environ.get "SIMULATE_CI")
      (print "Skipping pipenv sync during CI simulation")
      (sh "python -m pipenv sync --dev" :cwd (join "services/py" service) :shell True)))

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
  (sh ["mypy" "services/py" "shared/py/"]) )

;; JavaScript helpers ---------------------------------------------------------
(defn-cmd lint-js-service [service]
  (print (.format "Linting JS service: {}" service))
  (if (has-pnpm)
      (sh "pnpm exec eslint ." :cwd (join "services/js" service) :shell True)
      (sh "npx --yes eslint ." :cwd (join "services/js" service) :shell True)))

(defn-cmd lint-js []
  (if (has-pnpm)
      (run-dirs SERVICES_JS "pnpm exec eslint ." :shell True)
      (run-dirs SERVICES_JS "npx --yes eslint ." :shell True)))

(defn-cmd format-js []
  (if (has-pnpm)
      (run-dirs SERVICES_JS "pnpm exec prettier --write ." :shell True)
      (run-dirs SERVICES_JS "npx --yes prettier --write ." :shell True)))

(defn-cmd setup-shared-js []
  (print (.format "installing shared dependencies"))
  (if (has-pnpm)
      (sh "pnpm install" :shell True)
      (sh "npm install"  :shell True))
  )
(defn-cmd setup-js-service [service]
  (print (.format "Setting up JS service: {}" service))
  (setup-shared-js)
  (if (has-pnpm)
      (sh "pnpm install" :cwd (join "services/js" service) :shell True)
      (sh "npm install" :cwd (join "services/js" service) :shell True)))

(defn-cmd setup-js []
  (print "Setting up JavaScript services...")
  (setup-shared-js)
  (if (has-pnpm)
      (run-dirs SERVICES_JS "pnpm install" :shell True)
      (run-dirs SERVICES_JS "npm install" :shell True)))

(defn-cmd test-js-service [service]

  (print (.format "Running tests for JS service: {}" service))
  (if (has-pnpm)
      (sh "pnpm test" :cwd (join "services/js" service) :shell True)
      (sh "npm test" :cwd (join "services/js" service) :shell True)))

(defn-cmd test-js-services []
  (if (has-pnpm)
      (run-dirs SERVICES_JS "echo 'Running tests in $PWD...' && pnpm test" :shell True)
      (run-dirs SERVICES_JS "echo 'Running tests in $PWD...' && npm test" :shell True)))

(defn-cmd test-js []
  (test-js-services))

(defn-cmd coverage-js-service [service]
  (print (.format "Running coverage for JS service: {}" service))
  (if (has-pnpm)
      (sh "pnpm run coverage && pnpm exec c8 report -r lcov" :cwd (join "services/js" service) :shell True)
      (sh "npm run coverage && npx c8 report -r lcov" :cwd (join "services/js" service) :shell True)))

(defn-cmd coverage-js-services []
  (if (has-pnpm)
      (run-dirs SERVICES_JS "pnpm run coverage && pnpm exec c8 report -r lcov" :shell True)
      (run-dirs SERVICES_JS "npm run coverage && npx c8 report -r lcov" :shell True)))

(defn-cmd coverage-js []
  (coverage-js-services))

(defn-cmd clean-js []
  (sh "rm -rf shared/js/*" :shell True))

(defn-cmd build-js []
  (print "No build step for JavaScript services"))

;; TypeScript helpers ---------------------------------------------------------

(defn-cmd lint-ts-service [service]
  (print (.format "Linting TS service: {}" service))
  (if (has-pnpm)
      (sh "pnpm run lint" :cwd (join "services/ts" service) :shell True)
      (sh "npm run lint" :cwd (join "services/ts" service) :shell True)))

(defn-cmd lint-ts []
  (for [d SERVICES_TS]
       (when (isfile (join d "package.json"))
         (if (has-pnpm)
             (sh "pnpm run lint" :cwd d :shell True)
             (sh "npm run lint" :cwd d :shell True))))
  (for [d SHARED_TS]
       (when (isfile (join d "package.json"))
         (if (has-pnpm)
             (sh "pnpm run lint" :cwd d :shell True)
             (sh "npm run lint" :cwd d :shell True)))))

(defn-cmd format-ts []
  (if (has-pnpm)
      (do
        (run-dirs SERVICES_TS "pnpm exec @biomejs/biome format --write"  :shell True)
        (run-dirs SHARED_TS "pnpm exec @biomejs/biome format --write"  :shell True))
      (do
        (run-dirs SERVICES_TS "npx --yes @biomejs/biome format --write"  :shell True)
        (run-dirs SHARED_TS "npx --yes @biomejs/biome format --write"  :shell True))))

(defn-cmd typecheck-ts []
  (setv svc (or (os.environ.get "service") (os.environ.get "SERVICE")))
  (defn run [path]
    (if (and (isfile (join path "tsconfig.json"))
             (isdir (join path "node_modules")))
        (if (has-pnpm)
            (sh "pnpm exec tsc --noEmit" :cwd path :shell True)
            (sh "npx tsc --noEmit" :cwd path :shell True))
        (print (.format "Skipping typecheck for {}" path))))
  (if svc
      (run (join "services/ts" svc))
      (do
       (for [d SERVICES_TS] (run d))
       (for [d SHARED_TS] (run d)))))

(defn-cmd setup-ts-service [service]
  (print (.format "Setting up TS service: {}" service))
  (setup-shared-js)
  (if (has-pnpm)
      (sh "pnpm install" :cwd (join "services/ts" service) :shell True)
      (sh "npm install" :cwd (join "services/ts" service) :shell True)))

(defn-cmd setup-ts []
  (print "Setting up TypeScript services...")
  (setup-shared-js)
  (if (has-pnpm)
      (do
        (run-dirs SERVICES_TS "pnpm install" :shell True)
        (run-dirs SHARED_TS "pnpm install" :shell True))
      (do
        (run-dirs SERVICES_TS "npm install" :shell True)
        (run-dirs SHARED_TS "npm install" :shell True))))

(defn-cmd test-ts-service [service]
  (print (.format "Running tests for TS service: {}" service))

  (setup-shared-js)
  (if (has-pnpm)
      (sh "pnpm test" :cwd (join "services/ts" service) :shell True)
      (sh "npm test" :cwd (join "services/ts" service) :shell True)))

(defn-cmd test-ts-services []
  (if (has-pnpm)
      (run-dirs SERVICES_TS "echo 'Running tests in $PWD...' && pnpm test" :shell True)
      (run-dirs SERVICES_TS "echo 'Running tests in $PWD...' && npm test" :shell True)))

(defn-cmd test-ts []
  (test-ts-services)
  (if (has-pnpm)
      (run-dirs SHARED_TS "echo 'Running tests in $PWD...' && pnpm test" :shell True)
      (run-dirs SHARED_TS "echo 'Running tests in $PWD...' && npm test" :shell True)))

(defn-cmd coverage-ts-service [service]
  (print (.format "Running coverage for TS service: {}" service))
  (if (has-pnpm)
      (sh "pnpm run coverage && pnpm exec c8 report -r lcov" :cwd (join "services/ts" service) :shell True)
      (sh "npm run coverage && npx c8 report -r lcov" :cwd (join "services/ts" service) :shell True)))

(defn-cmd coverage-ts-services []
  (if (has-pnpm)
      (run-dirs SERVICES_TS "pnpm run coverage && pnpm exec c8 report -r lcov" :shell True)
      (run-dirs SERVICES_TS "npm run coverage && npx c8 report -r lcov" :shell True)))

(defn-cmd coverage-ts []
  (coverage-ts-services)
  (if (has-pnpm)
      (run-dirs SHARED_TS "pnpm run coverage && pnpm exec c8 report -r lcov" :shell True)
      (run-dirs SHARED_TS "npm run coverage && npx c8 report -r lcov" :shell True)))

(defn-cmd clean-ts []
  (run-dirs SERVICES_TS "npm run clean >/dev/null" :shell True)
  (run-dirs SHARED_TS "npm run clean >/dev/null" :shell True))

(defn-cmd build-ts []
  (print "Transpiling TS to JS... (if we had any shared ts modules)")

  (if (has-pnpm)
      (sh "pnpm run build" :cwd "./shared/ts/" :shell True)
      (sh "npm run build" :cwd "./shared/ts/" :shell True))
  (for [d SERVICES_TS]
       (when (isfile (join d "node_modules/.bin/tsc"))
         (if (has-pnpm)
             (sh "pnpm run build" :cwd d :shell True)
             (sh "npm run build" :cwd d :shell True))))
  )

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
      (sh "sudo apt-get update && sudo apt-get install -y libsndfile1" :shell True)))

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

(defn-cmd generate-makefile []
  (setv header
        "# Auto-generated Makefile. DO NOT EDIT MANUALLY.\n\n")
  ;; Extract base commands (no % wildcard) for COMMANDS block

  ;; Join COMMANDS into lines with `\` continuation
  (setv command-section
        (.join ""
               ["COMMANDS := \\\n  "
               (.join " \\\n  " commands)
               "\n\n"]))


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


(setv exceptions [])


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
                   (sys.exit 1))))
           (when (> (len exceptions) 0)
             (print "commands failed:" #* (lfor [name e] exceptions name))
             (.exit sys 1)

             )
           )))

(when (= __name__ "__main__")
  (main))
