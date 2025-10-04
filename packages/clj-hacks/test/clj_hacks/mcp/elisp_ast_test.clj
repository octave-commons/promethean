(ns clj-hacks.mcp.elisp-ast-test
  (:require [clojure.string :as str]
            [clojure.test :refer [deftest is testing]]
            [clj-hacks.mcp.elisp :as elisp]
            [elisp.ast :as ast]
            [elisp.read :as read]))

(def sample-servers
  {:github {:command "/home/err/devel/promethean/scripts/mcp/bin/github.sh"}
   :npm-helper {:command "npx"
                :args ["-y" "@pinkpixel/npm-helper-mcp"]
                :cwd "$HOME/devel/promethean"}})

(defn- no-parse-errors? [code]
  (false? (:has-errors? (read/syntax-tree code))))

(deftest servers-alist-prints-quoted-list
  (testing "servers map to assoc list with dotted pairs"
    (let [alist (elisp/servers->alist sample-servers)
          rendered (ast/emit (ast/quote alist))]
      (is (str/includes? rendered "(\"github\" ."))
      (is (str/includes? rendered "(:command \"npx\""))
      (is (str/includes? rendered "@pinkpixel/npm-helper-mcp"))
      (is (no-parse-errors? rendered)))))

(deftest block-construction-produces-valid-elisp
  (testing "full with-eval-after-load block"
    (let [block (elisp/mcp-block-ast sample-servers)
          code  (ast/emit block)]
      (is (str/includes? code "(setq mcp-hub-servers"))
      (is (str/includes? code "'((\"github\""))
      (is (no-parse-errors? code)))))

(deftest render-generated-block-includes-comment
  (testing "comment header precedes block"
    (let [rendered (elisp/render-generated-block sample-servers)]
      (is (str/starts-with? rendered elisp/generated-comment))
      (is (str/includes? rendered "with-eval-after-load"))
      (is (no-parse-errors? rendered)))))

(def existing-source
  (str "(message \"before\")\n\n"
       elisp/generated-comment
       "(with-eval-after-load 'mcp\n"
       "  (setq mcp-hub-servers '()))\n\n"
       "(message \"after\")\n"))

(deftest rewrite-source-replaces-existing-block
  (let [{:keys [ok? changed? inserted? source]} (elisp/rewrite-source existing-source sample-servers)]
    (is ok?)
    (is changed?)
    (is (false? inserted?))
    (is (str/includes? source "@pinkpixel/npm-helper-mcp"))
    (is (no-parse-errors? source))))

(deftest rewrite-source-appends-when-missing
  (let [{:keys [ok? inserted? source]} (elisp/rewrite-source "(message \"hi\")\n" sample-servers)]
    (is ok?)
    (is inserted?)
    (is (str/includes? source elisp/generated-comment))
    (is (no-parse-errors? source))))