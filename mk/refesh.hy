



(setv LOCK_CACHE_DIR ".cache")
(setv LOCK_CACHE_FILE (join LOCK_CACHE_DIR "lock-hashes.json"))
(defn ensure-dir [d]
  (when (not (isdir d)) (os.makedirs d :exist_ok True)))

(defn read-bytes [p]
  (with [f (open p "rb")] (.read f)))

(defn sha256-of [bs]
  (.hexdigest (doto (hashlib.sha256) (.update bs))))

(defn file-hash [p]
  (if (isfile p) (sha256-of (read-bytes p)) None))

(defn save-json [p data]
      (ensure-dir (dirname p))
      (with [f (open p "w")] (json.dump data f :indent 2 :sort_keys True)))

(defn load-json [p]
  (try
   (with [f (open p "r")] (json.load f))
   (except [Exception] {})))

(defn ensure-gitignore-has-cache []
  (let [gi ".gitignore"
       line (+ "/" LOCK_CACHE_DIR "/")]
       (when (isfile gi)
         (let [content (with [f (open gi "r")] (.read f))]
              (when (not (in line content))
                (with [f (open gi "a")] (.write f (+ "\n" line))))))))
;; Return existing lock files for a path
(defn existing-locks [paths]
  (lfor p paths :if (isfile p) p))

;; Python service/shared candidates (support both unified & split locks)
(defn py-locks-for [d]
  (existing-locks
   [(join d "requirements.lock")
   (join d "requirements.cpu.lock")
   (join d "requirements.gpu.lock")]))

;; JS/TS lock
(defn pnpm-lock-for [d]
  (existing-locks [(join d "pnpm-lock.yaml")]))

;; Compute a stable combined hash for a list of lock files
(defn combined-lock-hash [paths]
  (if (not paths)
      None
      (let [h (hashlib.sha256)]
           (for [p (sorted paths)]
                (.update h (.encode  p "utf-8"))
                (.update h (read-bytes p)))
           (.hexdigest h))))
(defn refresh-python-dir [d]
  (if (has-uv)
      (do
       (uv-venv d)
       ;; prefer existing lock (any of the supported names); else compile
       (let [locks (py-locks-for d)]
            (if  locks
                (uv-sync d)
                (do (uv-compile d) (uv-sync d))))
        (inject-sitecustomize-into-venv d))
      (do
       (print (+ "[python] uv not found → pip --user fallback in " d))
       ;; generate requirements.txt if you rely on pip path for fallback
       (when (isfile (join d "Pipfile"))
         (sh "python -m pipenv requirements > requirements.txt" :cwd d :shell True))
        (when (isfile (join d "requirements.txt"))
          (sh ["python" "-m" "pip" "install" "--user" "-r" "requirements.txt"] :cwd d)))))

(defn refresh-pnpm-dir [d]
  (if (has-pnpm)
      (sh "pnpm install" :cwd d :shell True)
      (require-pnpm)))

(defn define-patterns [#* groups]
      (lfor [lang commands] groups
            [action fn] commands
            [(+ action "-" lang "-service-") fn]))
(defn target-rows []
  (+
   ;; Python shared
   [[ "py:shared" "python" "shared/py" (py-locks-for "shared/py") ]]
   ;; Python services
   (lfor d SERVICES_PY
         [ (+ "py:" (basename d)) "python" d (py-locks-for d) ])
   ;; TS/JS shared (treat both; you can dedupe if you only use shared/ts)
   (lfor d SHARED_TS
         [ (+ "ts-shared:" (basename d)) "pnpm" d (pnpm-lock-for d) ])
   [[ "js:shared" "pnpm" "shared/js" (pnpm-lock-for "shared/js") ]]
   ;; TS services
   (lfor d SERVICES_TS
         [ (+ "ts:" (basename d)) "pnpm" d (pnpm-lock-for d) ])
   ;; JS services
   (lfor d SERVICES_JS
         [ (+ "js:" (basename d)) "pnpm" d (pnpm-lock-for d) ])))

(defn do-refresh [kind dir]
  (cond
    (= kind "python") (refresh-python-dir dir)
    (= kind "pnpm")   (refresh-pnpm-dir dir)
    True (print (+ "[warn] unknown target kind: " kind))))

(defn summarize [results]
  (print "\nRefresh summary:")
  (for [[name changed reason] results]
    (print (+ " - " name ": " (if changed "UPDATED" "SKIPPED")
              (if reason (+ " (" reason ")") "")))))

(import datetime [datetime])
(defn update-cache [cache name new-hash lock-paths]
  (setv (get cache name)
        {"hash" new-hash
         "locks" lock-paths
         "ts" (.isoformat (.now datetime))}))



(defn-cmd refresh []
  (ensure-gitignore-has-cache)
  (ensure-dir LOCK_CACHE_DIR)
  (let [cache (load-json LOCK_CACHE_FILE)
        results []]
    (for [[name kind dir lock-paths] (target-rows)]
      (let [prev (.get cache name)
            prev-hash (and prev (get prev "hash"))
            cur-hash (combined-lock-hash lock-paths)]
        (cond
          ;; no lock at all → skip quietly (or choose to run a full setup if you prefer)
          (= cur-hash None)
          (+= results [[name False "no lockfile"]])
          ;; hash unchanged → skip
          (= cur-hash prev-hash)
          (+= results [[name False "unchanged"]])
          ;; changed/missing cache → refresh
          True
          (do (print (+ "[refresh] " name " → " dir))
              (do-refresh kind dir)
            (update-cache cache name cur-hash lock-paths)
            (+= results [[name True "lock changed"]])))))
    (save-json LOCK_CACHE_FILE cache)
    (summarize results)))