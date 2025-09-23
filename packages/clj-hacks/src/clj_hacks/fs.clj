(ns clj-hacks.fs
  "Lightweight filesystem helpers that cover the subset of babashka.fs used in clj-hacks."
  (:import (java.nio.file Files Path Paths StandardCopyOption LinkOption)
           (java.nio.file.attribute FileAttribute)
           (java.util Comparator)))

(set! *warn-on-reflection* true)

(defn- ^Path ensure-path
  [p]
  (cond
    (instance? Path p) p
    (nil? p) (throw (IllegalArgumentException. "path cannot be nil"))
    :else (Paths/get (str p) (make-array String 0))))

(defn path
  "Create a java.nio.file.Path from one or more path segments."
  ([p]
   (ensure-path p))
  ([p & more]
   (Paths/get (str p) (into-array String (map str more)))))

(defn parent
  "Return the parent Path of `p` or nil when at filesystem root."
  [p]
  (.getParent ^Path (ensure-path p)))

(defn exists?
  "True when a file exists at `p`."
  [p]
  (Files/exists (ensure-path p) (make-array LinkOption 0)))

(defn create-dirs
  "Ensure the directory at `p` exists (mkdir -p)."
  [p]
  (Files/createDirectories (ensure-path p) (make-array FileAttribute 0)))

(defn create-temp-file
  "Create a temporary file. Options: {:dir <path> :prefix "" :suffix ""}."
  [{:keys [dir prefix suffix]}]
  (let [prefix (or prefix "")
        suffix (or suffix "")]
    (if dir
      (Files/createTempFile (ensure-path dir) prefix suffix (make-array FileAttribute 0))
      (Files/createTempFile prefix suffix (make-array FileAttribute 0)))))

(defn create-temp-dir
  "Create a temporary directory. Optionally accepts {:prefix "" :dir <path>}."
  ([] (create-temp-dir {}))
  ([{:keys [prefix dir]}]
   (let [prefix (or prefix "")]
     (if dir
       (Files/createTempDirectory (ensure-path dir) prefix (make-array FileAttribute 0))
       (Files/createTempDirectory prefix (make-array FileAttribute 0))))))

(defn move
  "Move file from `source` to `target`. Supports {:replace-existing true :atomic true}."
  [source target opts]
  (let [options (cond-> []
                  (:replace-existing opts) (conj StandardCopyOption/REPLACE_EXISTING)
                  (:atomic opts) (conj StandardCopyOption/ATOMIC_MOVE))]
    (Files/move (ensure-path source)
                (ensure-path target)
                (into-array StandardCopyOption options))))

(defn absolutize
  "Return the absolute Path for `p`."
  [p]
  (.toAbsolutePath (ensure-path p)))

(defn absolute?
  "True when `p` is an absolute path."
  [p]
  (.isAbsolute (ensure-path p)))

(defn expand-home
  "Expand leading ~ in `s` using the HOME environment variable."
  [s]
  (when-not (nil? s)
    (let [home (System/getenv "HOME")
          ^String s (str s)]
      (if (and (.startsWith s "~") home)
        (str home (.substring s 1))
        s))))

(defn file
  "Alias for `path` to match the babashka.fs API."
  [& parts]
  (apply path parts))

(defn cwd
  "Return the current working directory as a Path."
  []
  (.toAbsolutePath (Paths/get "" (make-array String 0))))

(defn delete-tree
  "Recursively delete the directory tree rooted at `p`."
  [p]
  (let [p* (ensure-path p)]
    (when (exists? p*)
      (with-open [stream (Files/walk p*)]
        (doseq [entry (iterator-seq (.iterator (.sorted stream (Comparator/reverseOrder))))]
          (Files/delete entry))))))
