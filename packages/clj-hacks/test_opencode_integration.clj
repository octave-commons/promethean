(require '[clj-hacks.mcp.adapter-opencode :as opencode])

;; Test with actual opencode.json
(let [parsed (opencode/read-full "../../opencode.json")]
  (println "Parsed opencode.json:")
  (clojure.pprint/pprint parsed))