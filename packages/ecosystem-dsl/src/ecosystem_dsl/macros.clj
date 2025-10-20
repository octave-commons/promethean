(ns ecosystem-dsl.macros
  "Macro system for the ecosystem DSL.
   
   This namespace contains the macro implementations that provide the syntactic
   sugar for defining ecosystem configurations and enhancements. The macros ensure
   proper hygiene, compile-time validation, and helpful error messages."
  (:require [clojure.walk :as walk]
            [clojure.pprint :as pprint]))

;; ============================================================================
;; ENHANCEMENT REGISTRY
;; ============================================================================

(def ^:dynamic *enhancement-registry* (atom {}))

;; ============================================================================
;; CORE MACRO IMPLEMENTATIONS
;; ============================================================================

(defmacro defecosystem-impl
  "Implementation macro for defecosystem.
   
   This macro performs compile-time validation and generates a function that
   creates the enhanced ecosystem configuration. It ensures proper hygiene by
   gensymming all internal variables."
  [name config apps]

  (let [ecosystem-sym (gensym "ecosystem")
        config-sym (gensym "config")
        apps-sym (gensym "apps")
        validation-sym (gensym "validation")]

    `(do
       ;; Validate configuration at compile time
       (let [~validation-sym (validate-ecosystem-config-impl ~config ~apps)]
         (when-not (:valid? ~validation-sym)
           (throw (ex-info "Invalid ecosystem configuration"
                           {:type ::ecosystem-validation-error
                            :name '~name
                            :errors (:errors ~validation-sym)}))))

       ;; Define the ecosystem function
       (defn ~name
         ~(str "Enhanced ecosystem configuration: " name)
         []
         (let [~config-sym ~config
               ~apps-sym ~apps
               ~ecosystem-sym (merge ~config-sym
                                     {:apps ~apps-sym}
                                     {:generated-at (java.util.Date.)
                                      :generated-by '~name})]
           (enhance-ecosystem-impl ~ecosystem-sym (:enhancements ~config-sym))))

       ;; Register ecosystem for discovery
       (alter-var-root #'*registered-ecosystems* conj '~name)

       (println (str "✅ Defined ecosystem: " '~name " with " (count ~apps) " apps"))
       '~name)))

(defmacro enhance-app-impl
  "Implementation macro for enhance-app.
   
   This macro applies multiple enhancements to an app configuration in a
   composable way. Each enhancement is applied in sequence, allowing for
   incremental transformation."
  [app & enhancements]

  (let [app-sym (gensym "app")
        enhancements-sym (gensym "enhancements")
        result-sym (gensym "result")]

    `(let [~app-sym ~app
           ~enhancements-sym [~@enhancements]
           ~result-sym (reduce (fn [acc# enhancement#]
                                 (apply-enhancement-impl acc# enhancement#))
                               ~app-sym
                               ~enhancements-sym)]
       ~result-sym)))

(defmacro def-enhancement-impl
  "Implementation macro for def-enhancement.
   
   This macro registers a new enhancement pattern in the global registry.
   The enhancement can then be applied to any app configuration."
  [name config]

  (let [name-sym (gensym "name")
        config-sym (gensym "config")
        enhancement-fn (gensym "enhancement-fn")]

    `(let [~name-sym '~name
           ~config-sym ~config
           ~enhancement-fn (fn [app#]
                             (merge app# ~config-sym))]

       ;; Register the enhancement
       (alter-var-root #'*enhancement-registry* assoc ~name-sym ~enhancement-fn)

       ;; Create a convenience function
       (defn ~(symbol (str "apply-" name))
         ~(str "Apply " name " enhancement to an app configuration")
         [app#]
         (~enhancement-fn app#))

       (println (str "✅ Defined enhancement: " '~name))
       '~name)))

;; ============================================================================
;; COMPOSITION MACROS
;; ============================================================================

(defmacro with-enhancements
  "Apply multiple enhancements to a block of app configurations.
   
   Usage:
   ```clojure
   (with-enhancements [:logging :performance :monitoring]
     [{:name \"app1\" :script \"node\"}
      {:name \"app2\" :script \"pnpm\"}])
   ```"
  [enhancements apps]

  (let [enhancements-sym (gensym "enhancements")
        apps-sym (gensym "apps")
        result-sym (gensym "result")]

    `(let [~enhancements-sym ~enhancements
           ~apps-sym ~apps
           ~result-sym (mapv (fn [app#]
                               (enhance-app-impl app# ~@enhancements-sym))
                             ~apps-sym)]
       ~result-sym)))

(defmacro conditional-enhancement
  "Apply an enhancement conditionally based on environment or other criteria.
   
   Usage:
   ```clojure
   (conditional-enhancement :production
     :security {:ssl true :auth \"basic\"})
   ```"
  [condition enhancement]

  (let [condition-sym (gensym "condition")
        enhancement-sym (gensym "enhancement")
        env-sym (gensym "env")]

    `(let [~condition-sym ~condition
           ~enhancement-sym ~enhancement
           ~env-sym (or (System/getenv \"NODE_ENV \") \"development \")]

       (when (= ~condition-sym (keyword ~env-sym))
         ~enhancement-sym))))

(defmacro enhancement-pipeline
  "Create a pipeline of enhancements that will be applied in sequence.
   
   Usage:
   ```clojure
   (enhancement-pipeline
     [:base-config]
     [:logging {:level :info}]
     [:performance {:memory \"1G\"}]
     [:monitoring {:health-check true}])
   ```"
  [& steps]

  (let [steps-sym (gensym "steps")
        pipeline-sym (gensym "pipeline")]

    `(let [~steps-sym [~@steps]
           ~pipeline-sym (reduce (fn [acc# step#]
                                   (let [[enhancement-type# config#] step#]
                                     (apply-enhancement-impl acc# [enhancement-type# config#])))
                                 (first ~steps-sym)
                                 (rest ~steps-sym))]
       ~pipeline-sym)))

;; ============================================================================
;; VALIDATION MACROS
;; ============================================================================

(defmacro validate-app
  "Validate an app configuration at compile time.
   
   Usage:
   ```clojure
   (validate-app {:name \"app\" :script \"node\"})
   ```"
  [app]

  (let [app-sym (gensym "app")
        validation-sym (gensym "validation")]

    `(let [~app-sym ~app
           ~validation-sym (validate-app-impl ~app-sym)]
       (when-not (:valid? ~validation-sym)
         (throw (ex-info "Invalid app configuration"
                         {:type ::app-validation-error
                          :app ~app-sym
                          :errors (:errors ~validation-sym)})))
       ~app-sym)))

(defmacro ensure-fields
  "Ensure required fields are present in an app configuration.
   
   Usage:
   ```clojure
   (ensure-fields app [:name :script :args])
   ```"
  [app required-fields]

  (let [app-sym (gensym "app")
        fields-sym (gensym "fields")
        missing-sym (gensym "missing")]

    `(let [~app-sym ~app
           ~fields-sym ~required-fields
           ~missing-sym (remove #(contains? ~app-sym %) ~fields-sym)]
       (when (seq ~missing-sym)
         (throw (ex-info "Missing required fields"
                         {:type ::missing-fields-error
                          :missing ~missing-sym
                          :app ~app-sym})))
       ~app-sym)))

;; ============================================================================
;; HELPER FUNCTIONS (USED BY MACROS)
;; ============================================================================

(def ^:dynamic *registered-ecosystems* (atom []))

(defn validate-ecosystem-config-impl
  "Internal implementation for ecosystem configuration validation."
  [config apps]
  (let [errors (atom [])]

    ;; Check required top-level fields
    (when-not (:description config)
      (swap! errors conj "Missing :description in ecosystem config"))

    ;; Validate each app
    (doseq [app apps]
      (when-not (:name app)
        (swap! errors conj (str "App missing :name: " app)))
      (when-not (:script app)
        (swap! errors conj (str "App missing :script: " app))))

    {:valid? (empty? @errors)
     :errors @errors}))

(defn validate-app-impl
  "Internal implementation for app validation."
  [app]
  (let [required [:name :script]
        missing (remove #(contains? app %) required)]
    {:valid? (empty? missing)
     :errors (mapv #(str "Missing field: " %) missing)}))

(defn apply-enhancement-impl
  "Internal implementation for applying a single enhancement."
  [app enhancement]
  (let [[enhancement-type config] enhancement
        enhancement-fn (get @*enhancement-registry* enhancement-type)]
    (if enhancement-fn
      (enhancement-fn (merge app config))
      (throw (ex-info "Unknown enhancement type"
                      {:type ::unknown-enhancement
                       :enhancement-type enhancement-type
                       :available (keys @*enhancement-registry*)})))))

(defn enhance-ecosystem-impl
  "Internal implementation for enhancing an entire ecosystem."
  [ecosystem enhancements]
  (let [apps (:apps ecosystem)
        enhanced-apps (mapv #(enhance-app-impl % enhancements) apps)]
    (assoc ecosystem :apps enhanced-apps)))

;; ============================================================================
;; DEBUG MACROS
;; ============================================================================

(defmacro debug-expansion
  "Debug macro expansion by printing the expanded form.
   
   Usage:
   ```clojure
   (debug-expansion
     (enhance-app {:name \"app\" :script \"node\"}
       :logging {:level :debug}))
   ```"
  [form]
  `(let [expanded# (macroexpand-1 '~form)]
     (println "=== Macro Expansion ===")
     (pprint/pprint expanded#)
     (println "======================")
     ~form))

(defmacro trace-enhancement
  "Trace the application of enhancements by printing intermediate steps.
   
   Usage:
   ```clojure
   (trace-enhancement app
     :logging {:level :info}
     :performance {:memory \"1G\"})
   ```"
  [app & enhancements]
  (let [app-sym (gensym "app")
        enhancements-sym (gensym "enhancements")]

    `(let [~app-sym ~app
           ~enhancements-sym [~@enhancements]]
       (println "🔍 Tracing enhancement application:")
       (println "   Original app:" ~app-sym)
       (doseq [[enh-type# config#] ~enhancements-sym]
         (println "   Applying:" enh-type# config#))
       (let [result# (enhance-app-impl ~app-sym ~@enhancements-sym)]
         (println "   Result:" result#)
         result#))))