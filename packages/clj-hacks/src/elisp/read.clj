(ns elisp.read
  (:import [java.nio.charset StandardCharsets]
           [org.treesitter TSParser TSNode TreeSitterElisp]))

(defonce ^TreeSitterElisp elisp-language (TreeSitterElisp.))

(def ^:dynamic *source* "")
(def ^:dynamic ^"[B" *source-bytes* nil)

(defn ^TSParser mk-parser []
  (doto (TSParser.) (.setLanguage (.copy elisp-language))))

(defn parse-root ^TSNode [^String src]
  (let [parser (mk-parser)]
    (.. parser (parseString nil src) (getRootNode))))

(defn- node-text ^String [^TSNode n]
  (let [^bytes bytes (or *source-bytes*
                          (throw (IllegalStateException. "node-text requires bound *source-bytes*")))
        start (.getStartByte n)
        end (.getEndByte n)
        length (- end start)]
    (String. bytes start length StandardCharsets/UTF_8)))

(defmulti node->edn (fn [^TSNode n] (.getType n)))
(defn children [^TSNode n]
  (map #(.getNamedChild n %) (range (.getNamedChildCount n))))

(defmethod node->edn "program" [n]
  (into [:el/source]
        (map node->edn (children n))))

(defmethod node->edn "source_file" [n]
  (into [:el/source]
        (map node->edn (children n))))

(defmethod node->edn "integer" [n] (Long/parseLong (node-text n)))
(defmethod node->edn "float"   [n] (Double/parseDouble (node-text n)))
(defmethod node->edn "string"  [n] (node-text n))                ; strip quotes if you like
(defmethod node->edn "symbol"  [n] {:el/type :symbol :name (node-text n)}) ; preserve elisp symbolness
(defmethod node->edn "character" [n] {:el/type :char :read (node-text n)})
(defmethod node->edn "comment" [n] {:el/type :comment :text (node-text n)})

;; Proper list (also handles dotted pairs emitted as symbols)
(defmethod node->edn "list" [n]
  (let [[car maybe-dot cdr :as items] (map node->edn (children n))]
    (if (and (= 3 (count items))
             (map? maybe-dot)
             (= :symbol (:el/type maybe-dot))
             (= "." (:name maybe-dot)))
      {:el/type :cons :car car :cdr cdr}
      (into [:el/list] items))))

;; Legacy dotted pair node (present in older grammars)
(defmethod node->edn "dotted_pair" [n]
  (let [[car dot cdr] (children n)]
    {:el/type :cons :car (node->edn car) :cdr (node->edn cdr)}))

;; Vector: [ ... ]
(defmethod node->edn "vector" [n]
  (into [:el/vector] (map node->edn (children n))))

;; Quote/backquote/etc. Normalize to explicit forms
(doseq [[t tag] {"quote" :quote "quasiquote" :quasiquote
                 "unquote" :unquote "unquote_splicing" :splice
                 "function" :function}]        ; #'x
  (derive (keyword "el" t) ::form)
  (defmethod node->edn t [n]
    {:el/type tag :form (node->edn (first (children n)))}))

(defmethod node->edn :default [n]
  {:el/type :unknown
   :node/type (.getType ^TSNode n)
   :raw (node-text n)})

(defn- unwrap-source [node]
  (if (and (vector? node)
           (= :el/source (first node)))
    (let [forms (vec (rest node))]
      (cond
        (empty? forms) [:el/source]
        (= 1 (count forms)) (first forms)
        :else (into [:el/source] forms)))
    node))

(defn elisp->data [src]
  (binding [*source* src
            *source-bytes* (.getBytes ^String src StandardCharsets/UTF_8)]
    (-> src parse-root node->edn unwrap-source)))
