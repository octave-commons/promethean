(ns promethean.shadow-ui.index
  "Primary runtime entry point."
  (:require [promethean.shadow-ui.runtime :as runtime]))

(def ^:export log-ready! runtime/log-ready!)
(def ^:export define-component! runtime/define-component!)
(def ^:export inject-html! runtime/inject-html!)
