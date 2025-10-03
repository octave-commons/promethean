(ns clj-hacks.mcp.adapter-elisp
  "Adapter for Emacs Lisp MCP configuration snippets."
  (:require [clj-hacks.mcp.core :as core]
            [clojure.edn :as edn]
            [clojure.string :as str]))

(def ^:private re-with-eval
  #"\(with-eval-after-load 'mcp(?s:).*?setq\s+mcp-hub-servers(?s:.*?)\)\s*\)\s*\)")

(def ^:private re-hub-setq
  #"\(setq\s+mcp-hub-servers\s+'(\((?s:.*)\))\)")

(def ^:private re-legacy-setq
  #"\(setq\s+mcp-server-programs\s+'\((?s:.*?)\)\)")

(defn- skip-ws [^String s idx]
  (let [len (.length s)]
    (loop [i idx]
      (if (and (< i len) (Character/isWhitespace (.charAt s i)))
        (recur (inc i))
        i))))

(defn- skip-string [^String s idx]
  (let [len (.length s)]
    (loop [i (inc idx)]
      (when (>= i len)
        (throw (ex-info "Unterminated string literal" {:source s :index idx})))
      (let [ch (.charAt s i)]
        (cond
          (= ch \"\\)
          (let [next (inc i)]
            (if (< next len)
              (recur (inc next))
              (throw (ex-info "Invalid escape sequence" {:source s :index i}))))

          (= ch \"\")
          (inc i)

          :else
          (recur (inc i)))))))

(defn- extract-paren [^String s idx]
  (let [len (.length s)]
    (when (>= idx len)
      (throw (ex-info "Unexpected end of input" {:source s :index idx})))
    (when-not (= \( (.charAt s idx))
      (throw (ex-info "Expected '('" {:source s :index idx})))
    (loop [i idx depth 0]
      (when (>= i len)
        (throw (ex-info "Unbalanced parentheses" {:source s :index idx})))
      (let [ch (.charAt s i)]
        (cond
          (= ch \()
          (recur (inc i) (inc depth))

          (= ch \))
          (let [next-depth (dec depth)]
            (if (zero? next-depth)
              [(subs s idx (inc i)) (inc i)]
              (recur (inc i) next-depth)))

          (= ch \"\")
          (recur (skip-string s i) depth)

          :else
          (recur (inc i) depth))))))

(defn- parse-quoted [^String s idx]
  (when-not (= \" (.charAt s idx))
    (throw (ex-info "Expected string" {:source s :index idx})))
  (let [end (skip-string s idx)]
    [(edn/read-string (subs s idx end)) end]))

(defn- parse-plist [s]
  (let [items (edn/read-string s)
        pairs (partition 2 items)]
    (into (sorted-map)
          (for [[k v] pairs]
            (let [v* (cond
                       (sequential? v) (vec v)
                       :else v)]
              [k v*])))))

(defn- parse-entry [^String s idx]
  (let [idx (skip-ws s idx)]
    (when (>= idx (.length s))
      (throw (ex-info "Unexpected end of input while parsing entry"
                      {:source s :index idx})))
    (when-not (= \( (.charAt s idx))
      (throw (ex-info "Expected entry to start with '('"
                      {:source s :index idx})))
    (let [idx (skip-ws s (inc idx))
          [name idx] (parse-quoted s idx)
          idx (skip-ws s idx)]
      (when-not (= \.
                    (.charAt s idx))
        (throw (ex-info "Expected dotted pair separator '.'"
                        {:source s :index idx})))
      (let [idx (skip-ws s (inc idx))
            [plist idx] (extract-paren s idx)
            props (parse-plist plist)
            idx (skip-ws s idx)]
        (when-not (= \) (.charAt s idx))
          (throw (ex-info "Expected entry to terminate with ')'"
                          {:source s :index idx})))
        [[(keyword name) props] (inc idx)]))))

(defn- parse-hub-servers [s]
  (let [len (.length ^String s)
        start (skip-ws s 0)]
    (when (or (zero? len) (not= \( (.charAt ^String s start)))
      (throw (ex-info "Expected list of servers" {:source s :index start})))
    (loop [idx (inc start)
           entries []]
      (let [idx (skip-ws s idx)]
        (cond
          (>= idx len)
          (into (sorted-map) entries)

          (= \) (.charAt ^String s idx))
          (into (sorted-map) entries)

          :else
          (let [[entry next-idx] (parse-entry s idx)]
            (recur next-idx (conj entries entry))))))))

(defn- escape-string [s]
  (-> s
      (str/replace "\\" "\\\\")
      (str/replace "\"" "\\\"")))

(defn- render-string [s]
  (str "\"" (escape-string s) "\""))

(defn- render-list [xs]
  (str "(" (str/join " " (map render-string xs)) ")"))

(def key-order
  [:command :args :cwd])

(def key-rank
  (zipmap key-order (range)))

(defn- ordered-keys [m]
  (sort-by (fn [k] [(get key-rank k 1000) (name k)])
           (keys m)))

(def property-indent "            ")
(def property-continued "                      ")

(defn- render-value [v]
  (cond
    (string? v) (render-string v)
    (sequential? v) (render-list v)
    (true? v) "t"
    (false? v) "nil"
    (nil? v) "nil"
    :else (render-string (str v))))

(defn- render-prop [k v]
  (str ":" (name k) " " (render-value v)))

(defn- render-props [props]
  (let [ks (vec (ordered-keys props))]
    (if (seq ks)
      (let [last-idx (dec (count ks))]
        (->> ks
             (map-indexed (fn [idx k]
                            (let [prefix (if (zero? idx)
                                           (str property-indent "(")
                                           property-continued)
                                  rendered (render-prop k (get props k))
                                  suffix (if (= idx last-idx) "))" "")]
                              (str prefix rendered suffix))))
             (str/join "\n")))
      (str property-indent "())"))))

(defn- render-entry [idx [k props]]
  (let [prefix (if (zero? idx)
                 "        '(( "
                 "          ( ")]
    (str prefix "\"" (name k) "\" .\n"
         (render-props props)
         "\n")))

(defn- render-setq [mcp]
  (let [entries (vec (sort-by (comp name key) (:mcp-servers mcp)))
        body (if (seq entries)
               (let [rendered (map-indexed render-entry entries)]
                 (str (apply str rendered)
                      "          )))\n"))
               "        '()\n          )))\n")]
    (str "(with-eval-after-load 'mcp\n"
         "  (setq mcp-hub-servers\n"
         body)))

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

(defn read-full [path]
  (let [s (slurp path)]
    (if-let [[_ servers-str] (re-find re-hub-setq s)]
      (let [servers (parse-hub-servers servers-str)
            rest    (str/replace s re-with-eval "")]
        {:mcp {:mcp-servers servers}
         :rest rest
         :raw  s})
      (let [legacy (parse-legacy s)
            rest   (str/replace s re-legacy-setq "")]
        {:mcp {:mcp-servers (:mcp-servers legacy)}
         :rest rest
         :raw  s}))))

(defn write-full [path {:keys [mcp rest]}]
  (let [block (render-setq mcp)
        base  (or rest "")
        trimmed (str/trimr base)
        prefix (if (str/blank? trimmed) "" (str trimmed "\n\n"))
        out    (str prefix block)]
    (core/ensure-parent! path)
    (spit path (str out (when-not (str/ends-with? out "\n") "\n")))))
