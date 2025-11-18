(ns promethean.sentinel.core-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [promethean.sentinel.core :as core]))

(defn reset-state! []
  (reset! core/sentinel-state {:root "/"
                               :watcher nil
                               :anchor-watcher nil
                               :backend :uninitialized
                               :watchers []
                               :registry {}
                               :config-path ""
                               :debounce-cache {}
                               :messaging nil
                               :rpc-closers []}))

(use-fixtures :each (fn [f]
                      (reset-state!)
                      (f)))

(deftest keyword->path-basic
  (is (= "foo/bar" (core/keyword->path :foo/bar)))
  (is (= "foo" (core/keyword->path :foo)))
  (is (= "ns/foo" (core/keyword->path :ns/foo))))

(deftest sentinel-pack-names-merge
  (is (= [:a :b :c]
         (core/sentinel-pack-names {:packs [:a] :use [:b :c]})))
  (is (nil? (core/sentinel-pack-names nil))))

(deftest match-rule-basic
  (testing "glob and type"
    (is (core/match-rule? {:on :add :glob "**/*.txt"} :add "foo/bar.txt" "/tmp/foo/bar.txt"))
    (is (not (core/match-rule? {:on :change} :add "foo" "/tmp/foo"))))
  (testing "size over"
    (with-redefs [core/file-size (fn [_] 2e6)]
      (is (core/match-rule? {:on :change :when {:size-over 1e6}}
                            :change "big.bin" "/tmp/big.bin"))
      (is (not (core/match-rule? {:on :change :when {:size-over 3e6}}
                                 :change "big.bin" "/tmp/big.bin"))))))

(deftest debounce-behavior
  (let [rule {:id :x :debounce-ms 10}
        p "/tmp/file"]
    (is (core/should-emit? rule p 1000))
    (is (not (core/should-emit? rule p 1005)))
    (is (core/should-emit? rule p 1015))))

(deftest recompute-watchers
  (core/registry-assoc "a" [{:path "p1"}])
  (core/registry-assoc "b" [{:path "p2"}])
  (is (= ["p2" "p1"] (map :path (:watchers @core/sentinel-state)))))
