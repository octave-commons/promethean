(ns promethean.agent-generator.platform.adapters.file-indexing
  "File indexing and analysis adapter for SCI compatibility"
  (:require [promethean.agent-generator.platform.adapters.file-system :as fs]))

(defn index-file [path]
  "Index a single file"
  (try
    (let [exists? ((fs/file-system path) :exists?)
          content (when exists? ((fs/file-system path) :read))]
      {:path path
       :exists? exists?
       :size (when content (count content))
       :indexed-at (java.util.Date.)
       :content-preview (when content (subs content 0 (min 100 (count content))))})
    (catch Exception _
      {:path path
       :exists? false
       :error "Failed to index file"})))

(defn index-directory [dir-path pattern]
  "Index all files in directory matching pattern"
  (try
    (let [files ((fs/file-system dir-path) :list)]
      (when files
        (map index-file 
             (filter #(re-matches (re-pattern pattern) %) files))))
    (catch Exception _
      [])))

(defn search-index [query]
  "Search indexed files"
  (try
    {:results []
     :query query
     :total 0}
    (catch Exception _
      {:results []
       :query query
       :total 0})))

(defn analyze-file [path]
  "Analyze file content and structure"
  (try
    (let [content ((fs/file-system path) :read)]
      (when content
        {:path path
         :lines (count (clojure.string/split-lines content))
         :characters (count content)
         :words (count (clojure.string/split content #"\s+"))
         :file-type (last (clojure.string/split path #"\."))}))
    (catch Exception _
      {:path path
       :error "Failed to analyze file"})))

(defn get-file-stats [path]
  "Get file statistics"
  (try
    (let [file (java.io.File. path)]
      (when (.exists file)
        {:path path
         :size (.length file)
         :last-modified (.lastModified file)
         :is-directory (.isDirectory file)
         :is-file (.isFile file)}))
    (catch Exception _
      {:path path
       :error "Failed to get file stats"})))

;; Main adapter function that features expect
(defn main [config]
  "File indexing adapter function"
  (fn [operation & args]
    (case operation
      :index-file (apply index-file args)
      :index-directory (apply index-directory args)
      :search (apply search-index args)
      :analyze (apply analyze-file args)
      :stats (apply get-file-stats args)
      nil)))