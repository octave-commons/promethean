(ns promethean.runtime.sentinel
  (:require [clojure.string :as str]
            [cheshire.core :as json]
            [promethean.llm.openai-compat :as llm]
            [promethean.contracts.markdown-frontmatter :as fm]
            [promethean.util.ids :as ids]))

(defn note->prompt [note-text]
  (str "Given the following note, produce JSON with keys: "
       "title, slug, description, tags (array of strings). "
       "Keep tags short, use kebab-case.\n\nNOTE:\n" note-text))

(defn run-contract! [llm-cfg file]
  (let [text (slurp file)
        prompt (note->prompt text)]
    (loop [attempt 1]
      (let [resp (llm/chat-completions llm-cfg {:model (:model llm-cfg)
                                                :messages [{:role "system" :content "Return ONLY JSON."}
                                                           {:role "user" :content prompt}]
                                                :temperature 0.2
                                                :max-tokens 600})
            out (llm/first-message-text resp)
            parsed (try (json/parse-string out true) (catch Throwable _ nil))]
        (if (and parsed (string? (:title parsed)) (seq (:tags parsed)))
          (let [slug (or (:slug parsed) (ids/slugify (:title parsed)))
                updated (fm/upsert-frontmatter text {:title (:title parsed)
                                                     :slug slug
                                                     :description (:description parsed)
                                                     :tags (:tags parsed)})]
            (spit file updated)
            {:ok? true :file file :attempt attempt})
          (if (< attempt 3) (recur (inc attempt)) {:ok? false :file file :attempt attempt :raw out}))))))
