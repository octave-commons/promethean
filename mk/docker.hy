
(defn-cmd docker-build []
  (sh ["docker" "build" "-f" "services/docker/base-python-pipenv.Dockerfile" "-t" "base-python-pipenv" "services/docker"])
  (sh ["docker" "compose" "build"]))

(defn-cmd docker-up []
  (sh ["docker" "compose" "up" "-d"]))

(defn-cmd docker-down []
  (sh ["docker" "compose" "down"]))

(defn-cmd build-changelog []
  (sh ["pipenv" "run" "towncrier" "build" "--yes"])
  (safe-rm-globs ["changelog.d/*.md"]))