(import base64)
(import json)
(import fastapi [FastAPI WebSocket WebSocketDisconnect])
(setv app (FastAPI))
(defn :async [(app.websocket "/transcribe")] transcribe_ws [(annotate ws WebSocket)] (await (ws.accept)) (try (setv msg (await (ws.receive_text))) (setv payload (json.loads msg)) (setv pcm_b64 (payload.get "pcm")) (when (is pcm_b64 None) (await (ws.close :code 1003)) (return)) (setv sample_rate (int (payload.get "sample_rate" 16000))) (setv pcm_bytes (base64.b64decode pcm_b64)) (import shared.py.speech.wisper_stt [transcribe_pcm]) (setv text (transcribe_pcm (bytearray pcm_bytes) sample_rate)) (await (ws.send_json {"transcription" text})) (except [WebSocketDisconnect]) (finally (when (not (= (. ws.client_state name) "CLOSED")) (await (ws.close))))))

