# @promethean/shadow-ui

Shared ClojureScript helpers for Promethean Shadow-CLJS frontends.

## Contents

- `promethean.shadow-ui.html/html` – hiccup-like macro that renders HTML at
  compile time.
- `promethean.shadow-ui.runtime` – runtime helpers for mounting web
  components and logging bundle readiness.

## Usage

```clojure
(ns example.app
  (:require [promethean.shadow-ui.runtime :as runtime]
            [promethean.shadow-ui.html :refer [html]]))

(def template
  (html
    [:div {:class "example"}
      [:h1 "Hello"]]))

(defn ^:export mount []
  (runtime/log-ready! "example-app")
  (when-let [host (.querySelector js/document "#app")]
    (runtime/inject-html! host template)))
```

## Scripts

Shadow-CLJS builds are defined in the repository root `shadow-cljs.edn`. Run
`pnpm --filter @promethean/shadow-ui build` to compile runtime helpers and
`pnpm --filter @promethean/shadow-ui watch` for development.
