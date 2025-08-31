
import os

def init_runtime():
    # Stop thread oversubscription (Torch/OpenVINO/MKL/BLAS)
    os.environ.setdefault("OMP_NUM_THREADS", "6")
    os.environ.setdefault("MKL_NUM_THREADS", "6")
    os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
    os.environ.setdefault("PYTORCH_CUDA_ALLOC_CONF", "max_split_size_mb:128")

    # Torch knobs (optional)
    try:
        import torch
        torch.set_num_threads(int(os.environ.get("TORCH_NUM_THREADS", "6")))
        torch.set_num_interop_threads(int(os.environ.get("TORCH_NUM_INTEROP", "2")))
        torch.backends.cuda.matmul.allow_tf32 = True
        torch.set_float32_matmul_precision("high")
    except Exception:
        pass

    # OpenVINO cache & threads (optional)
    try:
        import openvino as ov
        core = ov.Core()
        core.set_property({"CACHE_DIR": "/var/cache/ov_cache"})
        core.set_property("CPU", {
            "NUM_STREAMS": "AUTO",
            "INFERENCE_NUM_THREADS": int(os.environ.get("OV_INFERENCE_THREADS", "6"))
        })
        return {"ov_core": core}
    except Exception:
        return {"ov_core": None}
