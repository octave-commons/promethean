(ns clj-hacks.mcp.adapter-codex-toml-test
  (:require [babashka.fs :as fs]
            [clj-hacks.mcp.adapter-codex-toml :as adapter]
            [clojure.test :refer :all]))

(def sample-toml
  (str
   "# header\n"
   "experimental_use_rmcp_client = true\n\n"
   "[mcp_servers.\"github\"]\n"
   "command = \"gh\"\n"
   "args = [\"api\", \"me\"]\n"
   "cwd = \"/tmp/github\"\n"
   "env = { PATH = [\"/opt/bin\", \"/usr/bin\"], JSON = { key = \"val\" }, ESCAPED = \"value,with,comma\" }\n\n"
   "[mcp_servers.\"figma\"]\n"
   "url = \"https://mcp.linear.app/mcp\"\n"
   "bearer_token_env_var = \"FIGMA_TOKEN\"\n"
   "http_headers = { \"X-Custom-Header\" = \"custom-value\" }\n"
   "env_http_headers = { \"X-User-Agent\" = \"USER_AGENT_VAR\" }\n\n"
   "[mcp_servers.\"plain\"]\n"
   "command = \"echo\"\n\n"
   "# footer\n"))

(deftest read-full-extracts-tables
  (let [tmp  (fs/create-temp-file {:prefix "mcp-toml-" :suffix ".toml"})
        path (str tmp)]
    (spit path sample-toml)
    (let [{:keys [mcp rest raw]} (adapter/read-full path)
          servers (:mcp-servers mcp)]
      ;; Test experimental flag
      (is (= true (:experimental-use-rmcp-client mcp)))
      
      ;; Test STDIO server
      (is (= "gh" (get-in servers [:github :command])))
      (is (= ["api" "me"] (get-in servers [:github :args])))
      (is (= "/tmp/github" (get-in servers [:github :cwd])))
      (let [env (get-in servers [:github :env])]
        (is (= ["/opt/bin" "/usr/bin"] (get env "PATH")))
        (is (= {"key" "val"} (get env "JSON")))
        (is (= "value,with,comma" (get env "ESCAPED"))))
      
      ;; Test HTTP server
      (is (= "https://mcp.linear.app/mcp" (get-in servers [:figma :url])))
      (is (= "FIGMA_TOKEN" (get-in servers [:figma :bearer-token-env-var])))
      (let [headers (get-in servers [:figma :http-headers])]
        (is (= {"X-Custom-Header" "custom-value"} headers)))
      (let [env-headers (get-in servers [:figma :env-http-headers])]
        (is (= {"X-User-Agent" "USER_AGENT_VAR"} env-headers)))
      
      ;; Test plain server
      (is (= "echo" (get-in servers [:plain :command])))
      (is (string? rest))
      (is (string? raw)))))

(deftest write-full-renders-tables
  (let [tmp  (fs/create-temp-file {:prefix "mcp-toml-out-" :suffix ".toml"})
        path (str tmp)
        data {:mcp {:mcp-servers {:x {:command "cmd" :args ["a" "b"] :cwd "/tmp/x"}
                                  :y {:command "yo"}
                                  :figma {:url "https://mcp.figma.com/mcp"
                                          :bearer-token-env-var "FIGMA_TOKEN"
                                          :http-headers {"X-API-Version" "v1"}
                                          :env-http-headers {"X-User-Agent" "USER_AGENT"}}}
                    :experimental-use-rmcp-client true}
              :rest "# preserved"}]
    (adapter/write-full path data)
    (let [s (slurp path)]
      ;; Test experimental flag
      (is (re-find #"experimental_use_rmcp_client = true" s))
      
      ;; Test STDIO servers
      (is (re-find #"\[mcp_servers.\"x\"\]" s))
      (is (re-find #"command = \"cmd\"" s))
      (is (re-find #"args = \[\"a\", \"b\"\]" s))
      (is (re-find #"cwd = \"/tmp/x\"" s))
      (is (re-find #"\[mcp_servers.\"y\"\]" s))
      (is (re-find #"command = \"yo\"" s))
      
      ;; Test HTTP server
      (is (re-find #"\[mcp_servers.\"figma\"\]" s))
      (is (re-find #"url = \"https://mcp.figma.com/mcp\"" s))
      (is (re-find #"bearer_token_env_var = \"FIGMA_TOKEN\"" s))
      (is (re-find #"http_headers = \{ \"X-API-Version\" = \"v1\" \}" s))
      (is (re-find #"env_http_headers = \{ \"X-User-Agent\" = \"USER_AGENT\" \}" s)))))

(deftest write-full-generates-http-stdio-entries
  (let [tmp  (fs/create-temp-file {:prefix "mcp-toml-http-" :suffix ".toml"})
        path (str tmp)
        data {:mcp {:mcp-servers {:base {:command "noop" :cwd "/repo"}}
                    :http {:transport :http
                           :tools ['kanban_get_board 'kanban_update_status]
                           :include-help? true
                           :stdio-meta {:title "Default"}
                           :endpoints {:kanban {:tools ['kanban_get_board]
                                                :include-help? false
                                                :meta {:description "Kanban"}}}
                           :proxy {:config "./config/mcp_servers.edn"}}}
              :rest ""}]
    (adapter/write-full path data)
    (let [s (slurp path)]
      (is (re-find #"\[mcp_servers.\"http-default\"\]" s))
      (is (re-find #"command = \"pnpm\"" s))
      (is (re-find #"args = \[\"--filter\", \"@promethean/mcp\", \"dev\"\]" s))
      (is (re-find #"cwd = \"/repo\"" s))
      (is (re-find #"env = \{ MCP_CONFIG_JSON = \"\\\\\"transport\\\\\":\\\\\"stdio\\\\\"" s))
      (is (re-find #"\[mcp_servers.\"http-kanban\"\]" s))
      (is (re-find #"kanban_get_board" s)))))

(deftest http-streamable-config-roundtrip
  (let [tmp  (fs/create-temp-file {:prefix "mcp-http-stream-" :suffix ".toml"})
        path (str tmp)
        original-toml (str
                       "experimental_use_rmcp_client = true\n\n"
                       "[mcp_servers.\"context7\"]\n"
                       "url = \"https://api.context7.io/mcp\"\n"
                       "bearer_token_env_var = \"CONTEXT7_API_KEY\"\n"
                       "http_headers = { \"X-API-Version\" = \"v1\", \"X-Client\" = \"codex\" }\n"
                       "env_http_headers = { \"X-User-ID\" = \"USER_ID\" }\n\n")
        expected-data {:mcp {:mcp-servers {:context7 {:url "https://api.context7.io/mcp"
                                                    :bearer-token-env-var "CONTEXT7_API_KEY"
                                                    :http-headers {"X-API-Version" "v1" "X-Client" "codex"}
                                                    :env-http-headers {"X-User-ID" "USER_ID"}}
                            :experimental-use-rmcp-client true}}}]
    ;; Write original TOML
    (spit path original-toml)
    
    ;; Read it back
    (let [{:keys [mcp]} (adapter/read-full path)]
      ;; Verify structure
      (is (= true (:experimental-use-rmcp-client mcp)))
      (is (= "https://api.context7.io/mcp" (get-in mcp [:mcp-servers :context7 :url])))
      (is (= "CONTEXT7_API_KEY" (get-in mcp [:mcp-servers :context7 :bearer-token-env-var])))
      (is (= {"X-API-Version" "v1" "X-Client" "codex"} 
             (get-in mcp [:mcp-servers :context7 :http-headers])))
      (is (= {"X-User-ID" "USER_ID"} 
             (get-in mcp [:mcp-servers :context7 :env-http-headers])))
      
      ;; Write it back out
      (adapter/write-full path {:mcp m :rest ""})
      
      ;; Read again to verify roundtrip
      (let [{:keys [mcp]} (adapter/read-full path)]
        (is (= true (:experimental-use-rmcp-client mcp)))
        (is (= "https://api.context7.io/mcp" (get-in mcp [:mcp-servers :context7 :url])))))))
