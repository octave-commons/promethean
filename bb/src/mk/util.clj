(ns mk.util
  (:require
   [babashka.fs :as fs]
   [babashka.process :as p]
   [clojure.java.io :as io]
   [clojure.string :as str])
  (:import (java.nio.file Files Path Paths)
           (java.nio.file.attribute FileAttribute)))

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

(defn has-uv? [] (has-cmd? "uv"))
(defn has-pnpm? [] (has-cmd? "pnpm"))

(defn require-pnpm []
  (binding [*out* *err*]
    (println "ERROR: pnpm is required for JS/TS tasks. Install via: corepack enable && corepack prepare pnpm@latest --activate, then re-run with pnpm."))
  (System/exit 1))

(defn venv-site-packages [svc-dir]
  (let [pattern (fs/path svc-dir ".venv" "lib" "python*" "site-packages")
        hits (seq (fs/glob svc-dir (str (fs/path ".venv" "lib" "python*" "site-packages"))))]
    (some-> hits first str)) )

(defn uv-venv [d]
  (sh! "UV_VENV_IN_PROJECT=1 uv venv" d true))

(defn uv-compile [d infile lockf torch-index]
  (if (= infile "requirements.gpu.in")
    (sh! (format "UV_VENV_IN_PROJECT=1 uv pip compile --index %s %s -o %s --index-strategy unsafe-best-match"
                 torch-index infile lockf)
        d true)
    (sh! (format "UV_VENV_IN_PROJECT=1 uv pip compile --emit-index-url %s -o %s"
                 infile lockf)
        d true)))

(defn uv-sync [d lockf]
  (sh! (format "UV_VENV_IN_PROJECT=1 uv pip sync %s" lockf) d true))

(defn copy-file! [src dst]
  (fs/create-dirs (fs/parent dst))
  (fs/copy src dst {:replace-existing true}))

(defn inject-sitecustomize-into-venv [svc-dir]
  (let [src (fs/path svc-dir "sitecustomize.py")
        dst-base (venv-site-packages svc-dir)]
    (when (and dst-base (fs/exists? src))
      (copy-file! (str src) (str (fs/path dst-base "sitecustomize.py")))
      (println "sitecustomize →" dst-base))))

(defn cuda-probe [svc-dir gpu?]
  (when gpu?
    (sh! (str
          "UV_VENV_IN_PROJECT=1 uv run python - <<'PY'\n"
          "import ctypes, sys\n"
          "libs=('libcusparseLt.so.0','libcusparse.so.12','libcublasLt.so.12','libcublas.so.12','libcudnn.so.9')\n"
          "ok=True\nfor n in libs:\n  try:\n    ctypes.CDLL(n); print('OK', n)\n  except OSError as e:\n    ok=False; print('MISS', n, '->', e)\n"
          "sys.exit(0 if ok else 1)\n"
          "PY")
        svc-dir true)))

(defn has-eslint-config? [d]
  (pos? (+ (count (fs/glob d ".eslintrc*"))
           (count (fs/glob d "eslint.config.*")))))

