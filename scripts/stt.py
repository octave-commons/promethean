import torch
import torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import openvino as ov

def pad_waveforms(waveforms, target_length=None):
    """
    Pads a list of 1D torch tensors to the same length.
    Returns padded tensor [B, T] and the original lengths.
    """
    lengths = [w.shape[-1] for w in waveforms]
    max_len = target_length or max(lengths)
    padded = torch.stack([
        torch.nn.functional.pad(w, (0, max_len - w.shape[-1]))
        for w in waveforms
    ])
    return padded, lengths

# Load pre-trained model
model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-base-960h")
processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")

# Load audio data
waveform, sample_rate = torchaudio.load("Recording.wav")
waveform_resampled = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)(waveform)

print("waveform resampled shape",waveform_resampled.shape)
example_input=waveform_resampled
print("Example input shape:", example_input.shape)
# Convert Hugging Face model to OpenVINO IR
ov_model = ov.convert_model(model, example_input=example_input)
padded, lengths = pad_waveforms([waveform_resampled[i] for i in range(waveform_resampled.size(0))], 320000)
# padded = padded.unsqueeze(1).numpy()  # [B, 1, T]


# Manually set upper bounds (batch=2, channels=1, max length=300000)
input_tensor = ov_model.inputs[0]
partial_shape = input_tensor.get_partial_shape()
print("Original model input shape:", partial_shape)

# Set an upper bound for the dynamic dimension
max_wave_len = 320000  # this must be longer than your longest input
bounded_shape = ov.PartialShape([2, max_wave_len])
ov_model.reshape({ov_model.inputs[0]: bounded_shape})

# Compile for NPU
compiled_model = ov.compile_model(ov_model, device_name="NPU")
ov_out=compiled_model([padded])
print(ov_out)
logits= torch.tensor(ov_out['logits'])
predicted_ids = torch.argmax(logits, dim=-1)
transcription= processor.batch_decode(predicted_ids)
print("Transcription from OpenVINO:", transcription)
