import whisper

model = whisper.load_model("medium")
result = model.transcribe("../../longer_recording.wav")
print(result["text"])
