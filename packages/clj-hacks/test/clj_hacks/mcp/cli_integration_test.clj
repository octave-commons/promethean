(ns clj-hacks.mcp.cli-integration-test
  (:require [babashka.fs :as fs]
            [cheshire.core :as json]
            [clj-hacks.mcp.cli :as mcp-cli]
            [clojure.edn :as edn]
            [clojure.string :as str]
            [clojure.test :refer [deftest is testing]]))

(def base-config
  {:mcp-servers
   {:filesystem {:command "npx"
                 :args ["@modelcontextprotocol/server-filesystem" "/workspace"]
                 :cwd "~"
                 :env {"ALLOW" "1" "REGION" "earth"}
                 :description "Filesystem access"
                 :timeout 120
                 :metadata {:owner "ops" :tags ["fs" "local"]}
                 :capabilities {:claude {:stream true :tools true}}
                 :auto-approve ["fs.write"]
                 :auto-accept ["fs.read"]}
    :github {:command "npx"
             :args ["@modelcontextprotocol/server-github"]
             :env {"TOKEN" "ghp_demo"}
             :description "GitHub integration"
             :version "1.0.0"
             :disabled? false}
    :http-default {:command "npx"
                   :args ["mcp-remote" "http://127.0.0.1:3210/mcp"]}
    :custom-stdio {:command "java"
                   :args ["-jar" "custom.jar"]
                   :cwd "$HOME/projects"
                   :auto-connect? true
                   :auto-approve ["system.execute"]
                   :auto-accept ["system.info"]
                   :disabled? true}}
   :http {:transport :http
          :base-url "http://localhost:8900"
          :tools [:catalog.lookup "fs.read"]
          :include-help? true
          :stdio-meta {:title "Promethean Hub"
                       :description "Primary MCP hub"
                       :workflow ["setup" "run"]
                       :expectations {:usage ["Set $HOME path" "Start servers"]
                                      :pitfalls ["Network downtime"]
                                      :prerequisites ["Java" "Node"]}}
          :endpoints {:analytics {:tools ["analytics.query"]
                                  :include-help? false
                                  :meta {:title "Analytics"
                                         :description "Advanced analytics endpoint"
                                         :workflow ["connect" "query"]
                                         :expectations {:usage ["Call analytics"]
                                                        :pitfalls ["Rate limits"]}}}
                      :docs {:tools [:docs.search]
                             :include-help? true
                             :meta {:title "Documentation"
                                    :description "Docs aggregator"}}}
          :proxy {:config "./config/proxy.edn"}}
   :outputs [{:schema :mcp.json :path "out/promethean.mcp.json"}
             {:schema :claude_code.json :path "out/claude.mcp.json"}
             {:schema :vscode.json :path "out/vscode-mcp.json"}
             {:schema :codex.toml :path "out/codex.toml"}
             {:schema :elisp :path "out/mcp-servers.el"}
             {:schema :opencode.json :path "out/opencode.json"}]})

(defn write-config! [path data]
  (binding [*print-length* nil
            *print-level* nil]
    (spit path (pr-str data))))

(defn read-config [path]
  (edn/read-string (slurp path)))

(defn schema->slug [schema]
  (-> schema
      (str/replace #"[^a-zA-Z0-9]+" "-")
      (str/replace #"(^-)|(-$)" "")))

(defn integration-server [name]
  {:command "npx"
   :args ["@integration/server" name]
   :description (str "Integration server " name)
   :env {"INTEGRATION_SERVER" name}})

(def schema-cases
  [{:schema "mcp.json"
    :target ["out" "promethean.mcp.json"]
    :verify (fn [path server-name]
              (let [data (json/parse-string (slurp path))]
                (contains? (get data "mcpServers") server-name)))}
   {:schema "claude_code.json"
    :target ["out" "claude.mcp.json"]
    :verify (fn [path server-name]
              (let [data (json/parse-string (slurp path))]
                (contains? (get data "mcpServers") server-name)))}
   {:schema "vscode.json"
    :target ["out" "vscode-mcp.json"]
    :verify (fn [path server-name]
              (let [data (json/parse-string (slurp path))]
                (contains? (get data "servers") server-name)))}
   {:schema "codex.toml"
    :target ["out" "codex.toml"]
    :verify (fn [path server-name]
              (boolean (re-find (re-pattern (str "\\[mcp_servers\\.\"" server-name "\"\\]"))
                                (slurp path))))}
   {:schema "elisp"
    :target ["out" "mcp-servers.el"]
    :verify (fn [path server-name]
              (str/includes? (slurp path) (str "(\"" server-name "\"")))}
   {:schema "opencode.json"
    :target ["out" "opencode.json"]
    :verify (fn [path server-name]
              (let [data (json/parse-string (slurp path))]
                (contains? (get-in data ["mcp" "mcpServers"]) server-name)))}])

(defn run-cli! [schema target config-path]
  (fn [command]
    (let [{:keys [exit message]}
          (mcp-cli/run command [schema target "--edn" config-path])]
      (is (= 0 exit) (str schema " " command " failed" (when message (str ": " message)))))))

(deftest cli-command-integration
  (let [tmp (fs/create-temp-dir {:prefix "clj-hacks-cli-"})
        config-path (str (fs/path tmp "config.edn"))
        out-dir (fs/path tmp "out")]
    (try
      (doseq [{:keys [schema target verify]} schema-cases
              :let [slug (schema->slug schema)
                    server-name (str "integration-" slug)
                    server-key (keyword server-name)
                    target-path (str (apply fs/path tmp target))
                    run-command (run-cli! schema target-path config-path)]]
        (testing (str "CLI operations for " schema)
          (fs/delete-if-exists config-path)
          (when (fs/exists? out-dir)
            (fs/delete-tree out-dir))
          (write-config! config-path base-config)

          ;; push creates the target
          (run-command "push")
          (is (fs/exists? target-path) (str "Target not created for " schema))

          ;; remove :github to confirm pull merges from target
          (write-config! config-path
                         (update (read-config config-path) :mcp-servers dissoc :github))
          (run-command "pull")
          (is (contains? (:mcp-servers (read-config config-path)) :github)
              (str "pull did not restore :github server for " schema))

          ;; add integration server and sync
          (write-config! config-path
                         (assoc-in (read-config config-path)
                                   [:mcp-servers server-key]
                                   (integration-server server-name)))
          (run-command "sync")
          (is (contains? (:mcp-servers (read-config config-path)) server-key)
              (str "sync did not retain integration server in config for " schema))
          (is (verify target-path server-name)
              (str "sync did not update target for " schema))))
      (finally
        (fs/delete-tree tmp)))))
