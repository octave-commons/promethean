# SPDX-License-Identifier: GPL-3.0-only
import pytest; pytest.skip("requires external dependencies", allow_module_level=True)
from openvino.runtime import Core
import numpy as np

core = Core()
model = core.read_model("./services/stt/whisper-model-npu/whisper_medium_encoder.xml")
compiled = core.compile_model(model, "NPU")  # or "MYRIAD" or "NPU" if it appears

input_tensor = np.random.rand(1, 80, 3000).astype(np.float32)  # Simulated mel spectrogram
output = compiled([input_tensor])

print("Encoder output shape:", list(output.values())[0].shape)
