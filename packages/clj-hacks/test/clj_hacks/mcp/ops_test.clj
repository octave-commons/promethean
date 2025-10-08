(ns clj-hacks.mcp.ops-test
  (:require [babashka.fs :as fs]
            [cheshire.core :as json]
            [clj-hacks.mcp.ops :as ops]
            [clojure.test :refer [deftest is]]))

(deftest push-all-writes-extended-mcp-json
  (let [tmp-dir (fs/create-temp-dir {:prefix "mcp-ops-"})
        manifest (str (fs/path tmp-dir "promethean.mcp.json"))
        base (str tmp-dir)
        initial {"transport" "http"
                 "tools" ["files_view_file"]
                 "endpoints" {"files" {"tools" ["files_view_file"]}}
                 "mcpServers" {}}
        edn {:mcp-servers {:new {:command "echo"
                                 :args ["hi"]
                                 :env {"NODE_ENV" "test"}
                                 :timeout 60
                                 :auto-approve ["files.write"]
                                 :disabled? false}}
             :outputs [{:schema :mcp.json :path "./promethean.mcp.json"}]}]
    (try
      (fs/create-dirs (fs/parent manifest))
      (spit manifest (json/generate-string initial {:pretty true}))
      (ops/push-all! edn base (:outputs edn))
      (is (fs/exists? manifest))
      (let [written (json/parse-string (slurp manifest))
            servers (get written "mcpServers")]
        (is (= {"new" {"command" "echo"
                        "args" ["hi"]
                        "env" {"NODE_ENV" "test"}
                        "timeout" 60
                        "autoApprove" ["files.write"]
                        "disabled" false}}
               servers))
        (is (= "http" (get written "transport")))
        (is (= {"files" {"tools" ["files_view_file"]}}
               (get written "endpoints")))
        (is (= ["files_view_file"] (get written "tools"))))
      (finally
        (fs/delete-tree tmp-dir)))))
