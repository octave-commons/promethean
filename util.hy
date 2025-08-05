(import subprocess)
(import os.path [isdir join])
(import glob)
(import sys)
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
