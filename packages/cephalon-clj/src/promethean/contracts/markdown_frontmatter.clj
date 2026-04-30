(ns promethean.contracts.markdown-frontmatter
  (:require [clojure.string :as str]))

(defn has-frontmatter? [s]
  (boolean (re-find #"(?s)^---\n.*?\n---\n" (or s ""))))

(defn parse-frontmatter [s]
  (when (has-frontmatter? s)
    (let [[_ fm body] (re-find #"(?s)^---\n(.*?)\n---\n(.*)$" s)]
      {:frontmatter fm :body body})))

(defn upsert-frontmatter [s {:keys [tags title slug description]}]
  (let [{:keys [frontmatter body]} (or (parse-frontmatter s) {:frontmatter "" :body s})
        fm-lines (->> (str/split-lines (or frontmatter ""))
                      (remove str/blank?)
                      (remove #(re-find #"^(tags|title|slug|description):" %)))
        new-lines (concat
                   (when title [(str "title: " title)])
                   (when slug [(str "slug: " slug)])
                   (when description [(str "description: " description)])
                   (when (seq tags) [(str "tags: [" (str/join ", " tags) "]")])
                   fm-lines)
        fm (str "---\n" (str/join "\n" new-lines) "\n---\n")]
    (str fm (or body ""))))
