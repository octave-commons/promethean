
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