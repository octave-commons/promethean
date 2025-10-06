(ns clj_hacks.verify.core
(ns clj_hacks.verify.core
  (:require [clj_hacks.mcp.adapter_elisp :as adapter]))

(defn -main [& args]
  (let [path (first args)]
    (if-not path
      (println "Usage: clojure -M:verify fixtures/generated.el")
      (let [res (adapter/read-full path)]
        (println "MCP verify result:")
        (prn res)))))
