(ns promethean.frontend-service.utils
  (:require [typed.clojure :as t]
            [promethean.frontend-service.types :as types]
            [clojure.string :as str]
            ["fs" :as fs]
            ["path" :as path])
  (:require-macros [typed.clojure.macros :as tm]))

;; Typed namespace annotation
(t/ann-ns promethean.frontend-service.utils)

;; ============================================================================
;; FILE SYSTEM UTILITIES
;; ============================================================================

(t/defn file-exists?
  "Check if a file exists at the given path"
  [p :- t/Str]
  :- types/FileExistsResult
  (.existsSync fs p))

(t/defn read-json
  "Read and parse a JSON file, returning undefined if file doesn't exist"
  [p :- t/Str]
  :- types/ReadJsonResult
  (if (file-exists? p)
    (try
      (js/JSON.parse (.readFileSync fs p "utf8"))
      (catch :default e
        nil))
    nil))

(t/defn write-file
  "Write contents to a file, creating directories as needed"
  [{:keys [filePath contents]} :- types/WriteFileInput]
  :- t/Nil
  (.mkdirSync (path/dirname filePath) #js {:recursive true})
  (.writeFileSync fs filePath contents "utf8"))

;; ============================================================================
;; PACKAGE UTILITIES
;; ============================================================================

(t/defn package-name-for-dir
  "Extract package name from package.json or use fallback"
  [{:keys [pkgDir fallback]} :- types/PackageDirInfo]
  :- t/Str
  (let [pkg-json-path (path/join pkgDir "package.json")]
    (if (not (file-exists? pkg-json-path))
      fallback
      (let [raw (read-json pkg-json-path)]
        (if (and raw
                 (object? raw)
                 (string? (.-name raw)))
          (.-name raw)
          fallback)))))

(t/defn url-prefix-from-pkg-name
  "Convert package name to URL prefix, handling @promethean/ scope"
  [{:keys [name]} :- types/PackageNameInfo]
  :- t/Str
  (if (str/starts-with? name "@promethean/")
    (or (second (str/split name "/")) name)
    name))

(t/defn discover-package-mounts
  "Discover all package mounts in the given packages directory"
  [packages-dir :- t/Str]
  :- types/PackageMountsResult
  (if (not (file-exists? packages-dir))
    []
    (let [dirents (.readdirSync packages-dir #js {:withFileTypes true})]
      (->> (array-seq dirents)
           (filter (fn [dirent] (.-isDirectory dirent)))
           (map (fn [dirent]
                  (let [pkg-path (path/join packages-dir (.-name dirent))
                        pkg-name (package-name-for-dir
                                  {:pkgDir pkg-path
                                   :fallback (.-name dirent)})
                        prefix (url-prefix-from-pkg-name {:name pkg-name})]
                    {:pkgPath pkg-path :prefix prefix})))
           (into [])))))

;; ============================================================================
;; PATH UTILITIES
;; ============================================================================

(t/defn resolve-repo-root
  "Resolve the repository root directory from __dirname"
  [__dirname :- t/Str]
  :- t/Str
  (path/resolve __dirname ".." ".." ".."))

(t/defn default-packages-dir
  "Get the default packages directory path"
  [repo-root :- t/Str]
  :- t/Str
  (path/join repo-root "packages"))

;; ============================================================================
;; SERVER CONFIGURATION UTILITIES
;; ============================================================================

(t/defn resolve-server-options
  "Resolve server options with defaults"
  [options :- (t/U types/CreateServerOptions t/Nil)
   repo-root :- t/Str]
  :- types/CreateServerOptions
  (let [default-pkgs-dir (default-packages-dir repo-root)]
    (merge {:packagesDir default-pkgs-dir} options)))

;; ============================================================================
;; STATIC FILE UTILITIES
;; ============================================================================

(t/defn dist-frontend-path
  "Get the dist/frontend path for a package"
  [pkg-path :- t/Str]
  :- t/Str
  (path/join pkg-path "dist" "frontend"))

(t/defn static-dir-path
  "Get the static directory path for a package"
  [pkg-path :- t/Str]
  :- t/Str
  (path/join pkg-path "static"))

(t/defn create-static-mount-config
  "Create fastify-static mount configuration"
  [root-path :- t/Str
   url-prefix :- t/Str]
  :- types/FastifyStaticOptions
  {:root root-path
   :prefix (str url-prefix "/")
   :decorateReply false})

(t/defn create-static-mount-config-with-static
  "Create fastify-static mount configuration for static files"
  [root-path :- t/Str
   url-prefix :- t/Str]
  :- types/FastifyStaticOptions
  {:root root-path
   :prefix (str url-prefix "/static/")
   :decorateReply false})