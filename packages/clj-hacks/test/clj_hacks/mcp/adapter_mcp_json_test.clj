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
                    "  \"tools\": [\"files.view-file\"],\n"
                    "  \"includeHelp\": false,\n"
                    "  \"stdioMeta\": {\n"
                    "    \"title\": \"Default\",\n"
                    "    \"workflow\": [\"inspect\"],\n"
                    "    \"expectations\": { \"usage\": [\"call mcp.toolset\"] }\n"
                    "  },\n"
                    "  \"endpoints\": {\n"
                    "    \"files\": {\n"
                    "      \"tools\": [\"files.view-file\"],\n"
                    "      \"includeHelp\": true,\n"
                    "      \"meta\": {\n"
                    "        \"description\": \"Read files\",\n"
                    "        \"expectations\": { \"pitfalls\": [\"binary\"] }\n"
                    "      }\n"
                    "    }\n"
                    "  },\n"
                    "  \"stdioProxyConfig\": \"./config/mcp_servers.edn\",\n"
                    "  \"mcpServers\": {\n"
                    "    \"foo\": { \"command\": \"echo\", \"args\": [\"a\", \"b\"], \"cwd\": \"/tmp/foo\" },\n"
                    "    \"bar\": { \"command\": \"run\" }\n"
                    "  }\n"
                    "}"))
        {:keys [mcp rest]} (adapter/read-full path)]
    (is (map? mcp))
    (is (= #{{:command "echo" :args ["a" "b"] :cwd "/tmp/foo"}
             {:command "run"}}
           (set (vals (:mcp-servers mcp)))))
    (is (= {:transport :http
            :tools ["files.view-file"]
            :include-help? false
            :stdio-meta {:title "Default"
                         :workflow ["inspect"]
                         :expectations {:usage ["call mcp.toolset"]}}
            :endpoints {:files {:tools ["files.view-file"]
                                :include-help? true
                                :meta {:description "Read files"
                                       :expectations {:pitfalls ["binary"]}}}}
            :proxy {:config "./config/mcp_servers.edn"}}
           (:http mcp)))
    (is (= {"foo" 1} rest))))

(deftest write-full-writes-valid-json
  (let [tmp-out  (fs/create-temp-file {:prefix "mcp-json-out-" :suffix ".json"})
        path-out (str tmp-out)
        data     {:mcp {:mcp-servers {:foo {:command "echo" :args ["a" "b"] :cwd "/tmp/foo"}
                                      :bar {:command "run"}}
                        :http {:transport :http
                               :tools ["files.view-file"]
                               :include-help? true
                               :stdio-meta {:title "Default"
                                            :expectations {:usage ["workflow"]}}
                               :endpoints {:files {:tools ["files.view-file"]}}
                               :proxy {:config "./config/mcp_servers.edn"}}}
                   :rest {"foo" 1}}]
    (adapter/write-full path-out data)
    (is (fs/exists? path-out))
    (let [out (json/parse-string (slurp path-out))]
      (is (= "http" (get out "transport")))
      (is (= ["files.view-file"] (get out "tools")))
      (is (= true (get out "includeHelp")))
      (is (= "Default" (get-in out ["stdioMeta" "title"])))
      (is (= ["files.view-file"] (get-in out ["endpoints" "files" "tools"])))
      (is (= "./config/mcp_servers.edn" (get out "stdioProxyConfig"))))))

(deftest http-config-round-trips
  (let [tmp-out  (fs/create-temp-file {:prefix "mcp-json-rt-" :suffix ".json"})
        path-out (str tmp-out)
        canonical {:mcp {:mcp-servers {:foo {:command "echo"}}
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
