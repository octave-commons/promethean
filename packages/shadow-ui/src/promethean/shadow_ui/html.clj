(ns promethean.shadow-ui.html
  "Compile-time HTML helpers for Shadow-CLJS frontends."
  (:require [clojure.string :as str]))

(def ^:private void-elements
  #{"area" "base" "br" "col" "embed" "hr" "img" "input" "link" "meta" "param" "source" "track" "wbr"})

(defn- escape-html [value]
  (-> (str value)
      (str/replace "&" "&amp;")
      (str/replace "<" "&lt;")
      (str/replace ">" "&gt;")
      (str/replace "\"" "&quot;")
      (str/replace "'" "&#39;")))

(defn- render-attrs [attrs]
  (->> attrs
       (keep (fn [[k v]]
               (cond
                 (false? v) nil
                 (or (nil? v) (and (string? v) (str/blank? v))) nil
                 (true? v) (str " " (name k))
                 :else (str " " (name k) "=\"" (escape-html v) "\""))))
       (apply str)))

(declare render-node)

(defn- normalize-children [children]
  (->> children
       (mapcat (fn [child]
                 (cond
                   (nil? child) []
                   (sequential? child) (normalize-children child)
                   :else [child])))))

(defn- render-node [node]
  (cond
    (nil? node) ""
    (string? node) (escape-html node)
    (number? node) (str node)
    (keyword? node) (name node)
    (vector? node)
    (let [[tag maybe-attrs & raw-children] node
          [attrs children] (if (map? maybe-attrs)
                             [maybe-attrs raw-children]
                             [{} (cons maybe-attrs raw-children)])
          tag-name (name tag)
          normalized (normalize-children children)
          attrs-str (render-attrs attrs)
          void? (contains? void-elements tag-name)]
      (if void?
        (str "<" tag-name attrs-str "/>")
        (str "<" tag-name attrs-str ">"
             (apply str (map render-node normalized))
             "</" tag-name ">")))
    (map? node)
    (render-attrs node)
    :else (escape-html node)))

(defmacro html
  "Expand hiccup-style forms into HTML at compile time.

  Example:
  (html
    [:div {:class "chat"}
      [:h1 "Welcome" ]])
  => "<div class=\"chat\"><h1>Welcome</h1></div>"
  "
  [& nodes]
  (apply str (map render-node nodes)))
