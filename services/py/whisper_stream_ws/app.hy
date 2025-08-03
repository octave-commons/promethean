(import fastapi [FastAPI WebSocket WebSocketDisconnect])
(import shared.py.speech.whisper_stream [WhisperStreamer])
(setv app (FastAPI))
(setv streamer None)
(defn :async [(app.websocket "/stream")] stream [(annotate ws WebSocket)] (await (ws.accept)) (try (while True (global streamer) (when (is streamer None) (setv streamer (WhisperStreamer))) (setv data (await (ws.receive_bytes))) (setv text (next (streamer.transcribe_chunks [data]))) (await (ws.send_json {"transcription" text}))) (except [WebSocketDisconnect]) (finally (when (not (= (. ws.client_state name) "CLOSED")) (await (ws.close))))))

