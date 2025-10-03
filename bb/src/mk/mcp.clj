#!/usr/bin/env bb
(ns mk.mcp
  (:require [clojure.edn :as edn]
            [clojure.string :as str]
            [cheshire.core :as json]
            [babashka.fs :as fs]))

;; ---------- helpers ----------
(defn ensure-str [x where]
  (cond
    (string? x) x
    (keyword? x) (name x)
    (symbol? x)  (name x)
    (nil? x)     (throw (ex-info (str where ": got nil") {:where where}))
    :else        (str x)))

(defn q [s] (str "\"" (str/replace s #"\"" "\\\\\"") "\""))
(defn toml-table [nm] (format "[mcp_servers.%s]\n" (q nm)))
(defn toml-assign [k v] (format "%s = %s\n" k v))
(defn toml-array [xs] (str "[" (str/join ", " xs) "]"))

(defn- ensure-parent! [p]
  (when-let [dir (some-> p fs/path fs/parent)]
    (fs/create-dirs dir)))

(defn- sorted-servers [servers]
  (sort-by (comp name key) servers))

;; ---------- pure renderers (schema functions) ----------
(defn render-codex-toml
  "Return TOML text for Codex from servers map."
  [servers]
  (letfn [(render-toml [[k spec]]
            (let [name-str (ensure-str k "server name")
                  cmd      (ensure-str (:command spec) ":command")
                  args     (:args spec)
                  cwd      (:cwd spec)]
              (str
               (toml-table name-str)
               (toml-assign "command" (q cmd))
               (when (seq args)
                 (toml-assign "args" (toml-array (map #(q (ensure-str % ":args")) args))))
               (when cwd
                 (toml-assign "cwd" (q (ensure-str cwd ":cwd"))))
               "\n")))]
    (str "# generated — do not edit\n\n"
         (apply str (map render-toml (sorted-servers servers))))))

(defn render-codex-json
  "Return Codex JSON text: {\"mcpServers\": {name -> {command,args}}}."
  [servers]
  (let [pair (fn [[k spec]]
               [(ensure-str k "server name")
                (cond-> {"command" (ensure-str (:command spec) ":command")}
                  (seq (:args spec))
                  (assoc "args" (vec (map #(ensure-str % ":args") (:args spec))))
                  (:cwd spec)
                  (assoc "cwd" (ensure-str (:cwd spec) ":cwd")) )])
        payload {"mcpServers" (into (sorted-map) (map pair servers))}]
    (json/generate-string payload {:pretty true})))

(defn render-vscode-json
  "Return VSCode JSON text: {\"servers\":{name->{type:\"stdio\",command,args}}, ...opts }."
  [servers {:keys [include-inputs?] :as _opts}]
  (let [pair (fn [[k spec]]
               [(ensure-str k "server name")
                (cond-> {"command" (ensure-str (:command spec) ":command")
                         "type"    "stdio"}
                  (seq (:args spec))
                  (assoc "args" (vec (map #(ensure-str % ":args") (:args spec))))
                  (:cwd spec)
                  (assoc "cwd" (ensure-str (:cwd spec) ":cwd")) )])
        base {"servers" (into (sorted-map) (map pair servers))}
        payload (cond-> base
                  include-inputs? (assoc "inputs" []))]
    (json/generate-string payload {:pretty true})))

(defn render-elisp
  "Return Emacs Lisp text for (setq mcp-server-programs '((\"name\" . (\"cmd\" [args])) ...))."
  [servers]
  (letfn [(entry [[k spec]]
            (let [name-str (ensure-str k "server name")
                  cmd      (ensure-str (:command spec) ":command")
                  args     (vec (map #(ensure-str % ":args") (:args spec)))]
              ;; The Emacs client does not yet understand cwd values; we only
              ;; emit command/args here while keeping :cwd in the canonical EDN
              ;; model for other outputs.
              (format "  (\"%s\" . (\"%s\"%s))"
                      name-str cmd (if (seq args) (str " " (pr-str args)) ""))))]
    (str ";;; mcp-servers.el --- generated, do not edit\n"
         "(setq mcp-server-programs\n"
         "      '(\n"
         (str/join "\n" (map entry (sorted-servers servers)))
         "\n      ))\n")))
(defn resolve-path
  "Expand ~, then resolve relative to base; return absolute string path."
  [base p]
  (let [p1 (-> (str p) fs/expand-home)]
    (-> (if (fs/absolute? p1)
          p1
          (fs/path base p1))
        fs/absolutize
        str)))

;; ---------- schema registry ----------
(def schema->renderer
  {;; keyword   -> [render-fn file-extension default-opts?]
   :codex.toml  (fn [servers _opts] (render-codex-toml servers))
   :codex.json  (fn [servers _opts] (render-codex-json servers))
   :vscode.json (fn [servers opts]  (render-vscode-json servers opts))
   :elisp       (fn [servers _opts] (render-elisp servers))})

;; ---------- main ----------
(defn -main
  "Usage: bb gen-mcp  (reads $BB_MCP_CFG or mk/mcp.edn, writes all outputs)."
  [& [cfg-path]]
  (let [cfg-path (or cfg-path (or (System/getenv "BB_MCP_CFG") "mk/mcp.edn"))
        _        (when-not (fs/exists? cfg-path)
                   (binding [*out* *err*]
                     (println "Config not found:" cfg-path)
                     (System/exit 2)))
        cfg      (-> cfg-path slurp edn/read-string)
        servers  (:mcp-servers cfg)
        outputs  (:outputs cfg)
        _        (when-not (map? servers)
                   (throw (ex-info ":mcp-servers must be a map" {:found (type servers)})))
        _        (when-not (sequential? outputs)
                   (throw (ex-info ":outputs must be a vector of {:schema :path ...}" {:found (type outputs)})))
        base-dir (str (fs/parent (fs/path cfg-path)))]
    (println "mcp-servers:" (->> servers keys (map #(or % :<nil>)) (map str) sort vec))
    (doseq [{:keys [schema path opts] :as out} outputs]
      (when (or (nil? schema) (nil? path))
        (throw (ex-info "Each output needs :schema and :path" {:out out})))
      (let [renderer (get schema->renderer schema)]
        (when-not renderer
          (throw (ex-info (str "Unknown :schema " schema) {:known (keys schema->renderer)})))
        (let [abs (resolve-path base-dir path)
              txt (renderer servers (or opts {}))]
          (ensure-parent! abs)
          (spit abs txt)
          (println "wrote" abs))))))

;; Allow bb to run file directly
(when (= *file* (System/getProperty "babashka.file"))
  (apply -main *command-line-args*))
