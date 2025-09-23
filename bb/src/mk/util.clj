(ns mk.util
  (:require
   [babashka.fs :as fs]
   [babashka.process :as p]
   [clojure.string :as str]))

(def protect-files #{"ecosystem.config.js" "ecosystem.config.cjs"})

(defn- env* [] (System/getenv))

(defn sh!
  ([cmd] (sh! cmd nil nil))
  ([cmd {:keys [dir shell] :or {shell false}}] (sh! cmd dir shell))
  ([cmd dir shell]
   (let [opts (cond-> {:inherit true}
                dir (assoc :dir dir)
                shell (assoc :shell true))
         printable (if (true? shell) cmd (str/join " " (if (sequential? cmd) cmd [cmd])))]
     (println (format "Running in %s: %s" (or dir ".") printable))
     (-> (p/process cmd opts) (p/check)))) )

(defn run-dirs [dirs cmd & [{:keys [shell] :or {shell false}}]]
  (doseq [d dirs]
    (if (fs/directory? d)
      (sh! cmd d shell)
      (println (format "Skipping %s (not found)" d)))))

(defn git-ignored? [path]
  (= 0 (:exit (p/sh "git" "check-ignore" "-q" (str path)))))

(defn safe-rm-rf [path]
  (let [bn (fs/file-name path)]
    (if (contains? protect-files bn)
      (println (str "[protect] skip " path))
      (if (git-ignored? path)
        (do (println (str "[rm] " path))
            (fs/delete-tree path))
        (println (str "[skip] not ignored by git: " path))))))

(defn safe-rm-globs [root globs]
  (doseq [g globs
          :let [pattern (fs/path root g)]
          p (fs/glob root g)]
    (safe-rm-rf p)))

(defn has-cmd? [exe]
  (= 0 (:exit (p/sh "bash" "-lc" (str "command -v " (str exe) " >/dev/null")))))

(defn has-pnpm? [] (has-cmd? "pnpm"))

(defn require-pnpm []
  (binding [*out* *err*]
    (println "ERROR: pnpm is required for JS/TS tasks. Install via: corepack enable && corepack prepare pnpm@latest --activate, then re-run with pnpm."))
  (System/exit 1))

(defn has-eslint-config? [d]
  (pos? (+ (count (fs/glob d ".eslintrc*"))
           (count (fs/glob d "eslint.config.*")))))

