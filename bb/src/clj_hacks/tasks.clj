(ns clj-hacks.tasks
  (:require [babashka.fs :as fs]
            [babashka.process :as process]))

(def project-dir "packages/clj-hacks")

(defn- run! [cmd]
  (-> (process/process cmd {:dir project-dir :out :inherit :err :inherit})
      (process/check)))

(defn- ensure-target! []
  (fs/create-dirs (fs/path project-dir "target" "classes")))

(defn prepare! []
  (run! ["clojure" "-P"]))

(defn build []
  (ensure-target!)
  (prepare!)
  (run! ["clojure" "-M:compile"]))

(defn lint []
  (prepare!)
  (run! ["clojure" "-M:lint"]))

(defn test []
  (prepare!)
  (run! ["clojure" "-M:test"]))
