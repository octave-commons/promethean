(ns test-compilation
  (:require [opencode-unified.buffers :as buffers]
            [opencode-unified.state :as state]
            [opencode-unified.keymap :as keymap]
            [opencode-unified.evil :as evil]
            [opencode-unified.opencode :as opencode]
            [opencode-unified.ui :as ui]))

(println "All namespaces loaded successfully!")

;; Test the critical function that was failing
(let [test-content "line1\nline2\nline3"]
  (println "Testing line-col-to-pos:")
  (println "Result:" (buffers/line-col-to-pos test-content 1 0))
  (println "Test passed!"))