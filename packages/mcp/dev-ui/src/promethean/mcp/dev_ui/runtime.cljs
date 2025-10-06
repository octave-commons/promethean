(ns promethean.mcp.dev-ui.runtime
  (:require [clojure.string :as str]
            [goog.string :as gstring]
            [goog.string.format]))

(def ^:private attr-escape-map
  {"&" "&amp;"
   "\"" "&quot;"
   "'" "&#39;"
   "<" "&lt;"
   ">" "&gt;"})

(defn- escape-attr [value]
  (-> value
      (or "")
      (str)
      (str/replace #"[&\"'<>]" attr-escape-map)))

(defn fragment->string [value]
  (cond
    (nil? value) ""
    (string? value) value
    (keyword? value) (name value)
    (sequential? value) (apply str (map fragment->string value))
    (array? value) (let [arr value
                         len (.-length arr)]
                     (loop [idx 0
                            acc []]
                       (if (< idx len)
                         (recur (inc idx)
                                (conj acc (fragment->string (aget arr idx))))
                         (apply str acc))))
    :else (str value)))

(defn join* [parts]
  (apply str (map fragment->string parts)))

(defn element [tag attrs children]
  (let [attr-str (apply str
                        (for [[k v] attrs
                              :let [value (fragment->string v)]
                              :when (not (str/blank? value))]
                          (str " " k "=\"" (escape-attr value) "\"")))
        children-str (apply str (map fragment->string children))]
    (str "<" tag attr-str ">" children-str "</" tag ">")))
