(ns elisp.mcp-test
  (:require [clojure.test :refer [deftest is testing]]
            [clojure.java.io :as io]
            [elisp.mcp :as sut]))

(defn- slurp-fixture [name]
  (slurp (io/file "test/elisp/fixtures" name)))

(deftest parses-basic-config
  (testing "parses commands and args from a representative config"
    (is (= [["duckduckgo" {:command "uvx" :args ["duck" "--stdio"]}]
            ["file-system" {:command "/usr/local/bin/filesystem"}]
            ["haiku-rag" {:command "uvx"
                          :args ["haiku-rag" "serve" "--stdio" "--db" "/tmp/db"]}]]
           (sut/parse-mcp-server-programs (slurp-fixture "mcp-basic.el"))))))

(deftest parses-with-comments
  (testing "ignores inline comments and preserves ordering"
    (is (= [["alpha" {:command "alpha-cmd" :args ["--stdio"]}]
            ["beta" {:command "beta-cmd"}]
            ["gamma" {:command "gamma" :args ["--flag1" "--flag2"]}]]
           (sut/parse-mcp-server-programs (slurp-fixture "mcp-comments.el"))))))

(deftest returns-empty-when-missing
  (testing "non-matching buffers produce an empty result"
    (is (= [] (sut/parse-mcp-server-programs "(setq other-var 'value)")))))
