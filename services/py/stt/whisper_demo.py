import importlib
from typing import Any, cast

whisper = importlib.import_module("whisper")
model = cast(Any, whisper).load_model("medium")
result = model.transcribe("../../longer_recording.wav")
print(result["text"])
