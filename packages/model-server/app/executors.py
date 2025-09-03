# SPDX-License-Identifier: GPL-3.0-only

import asyncio
from concurrent.futures import ThreadPoolExecutor
from collections import OrderedDict
import os
import time

try:
    import torch
except Exception:  # pragma: no cover
    torch = None  # optional

def _cuda_free_mem_mb():
    if torch is None or not torch.cuda.is_available():
        return None
    free, total = torch.cuda.mem_get_info()
    return int(free / (1024*1024))

class ModelHandle:
    """Opaque handle for a loaded/compiled model + memory estimate."""
    def __init__(self, run_fn, mem_mb:int, cleanup_fn=None, meta:dict|None=None):
        self.run_fn = run_fn
        self.mem_mb = int(mem_mb)
        self.cleanup_fn = cleanup_fn
        self.meta = meta or {}
    def close(self):
        if self.cleanup_fn:
            try: self.cleanup_fn()
            except Exception: pass

class LRUByBytes:
    """Simple LRU keyed cache tracking total memory in MB."""
    def __init__(self, max_mb:int):
        self.max_mb = int(max_mb)
        self.map: OrderedDict[str, ModelHandle] = OrderedDict()
        self.total_mb = 0

    def __contains__(self, k): return k in self.map
    def __getitem__(self, k): 
        v = self.map.pop(k)
        self.map[k] = v
        return v
    def put(self, k:str, h:ModelHandle):
        self.map[k] = h
        self.total_mb += h.mem_mb
    def pop_lru(self):
        k, h = self.map.popitem(last=False)
        self.total_mb -= h.mem_mb
        return k, h
    def keys(self): return list(self.map.keys())

class DeviceExec:
    def __init__(self, name:str, budget_mb:int, max_conc:int, kind:str):
        self.name = name
        self.kind = kind  # 'nvidia'|'igpu'|'npu'|'cpu'
        self.sem = asyncio.Semaphore(max_conc)
        self.pool = ThreadPoolExecutor(max_workers=max(2, max_conc))
        self.cache = LRUByBytes(budget_mb)
        self.lock = asyncio.Lock()
        self.stats = {
            "runs": 0, "fails": 0, "avg_ms": 0.0, "queue_len": 0,
            "budget_mb": budget_mb, "concurrency": max_conc
        }

    async def get_model(self, key:str, loader):
        async with self.lock:
            if key in self.cache:
                return self.cache[key]
            handle: ModelHandle = loader()
            await self._make_room(handle.mem_mb)
            self.cache.put(key, handle)
            return handle

    async def _make_room(self, need_mb:int):
        # Evict until there is room (and a bit of headroom if CUDA)
        while self.cache.keys() and (self.cache.total_mb + need_mb) > self.cache.max_mb:
            k, h = self.cache.pop_lru()
            try: h.close()
            finally: pass
        # CUDA tidy
        if self.kind == "nvidia" and torch is not None and torch.cuda.is_available():
            try: torch.cuda.empty_cache()
            except Exception: pass

    async def run(self, key:str, loader, fn, *args, **kwargs):
        # Simple queue depth measure
        self.stats["queue_len"] = max(self.stats["queue_len"], self.sem._value if hasattr(self.sem, "_value") else 0)
        async with self.sem:
            start = time.perf_counter()
            try:
                handle = await self.get_model(key, loader)
                loop = asyncio.get_running_loop()
                res = await loop.run_in_executor(self.pool, fn, handle, *args, **kwargs)
                dur_ms = (time.perf_counter() - start) * 1000.0
                # EMA for avg
                self.stats["avg_ms"] = (self.stats["avg_ms"] * 0.9) + (dur_ms * 0.1)
                self.stats["runs"] += 1
                return res
            except Exception as e:
                self.stats["fails"] += 1
                raise e

    def snapshot(self):
        m = {
            "name": self.name,
            "kind": self.kind,
            "stats": self.stats | {"cached_models": len(self.cache.keys()), "cache_mb": self.cache.total_mb}
        }
        if self.kind == "nvidia":
            m["free_vram_mb"] = _cuda_free_mem_mb()
        return m

def make_executors_from_env():
    def geti(key, default): return int(os.environ.get(key, str(default)))
    return {
        "nvidia": DeviceExec("nvidia", geti("EXEC_NVIDIA_BUDGET_MB", 11000), geti("EXEC_NVIDIA_CONCURRENCY", 1), "nvidia"),
        "igpu":   DeviceExec("igpu",   geti("EXEC_IGPU_BUDGET_MB", 3000),  geti("EXEC_IGPU_CONCURRENCY", 3),   "igpu"),
        "npu":    DeviceExec("npu",    geti("EXEC_NPU_BUDGET_MB", 512),    geti("EXEC_NPU_CONCURRENCY", 6),    "npu"),
        "cpu":    DeviceExec("cpu",    geti("EXEC_CPU_BUDGET_MB", 16000),  geti("EXEC_CPU_CONCURRENCY", 8),    "cpu"),
    }
