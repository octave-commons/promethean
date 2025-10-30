(ns promethean.kanban.safe-rule-evaluation
  (:require [clojure.spec.alpha :as s]
            [promethean.kanban.validation :as validation]
            ["fs" :as fs]
            ["path" :as path]))

;; Helper to normalize validation results
(defn normalize-validation-result [raw]
  (cond
    (boolean? raw) {:isValid raw :errors []}
    (string? raw) {:isValid false :errors [raw]}
    (object? raw) (let [obj (js->clj raw :keywordize-keys true)]
                    {:isValid (boolean (or (.-isValid obj) (.-valid obj) true))
                     :errors (if (array? (.-errors obj))
                               (mapv str (.-errors obj))
                               [])})
    :else {:isValid false :errors []}))

;; Cache for validation functions
(def validation-functions-cache (atom nil))

(defn load-validation-functions []
  (or @validation-functions-cache
      (try
        (let [validation-path (path/resolve (dirname (.-fileURLToPath url)) "../clojure/validation.clj")
              functions (js/require "nbb" #js {:loadFile validation-path})]
          (if (and (.-validate-task functions)
                   (.-validate-board functions)
                   (.-evaluate-transition-rule functions))
            (let [cached {:validate-task (.-validate-task functions)
                          :validate-board (.-validate-board functions)
                          :evaluate-transition-rule (.-evaluate-transition-rule functions)}]
              (reset! validation-functions-cache cached)
              cached)
            (throw (js/Error. "Required validation functions not found in validation.clj"))))
        (catch js/Error e
          (throw (js/Error. (str "Failed to load validation functions: " (.-message e))))))))

(defn validate-task-with-zod [task-fm]
  (try
    (let [{:keys [validate-task]} (load-validation-functions)
          task-obj #js {:title (.-title task-fm)
                       :priority (.-priority task-fm)
                       :status (.-status task-fm)
                       :uuid (.-uuid task-fm)
                       :estimates #js {:complexity (or (.. task-fm -estimates -complexity) 0)}
                       :labels (or (.-labels task-fm) #js [])}
          validation-result (validate-task task-obj)]
      (normalize-validation-result validation-result))
    (catch js/Error e
      {:isValid false 
       :errors [(str "Validation system error: " (.-message e))]})))

(defn validate-board-with-zod [board]
  (try
    (let [{:keys [validate-board]} (load-validation-functions)
          board-obj #js {:columns (mapv (fn [col]
                                         #js {:name (.-name col)
                                              :limit (if (nil? (.-limit col))
                                                       nil
                                                       (or (.-limit col) 0))
                                              :tasks (or (.-tasks col) #js [])
                                              :count (or (.-count col) 
                                                         (if (.-tasks col) (.-length (.-tasks col)) 0))})
                                       (.-columns board))}
          validation-result (validate-board board-obj)]
      (normalize-validation-result validation-result))
    (catch js/Error e
      {:isValid false 
       :errors [(str "Board validation error: " (.-message e))]})))

(defn load-and-validate-inputs [task-fm board]
  (let [task-validation (validate-task-with-zod task-fm)
        board-validation (validate-board-with-zod board)]
    (if (and (.-isValid task-validation) (.-isValid board-validation))
      {:success true :validationErrors []}
      {:success false 
       :validationErrors (concat (.-errors task-validation) (.-errors board-validation))})))

(defn load-clojure-context [dsl-path]
  (let [load-string (js/require "nbb" #js {:loadString true})
        validation-path (path/resolve (dirname (.-fileURLToPath url)) "../clojure/validation.clj")
        validation-content (fs/readFileSync validation-path "utf8")]
    (load-string validation-content #js {:context "cljs.user" :print (fn [])})
    (when (and dsl-path (fs/existsSync dsl-path))
      (let [dsl-content (fs/readFileSync dsl-path "utf8")]
        (load-string dsl-content #js {:context "cljs.user" :print (fn [])})))))

(defn evaluate-rule [task-fm board rule-impl dsl-path]
  (let [load-string (js/require "nbb" #js {:loadString true})]
    (try
      (load-clojure-context dsl-path)
      
      (if (.startsWith (.trim rule-impl) "(evaluate-transition")
        ;; Direct function call
        (let [result (load-string rule-impl #js {:context "cljs.user" :print (fn [])})]
          (boolean result))
        ;; Function definition - wrap and call with evaluateTransitionRule
        (let [{:keys [evaluateTransitionRule]} (load-validation-functions)
              rule-fn (load-string (str "(" rule-impl ")") #js {:context "cljs.user" :print (fn [])})]
          (boolean (evaluateTransitionRule task-fm board rule-fn))))
      (catch js/Error e
        (throw (js/Error. (str "Rule evaluation failed: " (.-message e))))))))

(defn safe-evaluate-transition [task-fm board rule-impl dsl-path]
  (try
    (let [validation (load-and-validate-inputs task-fm board)]
      (if (.-success validation)
        (let [result (evaluate-rule task-fm board rule-impl dsl-path)]
          {:success result :validationErrors []})
        {:success false :validationErrors (.-errors validation)}))
    (catch js/Error e
      {:success false 
       :validationErrors []
       :evaluationError (.-message e)})))

;; Export functions for JavaScript usage
#js {:validateTaskWithZod validate-task-with-zod
     :validateBoardWithZod validate-board-with-zod
     :safeEvaluateTransition safe-evaluate-transition}