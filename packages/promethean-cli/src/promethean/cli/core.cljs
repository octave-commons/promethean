(ns promethean.cli.core
  (:require [clojure.string :as str]))

(def fs (js/require "fs"))
(def path (js/require "path"))
(def child-process (js/require "child_process"))

(def ignored-directories
  #{".git" ".hg" ".svn" ".pnpm" ".cache" ".turbo" "dist" "build" "node_modules" "coverage" "out" "target" "tmp"})

(defn read-json [file]
  (try
    (-> (.readFileSync fs file "utf8")
        (js/JSON.parse)
        (js->clj :keywordize-keys true))
    (catch :default _
      nil)))

(defn child-directories [dir]
  (try
    (->> (.readdirSync fs dir #js {:withFileTypes true})
         (array-seq)
         (filter #(.isDirectory %))
         (map #(.-name %))
         (remove #(contains? ignored-directories %))
         (map #(path.join dir %)))
    (catch :default _
      '())))

(defn alias-for [pkg-name dir]
  (let [fallback (.basename path dir)]
    (cond
      (and pkg-name (not (str/blank? pkg-name)))
      (-> pkg-name
          (str/split #"/")
          (last)
          (or fallback))
      :else fallback)))

(defn package-info [dir]
  (let [manifest-path (path.join dir "package.json")]
    (when (.existsSync fs manifest-path)
      (let [manifest (read-json manifest-path)
            pkg-name (:name manifest)]
        (when (and manifest (not (str/blank? pkg-name)))
          (let [scripts-map (:scripts manifest)
                script-names (->> scripts-map
                                  (or {})
                                  (keys)
                                  (map name)
                                  (sort)
                                  (vec))]
            {:dir dir
             :name pkg-name
             :alias (alias-for pkg-name dir)
             :scripts (set script-names)
             :ordered-scripts script-names}))))))

(defn gather-packages [dir]
  (let [info (package-info dir)
        children (mapcat gather-packages (child-directories dir))]
    (cond-> (vec children)
      info (conj info))))

(defn discover-packages []
  (let [repo-root (.resolve path js/__dirname ".." ".." "..")
        packages-root (path.join repo-root "packages")
        package-dirs (child-directories packages-root)
        discovered (mapcat gather-packages package-dirs)
        root-info (package-info repo-root)]
    (cond-> (vec discovered)
      root-info (conj root-info))))

(defn usage [packages]
  (println "Promethean CLI\n")
  (println "Usage: promethean <package> <action> [-- <script-args>]" )
  (println "\nAvailable packages and actions:")
  (doseq [pkg (sort-by :alias packages)]
    (let [alias (:alias pkg)
          full-name (:name pkg)
          heading (if (and full-name (not= alias full-name))
                    (str "  " alias " (" full-name ")")
                    (str "  " alias))
          scripts (:ordered-scripts pkg)]
      (println heading)
      (if (seq scripts)
        (doseq [action scripts]
          (println (str "    " action)))
        (println "    (no scripts)"))))
  (println ""))

(defn alias-map [packages]
  (reduce
   (fn [acc pkg]
     (let [alias (:alias pkg)
           name (:name pkg)
           dir (:dir pkg)
           base (.basename path dir)]
       (cond-> acc
         alias (assoc alias pkg)
         name (assoc name pkg)
         base (assoc base pkg))))
   {}
   packages))

(defn format-package-heading [pkg]
  (let [alias (:alias pkg)
        full (:name pkg)]
    (if (and full (not= alias full))
      (str alias " (" full ")")
      alias)))

(defn show-package-actions [pkg]
  (println (str "\nAvailable actions for " (format-package-heading pkg) ":"))
  (if (seq (:ordered-scripts pkg))
    (doseq [action (:ordered-scripts pkg)]
      (println (str "  " action)))
    (println "  (no scripts)")))

(defn run-pnpm-script [pkg action extra-args]
  (let [filter-name (:name pkg)
        base-args ["--filter" filter-name "run" action]
        pnpm-args (if (seq extra-args)
                    (into (conj (vec base-args) "--") extra-args)
                    (vec base-args))
        child (.spawn child-process "pnpm" (clj->js pnpm-args) #js {:stdio "inherit"})]
    (.on child "exit" (fn [code]
                         (.exit js/process code)))
    (.on child "error" (fn [err]
                          (.error js/console "Failed to run pnpm:" err)
                          (.exit js/process 1)))))

(defn -main [& args]
  (let [packages (discover-packages)
        package-map (alias-map packages)
        argv (vec args)]
    (when (empty? argv)
      (usage packages)
      (.exit js/process 1))
    (let [cmd (first argv)]
      (cond
        (#{"--help" "-h" "help"} cmd) (do (usage packages)
                                             (.exit js/process 0))
        (= "--list" cmd) (do (usage packages)
                              (.exit js/process 0))
        :else
        (let [pkg (get package-map cmd)]
          (when-not pkg
            (println (str "Unknown package: " cmd))
            (usage packages)
            (.exit js/process 1))
          (let [action (get argv 1)]
            (when-not action
              (println "Missing action argument.")
              (show-package-actions pkg)
              (.exit js/process 1))
            (when-not (contains? (:scripts pkg) action)
              (println (str "Unknown action '" action "' for " (format-package-heading pkg) "."))
              (show-package-actions pkg)
              (.exit js/process 1))
            (let [extra (subvec argv 2)]
              (run-pnpm-script pkg action extra))))))))

(set! *main-cli-fn* -main)

(defn ^:export main [& args]
  (apply -main args))
