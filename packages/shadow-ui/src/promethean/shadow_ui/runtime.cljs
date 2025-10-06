(ns promethean.shadow-ui.runtime
  "Runtime helpers consumed by Shadow-CLJS frontends.")

(defn- prefix []
  "[shadow-ui]")

(defn log-ready!
  "Write a consistent console banner when a bundle boots.

  Accepts a short `label` describing the bundle and an optional map of
  metadata (e.g., `{:bundle :shadow}`)."
  ([label]
   (log-ready! label nil))
  ([label meta]
   (let [meta-str (when meta (str " " (pr-str meta)))]
     (.info js/console (str (prefix) " " label " ready" meta-str)))))

(defn define-component!
  "Register a custom element constructor if it has not already been defined.

  Returns true when registration succeeds. Throws when `customElements`
  is not present (e.g., server-side rendering)."
  [tag ctor]
  (when-not (string? tag)
    (throw (js/Error. (str (prefix) " expected tag to be a string, got " (type tag)))))
  (when-not (exists? js/window)
    (throw (js/Error. (str (prefix) " customElements not available outside the browser"))))
  (let [registry js/customElements]
    (when-not registry
      (throw (js/Error. (str (prefix) " customElements API missing"))))
    (when-not (.get registry tag)
      (.define registry tag ctor))
    true))

(defn inject-html!
  "Replace the innerHTML of `element` with the provided markup string."
  [element markup]
  (if (and element (string? markup))
    (do
      (set! (.-innerHTML element) markup)
      element)
    (throw (js/Error. (str (prefix) " inject-html! expects (dom-element string), got "
                            (pr-str {:element element :markup markup}))))))
