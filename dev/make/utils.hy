(defn define-patterns [#* groups]
      (lfor [lang commands] groups
            [action fn] commands
            [(+ action "-" lang "-service-") fn]))
(defn svc-name [svc-dir]
  (basename svc-dir))
(defn gpu-present []
  (or (isfile "/dev/nvidiactl")
      (= 0 (os.system "nvidia-smi >/dev/null 2>&1"))))
(defn svc-name [svc-dir]
  (basename svc-dir))
(defn reqs-file-for [svc-dir]
  (if (in (svc-name svc-dir) GPU_SERVICES)
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
        (len (glob.glob (join d "eslint.config.*")))
