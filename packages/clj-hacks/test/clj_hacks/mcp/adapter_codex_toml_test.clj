(ns clj-hacks.mcp.adapter-codex-toml-test
  (:require [babashka.fs :as fs]
            [clj-hacks.mcp.adapter-codex-toml :as adapter]
            [clojure.test :refer :all]))

(def sample-toml
  (str
   "# header\n"
   "[mcp_servers.\"github\"]\n"
   "command = \"gh\"\n"
   "args = [\"api\", \"me\"]\n"
   "cwd = \"/tmp/github\"\n"
   "env = { PATH = [\"/opt/bin\", \"/usr/bin\"], JSON = { key = \"val\" }, ESCAPED = \"value,with,comma\" }\n\n"
   "[mcp_servers.\"plain\"]\n"
   "command = \"echo\"\n\n"
   "# footer\n"))

(deftest read-full-extracts-tables
  (let [tmp  (fs/create-temp-file {:prefix "mcp-toml-" :suffix ".toml"})
        path (str tmp)]
    (spit path sample-toml)
    (let [{:keys [mcp rest raw]} (adapter/read-full path)
          servers (:mcp-servers mcp)]
      (is (= "gh" (get-in servers [:github :command])))
      (is (= ["api" "me"] (get-in servers [:github :args])))
      (is (= "/tmp/github" (get-in servers [:github :cwd])))
      (let [env (get-in servers [:github :env])]
        (is (= ["/opt/bin" "/usr/bin"] (get env "PATH")))
        (is (= {"key" "val"} (get env "JSON")))
        (is (= "value,with,comma" (get env "ESCAPED"))))
      (is (= "echo" (get-in servers [:plain :command])))
      (is (string? rest))
      (is (string? raw)))))

(deftest write-full-renders-tables
  (let [tmp  (fs/create-temp-file {:prefix "mcp-toml-out-" :suffix ".toml"})
        path (str tmp)
        data {:mcp {:mcp-servers {:x {:command "cmd" :args ["a" "b"] :cwd "/tmp/x"}
                                  :y {:command "yo"}}}
              :rest "# preserved"}]
    (adapter/write-full path data)
    (let [s (slurp path)]
      (is (re-find #"\[mcp_servers.\"x\"\]" s))
      (is (re-find #"command = \"cmd\"" s))
      (is (re-find #"args = \[\"a\", \"b\"\]" s))
      (is (re-find #"cwd = \"/tmp/x\"" s))
      (is (re-find #"\[mcp_servers.\"y\"\]" s))
      (is (re-find #"command = \"yo\"" s)))))

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
