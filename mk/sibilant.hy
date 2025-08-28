(require mk.macros [defn-cmd])
;; Sibilant ------------------------------------------------------------------
(defn-cmd build-sibilant []
  (print "Transpiling Sibilant to JS... (not ready)"))

(defn-cmd setup-sibilant []
  (print "Setting up Sibilant services..."))

(defn-cmd setup-sibilant-service [service]
  (print (.format "Setting up Sibilant service: {}" service))
  (if (has-pnpm)
      (sh "pnpm dlx sibilant --install" :cwd (join "services" service) :shell True)
      (require-pnpm)))
