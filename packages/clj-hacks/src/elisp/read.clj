(ns elisp.read
  (:import [io.github.bonede.treesitter TSParser TSNode]
           ;; class name follows the pattern used by other bundles
           [io.github.bonede.treesitter.elisp TreeSitterElisp]))

(defn ^TSParser mk-parser []
  (doto (TSParser.) (.setLanguage (TreeSitterElisp/getLanguage))))

(defn parse-root ^TSNode [^String src]
  (let [parser (mk-parser)]
    (.. parser (parseString nil src) (getRootNode))))

(defmulti node->edn (fn [^TSNode n] (.getType n)))
(defn children [^TSNode n]
  (map #(.getChild n %) (range (.getChildCount n))))

(defmethod node->edn "program" [n]
  (into [:el/source]
        (map node->edn (children n))))

(defmethod node->edn "integer" [n] (Long/parseLong (.getText n)))
(defmethod node->edn "float"   [n] (Double/parseDouble (.getText n)))
(defmethod node->edn "string"  [n] (.getText n))                ; strip quotes if you like
(defmethod node->edn "symbol"  [n] {:el/type :symbol :name (.getText n)}) ; preserve elisp symbolness
(defmethod node->edn "character" [n] {:el/type :char :read (.getText n)})
(defmethod node->edn "comment" [n] {:el/type :comment :text (.getText n)})

;; Proper list
(defmethod node->edn "list" [n]
  (into [:el/list]
        (map node->edn (children n))))

;; Dotted pair: (a . b)
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
  (derive (keyword t) ::form)
  (defmethod node->edn t [n]
    {:el/type tag :form (node->edn (first (children n)))}))

(defmethod node->edn :default [n]
  {:el/type :unknown
   :node/type (.getType ^TSNode n)
   :raw (.getText ^TSNode n)})

(defn elisp->data [src]
  (-> src parse-root node->edn))
