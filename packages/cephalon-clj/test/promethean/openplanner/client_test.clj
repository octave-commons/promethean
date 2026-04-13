(ns promethean.openplanner.client-test
  (:require [cheshire.core :as json]
            [clojure.test :refer [deftest is testing]]
            [clj-http.client :as http]
            [promethean.openplanner.client :as sut]))

(deftest post-events-posts-envelope-to-events-endpoint
  (let [called (atom nil)
        event {:schema "openplanner.event.v1"
               :id "evt-1"
               :ts "2026-01-01T00:00:00Z"
               :source "cephalon-clj"
               :kind "memory.created"
               :source_ref {:session "session-1"}
               :text "hello"
               :meta {:role "user"}
               :extra {:memory_id "mem-1"}}]
    (with-redefs [http/post
                  (fn [url opts]
                    (reset! called {:url url :opts opts})
                    {:status 202 :body "ok"})]
      (sut/post-events! {:url "http://planner.test/" :api-key "abc"} [event])
      (testing "uses /v1/events with trimmed base url"
        (is (= "http://planner.test/v1/events" (:url @called))))
      (testing "sends json body + auth header"
        (is (= "application/json" (get-in @called [:opts :headers "Content-Type"])))
        (is (= "Bearer abc" (get-in @called [:opts :headers "Authorization"])))
        (is (= {:events [event]}
               (json/parse-string (get-in @called [:opts :body]) true)))))))

(deftest post-events-throws-on-non-2xx
  (with-redefs [http/post (fn [_ _] {:status 500 :body "boom"})]
    (is (thrown-with-msg?
          clojure.lang.ExceptionInfo
          #"OpenPlanner request failed"
          (sut/post-events! {:url "http://planner.test" :api-key "abc"} [{:id "e"}])))))
