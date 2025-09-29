(ns elisp.read-test
  (:require [clojure.test :refer [deftest is testing]]
            [elisp.read :as sut]))

(deftest parses-simple-list
  (testing "function application"
    (is (= [:el/list
            {:el/type :symbol :name "foo"}
            42
            5.5
            "\"bar\""]
           (sut/elisp->data "(foo 42 5.5 \"bar\")")))))

(deftest parses-quoted-symbol
  (testing "quote normalisation"
    (is (= {:el/type :quote
            :form {:el/type :symbol :name "baz"}}
           (sut/elisp->data "'baz")))))

(deftest parses-dotted-pair
  (testing "cons cells"
    (is (= {:el/type :cons
            :car {:el/type :symbol :name "a"}
            :cdr {:el/type :symbol :name "b"}}
           (sut/elisp->data "(a . b)")))))
