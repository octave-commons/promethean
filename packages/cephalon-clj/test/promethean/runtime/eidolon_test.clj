(ns promethean.runtime.eidolon-test
  (:require [clojure.test :refer [deftest is testing]]
            [promethean.memory.dedup :as dedup]
            [promethean.memory.store :as store]
            [promethean.runtime.eidolon :as eid]
            [promethean.eidolon.prompt :as prompt])
  (:import [java.time Instant]))

(deftest remember-emits-openplanner-memory-created-event
  (let [captured (atom nil)
        created-at (Instant/parse "2026-01-01T10:11:12Z")]
    (with-redefs [store/put! (fn [_ mem]
                               (assoc mem :memory/id "mem-1" :memory/created-at created-at))
                  dedup/stable-memory-key (fn [_] "stable-key")
                  prompt/render (fn [_] "rendered")
                  eid/embed-text! (fn [& _] nil)
                  eid/openplanner-post-events! (fn [cfg events]
                                                (reset! captured {:cfg cfg :events events})
                                                {:indexed 1})]
      (let [mem (eid/remember! {:eidolon {}
                                :mem-store {}
                                :llm-cfg {}
                                :embedding-prompt "embedding"
                                :agent-name "duck"
                                :openplanner-cfg {:url "http://planner.test/"
                                                  :api-key "secret"}}
                               {:memory/kind :event
                                :role "user"
                                :content "hello planner"
                                :meta {:session/id "session-1"
                                       :discord/message-id "msg-1"}})
            envelope (first (:events @captured))]
        (is (= "mem-1" (:memory/id mem)))
        (is (= {:url "http://planner.test/" :api-key "secret"}
               (:cfg @captured)))
        (testing "event envelope fields"
          (is (= "openplanner.event.v1" (:schema envelope)))
          (is (= "mem-1" (:id envelope)))
          (is (= "2026-01-01T10:11:12Z" (:ts envelope)))
          (is (= "cephalon-clj" (:source envelope)))
          (is (= "memory.created" (:kind envelope)))
          (is (= {:session "session-1"
                  :message "msg-1"
                  :memory "mem-1"}
                 (:source_ref envelope)))
          (is (= "hello planner" (:text envelope)))
          (is (= {:memory_kind "event" :role "user"}
                 (:meta envelope)))
          (is (= "mem-1" (get-in envelope [:extra :memory_id]))))))))

(deftest remember-handles-openplanner-failure-without-crashing
  (let [created-at (Instant/parse "2026-01-01T10:11:12Z")
        err-writer (java.io.StringWriter.)]
    (binding [*err* err-writer]
      (with-redefs [store/put! (fn [_ mem]
                                 (assoc mem :memory/id "mem-1" :memory/created-at created-at))
                    dedup/stable-memory-key (fn [_] "stable-key")
                    prompt/render (fn [_] "rendered")
                    eid/embed-text! (fn [& _] nil)
                    eid/openplanner-post-events! (fn [_ _]
                                                  (throw (ex-info "boom" {:status 500})))]
        (let [mem (eid/remember! {:eidolon {}
                                  :mem-store {}
                                  :llm-cfg {}
                                  :embedding-prompt "embedding"
                                  :agent-name "duck"
                                  :openplanner-cfg {:url "http://planner.test"
                                                    :api-key "secret"}}
                                 {:memory/kind :event
                                  :role "user"
                                  :content "hello planner"
                                  :meta {:session/id "session-1"}})]
          (is (= "mem-1" (:memory/id mem))))))
    (is (.contains (.toString err-writer) "OpenPlanner memory ingestion failed"))))
