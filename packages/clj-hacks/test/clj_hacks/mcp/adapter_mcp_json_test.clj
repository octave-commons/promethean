(ns clj-hacks.mcp.adapter-mcp-json-test
  (:require [babashka.fs :as fs]
            [clj-hacks.mcp.adapter-mcp-json :as adapter]
            [clojure.test :refer [deftest is]]))

(deftest read-full-parses-mcpServers
  (let [tmp  (fs/create-temp-file {:prefix "mcp-json-" :suffix ".json"})
        path (str tmp)
        _    (spit path
                   (str
                    "{\n"
                    "  \"foo\": 1,\n"
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
    (is (map? rest))))

(deftest write-full-writes-valid-json
  (let [tmp-out  (fs/create-temp-file {:prefix "mcp-json-out-" :suffix ".json"})
        path-out (str tmp-out)
        data     {:mcp {:mcp-servers {:foo {:command "echo" :args ["a" "b"] :cwd "/tmp/foo"}
                                      :bar {:command "run"}}}
                   :rest {"foo" 1}}]
    (adapter/write-full path-out data)
    (is (fs/exists? path-out))
    (let [out (slurp path-out)]
      (is (string? out))
      (is (re-find #"\"cwd\"\s*:\s*\"/tmp/foo\"" out)))))
