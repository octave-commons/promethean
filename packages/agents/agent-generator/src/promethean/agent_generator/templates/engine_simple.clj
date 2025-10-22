(ns promethean.agent-generator.templates.engine-simple
  "Simplified template processing engine for SCI compatibility"
  (:require [clojure.string :as str]
            [promethean.agent-generator.platform.detection :as detection]))

;; Simple template processing - no complex AST, just basic variable substitution
(defn render-template [template-content context]
  "Render template with basic variable substitution"
  (try
    (let [result (reduce 
                   (fn [content [variable value]]
                     (str/replace content (str "{{" variable "}}") (str value)))
                   template-content
                   context)]
      {:success true
       :result result
       :metadata {:variables-used (keys context)
                   :template-length (count template-content)
                   :result-length (count result)
                   :platform (detection/current-platform)}})
    (catch Exception e
      {:success false
       :error (.getMessage e)
       :result template-content})))

(defn validate-template [template-content]
  "Validate template syntax"
  (let [variable-pattern #"\{\{([^}]+)\}\}"
        variables (re-seq variable-pattern template-content)
        variable-names (map second variables)
        duplicates (filter #(> (count %) 1) (vals (group-by identity variable-names)))]
    {:valid template-content
     :variables (distinct variable-names)
     :variable-count (count variable-names)
     :has-duplicates (seq duplicates)
     :duplicates duplicates
     :malformed (filter #(str/includes? % "{{") 
                        (str/split template-content #"\{\{[^}]*\}\}"))}))

(defn extract-variables [template-content]
  "Extract variable names from template"
  (let [variable-pattern #"\{\{([^}]+)\}\}"
        matches (re-seq variable-pattern template-content)]
    (distinct (map second matches))))

(defn template-info [template-content]
  "Get information about template"
  {:length (count template-content)
   :line-count (count (str/split-lines template-content))
   :variables (extract-variables template-content)
   :variable-count (count (extract-variables template-content))
   :has-conditionals (str/includes? template-content "{{#")
   :has-loops (str/includes? template-content "{{#each")
   :platform (detection/current-platform)})

(defn create-simple-engine []
  "Create simple template engine instance"
  {:render render-template
   :validate validate-template
   :extract-variables extract-variables
   :info template-info})