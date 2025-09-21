(ns clj-hacks.ide.core
  "Core helpers for managing IDE configuration files."
  (:require [babashka.fs :as fs]
            [cheshire.core :as json]
            [clojure.pprint :as pp]
            [clojure.string :as str]))

;; ------------ paths ------------

(defn resolve-path
  "Resolve `p` relative to `base`, expanding `~` and `$HOME`."
  [base p]
  (let [s (str p)
        s (str/replace s #"\\$HOME\\b" (System/getenv "HOME"))
        s (if (str/starts-with? s "~")
            (str (System/getenv "HOME") (subs s 1))
            s)]
    (-> (if (fs/absolute? s) s (fs/path base s))
        fs/absolutize
        str)))

(defn ensure-parent!
  "Ensure the parent directory for `path` exists and return `path`."
  [path]
  (fs/create-dirs (fs/parent (fs/path path)))
  path)

;; ------------ atomic writes ------------

(defn write-atomic!
  "Atomically write string `s` to `path`."
  [path s]
  (let [p   (fs/path path)
        dir (fs/parent p)
        _   (fs/create-dirs dir)
        tmp (fs/create-temp-file {:dir dir :prefix ".tmp-ide-" :suffix ".json"})]
    (spit tmp s)
    (fs/move tmp p {:replace-existing true :atomic true})
    path))

;; ------------ pretty EDN (for future if you want) ------------

(defn pretty-edn-str
  "Render data as pretty-printed EDN."
  [x]
  (binding [*print-namespace-maps* false
            pp/*print-right-margin* 100]
    (with-out-str (pp/write x :dispatch pp/code-dispatch))))

;; ------------ JSONC (lossy on comments; safe on content) ------------

(defn- strip-jsonc
  "Remove // and /* */ comments outside of strings."
  [s]
  (let [sb (StringBuilder.)
        n  (count s)]
    (loop [i 0 in-str? false esc? false blk? false line? false]
      (if (>= i n)
        (str sb)
        (let [c  (.charAt s i)
              c2 (when (< (inc i) n) (.charAt s (inc i)))]
          (cond
            ;; inside block comment
            blk? (if (and (= c \*) (= c2 \/))
                   (recur (+ i 2) in-str? false false false)
                   (recur (inc i) in-str? false true false))

            ;; inside line comment
            line? (if (= c \newline)
                    (do (.append sb c)
                        (recur (inc i) in-str? false false false))
                    (recur (inc i) in-str? false false true))

            ;; inside string
            in-str?
            (do (.append sb c)
                (cond
                  esc?     (recur (inc i) true false false false)
                  (= c \\) (recur (inc i) true true  false false)
                  (= c \") (recur (inc i) false false false false)
                  :else    (recur (inc i) true  false false false)))

            ;; not in string/comment
            :else
            (cond
              (and (= c \/) (= c2 \*)) (recur (+ i 2) false false true  false)
              (and (= c \/) (= c2 \/)) (recur (+ i 2) false false false true)
              (= c \") (do (.append sb c)
                              (recur (inc i) true false false false))
              :else    (do (.append sb c)
                           (recur (inc i) false false false false)))))))))

(defn read-jsonc
  "Read a JSONC file at `path` into a map with string keys.
   Missing files yield `{}`."
  [path]
  (if (fs/exists? path)
    (let [txt (slurp path)
          raw (strip-jsonc txt)]
      (if (str/blank? (str/trim raw))
        {}
        (json/parse-string raw)))
    {}))

(defn pretty-json-str
  "Pretty-print JSON with sorted keys."
  [m]
  (json/generate-string m {:pretty true :escape-non-ascii false :sort-keys true}))

(defn write-json-atomic!
  "Write JSON data to `path` atomically."
  [path m]
  (->> (pretty-json-str m)
       (write-atomic! (ensure-parent! path))))
