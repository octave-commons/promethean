(ns promethean.agent-generator.templates.engine
  "Template processing engine for agent instruction generation"
  (:require [clojure.string :as str]
            [clojure.walk :as walk]
            [promethean.agent-generator.platform.features :as features]
            [promethean.agent-generator.platform.detection :as detection]))

(defn parse-template [template-content]
  "Parse template content into AST"
  (let [tokens (tokenize template-content)]
    (build-ast tokens)))

(defn tokenize [content]
  "Tokenize template content into tokens"
  (let [variable-pattern #"\{\{([^}]+)\}\}"
        conditional-pattern #"\{\{#(\w+)(?:\s+([^}]+))?\}\}"
        loop-pattern #"\{\{#each\s+(\w+)\}\}"
        end-pattern #"\{\{/(#\w+|\w+)\}\}"
        else-pattern #"\{\{else\}\}"
        tokens (atom [])]
    
    (loop [remaining content
           pos 0]
      (if (>= pos (count remaining))
        @tokens
        (let [next-var (re-find variable-pattern (subs remaining pos))
              next-conditional (re-find conditional-pattern (subs remaining pos))
              next-loop (re-find loop-pattern (subs remaining pos))
              next-end (re-find end-pattern (subs remaining pos))
              next-else (when (str/includes? (subs remaining pos) "{{else}}")
                         "{{else}}")]
          (cond
            ;; Find the earliest match
            (and next-var 
                 (or (not next-conditional) (< (+ pos (count (first next-var))) 
                                             (+ pos (count (first next-conditional)))))
                 (or (not next-loop) (< (+ pos (count (first next-var))) 
                                      (+ pos (count (first next-loop)))))
                 (or (not next-end) (< (+ pos (count (first next-var))) 
                                    (+ pos (count (first next-end))))))
            (let [[match content] next-var
                  start-pos (+ pos (count match))]
              (swap! tokens conj {:type :text :content (subs remaining pos (- (count match)))})
              (swap! tokens conj {:type :variable :content content})
              (recur remaining start-pos))
            
            ;; Conditional
            (and next-conditional
                 (or (not next-loop) (< (+ pos (count (first next-conditional))) 
                                      (+ pos (count (first next-loop)))))
                 (or (not next-end) (< (+ pos (count (first next-conditional))) 
                                    (+ pos (count (first next-end))))))
            (let [[match type condition] next-conditional
                  start-pos (+ pos (count match))]
              (swap! tokens conj {:type :text :content (subs remaining pos (- (count match)))})
              (swap! tokens conj {:type :conditional :type type :condition condition})
              (recur remaining start-pos))
            
            ;; Loop
            (and next-loop
                 (or (not next-end) (< (+ pos (count (first next-loop))) 
                                    (+ pos (count (first next-end))))))
            (let [[match collection] next-loop
                  start-pos (+ pos (count match))]
              (swap! tokens conj {:type :text :content (subs remaining pos (- (count match)))})
              (swap! tokens conj {:type :loop :collection collection})
              (recur remaining start-pos))
            
            ;; End block
            next-end
            (let [[match end-type] next-end
                  start-pos (+ pos (count match))]
              (swap! tokens conj {:type :text :content (subs remaining pos (- (count match)))})
              (swap! tokens conj {:type :end :type end-type})
              (recur remaining start-pos))
            
            ;; Else
            next-else
            (let [start-pos (+ pos (count next-else))]
              (swap! tokens conj {:type :text :content (subs remaining pos (- (count next-else)))})
              (swap! tokens conj {:type :else})
              (recur remaining start-pos))
            
            ;; No more special tokens, add remaining text
            :else
            (do
              (swap! tokens conj {:type :text :content (subs remaining pos)})
              @tokens)))))))

(defn build-ast [tokens]
  "Build AST from tokens"
  (let [stack (atom [])
        ast (atom [])]
    (doseq [token tokens]
      (case (:type token)
        :text (swap! ast conj token)
        :variable (swap! ast conj token)
        :conditional (do
                      (swap! stack conj {:type :conditional :token token :children []})
                      (swap! ast conj :placeholder))
        :loop (do
                (swap! stack conj {:type :loop :token token :children []})
                (swap! ast conj :placeholder))
        :else (when-let [current (peek @stack)]
                (swap! current assoc :else true))
        :end (let [current (pop @stack)
                   parent (peek @stack)]
               (if parent
                 (swap! parent assoc :children (conj (:children parent) current))
                 (swap! ast conj current)))))
    @ast))

(defn process-template [template-content context]
  "Process template with given context"
  (try
    (let [ast (parse-template template-content)]
      (render-ast ast context))
    (catch Exception e
      (throw (ex-info "Template processing failed" 
                      {:error (.getMessage e) 
                       :template (subs template-content 0 100)})))))

(defn render-ast [ast context]
  "Render AST to string"
  (str/join (map #(render-node % context) ast)))

(defn render-node [node context]
  "Render single AST node"
  (case (:type node)
    :text (:content node)
    :variable (resolve-variable (:content node) context)
    :conditional (render-conditional node context)
    :loop (render-loop node context)
    :else "" ; Else is handled in conditional rendering
    (str node))) ; Fallback

(defn resolve-variable [var-path context]
  "Resolve variable path from context"
  (let [path (str/split var-path #"\.")
        filters (when (str/includes? var-path "|")
                  (str/split (last path) #"\|"))
        clean-path (if filters 
                     (butlast path)
                     path)
        value (get-in context (map keyword clean-path))]
    (if (seq filters)
      (apply-filters value (rest filters))
      value)))

(defn apply-filters [value filters]
  "Apply filters to value"
  (reduce apply-filter value filters))

(defn apply-filter [value filter]
  "Apply single filter to value"
  (let [filter-name (str/trim filter)]
    (case filter-name
      "upper" (str/upper-case (str value))
      "lower" (str/lower-case (str value))
      "title" (str/capitalize (str value))
      "trim" (str/trim (str value))
      "default" (if (or (nil? value) (and (string? value) (str/blank? value)))
                   "default"
                   value)
      "count" (if (coll? value) (count value) 1)
      "join" (if (coll? value) (str/join ", " value) value)
      "first" (if (coll? value) (first value) value)
      "last" (if (coll? value) (last value) value)
      value)))

(defn render-conditional [node context]
  "Render conditional block"
  (let [condition-type (keyword (:type (:token node)))
        condition-expr (:condition (:token node))
        children (:children node)
        else-children (:else-children node)]
    (case condition-type
      :if (if (evaluate-condition condition-expr context)
             (render-ast children context)
             (render-ast (or else-children []) context))
      :unless (if (not (evaluate-condition condition-expr context))
                 (render-ast children context)
                 (render-ast (or else-children []) context))
      :platform (if (= condition-expr (name (detection/current-platform)))
                   (render-ast children context)
                   (render-ast (or else-children []) context))
      (render-ast children context))))

(defn evaluate-condition [condition context]
  "Evaluate condition expression"
  (cond
    ;; Simple boolean check
    (contains? context (keyword condition))
    (boolean (get context (keyword condition)))
    
    ;; Platform check
    (= condition "platform")
    true ; Handled in render-conditional
    
    ;; Feature check
    (str/starts-with? condition "feature:")
    (let [feature-name (keyword (subs condition 8))]
      (features/feature-available? feature-name))
    
    ;; Negation
    (str/starts-with? condition "!")
    (let [inner-condition (subs condition 1)]
      (not (evaluate-condition inner-condition context)))
    
    ;; Default to false
    :else false))

(defn render-loop [node context]
  "Render loop block"
  (let [collection-name (:collection (:token node))
        collection (get context (keyword collection-name))
        children (:children node)]
    (if (coll? collection)
      (str/join (map-indexed 
                  (fn [index item]
                    (let [loop-context (assoc context 
                                               'this item
                                               '@index index
                                               '@key (if (map? item) 
                                                      (first (keys item)) 
                                                      index))]
                      (render-ast children loop-context)))
                  collection))
      "")))

(defn validate-template [template-content]
  "Validate template syntax"
  (try
    (let [ast (parse-template template-content)]
      (validate-ast ast))
    (catch Exception e
      {:valid false :errors [(.getMessage e)]})))

(defn validate-ast [ast]
  "Validate AST structure"
  (let [errors (atom [])]
    ;; Check for balanced blocks
    (walk/postwalk 
      (fn [node]
        (when (and (map? node) (= (:type node) :placeholder))
          (swap! errors conj "Unbalanced template block"))
        node)
      ast)
    
    {:valid (empty? @errors) :errors @errors}))

(defn create-template-engine []
  "Create template engine instance"
  {:process-template process-template
   :validate-template validate-template
   :parse-template parse-template})