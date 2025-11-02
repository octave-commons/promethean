(ns omni-tools.config.edl
  "Emacs Lisp configuration adapter for MCP servers."
  (:require [clojure.string :as str]
            [clojure.walk :as walk]
            [omni-tools.config.core :as core]))

;; ----- Tree-sitter parsing -----
(defn parse-sexp [s]
  "Parse string s into a Clojure data structure using simple rules."
  (let [s (str/trim s)]
    (when-not (str/blank? s)
      (let [balanced? (fn [open close]
                               (fn [acc c]
                                 (cond
                                   (and (= c open) (= c close)) (reduced acc)
                                   (= c open) (inc acc)
                                   :else acc)))]
        (loop [chars (seq s)
               depth 0
               in-string? false
               escaped? false
               result []]
          (if (empty? chars)
            (apply str (reverse result))
            (let [[ch & rest] chars]
              (cond
                ;; Skip escaped characters
                (and escaped? (= ch \"))
                (recur rest depth in-string? false result)

                ;; Handle escape character
                (and (= ch \\) in-string?)
                (recur rest depth in-string? true result)

                ;; Start/end of string
                (= ch \")
                (recur rest depth (not in-string?) result)

                ;; Count parentheses/brackets
                (and (not in-string?)
                     (or (= ch \() (= ch \[) (= ch \{)))
                (recur rest (inc depth) in-string? false (conj result ch))

                ;; Closing parentheses/brackets
                (and (not in-string?)
                     (or (= ch \)) (= ch \]) (= ch \})))
                (recur rest (dec depth) in-string? false (conj result ch))

                ;; Regular character
                :else
                (recur rest depth in-string? false (conj result ch)))))))))

(defn extract-mcp-servers-from-sexp [sexp]
  "Extract MCP server configurations from parsed Emacs Lisp sexp."
  [sexp]
  (when (and (coll? sexp) (= (first sexp) 'setq))
    (let [[_ _ servers-sexp] sexp]
      (when (and (coll? servers-sexp) (= (first servers-sexp) 'quote))
        (let [servers-list (second servers-sexp)]
          (when (coll? servers-list)
            (into {}
                  (for [server-sexp servers-list]
                    (when (and (coll? server-sexp) (>= (count server-sexp) 2))
                      (let [[name-symbol & config-sexps] server-sexp
                            name (when (symbol? name-symbol) (str name-symbol))
                            config-pairs (partition 2 config-sexps)]
                        (when name
                          {name (into {}
                                         (for [[k v] config-pairs]
                                           (when (and (coll? v) (= (first v) :quote))
                                             [k (second v)])))))))))))

(defn read-full
  "Read EDL (Emacs Lisp) file and extract MCP server configurations."
  [path]
  (let [content (slurp path)]
    (try
      (let [parsed (parse-sexp content)]
        {:mcp {:mcp-servers (extract-mcp-servers-from-sexp parsed)}
         :rest content
         :raw content})
      (catch Exception e
        (throw (ex-info "Failed to parse EDL file" {:path path :error e})))))

(defn write-full
  "Write MCP configuration to EDL (Emacs Lisp) format."
  [path {:keys [mcp rest]}]
  (let [servers (:mcp-servers mcp)
        server-sexps (for [[name config] servers]
                           (let [config-pairs (mapcat (fn [[k v]]
                                                      [[k v]])]
                                 name-sexp (if (symbol? name)
                                               (symbol name)
                                               (str name))]
                             (cons name-sexp config-pairs)))
        servers-list (list 'quote (apply list server-sexps))
        setq-sexp (list 'setq 'mcp-hub-servers servers-list)
        content (str/join "\n" [(or rest "") setq-sexp])]
    (core/ensure-parent! path)
    (spit path content)))