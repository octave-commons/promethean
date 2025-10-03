#!/usr/bin/env bb
(ns mk.mcp-import
  (:require
    [clojure.edn :as edn]
    [clojure.string :as str]
    [cheshire.core :as json]
    [babashka.fs :as fs]))

;; -------------------- utils --------------------
(defn die! [msg & kvs]
  (binding [*out* *err*]
    (println msg (when (seq kvs) (pr-str (apply hash-map kvs))))
    (System/exit 2)))

(defn ensure-str [x]
  (cond (string? x) x
        (keyword? x) (name x)
        (symbol? x)  (name x)
        (nil? x)     (die! "unexpected nil")
        :else        (str x)))

(defn ->servers-edn [pairs]
  ;; pairs: seq of [name {command … :args …}]
  {:mcp-servers (into (sorted-map)
                      (for [[nm spec] pairs]
                        [(keyword nm)
                         (cond-> {:command (ensure-str (:command spec))}
                           (seq (:args spec))
                           (assoc :args (vec (map ensure-str (:args spec))))
                           (:cwd spec)
                           (assoc :cwd (ensure-str (:cwd spec))))]))})

(defn slurp-json [p] (json/parse-string (slurp p)))
(defn trimq [s] (some-> s (str/replace #"^\"|\"$" "")))

;; -------------------- schema: codex.json --------------------
;; shape: {"mcpServers": {"name": {"command":"…","args":[…]}}}
(defn parse-codex-json [path]
  (let [m (slurp-json path)
        servers (get m "mcpServers")]
    (when-not (map? servers)
      (die! "codex.json: missing mcpServers"))
    (->servers-edn
      (for [[nm spec] servers]
        [nm {:command (get spec "command")
             :args    (vec (or (get spec "args") []))
             :cwd     (get spec "cwd")}]))))

;; -------------------- schema: vscode.json --------------------
;; shape: {"servers":{"name":{"command":"…","type":"stdio","args":[…]}}}
(defn parse-vscode-json [path]
  (let [m (slurp-json path)
        servers (get m "servers")]
    (when-not (map? servers)
      (die! "vscode.json: missing servers"))
    (->servers-edn
      (for [[nm spec] servers]
        [nm {:command (get spec "command")
             :args    (vec (or (get spec "args") []))
             :cwd     (get spec "cwd")}]))))

(defn splitr [s re] (str/split  re s))
;; -------------------- schema: codex.toml --------------------
;; Minimal TOML reader for our constrained shape:
;; [mcp_servers."name"]\ncommand="…"\nargs=["…","…"]
(defn parse-simple-toml [s]
  ;; Returns a map {["mcp_servers" "name"] {"command" "…" "args" ["…"]}}
  (let [lines (->> (str/split s #"\r?\n") (map str/trim))
        state (volatile! {:tbl nil :out {}})]
    (doseq [ln lines]
      (cond
        (or (str/blank? ln) (str/starts-with? ln "#")) nil

        ;; table header: [mcp_servers."name"] or [mcp_servers.name]
        (re-matches #"\[\s*([^\]]+)\s*\]" ln)
        (let [[_ inner] (re-matches #"\[\s*([^\]]+)\s*\]" ln)
              parts (->> (str/split inner #"\.")
                         (map #(-> %
                                   (str/trim)
                                   (str/replace #"^\"|\"$" ""))))]
          (vswap! state assoc :tbl parts))

        ;; key = value
        (re-matches #"^[A-Za-z0-9_\-]+\s*=" ln)
        (let [[k v] (->> (str/split ln #"\s*=\s*" 2) (map str/trim))
              v* (cond
                   (str/starts-with? v "[")
                   ;; very light array parser: ["a","b"] -> ["a" "b"]
                   (->> (subs v 1 (dec (count v)))
                        (splitr #"\s*,\s*")
                        (remove str/blank?)
                        (map trimq)
                        vec)

                   (str/starts-with? v "\"")
                   (trimq v)

                   :else v)]
          (if-let [tbl (:tbl @state)]
            (vswap! state update-in [:out tbl] assoc k v*)
            (die! "TOML: key outside table" :line ln)))

        :else nil))
    (:out @state)))

(defn parse-codex-toml [path]
  (let [m (parse-simple-toml (slurp path))
        ;; collect tables under ["mcp_servers" name]
        servers
        (for [[[t1 nm] kv] m
              :when (= t1 "mcp_servers")]
          [nm {:command (get kv "command")
               :args    (vec (or (get kv "args") []))
               :cwd     (get kv "cwd")}])]
    (when (empty? servers)
      (die! "codex.toml: no [mcp_servers.*] tables found"))
    (->servers-edn servers)))

;; -------------------- schema: elisp --------------------
;; Our generator emits:
;; (setq mcp-server-programs
;;       '(
;;         ("name" . ("cmd" ["a" "b"]))
;;         ("name2" . ("cmd2"))
;;       ))
;;
;; We'll capture each entry and EDN-read the vector part.
(defn parse-elisp [path]
  (let [s (slurp path)
        ;; Very targeted regex for our known shape:
        ;; group1: "name"
        ;; group2: "cmd"
        ;; group3: optional args vector literal (printed via pr-str, i.e., valid EDN)
        re #"\(\s*\"([^\"]+)\"\s*\.\s*\(\s*\"([^\"]+)\"\s*(\[.*?\])?\s*\)\s*\)"
        ms (re-seq re s)]
    (when (empty? ms)
      (die! "elisp: could not find any (\"name\" . (\"cmd\" [args])) entries"))
    (->servers-edn
      (for [[_ nm cmd args-edn] ms]
        [nm {:command cmd
             :args    (vec (if (str/blank? (or args-edn ""))
                             []
                             (edn/read-string args-edn)))}]))))

;; -------------------- detection & CLI --------------------
(defn detect-schema [path]
  (let [ext (str/lower-case (or (fs/extension path) ""))]
    (cond
      (= ext "json")
      (let [m (slurp-json path)]
        (cond
          (contains? m "mcpServers") :codex.json
          (contains? m "servers")    :vscode.json
          :else (die! "Unknown JSON shape" :keys (keys m))))

      (= ext "toml") :codex.toml
      (or (= ext "el") (= ext "elisp")) :elisp

      ;; fallback by content sniff
      :else
      (let [s (slurp path)]
        (cond
          (re-find #"\[mcp_servers\." s) :codex.toml
          (re-find #"\(setq\s+mcp-server-programs" s) :elisp
          (re-find #"\{\s*\"mcpServers\"" s) :codex.json
          (re-find #"\{\s*\"servers\"" s)    :vscode.json
          :else (die! "Could not detect schema; pass --schema"))))))

(defn -main [& args]
  ;; usage:
  ;;   bb mk/mcp-import.bb <input> [--schema codex.toml|codex.json|vscode.json|elisp]
  (let [[in & more] args
        _  (when-not in (die! "usage: bb mk/mcp-import.bb <input> [--schema …]"))
        opt-idx (.indexOf more "--schema")
        schema (when (<= 0 opt-idx (- (count more) 2))
                 (keyword (nth more (inc opt-idx))))
        schema (or schema (detect-schema in))
        out-edn
        (case schema
          :codex.json  (parse-codex-json in)
          :vscode.json (parse-vscode-json in)
          :codex.toml  (parse-codex-toml in)
          :elisp       (parse-elisp in)
          (die! "Unknown schema" :schema schema))]
    (prn out-edn)))

(when (= *file* (System/getProperty "babashka.file"))
  (apply -main *command-line-args*))
