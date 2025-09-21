(ns promethean.render (:require [clojure.string :as str]))
(defn render-markdown [input] (let [repo (get input "repo")] (str "# Discovery Notes: " repo "\n\n## Open issues\n*none*\n\n## Recently closed\n*none*")))
(def ^:export renderMarkdown render-markdown)
