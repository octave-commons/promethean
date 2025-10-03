(ns mk.mcp-adapter-mcp-json-test
  (:require [clojure.test :refer [deftest is]]
            [babashka.fs :as fs]
            [mk.mcp-adapter-mcp-json :as adapter]))

(deftest read-full-parses-mcpServers
  (let [tmp (fs/create-temp-file {:prefix "mcp-json-" :suffix ".json"})
        path (str tmp)
        _ (spit path
                (str
                 "{\n"
                 "  \"foo\": 1,\n"
                 "  \"mcpServers\": {\n"
                 "    \"foo\": { \"command\": \"echo\", \"args\": [\"a\", \"b\"], \"cwd\": \"/tmp\" },\n"
                 "    \"bar\": { \"command\": \"run\" }\n"
                 "  }\n"
                 "}"))
        {:keys [mcp rest]} (adapter/read-full path)]
    (is (map? mcp))
    (is (= #{{:command "echo" :args ["a" "b"] :cwd "/tmp"}
             {:command "run"}}
           (set (vals (:mcp-servers mcp)))))
    (is (map? rest))))

(deftest write-full-writes-valid-json
  (let [tmp-out (fs/create-temp-file {:prefix "mcp-json-out-" :suffix ".json"})
        path-out (str tmp-out)
        data {:mcp {:mcp-servers {:foo {:command "echo" :args ["a" "b"] :cwd "/srv"}
                                  :bar {:command "run"}}}
              :rest {"foo" 1}}]
  (adapter/write-full path-out data)
  (is (fs/exists? path-out))
        (let [contents (slurp path-out)]
      (is (string? contents))
      (is (re-find #"\\\"cwd\\\"\\s*:\\s*\\\"/srv\\\"" contents))))))
