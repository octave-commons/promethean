
(defn-cmd setup-hy []
  (print "Setting up Hy services..."))

(defn-cmd setup-hy-service [service]
  (print (.format "Setting up Hy service: {}" service))
  (sh ["pipenv" "install" "--dev"] :cwd (join "services" service)))

(defn-cmd compile-hy []
  (sh ["python" "scripts/compile_hy.py"]))

(defn-cmd test-hy-service [service]
  (print (.format "Running tests for Hy service: {}" service))
  (sh "hy -m pytest tests/" :cwd (join "services/hy" service) :shell True))

(defn-cmd test-hy-services []
  (run-dirs SERVICES_HY "echo 'Running tests in $PWD...' && hy -m pytest tests/" :shell True))

(defn-cmd test-hy []
  (test-hy-services))
