# shared/py/speech/service_clients.py

Helper functions extracted from various scripts to interact with the
speech services over HTTP.

- `send_wav_as_pcm(file_path, url="http://localhost:5001/transcribe_pcm", query_params=None)` –
  send a 16‑bit PCM WAV file to the STT service and return the
  transcription text.
- `synthesize_text_to_file(text, output_path, url="http://localhost:5000/synth_voice")` –
  request speech synthesis from the TTS service and write the resulting
  audio to ``output_path``.
