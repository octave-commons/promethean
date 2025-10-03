(ns mk.mcp-adapter-codex-toml-test
  (:require [clojure.test :refer :all]
            [babashka.fs :as fs]
            [mk.mcp-adapter-codex-toml :as adapter]))

(def sample-toml
  (str
   "# header\n"
   "[mcp_servers.\"github\"]\n"
   "command = \"gh\"\n"
   "args = [\"api\", \"me\"]\n\n"
   "[mcp_servers.\"plain\"]\n"
   "command = \"echo\"\n"
   "cwd = \"/tmp\"\n\n"
   "# footer\n"))

(deftest read-full-extracts-tables
  (let [tmp (fs/create-temp-file {:prefix "mcp-toml-" :suffix ".toml"})
        path (str tmp)]
    (spit path sample-toml)
    (let [{:keys [mcp rest raw]} (adapter/read-full path)
          servers (:mcp-servers mcp)]
      (is (= "gh" (get-in servers [:github :command])))
      (is (= ["api" "me"] (get-in servers [:github :args])))
      (is (= "echo" (get-in servers [:plain :command])))
      (is (= "/tmp" (get-in servers [:plain :cwd])))
      (is (string? rest))
      (is (string? raw)))))

(deftest write-full-renders-tables
  (let [tmp (fs/create-temp-file {:prefix "mcp-toml-out-" :suffix ".toml"})
        path (str tmp)
        data {:mcp {:mcp-servers {:x {:command "cmd" :args ["a" "b"] :cwd "/srv"}
                                  :y {:command "yo"}}}
              :rest "# preserved"}]
    (adapter/write-full path data)
    (let [s (slurp path)]
      (is (re-find #"\[mcp_servers.\"x\"\]" s))
      (is (re-find #"command = \"cmd\"" s))
      (is (re-find #"args = \[\"a\", \"b\"\]" s))
      (is (re-find #"cwd = \"/srv\"" s))
      (is (re-find #"\[mcp_servers.\"y\"\]" s))
      (is (re-find #"command = \"yo\"" s)))))
