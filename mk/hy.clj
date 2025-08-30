(ns mk.hy
  (:require [mk.util :as u]
            [mk.configs :as cfg]
            [babashka.fs :as fs]))

(defn setup-hy []
  (println "Setting up Hy services..."))

(defn setup-hy-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (println (format "Setting up Hy service: %s" service))
    (u/sh! ["pipenv" "install" "--dev"] {:dir (str (fs/path "services" service))})))

(defn compile-hy []
  (u/sh! ["python" "scripts/compile_hy.py"]))

(defn test-hy-service []
  (let [service (or (System/getenv "service") (System/getenv "SERVICE"))]
    (when-not service (throw (ex-info "SERVICE env required" {})))
    (println (format "Running tests for Hy service: %s" service))
    (u/sh! "hy -m pytest tests/" {:dir (str (fs/path "services/hy" service)) :shell true})))

(defn test-hy-services []
  (u/run-dirs cfg/services-hy "echo 'Running tests in $PWD...' && hy -m pytest tests/" {:shell true}))

(defn test-hy [] (test-hy-services))

