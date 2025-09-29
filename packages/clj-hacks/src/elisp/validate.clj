(ns elisp.validate
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [elisp.read :as read])
  (:import [org.treesitter TSNode]
           [java.nio.file Paths]))

(def ^:private org-lang-pattern
  #"(?mis)^[ \t]*#\+BEGIN_SRC\s+(?:emacs-)?lisp\b[^\n]*\n(.*?)(?m)^[ \t]*#\+END_SRC")

(def ^:private ignored-map-keys
  #{:el/type :node/type :raw :text :name :read})

(defn- truncate
  ([s limit]
   (let [limit (or limit 0)]
     (if (and s (> (count s) limit))
       (str (subs s 0 limit) "…")
       s)))
  ([s]
   (truncate s 80)))

(defn- normalize-path [path]
  (-> path io/file .getCanonicalPath))

(defn- present-path [path]
  (let [cwd (Paths/get (System/getProperty "user.dir") (make-array String 0))
        target (Paths/get path (make-array String 0))]
    (try
      (let [rel (.relativize cwd target)]
        (if (str/blank? (str rel)) path (str rel)))
      (catch Exception _
        path))))

(defn- context-label [{:keys [file block-index start-line]}]
  (let [base (present-path file)
        with-block (if (some? block-index)
                     (format "%s block %d" base (inc block-index))
                     base)]
    (if (some? start-line)
      (format "%s (line %d)" with-block start-line)
      with-block)))

(defn- path->string [path]
  (when (seq path)
    (str/join " -> "
              (map (fn [segment]
                     (cond
                       (keyword? segment) (name segment)
                       :else (str segment)))
                   path))))

(defn- lisp-file? [^java.io.File f]
  (let [name (.getName f)]
    (or (str/ends-with? name ".el")
        (str/ends-with? name ".org"))))

(defn- expand-target [target]
  (let [f (io/file target)]
    (cond
      (.isDirectory f)
      (->> (file-seq f)
           (filter #(.isFile ^java.io.File %))
           (filter lisp-file?)
           (map (comp normalize-path str)))

      (.isFile f)
      (when (lisp-file? f)
        [(normalize-path f)])

      :else [])))

(defn- default-targets []
  (let [candidates [(io/file "../.emacs/layers")
                    (io/file ".emacs/layers")]
        existing (->> candidates (filter #(.exists ^java.io.File %)) (map #(.getPath ^java.io.File %)))]
    (vec existing)))

(defn- expand-targets [targets]
  (->> (or (seq targets) (default-targets))
       (mapcat expand-target)
       (map normalize-path)
       distinct
       sort
       vec))

(defn- syntax-diagnostics [^TSNode root context source]
  (when (.hasError root)
    [{:type :syntax-error
      :context context
      :message (str "Syntax error reported by tree-sitter in " (context-label context))
      :snippet (-> source str/trim (truncate 120))}]))

(defn- sequential-children [node]
  (cond
    (vector? node)
    (let [items (vec node)]
      (if (and (seq items)
               (keyword? (first items))
               (str/starts-with? (name (first items)) "el/"))
        (map-indexed (fn [idx child] [(inc idx) child]) (subvec items 1))
        (map-indexed vector items)))

    (sequential? node)
    (map-indexed vector (vec node))

    :else []))

(defn- unknown-diagnostic [node context path]
  (let [label (context-label context)
        snippet (some-> (:raw node) str/trim (truncate 80))
        path-fragment (path->string path)
        node-type (:node/type node)
        snippet-label (when (seq snippet) (format "`%s`" snippet))
        base (if snippet-label
               (str "Unknown form " snippet-label)
               "Unknown form")
        location (cond-> label
                    path-fragment (str ", path " path-fragment))]
    {:type :unknown-form
     :context context
     :path path
     :node-type node-type
     :raw (:raw node)
     :message (->> [base
                    (when node-type (format "[node %s]" node-type))
                    (when location (str " in " location))]
                   (remove nil?)
                   (str/join " "))}))

(defn- unknown-form-diagnostics [data context]
  (letfn [(walk [node path]
            (lazy-seq
             (concat
              (when (and (map? node)
                         (= :unknown (:el/type node)))
                [(unknown-diagnostic node context path)])
              (cond
                (map? node)
                (mapcat (fn [[k v]]
                          (if (ignored-map-keys k)
                            []
                            (walk v (conj path k))))
                        node)

                (sequential? node)
                (mapcat (fn [[idx child]] (walk child (conj path idx)))
                        (sequential-children node))

                :else []))))]
    (vec (walk data []))))

(defn- diagnostics-for-source [source context]
  (try
    (let [root (read/parse-root source)
          data (read/elisp->data source)
          syntax (syntax-diagnostics root context source)
          unknowns (unknown-form-diagnostics data context)]
      (vec (concat syntax unknowns)))
    (catch Throwable t
      [{:type :exception
        :context context
        :message (str "Exception while parsing " (context-label context) ": " (.getMessage t))}]))
  )

(defn- org-lisp-blocks [content]
  (let [matcher (re-matcher org-lang-pattern content)]
    (loop [acc []]
      (if (.find matcher)
        (let [body (.group matcher 1)
              start (.start matcher)
              preceding (.substring content 0 start)
              start-line (inc (count (re-seq #"\n" preceding)))
              block-index (count acc)
              code (-> body (str/replace #"(?s)\s+$" ""))]
          (recur (conj acc {:code code
                             :start-line start-line
                             :block-index block-index})))
        acc))))

(defn- validate-elisp-file [path]
  {:file path
   :diagnostics (diagnostics-for-source (slurp path) {:file path})})

(defn- validate-org-file [path]
  (let [content (slurp path)
        blocks (org-lisp-blocks content)
        diagnostics (mapcat (fn [{:keys [code] :as block}]
                              (diagnostics-for-source code (assoc block :file path)))
                            blocks)]
    {:file path
     :diagnostics (vec diagnostics)}))

(defn validate-path [path]
  (let [path (normalize-path path)]
    (if (str/ends-with? path ".org")
      (validate-org-file path)
      (validate-elisp-file path))))

(defn validate-paths [targets]
  (let [files (expand-targets targets)
        results (mapv validate-path files)]
    {:files files
     :results results
     :ok? (every? (comp empty? :diagnostics) results)}))

(defn- print-diagnostics [results]
  (doseq [{:keys [file diagnostics]} results
          :when (seq diagnostics)]
    (println (str "✖ " (present-path file)))
    (doseq [{:keys [message]} diagnostics]
      (println (str "  - " message)))
    (println)))

(defn -main [& args]
  (let [{:keys [files results ok?]} (validate-paths args)
        count-files (count files)]
    (cond
      (zero? count-files)
      (println "No Lisp sources matched the provided targets." )

      (= 1 count-files)
      (println (format "Checked %d Lisp source." count-files))

      :else
      (println (format "Checked %d Lisp sources." count-files)))
    (when-not ok?
      (print-diagnostics results))
    (System/exit (if ok? 0 1))))

(comment
  (-main))
