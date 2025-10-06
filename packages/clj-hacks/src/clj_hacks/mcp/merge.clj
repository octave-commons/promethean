(ns clj-hacks.mcp.merge
  "Adapter-aware push/pull helpers for MCP configuration formats."
  (:require [babashka.fs :as fs]
            [clj-hacks.mcp.adapter-codex-toml :as codex-toml]
            [clj-hacks.mcp.adapter-elisp :as elisp]
            [clj-hacks.mcp.adapter-mcp-json :as mcp-json]
            [clj-hacks.mcp.adapter-vscode-json :as vscode-json]
            [clj-hacks.mcp.core :as core]))

(def adapters
  {;; Official MCP JSON
   :mcp.json   {:read mcp-json/read-full   :write mcp-json/write-full   :rest-default {}}
   ;; Back-compat alias so old calls keep working for now
   :codex.json {:read mcp-json/read-full   :write mcp-json/write-full   :rest-default {}}

   ;; Vendor-specific
   :vscode.json {:read vscode-json/read-full :write vscode-json/write-full :rest-default {}}
   :codex.toml  {:read codex-toml/read-full  :write codex-toml/write-full  :rest-default ""}
   :elisp       {:read elisp/read-full       :write elisp/write-full       :rest-default {:before "" :after ""}}})

(defn- ensure-adapter! [schema]
  (when-not (contains? adapters schema)
    (throw (ex-info (str "Unknown :schema " schema) {:known (keys adapters)}))))

(defn pull [{:keys [schema path]} edn-map]
  (ensure-adapter! schema)
  (let [{:keys [read]} (adapters schema)
        t              (read path)]
    ((:mcp-merge core/*pull-policy*) edn-map (:mcp t))))

(defn push [{:keys [schema path]} edn-map]
  (ensure-adapter! schema)
  (let [{:keys [read write rest-default]} (adapters schema)
        t       (when (fs/exists? path) (read path))
        merged  {:mcp  ((:mcp-merge core/*push-policy*) (:mcp t) edn-map)
                 :rest (or (:rest t) rest-default)}]
    (write path merged)))

(defn sync! [{:keys [schema path]} edn-map]
  (let [edn* (pull {:schema schema :path path} edn-map)]
    (push {:schema schema :path path} edn*)
    edn*))
