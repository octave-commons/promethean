(ns clj-hacks.mcp.core-test
  (:require [babashka.fs :as fs]
            [clj-hacks.mcp.core :as core]
            [clojure.test :refer [deftest is testing]]))

(deftest resolve-path-expands-home-and-env
  (let [home (System/getenv "HOME")]
    (is (.startsWith (core/resolve-path "." "~/.config/foo.edn") (str home "/")))
    (is (.startsWith (core/resolve-path "." "$HOME/.config/foo.edn") (str home "/"))))
  (testing "relative becomes absolute from base"
    (let [tmp (fs/create-temp-dir)
          p   (core/resolve-path (str tmp) "a/b.edn")]
      (is (re-find #"a/b.edn$" p))
      (is (fs/absolute? p))
      (fs/delete-tree tmp))))

(deftest deep-merge-prefers-later
  (is (= {:a 1 :b {:x 3 :y 2}}
         (core/deep-merge {:a 1 :b {:x 1 :y 2}}
                          {:b {:x 3}}))))

(deftest deep-merge-prefer-existing-prefers-earlier
  (is (= {:a 1 :b {:x 1 :y 2}}
         (core/deep-merge-prefer-existing {:a 1 :b {:x 1 :y 2}}
                                          {:b {:x 3}}))))

(deftest write-atomic-spits-file
  (let [tmp-dir (fs/create-temp-dir)
        out     (str (fs/path tmp-dir "out.edn"))
        data    {:hello :world}]
    (try
      (core/spit-edn! out data)
      (is (fs/exists? out))
      (is (= (read-string (slurp out)) data))
      (finally
        (fs/delete-tree tmp-dir)))))
