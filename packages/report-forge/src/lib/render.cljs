(ns report-forge.render
  (:require [clojure.string :as str]))

(defn- esc [s]
  (-> s
      (str/replace "<" "&lt;")))

(defn- format-issue [issue]
  (let [{:keys [number title labels url closedAt]} issue
        label-str (when (seq labels)
                    (str "(" (str/join ", " (map :name labels)) ")"))]
    (str "- #" number " " (esc title)
         (when label-str (str " " label-str))
         (when url (str " — " url))
         (when closedAt (str " — closed " (subs closedAt 0 10))))))

(defn render-markdown [{:keys [repo issues]}]
  (let [by-state (fn [st] (filter #(= (:state %) st) issues))
        opens (map format-issue (by-state "open"))
        closed (->> (by-state "closed")
                    (take 10)
                    (map format-issue))]
    (str/join 
"
"
      [
       (str "# Discovery Notes: " repo)
       "## Open issues"
       (if (seq opens) (str/join "\n" opens) "*none*")
       "## Recently closed"
       (if (seq closed) (str/join "\n" closed) "*none*")]))
