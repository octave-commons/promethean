(ns clj-hacks.automation
  (:refer-clojure :exclude [test])
  (:require [babashka.fs :as fs]
            [babashka.process :as process]))

(def project-dir "packages/clj-hacks")

(defn- run-cmd! [cmd]
  (-> (process/process cmd {:dir project-dir :out :inherit :err :inherit})
      (process/check)))

(defn- ensure-target! []
  (fs/create-dirs (fs/path project-dir "target" "classes")))

(defn prepare! []
  (run-cmd! ["clojure" "-P"]))

(defn build []
  (ensure-target!)
  (prepare!)
  (run-cmd! ["clojure" "-M:compile"]))

(defn lint []
  (prepare!)
  (run-cmd! ["clojure" "-M:lint"]))

(defn test []
  (prepare!)
  (run-cmd! ["clojure" "-M:test"]))