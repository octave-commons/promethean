
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Literal
import os, time, asyncio

from .runtime import init_runtime
from .executors import make_executors_from_env, ModelHandle

RUNTIME = init_runtime()
EXEC = make_executors_from_env()
POWER_MODE = os.environ.get("POWER_MODE", "AC")  # AC|BATTERY

app = FastAPI(title="Promethean Model Server", version="0.1.0")

# ---- Request models ----

class STTRequest(BaseModel):
    wav: str = Field(..., description="Base64 or path or handle (wire real one)")
    latency_ms: int = 1500
    priority: Literal["rt", "int", "batch"] = "int"
    power: Optional[Literal["AC","BATTERY"]] = None

class GenericRequest(BaseModel):
    payload: str
    latency_ms: int = 1000
    priority: Literal["rt", "int", "batch"] = "int"
    power: Optional[Literal["AC","BATTERY"]] = None

# ---- Routing policy (simple & explainable) ----

def pick_executor(kind:str, latency_ms:int, priority:str, power:Optional[str]):
    p = (power or POWER_MODE).upper()
    # Harsh but predictable defaults
    if kind == "llm":
        return EXEC["igpu"] if p == "BATTERY" else EXEC["nvidia"]
    if kind == "embed":
        return EXEC["igpu"]
    if kind == "vad":
        return EXEC["npu"] if p == "AC" else EXEC["igpu"]
    if kind == "stt":
        return EXEC["nvidia"] if latency_ms <= 1500 and p == "AC" else EXEC["igpu"]
    return EXEC["cpu"]

# ---- Stub loaders/runners; replace with real implementations ----

def load_whisper_medium_on(device) -> ModelHandle:
    # Rough memory estimate; replace with true probe
    mem = 6200 if device.kind == "nvidia" else 2800 if device.kind == "igpu" else 1200
    def _run(handle, wav): 
        # TODO: run actual inference
        time.sleep(0.05)
        return {"text": "ok (stub)", "device": device.kind}
    def _cleanup():
        # torch.cuda.empty_cache() if cuda; release ov compiled models if any
        pass
    return ModelHandle(run_fn=_run, mem_mb=mem, cleanup_fn=_cleanup, meta={"model": "whisper-medium"})

def load_embed_model_on(device) -> ModelHandle:
    mem = 500 if device.kind in ("igpu","npu") else 800
    def _run(handle, payload):
        time.sleep(0.01)
        return {"embedding": [0.0, 1.0, 0.5], "device": device.kind}
    return ModelHandle(run_fn=_run, mem_mb=mem)

def load_vad_on(device) -> ModelHandle:
    mem = 128
    def _run(handle, payload):
        time.sleep(0.005)
        return {"voice": True, "device": device.kind}
    return ModelHandle(run_fn=_run, mem_mb=mem)

def load_llm_on(device) -> ModelHandle:
    mem = 5000 if device.kind == "nvidia" else 1500
    def _run(handle, payload):
        time.sleep(0.03)
        return {"reply": "stub", "device": device.kind}
    return ModelHandle(run_fn=_run, mem_mb=mem)

# ---- Endpoints ----

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.get("/metrics")
def metrics():
    return {
        "power_mode": POWER_MODE,
        "executors": {k: v.snapshot() for k, v in EXEC.items()}
    }

@app.post("/stt")
async def stt(req: STTRequest):
    dev = pick_executor("stt", req.latency_ms, req.priority, req.power)
    key = f"whisper-medium:{dev.kind}"
    loader = lambda: load_whisper_medium_on(dev)
    result = await dev.run(key, loader, lambda h, x: h.run_fn(h, x), req.wav)
    return result

@app.post("/embed")
async def embed(req: GenericRequest):
    dev = pick_executor("embed", req.latency_ms, req.priority, req.power)
    key = f"embed-e5-small:{dev.kind}"
    loader = lambda: load_embed_model_on(dev)
    result = await dev.run(key, loader, lambda h, x: h.run_fn(h, x), req.payload)
    return result

@app.post("/vad")
async def vad(req: GenericRequest):
    dev = pick_executor("vad", req.latency_ms, req.priority, req.power)
    key = f"silero-vad:{dev.kind}"
    loader = lambda: load_vad_on(dev)
    result = await dev.run(key, loader, lambda h, x: h.run_fn(h, x), req.payload)
    return result

@app.post("/llm")
async def llm(req: GenericRequest):
    dev = pick_executor("llm", req.latency_ms, req.priority, req.power)
    key = f"llm-small:{dev.kind}"
    loader = lambda: load_llm_on(dev)
    result = await dev.run(key, loader, lambda h, x: h.run_fn(h, x), req.payload)
    return result
