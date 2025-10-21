(ns promethean.agent-generator.platform.adapters.json
  "JSON processing adapter for SCI compatibility")

(defn json-parse [content]
  "Parse JSON content - simplified for SCI compatibility"
  (try
    ;; For now, just return a simple parsed structure
    ;; In a real implementation, this would use proper JSON parsing
    (if (and (string? content) 
             (clojure.string/starts-with? content "{")
             (clojure.string/ends-with? content "}"))
      {:parsed true :content content}
      {})
    (catch Exception _
      {})))

(defn json-generate [data]
  "Generate JSON content - simplified for SCI compatibility"
  (try
    ;; For now, just return a simple string representation
    (if (map? data)
      (str "{:generated true :data " (pr-str data) "}")
      "{}")
    (catch Exception _
      "{}")))

;; Main adapter function that features expect
(defn json-parse [input]
  "JSON adapter function"
  (fn [operation]
    (case operation
      :parse (json-parse input)
      :generate (json-generate input)
      nil)))