(ns promethean.kanban.safe-rule-evaluation
  (:require ["fs" :as fs]
            ["path" :as path]
            ["url" :as url]
            [nbb.core :as nbb])))

;; Helper to normalize validation results
(defn normalize-validation-result [raw]
  (cond
    (boolean? raw) #js {:isValid raw :errors #js []}
    (string? raw) #js {:isValid false :errors #js [raw]}
    (object? raw) (let [obj (js->clj raw :keywordize-keys true)]
                   #js {:isValid (boolean (or (.-isValid obj) (.-valid obj) true))
                         :errors (if (array? (.-errors obj))
                                   (mapv str (.-errors obj))
                                   #js [])})
    :else #js {:isValid false :errors #js []}))

;; Cache for validation functions
(def validation-functions-cache (atom nil))

(defn load-validation-functions []
  (or @validation-functions-cache
      (try
        (let [__dirname (path/dirname (.-fileURLToPath url))
              validation-path (path/resolve __dirname "../clojure/validation.clj")
              functions (nbb/load-file validation-path)]
              __dirname (path/dirname (.-fileURLToPath url))
              validation-path (path/resolve __dirname "../clojure/validation.clj")
              functions (.loadFile nbb validation-path)]
          (if (and (.-validate-task functions)
                   (.-validate-board functions)
                   (.-evaluate-transition-rule functions))
            (let [cached #js {:validate-task (.-validate-task functions)
                              :validate-board (.-validate-board functions)
                              :evaluate-transition-rule (.-evaluate-transition-rule functions)}]
              (reset! validation-functions-cache cached)
              cached)
            (throw (js/Error. "Required validation functions not found in validation.clj"))))
        (catch js/Error e
          (throw (js/Error. (str "Failed to load validation functions: " (.-message e))))))))

(defn validate-task-with-zod [task-fm]
  (try
    (let [functions (load-validation-functions)
          validate-task (.-validate-task functions)
          task-obj #js {:title (.-title task-fm)
                       :priority (.-priority task-fm)
                       :status (.-status task-fm)
                       :uuid (.-uuid task-fm)
                       :estimates #js {:complexity (or (.. task-fm -estimates -complexity) 0)}
                       :labels (or (.-labels task-fm) #js [])}
          validation-result (validate-task task-obj)]
      (normalize-validation-result validation-result))
    (catch js/Error e
      #js {:isValid false 
            :errors #js [(str "Validation system error: " (.-message e))]})))

(defn validate-board-with-zod [board]
  (try
    (let [functions (load-validation-functions)
          validate-board (.-validate-board functions)
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
      #js {:isValid false 
            :errors #js [(str "Board validation error: " (.-message e))]})))

(defn load-and-validate-inputs [task-fm board]
  (let [task-validation (validate-task-with-zod task-fm)
        board-validation (validate-board-with-zod board)]
    (if (and (.-isValid task-validation) (.-isValid board-validation))
      #js {:success true :validationErrors #js []}
      #js {:success false 
            :validationErrors (concat (.-errors task-validation) (.-errors board-validation))})))

(defn load-clojure-context [dsl-path]
  (let [__dirname (path/dirname (.-fileURLToPath url))
          validation-path (path/resolve __dirname "../clojure/validation.clj")
          validation-content (fs/readFileSync validation-path "utf8")]
    (nbb/load-string validation-content #js {:context "cljs.user" :print (fn [])})
    (when (and dsl-path (.existsSync fs dsl-path))
      (let [dsl-content (fs/readFileSync dsl-path "utf8")]
        (nbb/load-string dsl-content #js {:context "cljs.user" :print (fn [])}))))
        __dirname (path/dirname (.-fileURLToPath url))
        validation-path (path/resolve __dirname "../clojure/validation.clj")
        validation-content (fs/readFileSync validation-path "utf8")]
    (.loadString nbb validation-content #js {:context "cljs.user" :print (fn [])})
    (when (and dsl-path (.existsSync fs dsl-path))
      (let [dsl-content (fs/readFileSync dsl-path "utf8")]
        (.loadString nbb dsl-content #js {:context "cljs.user" :print (fn [])})))))

(defn evaluate-rule [task-fm board rule-impl dsl-path]
    (try
      (load-clojure-context dsl-path)
      
      (if (.startsWith (.trim rule-impl) "(evaluate-transition")
        ;; Direct function call
        (let [result (.loadString nbb rule-impl #js {:context "cljs.user" :print (fn [])})]
          (boolean result))
        ;; Function definition - wrap and call with evaluateTransitionRule
        (let [functions (load-validation-functions)
              evaluate-transition-rule (.-evaluate-transition-rule functions)
              rule-fn (.loadString nbb (str "(" rule-impl ")") #js {:context "cljs.user" :print (fn [])})]
          (boolean (evaluate-transition-rule task-fm board rule-fn))))
      (catch js/Error e
        (throw (js/Error. (str "Rule evaluation failed: " (.-message e))))))))

(defn safe-evaluate-transition [task-fm board rule-impl dsl-path]
  (try
    (let [validation (load-and-validate-inputs task-fm board)]
      (if (.-success validation)
        (let [result (evaluate-rule task-fm board rule-impl dsl-path)]
          #js {:success result :validationErrors #js []})
        #js {:success false :validationErrors (.-errors validation)}))
    (catch js/Error e
      #js {:success false 
            :validationErrors #js []
            :evaluationError (.-message e)})))

;; Export functions for JavaScript usage
#js {:validateTaskWithZod validate-task-with-zod
     :validateBoardWithZod validate-board-with-zod
     :safeEvaluateTransition safe-evaluate-transition}