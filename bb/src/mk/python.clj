(ns mk.python
  (:require [mk.util :as u]
            [mk.configs :as cfg]
            [babashka.fs :as fs]
            [clojure.string :as str]))

(defn setup-python-services []
  (println "Setting up Python services (uv preferred)...")
  (doseq [d cfg/services-py]
    (if (u/has-uv?)
      (do (u/uv-venv d)
          (u/uv-compile d (cfg/reqs-file-for d) (cfg/lockfile-for d) (cfg/torch-index))
          (u/uv-sync d (cfg/lockfile-for d))
          (u/inject-sitecustomize-into-venv d))
      (do (println "uv not found → falling back to pipenv in" d)
          (u/sh! "python -m pipenv sync --dev" {:dir d :shell true})))))

(defn setup-pipenv []
  (if (u/has-cmd? "pipenv")
    (println "pipenv already installed, skipping")
    (do (u/sh! ["python" "-m" "pip" "install" "--upgrade" "pip"]) 
        (println "installing pipenv")
        (u/sh! ["python" "-m" "pip" "install" "pipenv"]))))

(defn generate-python-shared-requirements []
  (u/sh! "python -m pipenv requirements | grep -Ev '^nvidia-[a-z0-9\\-]+-cu[0-9]+(\\.[0-9]+)?' > requirements.txt"
        {:dir "shared/py" :shell true}))

(defn generate-python-services-requirements []
  (println "Generating requirements.txt for Python services...")
  (doseq [d cfg/services-py]
    (u/sh! "python -m pipenv requirements | grep -Ev '^nvidia-[a-z0-9\\-]+-cu[0-9]+(\\.[0-9]+)?' > requirements.txt" {:dir d :shell true})))

(defn generate-requirements-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (u/sh! "python -m pipenv requirements | grep -Ev '^nvidia-[a-z0-9\\-]+-cu[0-9]+(\\.[0-9]+)?' > requirements.txt"
          {:dir (str (fs/path "services/py" service)) :shell true})))

(defn setup-shared-python []
  (u/sh! ["python" "-m" "pipenv" "install" "--dev"] {:dir "shared/py"}))

(defn lock-python-cpu []
  (System/setProperty "PROMETHEAN_TORCH" "cpu")
  (doseq [d cfg/services-py]
    (u/uv-compile d (cfg/reqs-file-for d) (cfg/lockfile-for d) (cfg/torch-index)))
  (u/uv-compile "./shared/py" (cfg/reqs-file-for "./shared/py") (cfg/lockfile-for "./shared/py") (cfg/torch-index)))

(defn lock-python-gpu []
  (System/setProperty "PROMETHEAN_TORCH" "cu129")
  (doseq [d cfg/services-py]
    (u/uv-compile d (cfg/reqs-file-for d) (cfg/lockfile-for d) (cfg/torch-index)))
  (u/uv-compile "./shared/py" (cfg/reqs-file-for "./shared/py") (cfg/lockfile-for "./shared/py") (cfg/torch-index)))

(defn setup-shared-python-quick []
  (let [d "./shared/py/"]
    (if (u/has-uv?)
      (do (u/uv-venv d)
          (if (fs/exists? (fs/path d (cfg/lockfile-for d)))
            (u/uv-sync d (cfg/lockfile-for d))
            (do (u/uv-compile d (cfg/reqs-file-for d) (cfg/lockfile-for d) (cfg/torch-index))
                (u/uv-sync d (cfg/lockfile-for d))))
          (u/inject-sitecustomize-into-venv d))
      (do (println "uv not found → pip --user fallback in" d)
          ;; NOTE: Fallback mirrors existing Hy behavior but may not be ideal
          (generate-requirements-service)
          (u/sh! ["python" "-m" "pip" "install" "--user" "-r" "requirements.txt"] {:dir d}))))

(defn setup-python-services-quick []
  (println "Quick Python setup (uv preferred)...")
  (doseq [d cfg/services-py]
    (if (u/has-uv?)
      (do (u/uv-venv d)
          (if (fs/exists? (fs/path d (cfg/lockfile-for d)))
            (u/uv-sync d (cfg/lockfile-for d))
            (do (u/uv-compile d (cfg/reqs-file-for d) (cfg/lockfile-for d) (cfg/torch-index))
                (u/uv-sync d (cfg/lockfile-for d))))
          (u/inject-sitecustomize-into-venv d))
      (do (println "uv not found → pip --user fallback in" d)
          (u/sh! ["python" "-m" "pip" "install" "--user" "-r" "requirements.txt"] {:dir d})))))

(defn setup-python []
  (setup-python-services)
  (setup-shared-python))

(defn setup-python-quick []
  (setup-python-services-quick)
  (setup-shared-python-quick))

(defn build-python []
  (println "No build step for Python services"))

(defn clean-python []
  (println "Cleaning Python artifacts (git-aware)...")
  (doseq [d cfg/services-py]
    (u/safe-rm-globs d [".venv" "__pycache__" ".pytest_cache" "*.pyc" "requirements.*.lock"]))
  (u/safe-rm-globs "shared/py" [".venv" "__pycache__" ".pytest_cache" "*.pyc" "requirements.*.lock"]))

(defn setup-python-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (println (format "Setting up Python service: %s" service))
    (if (System/getenv "SIMULATE_CI")
      (println "Skipping pipenv sync during CI simulation")
      (u/sh! "python -m pipenv sync --dev" {:dir (str (fs/path "services/py" service)) :shell true}))))

(defn test-python-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (println (format "Running tests for Python service: %s" service))
    (u/sh! "if [ -d tests ]; then SKIP_NETWORK_TESTS=1 python -m pytest tests/; else echo 'no tests'; fi"
          {:dir (str (fs/path "services/py" service)) :shell true})))

(defn test-python-services []
  (u/run-dirs cfg/services-py "echo 'Running tests in $PWD...' && if [ -d tests ]; then SKIP_NETWORK_TESTS=1 python -m pytest tests/; else echo 'no tests'; fi" {:shell true}))

(defn test-shared-python []
  (u/sh! "python -m pytest tests/" {:dir "shared/py" :shell true}))

(defn test-python []
  (test-python-services)
  (test-shared-python))

(def coverage-snippet
  (str "python -m pipenv run bash -lc '\n"
       "set -e\n"
       "if python - <<\"PY\"\n"
       "import importlib.util, sys\n"
       "sys.exit(0 if importlib.util.find_spec(\"pytest_cov\") else 1)\n"
       "PY\n"
       "then\n"
       "  echo \"[coverage] pytest-cov found → using coverage flags\"\n"
       "  pytest tests/ --cov=./ --cov-report=xml --cov-report=term\n"
       "else\n"
       "  echo \"[coverage] pytest-cov not found → running tests without coverage\"\n"
       "  pytest tests/\n"
       "fi'"))

(defn coverage-python-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (println (format "Running coverage for Python service: %s" service))
    (u/sh! coverage-snippet {:dir (str (fs/path "services/py" service)) :shell true})))

(defn coverage-python-services []
  (u/run-dirs cfg/services-py (str "echo 'Generating coverage in $PWD...' && " coverage-snippet) {:shell true}))

(defn coverage-shared-python []
  (u/sh! coverage-snippet {:dir "shared/py" :shell true}))

(defn coverage-python []
  (coverage-python-services)
  (coverage-shared-python))

(defn lint-python-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (println (format "Linting Python service: %s" service))
    (u/sh! ["flake8" (str (fs/path "services" "py" service))])))

(defn lint-python []
  (u/sh! ["flake8" "services/py" "shared/py/"]))

(defn format-python []
  (u/sh! ["black" "services/py" "shared/py/"])
  (u/sh! ["black" "shared/py/"]))

(defn typecheck-python []
  (u/sh! ["mypy"]))

(defn generate-python-requirements []
  (generate-python-services-requirements)
  (generate-python-shared-requirements))

(defn generate-requirements []
  (generate-python-requirements))

