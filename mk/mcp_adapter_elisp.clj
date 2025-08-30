(ns mk.mcp-adapter-elisp
  (:require [clojure.string :as str]
            [mk.mcp-core :as core]))

(def re-setq #"\(setq\s+mcp-server-programs\s+'\((?s:.*?)\)\)")

(defn read-full [path]
  (let [s (slurp path)
        ;; parse entries from our known shape (round-trip compatible)
        re-entry #"\(\s*\"([^\"]+)\"\s*\.\s*\(\s*\"([^\"]+)\"\s*(\[.*?\])?\s*\)\s*\)"
        ms (re-seq re-entry s)
        mcp {:mcp-servers
             (into (sorted-map)
                   (for [[_ nm cmd args-edn] ms]
                     [(keyword nm)
                      (cond-> {:command cmd}
                        (and args-edn (not (str/blank? args-edn)))
                        (assoc :args (vec (read-string args-edn))) )]))}
        rest (str/replace s re-setq "")]
    {:mcp mcp :rest rest :raw s}))

(defn- render-entry [[k {:keys [command args]}]]
  (format "  (\"%s\" . (\"%s\"%s))"
          (name k) command (if (seq args) (str " " (pr-str (vec args))) "")))

(defn- render-setq [mcp]
  (str "(setq mcp-server-programs\n"
       "      '(\n"
       (str/join "\n" (map render-entry (:mcp-servers mcp)))
       "\n      ))"))

(defn write-full [path {:keys [mcp rest]}]
  (let [setq (render-setq mcp)
        base (or rest "")
        out (if (re-find re-setq base)
              (str/replace base re-setq setq)
              (str (str/trimr base) "\n\n" setq "\n"))]
    (core/ensure-parent! path)
    (spit path out)))
