(ns clj-hacks.ide.adapter-settings-json
  "Adapter for VSCode-style settings.json files."
  (:require [clj-hacks.ide.core :as core]))

(defn read-full
  "Return {:settings map} for the given settings.json path."
  [path]
  {:settings (core/read-jsonc path)})

(defn write-full
  "Write {:settings map} back to disk, creating parent directories as needed."
  [path {:keys [settings]}]
  (core/write-json-atomic! path (or settings {})))
