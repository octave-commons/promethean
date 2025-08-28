(ns mk.configs
  (:require [babashka.fs :as fs]
            [clojure.string :as str]))

;; Services that may target GPU wheels
(def gpu-services #{"stt" "tts"})

(defn gpu-present? []
  (or (fs/exists? "/proc/driver/nvidia")
      (fs/which "nvidia-smi")))

(defn torch-flavor []
  (or (System/getenv "PROMETHEAN_TORCH")
      (when (gpu-present?) "cu129")
      "cpu"))

(defn torch-channel []
  (or (System/getenv "PROMETHEAN_TORCH_CHANNEL") "cu129"))

(defn torch-index []
  (format "https://download.pytorch.org/whl/%s" (torch-channel)))

(defn svc-name [p]
  (-> p fs/file-name str))

(defn reqs-file-for [svc-dir]
  (let [name (svc-name svc-dir)]
    (if (and (= (torch-flavor) "cu129") (contains? gpu-services name))
      "requirements.gpu.in"
      "requirements.cpu.in")))

(defn lockfile-for [svc-dir]
  (if (= (reqs-file-for svc-dir) "requirements.gpu.in")
    "requirements.gpu.lock"
    "requirements.cpu.lock"))

(defn list-services [root]
  (->> (fs/glob root "*")
       (map str)
       (filter fs/directory?)
       (remove #(str/includes? % "/templates"))
       (sort)))

(def services-hy (list-services "services/hy"))
(def services-py (list-services "services/py"))
(def services-js (list-services "services/js"))
(def services-ts (list-services "services/ts"))

;; Shared TS packages (currently single root)
(def shared-ts ["shared/ts"]) 

