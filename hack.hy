;; Fast install improvements for Codex agent startup
(import subprocess)
(import os.path [isdir isfile join exists])
(import hashlib)
(import shutil)


(defn sh [cmd [cwd None] [shell False]]
  (import subprocess os)
  (setv env (os.environ.copy))
  (setv (get env "PIPENV_NOSPIN") "1")
  (if shell
      (do (print (.format "Running in {}: {}" (or cwd ".") cmd))
          (subprocess.run cmd :cwd cwd :check True :shell True))
      (do (print (.format "Running in {}: {}" (or cwd ".") (.join " " cmd)))
          (subprocess.run cmd :cwd cwd :check True))))
