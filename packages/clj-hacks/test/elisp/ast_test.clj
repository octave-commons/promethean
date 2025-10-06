(ns elisp.ast-test
  (:require [clojure.test :refer [deftest is testing]]
            [elisp.ast :as ast]
            [elisp.read :as read]))

(defn- roundtrip-ok? [code]
  (let [{:keys [has-errors?]} (read/syntax-tree code)]
    (false? has-errors?)))

(deftest emit-basic-list
  (testing "simple application with string literal"
    (let [form (ast/list (ast/symbol "message") (ast/string "hello"))
          out  (ast/emit form)]
      (is (= "(message \"hello\")" out))
      (is (roundtrip-ok? out)))))

(deftest emit-quote-and-vector
  (testing "quoted symbol and vector"
    (let [form (ast/list (ast/symbol "with-eval-after-load")
                         (ast/quote (ast/symbol "mcp"))
                         (ast/vector (ast/string "done")))]
      (let [out (ast/emit form)]
        (is (= "(with-eval-after-load 'mcp [\"done\"])" out))
        (is (roundtrip-ok? out))))))

(deftest emit-property-list
  (testing "property list formatting"
    (let [plist (ast/plist [:command (ast/string "npx")]
                            [:args (ast/list (ast/string "-y") (ast/string "pkg"))]
                            [:cwd (ast/string "$HOME")])
          out   (ast/emit plist)]
      (is (= "(:command \"npx\"\n          :args (\"-y\" \"pkg\")\n          :cwd \"$HOME\")" out))
      (is (roundtrip-ok? (str "(list " out ")"))))))
