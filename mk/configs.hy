(import os)
(setv TORCH-FLAVOR (or (os.environ.get "PROMETHEAN_TORCH")
                       (if (gpu-present) "cu129" "cpu")))
;; Choose which requirements.in to compile
(setv REQS-IN (if (= TORCH-FLAVOR "cpu") "requirements.cpu.in" "requirements.gpu.in"))

;; ---------- UV helpers (repo-local .venv like node_modules) ----------

(setv GPU_SERVICES #{"stt" "tts"})   ; only these may use GPU wheels

;; Allow override; default to cu129 per current PyTorch page
(setv TORCH_CHANNEL (or (os.environ.get "PROMETHEAN_TORCH_CHANNEL") "cu129"))
(setv TORCH_INDEX (.format "https://download.pytorch.org/whl/{}" TORCH_CHANNEL))
   ; only these Python services are allowed to use GPUs


(setv commands {})
(setv exceptions [])
