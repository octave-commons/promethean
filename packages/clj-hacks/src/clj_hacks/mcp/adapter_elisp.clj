(ns clj-hacks.mcp.adapter-elisp
  "Adapter for Emacs Lisp MCP configuration snippets."
  (:require [clj-hacks.mcp.core :as core]
            [clj-hacks.mcp.elisp :as elisp]
            [clojure.edn :as edn]
            [clojure.string :as str]
            [elisp.mcp :as mcp-ast]
            [elisp.read :as elisp-read])
  (:import [java.io FileNotFoundException]))

(def ^:private default-http-base
  (or (System/getenv "MCP_HTTP_BASE")
      "http://127.0.0.1:3210"))

(def ^:private re-hub-setq
  #"\(setq\s+mcp-hub-servers\s+'(\((?s:.*)\))\)")

(def ^:private re-legacy-setq
  #"\(setq\s+mcp-server-programs\s+'\((?s:.*?)\)\)")

;; ----------------------------------------------------------------------------
;; Tree-sitter backed parsing helpers
;; ----------------------------------------------------------------------------

(defn- strip-quotes [s]
  (if (and (string? s)
           (<= 2 (count s))
           (= " (first s))
           (= " (last s)))
    (subs s 1 (dec (count s)))
    s))

(defn- parse-string-literal [s]
  (try
    (let [trimmed (strip-quotes s)]
      (if (= trimmed s)
        s
        (edn/read-string (str "\"" trimmed "\""))))
    (catch Exception _ s)))

(defn- symbol-name->value [name]
  (cond
    (= name "t") true
    (= name "nil") nil
    (str/starts-with? name ":") (keyword (subs name 1))
    :else name))

(defn- plist-key? [node]
  (and (map? node)
       (= :symbol (:el/type node))
       (str/starts-with? (:name node) ":")))

(defn- el-list-items [node]
  (when (and (vector? node) (keyword? (first node)))
    (case (first node)
      :el/list (rest node)
      :el/vector (rest node)
      nil)))

(defn- node->value [node]
  (cond
    (string? node) (parse-string-literal node)
    (number? node) node
    (vector? node)
    (let [items (el-list-items node)]
      (when items
        (mapv node->value items)))
    (map? node)
    (case (:el/type node)
      :symbol (symbol-name->value (:name node))
      :quote (node->value (:form node))
      :cons {:car (node->value (:car node))
             :cdr (node->value (:cdr node))}
      :comment nil
      :unknown (:raw node)
      node)
    :else node))

(defn- plist->map [plist-node]
  (let [items (el-list-items plist-node)]
    (loop [remaining items, acc (sorted-map)]
      (if (seq remaining)
        (let [[k-node v-node & rest-items] remaining
              key (when (plist-key? k-node)
                    (keyword (subs (:name k-node) 1)))
              val (node->value v-node)]
          (recur rest-items (if key (assoc acc key val) acc)))
        acc))))

(defn- parse-servers-str [servers-str]
  (let [data (elisp-read/elisp->data servers-str)
        list-node (some #(when (and (vector? %)
                                    (= :el/list (first %)))
                           %)
                        (rest data))]
    (if-not list-node
      (sorted-map)
      (into (sorted-map)
            (keep (fn [entry]
                    (when (and (map? entry)
                               (= :cons (:el/type entry)))
                      (let [name (node->value (:car entry))
                            props (plist->map (:cdr entry))]
                        (when name
                          [(keyword (str name)) props])))))
            (el-list-items list-node)))))

;; ----------------------------------------------------------------------------
;; Legacy parsing helpers
;; ----------------------------------------------------------------------------

(defn- parse-legacy [s]
  (let [re-entry #"\(\s*\"([^\"]+)\"\s*\.\s*\(\s*\"([^\"]+)\"\s*(\[.*?\])?\s*\)\s*\)"
        ms (re-seq re-entry s)]
    {:mcp-servers
     (into (sorted-map)
           (map (fn [[_ nm cmd args-edn]]
                  (let [entry (cond-> {:command cmd}
                                (and args-edn (not (str/blank? args-edn)))
                                (assoc :args (vec (read-string args-edn))))]
                    [(keyword nm) entry]))
                ms))}))

;; ----------------------------------------------------------------------------
;; HTTP helpers (retain behaviour of legacy adapter)
;; ----------------------------------------------------------------------------

(defn- endpoint-key->path [k]
  (let [s (cond
            (keyword? k) (if-let [ns (namespace k)]
                           (str ns "/" (name k))
                           (name k))
            (string? k) k
            :else (str k))]
    (if (str/starts-with? s "/") s (str "/" s))))

(defn- path->entry-key [path]
  (if (= path "/mcp")
    :http-default
    (keyword (str "http-"
                  (str/replace (subs path 1) #"/" "-")))))

(defn- http-endpoints->servers [http]
  (when (and (map? http) (= (:transport http) :http))
    (let [base (or (:base-url http) default-http-base)
          endpoints (or (:endpoints http) {})
          entries (cond-> []
                     (seq (:tools http))
                     (conj [:http-default {:url (str base "/mcp")}]))]
      (->> (sort-by (fn [[k _]] (endpoint-key->path k)) endpoints)
           (reduce (fn [acc [k _]]
                     (let [path (endpoint-key->path k)
                           key  (path->entry-key path)]
                       (if (= key :http-default)
                         acc
                         (conj acc [key {:url (str base path)}]))))
                   entries)
           (into (sorted-map))))))

(defn- merge-http-servers [servers http]
  (let [base-map (into (sorted-map) servers)
        http-map (http-endpoints->servers http)]
    (reduce (fn [acc [k v]]
              (if (contains? acc k)
                acc
                (assoc acc k v)))
            base-map
            http-map)))

;; ----------------------------------------------------------------------------
;; Public API
;; ----------------------------------------------------------------------------

(defn read-full [path]
  (let [s (slurp path)]
    (if-let [{:keys [block before after block-start block-end]} (mcp-ast/find-generated-block s)]
      (let [servers-str (some-> (re-find re-hub-setq block) second)
            servers     (if servers-str
                          (parse-servers-str servers-str)
                          (sorted-map))]
        {:mcp {:mcp-servers servers}
         :rest {:before before :after after}
         :raw s
         :block-range {:start block-start :end block-end}})
      (let [legacy (parse-legacy s)
            rest-str (if (re-find re-legacy-setq s)
                       (str/replace s re-legacy-setq "")
                       s)]
        {:mcp {:mcp-servers (:mcp-servers legacy)}
         :rest {:before rest-str :after ""}
         :raw s
         :legacy? true}))))

(defn- resolve-source [path rest]
  (try
    (slurp path)
    (catch FileNotFoundException _
      (cond
        (and (map? rest) (contains? rest :before) (contains? rest :after))
        (str (or (:before rest) "") (or (:after rest) ""))

        (string? rest) rest

        :else ""))))

(defn write-full [path {:keys [mcp rest]}]
  (let [mcp'     (core/expand-servers-home mcp)
        combined (merge-http-servers (:mcp-servers mcp') (:http mcp'))]
    (if (and (map? rest) (contains? rest :before) (contains? rest :after))
      (let [block (elisp/render-generated-block combined)
            out   (str (or (:before rest) "") block (or (:after rest) ""))
            out*  (if (str/ends-with? out "
") out (str out "
"))]
        (core/ensure-parent! path)
        (spit path out*)
        {:ok? true
         :source out*
         :block block
         :changed? true
         :inserted? false})
      (let [original (resolve-source path rest)
            rewrite  (elisp/rewrite-source original combined)]
        (if (:ok? rewrite)
          (let [out (:source rewrite)
                out* (if (str/ends-with? out "
") out (str out "
"))]
            (core/ensure-parent! path)
            (spit path out*)
            (assoc rewrite :source out*))
          (throw (ex-info "Unable to rewrite Elisp MCP configuration" rewrite)))))))
