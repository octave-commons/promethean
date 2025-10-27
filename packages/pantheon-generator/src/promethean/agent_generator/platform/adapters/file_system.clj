(ns promethean.agent-generator.platform.adapters.file-system
  "File system operations adapter for SCI compatibility"
  (:require [clojure.java.io :as io]))

(defn file-exists? [path]
  "Check if file exists - simplified for SCI"
  (try
    (.exists (io/file path))
    (catch Exception _
      false)))

(defn read-file [path]
  "Read file content - simplified for SCI"
  (try
    (slurp path)
    (catch Exception _
      "")))

(defn write-file [path content]
  "Write file content - simplified for SCI"
  (try
    (spit path content)
    true
    (catch Exception _
      false)))

(defn list-files [pattern]
  "List files matching pattern - simplified for SCI"
  (try
    (let [file (io/file ".")
          files (when (.exists file) (.listFiles file))]
      (when files
        (map #(.getName %) 
             (filter #(.isFile %) files))))
    (catch Exception _
      [])))

;; Main adapter function that config expects
(defn file-system [path]
  "File system adapter function"
  (fn [operation]
    (case operation
      :exists? (file-exists? path)
      :read (read-file path)
      :write (fn [content] (write-file path content))
      :list (list-files path)
      nil)))