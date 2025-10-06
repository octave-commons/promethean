(ns elisp.read
  (:import [java.nio.charset StandardCharsets]
           [org.treesitter TSParser TSNode TSPoint TreeSitterElisp]))

(defonce elisp-language (TreeSitterElisp.))

(def ^:dynamic *source* "")
(def ^:dynamic *source-bytes* nil)

(defn ^TSParser mk-parser []
  (doto (TSParser.) (.setLanguage (.copy elisp-language))))

(defn parse-root ^TSNode [^String src]
  (let [parser (mk-parser)]
    (.. parser (parseString nil src) (getRootNode))))

(defn node-text*
  ^String [^TSNode n ^bytes bytes]
  (let [start (.getStartByte n)
        end   (.getEndByte n)]
    (String. bytes start (- end start) StandardCharsets/UTF_8)))

(defn node-text
  (^String [^TSNode n]
   (node-text n (or *source-bytes*
                    (throw (IllegalStateException. "node-text requires bound *source-bytes*")))))
  (^String [^TSNode n ^bytes bytes]
   (node-text* n bytes)))

(defn point->map [^TSPoint p]
  {:row (.getRow p)
   :column (.getColumn p)})

(defn- child-field [^TSNode parent idx]
  (when-let [field (.getFieldNameForChild parent idx)]
    (keyword field)))

(defn- node->syntax*
  [^TSNode node ^bytes source-bytes child-index field-name]
  (let [child-count (.getChildCount node)
        named-child-count (.getNamedChildCount node)
        start-byte (.getStartByte node)
        end-byte (.getEndByte node)
        start-point (point->map (.getStartPoint node))
        end-point (point->map (.getEndPoint node))
        text (node-text node source-bytes)
        children (mapv (fn [idx]
                         (let [child (.getChild node idx)
                               field (child-field node idx)]
                           (node->syntax* child source-bytes idx field)))
                       (range child-count))]
    {:type (.getType node)
     :named? (.isNamed node)
     :has-error? (.hasError node)
     :start-byte start-byte
     :end-byte end-byte
     :start-point start-point
     :end-point end-point
     :child-count child-count
     :named-child-count named-child-count
     :child-index child-index
     :field-name field-name
     :text text
     :children children}))

(defn node->syntax
  "Convert a `TSNode` into a concrete tree map with offsets and text."
  ([^TSNode node ^bytes source-bytes]
   (node->syntax* node source-bytes nil nil))
  ([^TSNode node ^bytes source-bytes child-index field-name]
   (node->syntax* node source-bytes child-index field-name)))

(defn syntax-tree
  "Parse `source` into a syntax tree map that preserves comments and trivia.

  Returns {:source string
           :source-bytes byte-array
           :root-node TSNode
           :root map
           :has-errors? boolean}."
  [^String source]
  (let [bytes (.getBytes source StandardCharsets/UTF_8)
        root-node (parse-root source)]
    {:source source
     :source-bytes bytes
     :root-node root-node
     :root (node->syntax root-node bytes)
     :has-errors? (.hasError root-node)}))

(defn unwrap-source [node]
  (if (and (vector? node)
           (= :el/source (first node)))
    (let [forms (vec (rest node))]
      (cond
        (empty? forms) [:el/source]
        (= 1 (count forms)) (first forms)
        :else (into [:el/source] forms)))
    node))

(defn- named-children [^TSNode n]
  (map #(.getNamedChild n %) (range (.getNamedChildCount n))))

(defmulti node->edn (fn [n] (.getType n)))

(defmethod node->edn "program" [n]
  (into [:el/source]
        (map node->edn (named-children n))))

(defmethod node->edn "source_file" [n]
  (into [:el/source]
        (map node->edn (named-children n))))

(defmethod node->edn "integer" [n] (Long/parseLong (node-text n)))
(defmethod node->edn "float"   [n] (Double/parseDouble (node-text n)))
(defmethod node->edn "string"  [n] (node-text n))                ; strip quotes if you like
(defmethod node->edn "symbol"  [n] {:el/type :symbol :name (node-text n)}) ; preserve elisp symbolness
(defmethod node->edn "character" [n] {:el/type :char :read (node-text n)})
(defmethod node->edn "comment" [n] {:el/type :comment :text (node-text n)})

;; Proper list (also handles dotted pairs emitted as symbols)
(defmethod node->edn "list" [n]
  (let [[car maybe-dot cdr :as items] (map node->edn (named-children n))]
    (if (and (= 3 (count items))
             (map? maybe-dot)
             (= :symbol (:el/type maybe-dot))
             (= "." (:name maybe-dot)))
      {:el/type :cons :car car :cdr cdr}
      (into [:el/list] items))))

;; Legacy dotted pair node (present in older grammars)
(defmethod node->edn "dotted_pair" [n]
  (let [[car dot cdr] (named-children n)]
    {:el/type :cons :car (node->edn car) :cdr (node->edn cdr)}))

;; Vector: [ ... ]
(defmethod node->edn "vector" [n]
  (into [:el/vector] (map node->edn (named-children n))))

;; Quote/backquote/etc. Normalize to explicit forms
(doseq [[t tag] {"quote" :quote "quasiquote" :quasiquote
                 "unquote" :unquote "unquote_splicing" :splice
                 "function" :function}]        ; #'x
  (derive (keyword "el" t) ::form)
  (defmethod node->edn t [n]
    {:el/type tag :form (node->edn (first (named-children n)))}))

(defmethod node->edn :default [n]
  {:el/type :unknown
   :node/type (.getType n)
   :raw (node-text n)})

(defn elisp->data [src]
  (binding [*source* src
            *source-bytes* (.getBytes ^String src StandardCharsets/UTF_8)]
    (-> src parse-root node->edn unwrap-source)))
