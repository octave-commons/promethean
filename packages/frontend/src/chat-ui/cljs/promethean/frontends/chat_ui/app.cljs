(ns promethean.frontends.chat-ui.app
  (:require [promethean.shadow-ui.runtime :as runtime]))

(def placeholder
  [:section.module-placeholder
   [:h2 "Chat UI"]
   [:p "The chat experience still ships as a standalone React bundle."]
   [:p "Run `pnpm --filter @promethean-os/frontend dev` or open /chat-ui directly to use it."]])

(defn main-component []
  placeholder)

(defn ^:export init []
  (runtime/log-ready! "chat-ui" {:bundle :shadow}))
