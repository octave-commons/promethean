(ns mk.ide-adapter-settings-json
  (:require [mk.ide-core :as core]))

(defn read-full
  "Return {:settings <map>} from a JSONC settings.json path."
  [path]
  {:settings (core/read-jsonc path)})

(defn write-full
  "Write {:settings <map>} back to JSON. Keep unknown keys by merging before call."
  [path {:keys [settings]}]
  (core/write-json-atomic! path (or settings {})))
