(ns promethean.test-runner
  (:require [clojure.test :as t]
            [promethean.openplanner.client-test]
            [promethean.runtime.eidolon-test]))

(defn -main [& _]
  (let [{:keys [fail error]}
        (t/run-tests 'promethean.openplanner.client-test
                     'promethean.runtime.eidolon-test)]
    (when (pos? (+ fail error))
      (System/exit 1))))
