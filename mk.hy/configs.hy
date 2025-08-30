(import os)
(setv TORCH-FLAVOR)
;; Choose which requirements.in to compile
(setv REQS-IN)

;; ---------- UV helpers (repo-local .venv like node_modules) ----------

(setv GPU_SERVICES #{"stt" "tts" 
                     ;; "embedding_service" ;; Can use the gpu, but in practice it hasn't been. it's mainly ollama
                     })   ; services that may use GPU wheels

;; Allow override; default to cu129 per current PyTorch page
(setv TORCH_CHANNEL )
(setv TORCH_INDEX )
   ; only these Python services are allowed to use GPUs


(setv commands {})
(setv exceptions [])

(defn get-torch-flavor () 
 (or (os.environ.get "PROMETHEAN_TORCH")
                       (if (gpu-present) "cu129" "cpu")))
(defn get-reqs-in ()
 (if (= (get-torch-flavor) "cpu") 
   "requirements.cpu.in" 
   "requirements.gpu.in"))

(defn get-torch-index ()
  (.format "https://download.pytorch.org/whl/{}" TORCH_CHANNEL))
(defn get-torch-channel () 
(or (os.environ.get "PROMETHEAN_TORCH_CHANNEL") 
      "cu129"))
(defn get-commands () commands)
(defn get-exceptions () exceptions)


(define-service-list SERVICES_HY "services/hy" (not (in  "templates" path)))
(define-service-list SERVICES_PY "services/py" (and (not (in  "templates" path)) (not (in "__pycache__" path))))
(define-service-list SERVICES_JS "services/js" (not (in  "templates" path)))
(define-service-list SERVICES_TS "services/ts" (not (in  "templates" path)))