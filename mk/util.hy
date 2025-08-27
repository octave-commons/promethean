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

(defn define-patterns [#* groups]
      (lfor [lang commands] groups
            [action fn] commands
            [(+ action "-" lang "-service-") fn]))

(defn svc-name [svc-dir] (basename svc-dir))

(defn svc-name [svc-dir] (basename svc-dir))

(defn lockfile-for [d]
  (if (= (reqs-file-for d) "requirements.gpu.in")
      "requirements.gpu.lock"
      "requirements.cpu.lock"))




;; PROMETHEAN_TORCH env wins: "cpu" or "cu129" (or any cuXX)


(defn reqs-file-for [svc-dir]
  (if (and (= TORCH-FLAVOR "cu129") (in (svc-name svc-dir) GPU_SERVICES))
      "requirements.gpu.in"
      "requirements.cpu.in"))


(defn has-file* [d f] (isfile (join d f)))
(defn has-uv [] (not (= (shutil.which "uv") None)))
(defn has-pnpm [] (not (= (shutil.which "pnpm") None)))

(defn require-pnpm []
  (print "ERROR: pnpm is required for JS/TS tasks. Install via: corepack enable && corepack prepare pnpm@latest --activate, then re-run with pnpm.")
  (sys.exit 1))

(defn venv-site-packages [svc-dir]
  ;; glob .venv/lib/python*/site-packages
  (let [pattern (join svc-dir ".venv" "lib" "python*" "site-packages")
       hits (glob.glob pattern)]
       (if hits (get hits 0) None)))

(defn uv-venv [d]
  (sh "UV_VENV_IN_PROJECT=1 uv venv" :cwd d :shell True))
(defn uv-compile [d]
  (let [infile (reqs-file-for d)
       lockf  (lockfile-for d)]
       (if (= infile "requirements.gpu.in")
           (sh (.format
                "UV_VENV_IN_PROJECT=1 uv pip compile --index {} {} -o {} --index-strategy unsafe-best-match"
                TORCH_INDEX infile lockf)
               :cwd d :shell True)
           (sh (.format
                "UV_VENV_IN_PROJECT=1 uv pip compile --emit-index-url {} -o {}"
                infile lockf)
               :cwd d :shell True))))

(defn uv-sync [d]
  (let [lockf (lockfile-for d)]
       (sh (.format "UV_VENV_IN_PROJECT=1 uv pip sync {}" lockf) :cwd d :shell True)))

(defn inject-sitecustomize-into-venv [svc-dir]
  (let [src (join svc-dir "sitecustomize.py")
       dst-base (venv-site-packages svc-dir)]
       (when (and dst-base (isfile src))
         (copyfile src (join dst-base "sitecustomize.py"))
         (print "sitecustomize →" dst-base))))

(defn gpu-build? [svc-dir]
  (= (reqs-file-for svc-dir) "requirements.gpu.in"))

(defn cuda-probe [svc-dir]
  (when (gpu-build? svc-dir)
    (sh
     "UV_VENV_IN_PROJECT=1 uv run python - <<'PY'\nimport ctypes, sys\nlibs=('libcusparseLt.so.0','libcusparse.so.12','libcublasLt.so.12','libcublas.so.12','libcudnn.so.9')\nok=True\nfor n in libs:\n  try:\n    ctypes.CDLL(n); print('OK', n)\n  except OSError as e:\n    ok=False; print('MISS', n, '->', e)\nsys.exit(0 if ok else 1)\nPY"
     :cwd svc-dir :shell True)))

(defn has-eslint-config [d]
  (> (+ (len (glob.glob (join d ".eslintrc*")))
        (len (glob.glob (join d "eslint.config.*")))) 0))
