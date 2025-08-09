(import fastapi [FastAPI Request Header HTTPException])
(import fastapi.responses [JSONResponse])
(import asyncio)
(import lib.speech.wisper_stt [transcribe_pcm])

(setv app (FastAPI))

(@ (app.post "/transcribe_pcm")
(defn transcribe-pcm-endpoint [request [x-sample-rate (Header 16000)] [x-dtype (Header "int16")]]
  (if (!= x-dtype "int16")
      (JSONResponse :content {"error" "Only int16 PCM supported for now"} :status_code 400)
      (do
        (setv pcm-data (bytearray))
        (async-for [chunk (.stream request)]
          (.extend pcm-data chunk))
        (setv transcription (transcribe_pcm pcm-data x-sample-rate))
        {"transcription" transcription})))
