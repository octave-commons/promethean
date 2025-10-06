(ns elisp.ast
  "Helpers for building and emitting Emacs Lisp fragments from structured data."
  (:refer-clojure :exclude [symbol list vector cons unquote comment])
  (:require [clojure.string :as str]))

(def default-indent 2)

;; ---------------------------------------------------------------------------
;; AST constructors
;; ---------------------------------------------------------------------------

(defn el-symbol
  "Create an Elisp symbol node."
  [name]
  (when-not (string? name)
    (throw (ex-info "Symbol name must be a string" {:name name})))
  {:el/type :symbol :name name})

(defn string
  "Ensure a value is represented as a string literal."
  [value]
  (str value))

(defn el-list
  "Create a list node with optional metadata."
  [& items]
  (into [:el/list] items))

(defn el-vector
  "Create a vector node."
  [& items]
  (into [:el/vector] items))

(defn el-cons
  "Create a dotted pair node."
  [car cdr]
  {:el/type :cons :car car :cdr cdr})

(defn quote [form] {:el/type :quote :form form})
(defn quasiquote [form] {:el/type :quasiquote :form form})
(defn el-unquote [form] {:el/type :unquote :form form})
(defn splice [form] {:el/type :splice :form form})
(defn function [form] {:el/type :function :form form})

(defn el-comment
  "Create a comment node. Include trailing newline if needed."
  [text]
  {:el/type :comment :text text})

(defn plist
  "Create a property list, formatting key/value pairs on separate lines when needed.

  Accepts arguments as `[key value]` vectors to preserve ordering."
  [& kvs]
  (let [pairs (mapcat (fn [pair]
                        (when-not (and (vector? pair) (= 2 (count pair)))
                          (throw (ex-info "plist entries must be [key value] pairs" {:entry pair})))
                        pair)
                      kvs)]    (with-meta (into [:el/list] pairs)
      {:el/layout :pairs
       :el/pairs-offset 10})))

(defn inline-list
  "Create a list whose children should remain inline."
  [& items]
  (with-meta (into [:el/list] items)
    {:el/layout :inline}))

;; ---------------------------------------------------------------------------
;; Emission helpers
;; ---------------------------------------------------------------------------

(defn- spaces [n]
  (apply str (repeat (max 0 n) \space)))

(defn- escape-string [s]
  (-> s
      (str/replace "\\" "\\\\")
      (str/replace "\"" "\\\"")))

(defn- keyword->str [k]
  (if-let [ns (namespace k)]
    (str ":" ns "/" (name k))
    (str ":" (name k))))

(defn- bool->elisp [b]
  (if b "t" "nil"))

(declare emit-node)

(defn- simple-node?
  [node]
  (cond
    (nil? node) true
    (boolean? node) true
    (number? node) true
    (keyword? node) true
    (and (string? node) (not (str/includes? node "\n"))) true
    (map? node)
    (case (:el/type node)
      :symbol true
      :char true
      :quote (simple-node? (:form node))
      :quasiquote (simple-node? (:form node))
      :unquote (simple-node? (:form node))
      :splice (simple-node? (:form node))
      :function (simple-node? (:form node))
      :comment false
      :cons false
      :unknown false
      false)
    (vector? node)
    (let [tag (first node)
          items (rest node)]
      (case tag
        :el/list (and (not= :pairs (:el/layout (meta node)))
                      (<= (count items) 3)
                      (every? simple-node? items))
        :el/vector (every? simple-node? items)
        :el/source false
        false))
    :else false))

(defn- emit-string-node [^StringBuilder sb value]
  (.append sb "\"")
  (.append sb (escape-string value))
  (.append sb "\"")
  {:multi-line? false})

(defn- emit-comment-node [^StringBuilder sb {:keys [text]}]
  (let [comment-text (if (str/ends-with? text "\n") text (str text "\n"))]
    (.append sb comment-text)
    {:multi-line? true}))

(defn- emit-symbol-node [^StringBuilder sb {:keys [name]}]
  (.append sb name)
  {:multi-line? false})

(defn- emit-character-node [^StringBuilder sb {:keys [read]}]
  (.append sb read)
  {:multi-line? false})

(defn- quote-marker [type]
  (case type
    :quote "'"
    :quasiquote "`"
    :unquote ","
    :splice ",@"
    :function "#'"
    (throw (ex-info "Unsupported quote type" {:type type}))))

(defn- emit-quote-node [^StringBuilder sb {:keys [form] :as node} ctx]
  (let [marker (quote-marker (:el/type node))]
    (.append sb marker)
    (emit-node sb form ctx)))

(defn- emit-inline-content [^StringBuilder sb items ctx]
  (loop [xs items idx 0]
    (if-let [item (first xs)]
      (do
        (when (pos? idx)
          (.append sb " "))
        (emit-node sb item ctx)
        (recur (rest xs) (inc idx)))
      false)))

(defn- emit-pairs-content [^StringBuilder sb items {:keys [indent] :as ctx} child-indent pairs-offset]
  (let [pair-indent (if (some? pairs-offset)
                      (+ indent pairs-offset)
                      child-indent)
        pairs (partition 2 items)]
    (loop [pairs pairs
           first? true
           multi? false]
      (if-let [[k v] (first pairs)]
        (do
          (when-not first?
            (.append sb "
")
            (.append sb (spaces pair-indent)))
          (emit-node sb k (assoc ctx :indent pair-indent))
          (.append sb " ")
          (let [{:keys [multi-line?]} (emit-node sb v (assoc ctx :indent pair-indent))]
            (recur (rest pairs) false (or multi? multi-line? (not first?)))))
        multi?))))

(defn- emit-default-content [^StringBuilder sb items ctx child-indent]
  (loop [xs items
         idx 0
         multi? false]
    (if-let [item (first xs)]
      (cond
        (zero? idx)
        (let [{:keys [multi-line?]} (emit-node sb item ctx)]
          (recur (rest xs) 1 (or multi? multi-line?)))

        (simple-node? item)
        (do
          (.append sb " ")
          (let [{:keys [multi-line?]} (emit-node sb item ctx)]
            (recur (rest xs) (inc idx) (or multi? multi-line?))))

        :else
        (do
          (.append sb "\n")
          (.append sb (spaces child-indent))
          (let [{:keys [multi-line?]} (emit-node sb item (assoc ctx :indent child-indent))]
            (recur (rest xs) (inc idx) (or multi? true multi-line?)))))
      multi?)))

(defn- emit-list [^StringBuilder sb node {:keys [indent indent-step] :as ctx}]
  (let [meta-info (meta node)
        items (vec (rest node))
        layout (:el/layout meta-info)
        pairs-offset (:el/pairs-offset meta-info)
        child-indent (+ indent indent-step)]
    (if (empty? items)
      (do
        (.append sb "()")
        {:multi-line? false})
      (do
        (.append sb "(")
        (let [multi? (case layout
                       :inline (emit-inline-content sb items ctx)
                       :pairs (emit-pairs-content sb items ctx child-indent pairs-offset)
                       (emit-default-content sb items ctx child-indent))
              newline-before-close? (and multi? (not= layout :pairs))]
          (when newline-before-close?
            (.append sb "
")
            (.append sb (spaces indent)))
          (.append sb ")")
          {:multi-line? multi?})))))

(defn- emit-vector [^StringBuilder sb node {:keys [indent indent-step] :as ctx}]
  (let [items (vec (rest node))
        child-indent (+ indent indent-step)]
    (if (empty? items)
      (do
        (.append sb "[]")
        {:multi-line? false})
      (do
        (.append sb "[")
        (let [multi? (loop [xs items idx 0 multi? false]
                       (if-let [item (first xs)]
                         (cond
                           (zero? idx)
                           (let [{:keys [multi-line?]} (emit-node sb item ctx)]
                             (recur (rest xs) 1 (or multi? multi-line?)))

                           (simple-node? item)
                           (do
                             (.append sb " ")
                             (let [{:keys [multi-line?]} (emit-node sb item ctx)]
                               (recur (rest xs) (inc idx) (or multi? multi-line?))))

                           :else
                           (do
                             (.append sb "\n")
                             (.append sb (spaces child-indent))
                             (let [{:keys [multi-line?]} (emit-node sb item (assoc ctx :indent child-indent))]
                               (recur (rest xs) (inc idx) (or multi? true multi-line?)))))
                         multi?))]
          (when multi?
            (.append sb "\n")
            (.append sb (spaces indent)))
          (.append sb "]")
          {:multi-line? multi?})))))

(defn- emit-cons [^StringBuilder sb {:keys [car cdr]} {:keys [indent indent-step] :as ctx}]
  (let [child-indent (+ indent indent-step)
        simple-cdr? (simple-node? cdr)]
    (.append sb "(")
    (emit-node sb car ctx)
    (if simple-cdr?
      (do
        (.append sb " . ")
        (emit-node sb cdr ctx)
        (.append sb ")")
        {:multi-line? false})
      (do
        (.append sb " .\n")
        (.append sb (spaces child-indent))
        (let [{:keys [multi-line?]} (emit-node sb cdr (assoc ctx :indent child-indent))]
          (when multi-line?
            (.append sb "\n")
            (.append sb (spaces indent)))
          (.append sb ")")
          {:multi-line? true})))))

(defn- emit-node
  (^java.util.Map [^StringBuilder sb node {:keys [indent indent-step] :as ctx}]
   (cond
     (nil? node)
     (do (.append sb "nil") {:multi-line? false})

     (string? node)
     (emit-string-node sb node)

     (number? node)
     (do (.append sb (str node)) {:multi-line? false})

     (boolean? node)
     (do (.append sb (bool->elisp node)) {:multi-line? false})

     (keyword? node)
     (do (.append sb (keyword->str node)) {:multi-line? false})

     (map? node)
     (case (:el/type node)
       :symbol (emit-symbol-node sb node)
       :char (emit-character-node sb node)
       :comment (emit-comment-node sb node)
       :quote (emit-quote-node sb node ctx)
       :quasiquote (emit-quote-node sb node ctx)
       :unquote (emit-quote-node sb node ctx)
       :splice (emit-quote-node sb node ctx)
       :function (emit-quote-node sb node ctx)
       :cons (emit-cons sb node ctx)
       :unknown (throw (ex-info "Cannot emit unknown node" {:node node}))
       (throw (ex-info "Unhandled node type" {:node node})))

     (vector? node)
     (case (first node)
       :el/list (emit-list sb node ctx)
       :el/vector (emit-vector sb node ctx)
       :el/source (do
                    (doseq [[idx form] (map-indexed identity (rest node))]
                      (when (pos? idx)
                        (.append sb "\n"))
                      (emit-node sb form ctx))
                    {:multi-line? true})
       (throw (ex-info "Unknown vector node" {:node node})))

     (sequential? node)
     (do
       (doseq [[idx form] (map-indexed identity node)]
         (when (pos? idx)
           (.append sb "\n"))
         (emit-node sb form ctx))
       {:multi-line? true})

     :else
     (do (.append sb (str node)) {:multi-line? false}))))

(defn- emit-root [^StringBuilder sb node ctx]
  (let [{:keys [multi-line?]} (emit-node sb node ctx)]
    {:multi-line? multi-line?}))

(defn emit
  "Render an AST node (or sequence of nodes) to an Emacs Lisp source string.

  Options:
  - `:indent`      starting indentation (default 0)
  - `:indent-step` spaces to indent nested forms (default 2)"
  ([node] (emit node {}))
  ([node {:keys [indent indent-step] :or {indent 0 indent-step default-indent}}]
   (let [sb (StringBuilder.)]
     (emit-root sb node {:indent indent :indent-step indent-step})
     (str sb))))
