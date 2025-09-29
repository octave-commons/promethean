(ns elisp.validate-test
  (:require [clojure.java.io :as io]
            [clojure.test :refer [deftest is]]
            [elisp.validate :as sut]))

(defn- canonical [^String path]
  (.getCanonicalPath (io/file path)))

(defn- fixture-path [name]
  (canonical (str "test/fixtures/" name)))

(deftest valid-layer-files-parse-cleanly
  (let [target (fixture-path "valid_layer.el")
        {:keys [ok? results]} (sut/validate-paths [target])
        failures (filter (comp seq :diagnostics) results)]
    (is (seq results) "expected the target file to be checked")
    (is ok? (str "expected no diagnostics, found " failures))))

(deftest syntax-errors-are-reported
  (let [target (fixture-path "missing_paren.el")
        {:keys [results]} (sut/validate-paths [target])
        diag (:diagnostics (first results))]
    (is (seq diag) "expected syntax problems to be reported")
    (is (some #(= :syntax-error (:type %)) diag)
        (str "expected syntax error diagnostic, found " diag))))

(deftest unknown-forms-are-reported
  (let [target (fixture-path "unknown_form.el")
        {:keys [results]} (sut/validate-paths [target])
        diag (:diagnostics (first results))]
    (is (seq diag) "expected unknown form to be reported")
    (is (some #(= :unknown-form (:type %)) diag)
        (str "expected unknown-form diagnostic, found " diag))))

(deftest org-blocks-are-validated
  (let [target (fixture-path "bad_block.org")
        {:keys [results]} (sut/validate-paths [target])
        diag (:diagnostics (first results))]
    (is (seq diag) "expected org block problems to be reported")
    (is (some #(= :syntax-error (:type %)) diag)
        (str "expected syntax diagnostic for org block, found " diag))))
