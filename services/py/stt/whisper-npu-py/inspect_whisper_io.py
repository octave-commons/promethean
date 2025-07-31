import json
import os
from openvino.runtime import Core

# Paths to the models
model_paths = {
    "encoder": "./whisper-model-npu/whisper_medium_encoder.xml",
    "cross_kv": "./whisper-model-npu/whisper_medium_encoder_decoder_cross_kv.xml",
    "decoder": "./whisper-model-npu/whisper_medium_decoder_static_kvcache_224_lm_QKs.xml"
}

def describe_model_io(model, compiled):
    desc = {"inputs": {}, "outputs": {}}
    for i in range(len(compiled.inputs)):
        name = compiled.input(i).get_any_name()
        shape = compiled.input(i).get_partial_shape().to_shape()
        desc["inputs"][name] = list(shape)

    for i in range(len(compiled.outputs)):
        name = compiled.output(i).get_any_name()
        shape = compiled.output(i).get_partial_shape().to_shape()
        desc["outputs"][name] = list(shape)
    return desc

def cache_model_io(ie: Core, paths: dict, device="NPU", cache_file="model_io.json", force_reload=False):
    if os.path.exists(cache_file) and not force_reload:
        with open(cache_file, "r") as f:
            return json.load(f)

    results = {}
    for name, path in paths.items():
        print(f"Loading {name} model from {path}...")
        model = ie.read_model(path)
        compiled = ie.compile_model(model, device)
        results[name] = describe_model_io(model, compiled)

    with open(cache_file, "w") as f:
        json.dump(results, f, indent=2)

    return results

# Usage
ie = Core()
io_descriptions = cache_model_io(ie, model_paths)

# Print nicely
for model_name, io in io_descriptions.items():
    print(f"\n=== {model_name.upper()} ===")
    print("Inputs:")
    for name, shape in io["inputs"].items():
        print(f"  {name}: {shape}")
    print("Outputs:")
    for name, shape in io["outputs"].items():
        print(f"  {name}: {shape}")
