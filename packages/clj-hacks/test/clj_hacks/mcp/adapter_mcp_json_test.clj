(ns clj-hacks.mcp.adapter-mcp-json-test
  (:require [babashka.fs :as fs]
            [cheshire.core :as json]
            [clj-hacks.mcp.adapter-mcp-json :as adapter]
            [clojure.test :refer [deftest is]]))

(deftest read-full-parses-http-config
  (let [tmp  (fs/create-temp-file {:prefix "mcp-json-" :suffix ".json"})
        path (str tmp)
        _    (spit path
                   (str
                    "{\n"
                    "  \"foo\": 1,\n"
                    "  \"transport\": \"http\",\n"
                    "  \"tools\": [\"files_view_file\"],\n"
                    "  \"includeHelp\": false,\n"
                    "  \"stdioMeta\": {\n"
                    "    \"title\": \"Default\",\n"
                    "    \"workflow\": [\"inspect\"],\n"
                    "    \"expectations\": { \"usage\": [\"call mcp_toolset\"] }\n"
                    "  },\n"
                    "  \"endpoints\": {\n"
                    "    \"files\": {\n"
                    "      \"tools\": [\"files_view_file\"],\n"
                    "      \"includeHelp\": true,\n"
                    "      \"meta\": {\n"
                    "        \"description\": \"Read files\",\n"
                    "        \"expectations\": { \"pitfalls\": [\"binary\"] }\n"
                    "      }\n"
                    "    }\n"
                    "  },\n"
                    "  \"stdioProxyConfig\": \"./config/mcp_servers.edn\",\n"
                    "  \"mcpServers\": {\n"
                    "    \"foo\": {\n"
                    "      \"command\": \"echo\",\n"
                    "      \"args\": [\"a\", \"b\"],\n"
                    "      \"cwd\": \"/tmp/foo\",\n"
                    "      \"env\": { \"NODE_ENV\": \"test\" },\n"
                    "      \"timeout\": 90,\n"
                    "      \"description\": \"Local echo\",\n"
                    "      \"version\": \"1.2.3\",\n"
                    "      \"metadata\": { \"scope\": \"dev\" },\n"
                    "      \"capabilities\": { \"claude\": { \"stream\": true } },\n"
                    "      \"autoConnect\": true,\n"
                    "      \"autoApprove\": [\"files.write\"],\n"
                    "      \"autoAccept\": [\"files.view\"],\n"
                    "      \"disabled\": false\n"
                    "    },\n"
                    "    \"bar\": { \"command\": \"run\", \"disabled\": true }\n"
                    "  }\n"
                    "}"))
        {:keys [mcp rest]} (adapter/read-full path)]
    (is (map? mcp))
    (is (= #{{:command "echo"
              :args ["a" "b"]
              :cwd "/tmp/foo"
              :env {"NODE_ENV" "test"}
              :timeout 90
              :description "Local echo"
              :version "1.2.3"
              :metadata {"scope" "dev"}
              :capabilities {"claude" {"stream" true}}
              :auto-connect? true
              :auto-approve ["files.write"]
              :auto-accept ["files.view"]
              :disabled? false}
             {:command "run" :disabled? true}}
           (set (vals (:mcp-servers mcp)))))
    (is (= {:transport :http
            :tools ["files_view_file"]
            :include-help? false
            :stdio-meta {:title "Default"
                         :workflow ["inspect"]
                         :expectations {:usage ["call mcp_toolset"]}}
            :endpoints {:files {:tools ["files_view_file"]
                                :include-help? true
                                :meta {:description "Read files"
                                       :expectations {:pitfalls ["binary"]}}}}
            :proxy {:config "./config/mcp_servers.edn"}}
           (:http mcp)))
    (is (= {"foo" 1} rest))))

(deftest write-full-writes-valid-json
  (let [tmp-out  (fs/create-temp-file {:prefix "mcp-json-out-" :suffix ".json"})
        path-out (str tmp-out)
        data     {:mcp {:mcp-servers {:foo {:command "echo"
                                            :args ["a" "b"]
                                            :cwd "/tmp/foo"
                                            :env {"NODE_ENV" "test"}
                                            :timeout 90
                                            :description "Local echo"
                                            :version "1.2.3"
                                            :metadata {"scope" "dev"}
                                            :capabilities {"claude" {"stream" true}}
                                            :auto-connect? true
                                            :auto-approve ["files.write"]
                                            :auto-accept ["files.view"]
                                            :disabled? false}
                                      :bar {:command "run" :disabled? true}}
                        :http {:transport :http
                               :tools ["files_view_file"]
                               :include-help? true
                               :stdio-meta {:title "Default"
                                            :expectations {:usage ["workflow"]}}
                               :endpoints {:files {:tools ["files_view_file"]}}
                               :proxy {:config "./config/mcp_servers.edn"}}}
                   :rest {"foo" 1}}]
    (adapter/write-full path-out data)
    (is (fs/exists? path-out))
    (let [out (json/parse-string (slurp path-out))]
      (is (= "http" (get out "transport")))
      (is (= ["files_view_file"] (get out "tools")))
      (is (= true (get out "includeHelp")))
      (is (= "Default" (get-in out ["stdioMeta" "title"])))
      (is (= ["files_view_file"] (get-in out ["endpoints" "files" "tools"])))
      (is (= "./config/mcp_servers.edn" (get out "stdioProxyConfig")))
      (is (= {"NODE_ENV" "test"} (get-in out ["mcpServers" "foo" "env"])))
      (is (= 90 (get-in out ["mcpServers" "foo" "timeout"])))
      (is (= ["files.write"] (get-in out ["mcpServers" "foo" "autoApprove"])))
      (is (= ["files.view"] (get-in out ["mcpServers" "foo" "autoAccept"])))
      (is (= true (get-in out ["mcpServers" "foo" "autoConnect"])))
      (is (= false (get-in out ["mcpServers" "foo" "disabled"])))
      (is (= true (get-in out ["mcpServers" "bar" "disabled"]))))))

(deftest http-config-round-trips
  (let [tmp-out  (fs/create-temp-file {:prefix "mcp-json-rt-" :suffix ".json"})
        path-out (str tmp-out)
        canonical {:mcp {:mcp-servers {:foo {:command "echo"
                                             :env {"NODE_ENV" "test"}
                                             :auto-approve ["files.write"]
                                             :disabled? false}}
                         :http {:transport :http
                                :tools ["a" "b"]
                                :include-help? false
                                :stdio-meta {:title "Stdio" :workflow []}
                                :endpoints {:alpha {:tools ["a"]
                                                    :include-help? true
                                                    :meta {:title "Alpha"
                                                           :expectations {:usage ["call a"]}}}}
                                :proxy {:config "./config/servers.edn"}}}
                    :rest {}}]
    (adapter/write-full path-out canonical)
    (let [{:keys [mcp]} (adapter/read-full path-out)]
      (is (= {:foo {:command "echo"}} (:mcp-servers mcp)))
      (is (= (:http (:mcp canonical)) (:http mcp))))))

(deftest write-full-skips-nil-servers
  (let [tmp-out  (fs/create-temp-file {:prefix "mcp-json-nil-" :suffix ".json"})
        path-out (str tmp-out)
        data     {:mcp {:mcp-servers {:remove nil
                                      :keep {:command "echo"}}}}
        _        (adapter/write-full path-out data)
        out      (json/parse-string (slurp path-out))
        servers  (get out "mcpServers")]
    (is (map? servers))
    (is (not (contains? servers "remove")))
    (is (= "echo" (get-in servers ["keep" "command"])))))
