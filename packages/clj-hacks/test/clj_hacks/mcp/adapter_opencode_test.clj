(ns clj-hacks.mcp.adapter-opencode-test
  (:require [babashka.fs :as fs]
            [cheshire.core :as json]
            [clj-hacks.mcp.adapter-opencode :as opencode]
            [clj-hacks.mcp.core :as core]
            [clojure.test :as t]
            [clojure.java.io :as io]))

(t/deftest test-read-full
  (let [temp-file (fs/create-temp-file {:suffix ".json"})
        opencode-config {"$schema" "https://opencode.ai/config.json"
                        "provider" {"ollama" {"models" {"qwen3:8b" {"name" "Qwen3 8B"}}}}
                        "mcp" {"mcpServers"
                               {"clj" {"type" "local"
                                       "command" ["clojure" "-X:mcp-shadow-dual"]
                                       "enabled" true}
                                "clj-kondo" {"type" "local"
                                            "command" ["npx" "clj-kondo-mcp"]
                                            "enabled" true}}}
                        "permission" {"bash" {}}}]
    (spit temp-file (json/generate-string opencode-config {:pretty true}))
    
    (let [result (opencode/read-full (str temp-file))]
      (t/is (= {:mcp {:mcp-servers {:clj {:type "local"
                                          :command ["clojure" "-X:mcp-shadow-dual"]
                                          :enabled? true}
                                    :clj-kondo {:type "local"
                                                :command ["npx" "clj-kondo-mcp"]
                                                :enabled? true}}}
                :rest {"$schema" "https://opencode.ai/config.json"
                       "provider" {"ollama" {"models" {"qwen3:8b" {"name" "Qwen3 8B"}}}}
                       "permission" {"bash" {}}})
              result)))))

(t/deftest test-write-full
  (let [temp-file (fs/create-temp-file {:suffix ".json"})
        mcp-data {:mcp {:mcp-servers {:test-server {:command "test-command"
                                                     :args ["arg1" "arg2"]
                                                     :enabled? true
                                                     :type "local"}}}
                  :rest {"$schema" "https://opencode.ai/config.json"
                         "provider" {"test" {"models" {}}}}}]
    
    (opencode/write-full (str temp-file) mcp-data)
    
    (let [written (json/parse-string (slurp temp-file) true)]
      (t/is (= "https://opencode.ai/config.json" (get written "$schema")))
      (t/is (= {"test" {"models" {}}} (get written "provider")))
      (t/is (= {"mcpServers" {"test-server" {"command" "test-command"
                                             "args" ["arg1" "arg2"]
                                             "enabled" true
                                             "type" "local"}}}
               (get written "mcp"))))))

(t/deftest test-round-trip
  (let [temp-file (fs/create-temp-file {:suffix ".json"})
        original-mcp {:mcp {:mcp-servers {:server1 {:command "cmd1"
                                                    :args ["--flag"]
                                                    :enabled? true
                                                    :type "local"}
                                          :server2 {:command "cmd2"
                                                    :enabled? false
                                                    :type "stdio"}}}
                      :rest {"custom" {"key" "value"}}}]
    
    ;; Write original data
    (opencode/write-full (str temp-file) original-mcp)
    
    ;; Read it back
    (let [read-back (opencode/read-full (str temp-file))]
      ;; Write it again
      (opencode/write-full (str temp-file) read-back)
      
      ;; Read final result
      (let [final (opencode/read-full (str temp-file))]
        (t/is (= original-mcp final))))))

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