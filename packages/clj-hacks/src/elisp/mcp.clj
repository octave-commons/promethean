(ns elisp.mcp
  (:require [clojure.edn :as edn]
            [elisp.read :as read]))

(defn- comment-node? [node]
  (and (map? node) (= :comment (:el/type node))))

(defn- symbol-node-name [node]
  (when (and (map? node) (= :symbol (:el/type node)))
    (:name node)))

(defn- unwrap-quote [node]
  (if (and (map? node) (= :quote (:el/type node)))
    (:form node)
    node))

(defn- list-items [node]
  (when (and (vector? node) (= :el/list (first node)))
    (subvec node 1)))

(defn- vector-items [node]
  (when (and (vector? node) (= :el/vector (first node)))
    (subvec node 1)))

(defn- literal-value [node]
  (cond
    (string? node) (edn/read-string node)
    (number? node) node
    (map? node)
    (case (:el/type node)
      :symbol (:name node)
      :char (:read node)
      :quote (literal-value (:form node))
      nil)
    :else nil))

(defn- vector-values [node]
  (->> (vector-items node)
       (remove comment-node?)
       (map literal-value)
       (remove nil?)
       vec))

(defn- entry->pair [entry]
  (when (and (map? entry) (= :cons (:el/type entry)))
    (let [name (literal-value (:car entry))
          spec (-> entry :cdr unwrap-quote)
          items (->> (list-items spec)
                     (remove comment-node?))
          command-node (first items)
          command (literal-value command-node)
          args-node (some #(when (and (vector? %)
                                       (= :el/vector (first %)))
                             %)
                           (rest items))
          args (when args-node (vector-values args-node))]
      (when (and name command)
        [name (cond-> {:command command}
                 (seq args) (assoc :args args))]))))

(defn- entries-from-value [value]
  (let [list-node (-> value unwrap-quote)]
    (->> (list-items list-node)
         (remove comment-node?)
         (map entry->pair)
         (remove nil?))))

(defn- setq-node? [node]
  (and (vector? node)
       (= :el/list (first node))
       (>= (count node) 3)
       (= "setq" (symbol-node-name (nth node 1)))))

(defn- setq-bindings [node]
  (when (setq-node? node)
    (loop [forms (subvec node 2)
           acc []]
      (let [[var & rest-forms] (drop-while comment-node? forms)]
        (if (nil? var)
          acc
          (let [[value & remaining] (drop-while comment-node? rest-forms)
                name (symbol-node-name var)]
            (if (or (nil? value) (nil? name))
              acc
              (recur remaining (conj acc [name value])))))))))

(defn- source-forms [data]
  (cond
    (and (vector? data) (= :el/source (first data))) (subvec data 1)
    (sequential? data) (vec data)
    :else [data]))

(defn parse-mcp-server-programs
  "Parses `mcp-server-programs` entries from the provided Emacs Lisp source.
  Returns a vector of `[name {:command ... :args [...]}]` pairs in source order.
  Entries that cannot be parsed are skipped."
  [source]
  (let [_root (read/parse-root source)
        data (read/elisp->data source)]
    (->> (source-forms data)
         (mapcat setq-bindings)
         (filter (fn [[sym _]] (= sym "mcp-server-programs")))
         (mapcat (comp entries-from-value second))
         vec)))
