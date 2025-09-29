(ns mk.configs
  (:require [babashka.fs :as fs]
            [clojure.string :as str]))

(defn list-services [root]
  (->> (fs/glob root "*")
       (map str)
       (filter fs/directory?)
       (remove #(str/includes? % "/templates"))
       (remove #(str/includes? % "/shared"))
       (sort)))

(def services-js (list-services "services/js"))
(def services-ts (list-services "services/ts"))

;; Shared TS packages (currently single root)
(def shared-ts ["shared/ts"])

