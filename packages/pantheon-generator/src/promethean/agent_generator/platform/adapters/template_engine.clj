(ns promethean.agent-generator.platform.adapters.template-engine
  "Template processing engine adapter for SCI compatibility")

(defn simple-template [template data]
  "Simple template replacement using {{key}} syntax"
  (try
    (loop [result template
           keys (keys data)]
      (if (empty? keys)
        result
        (let [key (first keys)
              pattern (re-pattern (str "\\{\\{" (name key) "\\}\\}"))
              replacement (str (get data key))]
          (recur (clojure.string/replace result pattern replacement)
                 (rest keys)))))
    (catch Exception _
      template)))

(defn process-template [template-path data]
  "Process template file with given data"
  (try
    (let [template (slurp template-path)]
      (simple-template template data))
    (catch Exception _
      "")))

(defn render-string [template-string data]
  "Render template string with data"
  (try
    (simple-template template-string data)
    (catch Exception _
      template-string)))

(defn validate-template [template]
  "Validate template syntax"
  (try
    (let [matches (re-seq #"\{\{([^}]+)\}\}" template)]
      {:valid? true
       :variables (map second matches)
       :errors []})
    (catch Exception e
      {:valid? false
       :variables []
       :errors [(.getMessage e)]})))

;; Main adapter function that features expect
(defn main [template-path]
  "Template engine adapter function"
  (fn [operation & args]
    (case operation
      :process (process-template template-path (first args))
      :render (render-string template-path (first args))
      :validate (validate-template template-path)
      nil)))