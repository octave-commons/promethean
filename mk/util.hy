(import subprocess)
(import shlex)
(import os)
(import os.path [isfile isdir join basename])
(import glob)
(import sys)
(setv PROTECT_FILES #{"ecosystem.config.js" "ecosystem.config.cjs"})
(defn sh [cmd [cwd None] [shell False]]
  (import subprocess os)
  (setv env (os.environ.copy))
  (setv (get env "PIPENV_NOSPIN") "1")
  (if shell
      (do (print (.format "Running in {}: {}" (or cwd ".") cmd))
          (subprocess.run cmd :cwd cwd :check True :shell True))
      (do (print (.format "Running in {}: {}" (or cwd ".") (.join " " cmd)))
          (subprocess.run cmd :cwd cwd :check True))))

(defn run-dirs [dirs cmd [shell False]]
  (for [d dirs]
    (if (isdir d)
        (sh cmd :cwd d :shell shell)
        (print (.format "Skipping {} (not found)" d)))))

(defn git-ignored? [path]
  ;; returns True if Git says the path matches .gitignore
  (= 0 (os.system (.format "git check-ignore -q {}" (shlex.quote path)))))

(defn safe-rm-rf [path]
  ;; refuse to delete if file is protected OR tracked (unless it's ignored)
  (when (in (basename path) PROTECT_FILES)
    (print (+ "[protect] skip " path))
    (return None))
  ;; If it's ignored → safe to delete
  (if (git-ignored? path)
      (do (print (+ "[rm] " path))
          (sh ["rm" "-rf" path]))
      (print (+ "[skip] not ignored by git: " path))))

(defn safe-rm-globs [root globs]
  (for [g globs
        p (glob.glob (join root g))]
    (safe-rm-rf p)))
