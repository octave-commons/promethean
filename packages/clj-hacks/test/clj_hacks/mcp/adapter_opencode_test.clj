(ns clj-hacks.mcp.adapter-opencode-test
  (:require [babashka.fs :as fs]
            [cheshire.core :as json]
            [clj-hacks.mcp.adapter-opencode :as opencode]
            [clj-hacks.mcp.core :as core]
            [clojure.test :as t]))

(t/deftest test-read-full
  (let [temp-file (fs/create-temp-file {:suffix ".json"})
        temp-path (str temp-file)
        json-str (str "{\n"
                     "  \"$schema\": \"https://opencode.ai/config.json\",\n"
                     "  \"provider\": {\n"
                     "    \"ollama\": {\n"
                     "      \"models\": {\n"
                     "        \"qwen3:8b\": {\n"
                     "          \"name\": \"Qwen3 8B\"\n"
                     "        }\n"
                     "      }\n"
                     "    }\n"
                     "  },\n"
                     "  \"mcp\": {\n"
                     "    \"mcpServers\": {\n"
                     "      \"clj\": {\n"
                     "        \"type\": \"local\",\n"
                     "        \"command\": [\"clojure\", \"-X:mcp-shadow-dual\"],\n"
                     "        \"enabled\": true\n"
                     "      },\n"
                     "      \"clj-kondo\": {\n"
                     "        \"type\": \"local\",\n"
                     "        \"command\": [\"npx\", \"clj-kondo-mcp\"],\n"
                     "        \"enabled\": true\n"
                     "      }\n"
                     "    }\n"
                     "  },\n"
                     "  \"permission\": {\n"
                     "    \"bash\": {}\n"
                     "  }\n"
                     "}")]
    (spit temp-path json-str)
    
    (let [result (opencode/read-full temp-path)]
      (t/is (= {:mcp {:mcp-servers {:clj {:type "local"
                                          :command ["clojure" "-X:mcp-shadow-dual"]
                                          :enabled? true}
                                    :clj-kondo {:type "local"
                                                :command ["npx" "clj-kondo-mcp"]
                                                :enabled? true}}}
                :rest {"$schema" "https://opencode.ai/config.json"
                       "provider" {"ollama" {"models" {"qwen3:8b" {"name" "Qwen3 8B"}}}}
                       "permission" {"bash" {}}}}
              result)))))

(t/deftest test-write-full
  (let [temp-file (fs/create-temp-file {:suffix ".json"})
        temp-path (str temp-file)
        mcp-data {:mcp {:mcp-servers {:test-server {:command "test-command"
                                                     :args ["arg1" "arg2"]
                                                     :enabled? true
                                                     :type "local"}}}
                  :rest {"$schema" "https://opencode.ai/config.json"
                         "provider" {"test" {"models" {}}}}}]
    
    (opencode/write-full temp-path mcp-data)
    
    (let [written (json/parse-string (slurp temp-path) true)]
      (t/is (= "https://opencode.ai/config.json" (get written "$schema")))
      (t/is (= {"test" {"models" {}}} (get written "provider")))
      (t/is (= {"mcpServers" {"test-server" {"command" "test-command"
                                             "args" ["arg1" "arg2"]
                                             "enabled" true
                                             "type" "local"}}}
               (get written "mcp"))))))

(t/deftest test-parse-opencode-server
  (let [server-spec {"type" "local"
                     "command" ["clojure" "-X:mcp"]
                     "enabled" true
                     "args" ["--debug"]
                     "env" {"DEBUG" "true"}}]
    (let [result (opencode/parse-opencode-server server-spec)]
      (t/is (= {:type "local"
                :command ["clojure" "-X:mcp"]
                :enabled? true
                :args ["--debug"]
                :env {"DEBUG" "true"}}
              result))))

  (t/testing "empty spec"
    (let [result (opencode/parse-opencode-server {})]
      (t/is (= {} result)))))

(t/deftest test-opencode-server->json
  (let [server-spec {:type "local"
                     :command ["clojure" "-X:mcp"]
                     :enabled? true
                     :args ["--debug"]
                     :env {"DEBUG" "true"}}]
    (let [result (opencode/opencode-server->json server-spec)]
      (t/is (= {"type" "local"
                "command" ["clojure" "-X:mcp"]
                "enabled" true
                "args" ["--debug"]
                "env" {"DEBUG" "true"}}
              result))))

  (t/testing "spec with nil command"
    (let [result (opencode/opencode-server->json {:type "local"})]
      (t/is (= {"type" "local" "command" nil} result)))))