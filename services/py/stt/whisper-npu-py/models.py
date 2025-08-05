from openvino.runtime import Core
from transformers import WhisperTokenizer
import numpy as np

print("Loading Whisper tokenizer...")
tokenizer = WhisperTokenizer.from_pretrained("openai/whisper-medium")
print("Whisper tokenizer loaded.")

print("Loading OpenVINO Core...")
ie = Core()
# ie.set_property("NPU",{"LOG_LEVEL": "LOG_INFO"})
print("OpenVINO Core loaded.")

print("Loading Whisper models...")
encoder_model = ie.read_model(
    "../whisper-npu/models/whisper_medium/whisper_medium_encoder.xml"
)
print("Whisper encoder model loaded.")
encoder_compiled = ie.compile_model(encoder_model, "NPU")
print("Whisper encoder model compiled.")


print("Loading Whisper cross-kv model...")
cross_kv_model = ie.read_model(
    "../whisper-npu/models/whisper_medium/whisper_medium_encoder_decoder_cross_kv.xml"
)
print("Whisper cross-kv model loaded.")
cross_kv_compiled = ie.compile_model(cross_kv_model, "NPU")
print("Whisper cross-kv model compiled.")


print("Loading Whisper decoder model...")
decoder_model = ie.read_model(
    "../whisper-npu/models/whisper_medium/whisper_medium_decoder_static_kvcache_224_lm_QKs.xml"
)
print("Whisper decoder model loaded.")
decoder_compiled = ie.compile_model(decoder_model, "NPU")
print("Whisper decoder model compiled.")


def run_encoder(mel):
    # Expecting mel to be (1, 80, N) — need to pad/crop to 3000ms = 300 frames
    inputs = {"input_features": mel[np.newaxis, :, :]}
    return encoder_compiled(inputs)[encoder_compiled.output(0)]


def run_cross_kv(encoded_features):
    inputs = {"encoder_hidden_states": encoded_features}
    print("Cross KV inputs keys:", inputs.keys())
    return cross_kv_compiled(inputs)
