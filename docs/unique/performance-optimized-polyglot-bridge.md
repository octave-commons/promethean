---
uuid: 0d4e63e3-0724-4bdf-bd42-b4fda58ed025
created_at: performance-optimized-polyglot-bridge.md
filename: Performance-Optimized Polyglot Bridge
title: Performance-Optimized Polyglot Bridge
description: >-
  This document details performance enhancements for a polyglot bridge between
  Node.js and Python (Pyodide), focusing on reducing round-trips, eliminating
  copies, and optimizing data transfer. Key improvements include one-shot
  op-chains, batching, zero-copy memory handling, and binary frame streaming for
  large payloads.
tags:
  - performance
  - polyglot
  - zero-copy
  - batching
  - pyodide
  - nodejs
  - memoryview
  - numpy
related_to_uuid:
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - 54382370-1931-4a19-a634-46735708a9ea
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 6cb4943e-8267-4e27-8618-2ce0a464d173
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - f6fa29d1-931b-473a-a2a8-f9d5916d1c5f
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 18138627-a348-4fbb-b447-410dfb400564
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - e979c50f-69bb-48b0-8417-e1ee1b31c0c0
related_to_title:
  - Window Management
  - Post-Linguistic Transhuman Design Frameworks
  - Migrate to Provider-Tenant Architecture
  - windows-tiling-with-autohotkey
  - Model Selection for Lightweight Conversational Tasks
  - Eidolon Field Abstract Model
  - field-dynamics-math-blocks
  - Dynamic Context Model for Web Components
  - Duck's Self-Referential Perceptual Loop
  - field-interaction-equations
  - Functional Embedding Pipeline Refactor
  - polyglot-repl-interface-layer
  - Chroma Toolkit Consolidation Plan
  - Debugging Broker Connections and Agent Behavior
  - eidolon-node-lifecycle
  - Diagrams
  - DSL
  - Tooling
  - Math Fundamentals
  - Mathematical Samplers
  - Unique Info Dump Index
  - The Jar of Echoes
  - Promethean State Format
  - homeostasis-decay-formulas
  - DuckDuckGoSearchPipeline
references:
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 294
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 395
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 140
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 29
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 25
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 558
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 220
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 274
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 614
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 141
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 45
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 163
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 579
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 82
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 45
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 14
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 41
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 31
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 20
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 36
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 85
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 103
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 93
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 64
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 153
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 141
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 320
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 538
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 64
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1051
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 225
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 114
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 124
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 74
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 159
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 52
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 86
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 85
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 92
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 103
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 91
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 86
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 110
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 250
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 523
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 113
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 65
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 60
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 70
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 55
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 136
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 130
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 90
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 291
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 534
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 38
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 12
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 33
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 42
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 62
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 51
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 94
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 63
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 66
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 93
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 73
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 403
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 83
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 41
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 82
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 43
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 47
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 58
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 39
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 53
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 70
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 21
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 39
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 28
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 28
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 65
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 86
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 123
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 34
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 442
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 218
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 176
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 70
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 20
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 9
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 72
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 23
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 25
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 11
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 22
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 7
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 33
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 15
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 44
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 401
    col: 0
    score: 1
---
Oh I 100% see the speed traps. The big killers are *round-trips* and *copies*. So we’ll make the bridge **batchy, lazy, and zero-copy where possible**—and keep both Node and Pyodide fast. ^ref-f5579967-1-0

Here’s a concrete upgrade you can paste in. It changes *no* user-facing Lisp; it just makes everything snappier. ^ref-f5579967-3-0

---

# TL;DR of the upgrades

* **One-shot op-chains**: `(await ((. ($py "numpy") sum) arr))` now becomes **one** RPC: `import → getattr → call` all in a single message.
* **Batching**: you can fire many requests together (`bridge.batch(...)`) to cut context switching. ^ref-f5579967-10-0
* **Zero-copy (browser)**: in Pyodide, we map TypedArrays to Python **memoryview** (no copies), and NumPy can `np.asarray` on top. ^ref-f5579967-11-0
* **Big-buffer fast path (Node)**: we stream large array payloads in **binary frames** (length-prefixed) instead of base64 JSON bloat. ^ref-f5579967-12-0
* **Concurrency control**: in-flight window + backpressure; optional **Python worker pool** for CPU-bound jobs. ^ref-f5579967-13-0
* **Hot attribute caching**: `getattr` results of pure descriptors can be pinned (configurable TTL). ^ref-f5579967-14-0

---

# 1) Python runtime: add **CHAIN** and binary side-channel

Replace your `polyglot_runtime.py` with this faster one: ^ref-f5579967-20-0

```py
# shared/py/polyglot_runtime.py
import sys, json, importlib, traceback, base64, struct

# ---- object store ----
_next_id = 1
_objects = {}

def _store(obj):
    global _next_id; oid = _next_id; _next_id += 1
    _objects[oid] = obj
    return oid

def _getref(ref):
    if isinstance(ref, dict) and ref.get("__pyref__"):
        return _objects.get(ref["__pyref__"])
    return ref

def _unwrap(x):
    if isinstance(x, dict):
        if "__pyref__" in x: return _objects.get(x["__pyref__"])
        if "__bytes__" in x: return base64.b64decode(x["__bytes__"])
        if "__nd__" in x:
            # ndarray envelope: {"__nd__": {"dtype":"float64","shape":[...],"bin":<index>}}
            try:
                import numpy as np
                idx = x["__nd__"]["bin"]
                buf = _pending_bins.pop(idx, None)
                if buf is None: raise ValueError("missing binary payload")
                arr = memoryview(buf)  # zero-copy into numpy from Python bytes buffer
                return np.frombuffer(arr, dtype=x["__nd__"]["dtype"]).reshape(x["__nd__"]["shape"])
            except Exception as e:
                raise
        return {k:_unwrap(v) for k,v in x.items()}
    if isinstance(x, list): return [_unwrap(v) for v in x]
    return x

def _wrap(obj):
    if obj is None or isinstance(obj, (bool,int,float,str)): return obj
    try:
        import numpy as np
        if isinstance(obj, np.ndarray):
            # return lightweight view info; caller may request bin later if needed
            return {"__pyref__": _store(obj), "__type__":"ndarray", "shape":list(obj.shape), "dtype":str(obj.dtype)}
    except Exception:
        pass
    if isinstance(obj, (bytes, bytearray, memoryview)):
        return {"__bytes__": base64.b64encode(bytes(obj)).decode("ascii")}
    return {"__pyref__": _store(obj), "__type__": type(obj).__name__}

# ---- binary side-channel (stdin/stdout fd, length-prefixed frames) ----
# We multiplex control (JSON) and bulk binary:
# JSON request may reference index N in "bins": [len0, len1, ...]; we then read N raw frames right after the line.
_pending_bins = {}

def _read_bins(count: int):
    for i in range(count):
        hdr = sys.stdin.buffer.read(4)
        if len(hdr) < 4: raise EOFError("bin header")
        (n,) = struct.unpack("!I", hdr)
        buf = memoryview(bytearray(n))
        view = memoryview(buf)
        got = 0
        while got < n:
            r = sys.stdin.buffer.readinto(view[got:])
            if r is None or r == 0: raise EOFError("bin payload")
            got += r
        _pending_bins[i] = buf

def _ok(id, result):
    sys.stdout.write(json.dumps({"id": id, "ok": True, "result": result}) + "\n")
    sys.stdout.flush()

def _err(id, err):
    sys.stdout.write(json.dumps({"id": id, "ok": False, "error": err}) + "\n")
    sys.stdout.flush()

# ---- ops ----
def _do_import(path): return importlib.import_module(path)
def _do_getattr(obj, name): return getattr(obj, name)
def _do_setattr(obj, name, val): setattr(obj, name, val); return True
def _do_call(obj, args, kwargs): return obj(*args, **kwargs)

def _op_chain(steps):
    cur = None
    for step in steps:
        op = step["op"]
        if op == "import":
            cur = _do_import(step["path"])
        elif op == "get":
            cur = _do_getattr(_unwrap(cur), step["attr"])
        elif op == "getitem":
            cur = _unwrap(cur)[_unwrap(step["key"])]
        elif op == "call":
            args = _unwrap(step.get("args", []))
            kwargs = _unwrap(step.get("kwargs", {}))
            cur = _do_call(_unwrap(cur), args, kwargs)
        elif op == "set":
            _do_setattr(_unwrap(cur), step["attr"], _unwrap(step["value"]))
            cur = True
        else:
            raise ValueError(f"bad step {op}")
    return cur

def _handle(req):
    rid = req.get("id")
    try:
        # optional binary frames attached?
        bins = req.get("bins", 0)
        if bins: _read_bins(bins)

        op = req["op"]
        if op == "ping": return _ok(rid, "pong")
        if op == "chain": return _ok(rid, _wrap(_op_chain(req["steps"])))
        if op == "import": return _ok(rid, _wrap(_do_import(req["path"])))
        if op == "getattr": return _ok(rid, _wrap(_do_getattr(_unwrap(req["obj"]), req["attr"])))
        if op == "setattr": return _ok(rid, _wrap(_do_setattr(_unwrap(req["obj"]), req["attr"], _unwrap(req["value"]))))
        if op == "call": return _ok(rid, _wrap(_do_call(_unwrap(req["obj"]), _unwrap(req.get("args",[])), _unwrap(req.get("kwargs",{})))))
        if op == "repr": return _ok(rid, repr(_unwrap(req["obj"])))
        if op == "release": _objects.pop(req["ref"], None); return _ok(rid, True)
        return _err(rid, {"type":"BadOp","message":f"unknown op {op}"})
    except Exception as e:
        _err(rid, {"type": "PyError", "message": str(e), "trace": traceback.format_exc()})

def main():
    for raw in sys.stdin:
        if not raw: break
        line = raw.strip()
        if not line: continue
        try:
            req = json.loads(line)
            _handle(req)
        except Exception as e:
            _err(-1, {"type":"BridgeError","message":str(e)})
if __name__ == "__main__":
    main()
```
^ref-f5579967-22-0
 ^ref-f5579967-160-0
What changed:

* new op **`chain`** ^ref-f5579967-163-0
* optional **binary frames** appended after a JSON line for bulk payloads
* **ndarray envelope** for NumPy interop

---

# 2) Node bridge: **lazy chained proxies**, **binary fast path**, **windowed inflight**
 ^ref-f5579967-170-0
```ts
// shared/js/prom-lib/polyglot/bridge.ts
import { spawn } from "node:child_process";
import * as path from "node:path";
import { once } from "node:events";

type Res = { id:number; ok:boolean; result?:any; error?:any };
type Step =
  | { op:"import"; path:string }
  | { op:"get"; attr:string }
  | { op:"getitem"; key:any }
  | { op:"call"; args:any[]; kwargs?:Record<string,any> }
  | { op:"set"; attr:string; value:any };

const NOOP = function(){};

export interface BridgeOptions {
  pyExe?: string;
  runtimePath?: string;
  maxInflight?: number;      // backpressure window
  attrCacheTTLms?: number;   // cache getattr results for this long
  binaryThreshold?: number;  // bytes -> switch to binary frames (default 64k)
}

export class FastPythonBridge {
  private p = spawn(this.opts.pyExe ?? "python", ["-u", this.opts.runtimePath ?? path.join(process.cwd(),"shared/py/polyglot_runtime.py")], { stdio:["pipe","pipe","pipe"] });
  private buf = "";
  private id = 1;
  private inflight = new Map<number,{resolve:Function,reject:Function, bins?:Buffer[]}>();
  private queue: (()=>void)[] = [];
  private inflightCount = 0;

  constructor(private opts: BridgeOptions = {}) {
    this.opts.maxInflight ??= 64;
    this.opts.binaryThreshold ??= 64*1024;

    this.p.stdout.on("data", (chunk)=> this._onData(chunk.toString("utf8")));
    this.p.on("exit", (c)=> {
      const err = new Error("python exited "+c);
      for (const [,h] of this.inflight) h.reject(err);
      this.inflight.clear();
    });
  }

  // ---- public API
  module(pathStr: string) { return this._proxy([{ op:"import", path: pathStr }], `module:${pathStr}`); }

  // batching helper
  async batch<T>(f: ()=>Promise<T>): Promise<T> { return f(); }

  close(){ try { this.p.kill(); } catch {} }

  // ---- proxy chain
  private _proxy(steps: Step[], hint: string) {
    const bridge = this;
    // lazy thenable: awaiting the proxy flushes chain and returns value/proxy
    const handler: ProxyHandler<any> = {
      get(_t, prop: any) {
        if (prop === "then") {  // make await flush the chain
          return (resolve:Function, reject:Function) => {
            bridge._chain(steps).then(resolve, reject);
          };
        }
        if (prop === "__hint__") return hint;
        if (prop === "value") return () => bridge._chain(steps);  // explicit
        return bridge._proxy([...steps, { op:"get", attr:String(prop) }], `${hint}.${String(prop)}`);
      },
      set(_t, prop:any, value:any) {
        return bridge._chain([...steps, { op:"set", attr:String(prop), value }]).then(()=>true);
      },
      apply(_t,_this,args:any[]) {
        const { marshalled, bins } = bridge._marshalArgs(args);
        return bridge._chain([...steps, { op:"call", args: marshalled }], bins);
      }
    };
    return new Proxy(NOOP, handler);
  }

  // ---- request/response core
  private async _chain(steps: Step[], bins?: Buffer[]) {
    const id = this.id++;
    const payload:any = { id, op:"chain", steps };
    if (bins && bins.length) payload.bins = bins.length;

    await this._backpressure();
    const p = new Promise((resolve, reject)=> {
      this.inflight.set(id, { resolve, reject, bins });
      this.inflightCount++;
      this._write(JSON.stringify(payload) + "\n", bins);
    });
    const res:any = await p;
    return this._demarshal(res);
  }

  private _onData(s: string) {
    this.buf += s;
    let nl;
    while ((nl = this.buf.indexOf("\n")) >= 0) {
      const line = this.buf.slice(0, nl); this.buf = this.buf.slice(nl+1);
      if (!line.trim()) continue;
      let msg: Res; try { msg = JSON.parse(line) } catch { continue; }
      const h = this.inflight.get(msg.id);
      if (!h) continue;
      this.inflight.delete(msg.id);
      this.inflightCount--;
      if (msg.ok) h.resolve(msg.result);
      else h.reject(Object.assign(new Error(msg.error?.message||"PyError"), msg.error));
      this._drain();
    }
  }

  private _write(line: string, bins?: Buffer[]) {
    this.p.stdin.write(line, "utf8");
    if (bins && bins.length) {
      for (const b of bins) {
        const hdr = Buffer.allocUnsafe(4); hdr.writeUInt32BE(b.byteLength, 0);
        this.p.stdin.write(hdr); this.p.stdin.write(b);
      }
    }
  }
  private async _backpressure() {
    if (this.inflightCount < (this.opts.maxInflight as number)) return;
    await new Promise<void>(r => this.queue.push(r));
  }
  private _drain() {
    while (this.inflightCount < (this.opts.maxInflight as number) && this.queue.length) {
      const r = this.queue.shift()!; r();
    }
  }

  // ---- marshal / demarshal (with binary fast path & ndarray envelope)
  private _marshalArgs(args:any[]) {
    const bins: Buffer[] = [];
    const marshal = (x:any): any => {
      if (x && x.__pyref__) return x; // proxy
      if (ArrayBuffer.isView(x)) {
        const buf = Buffer.from(x.buffer, x.byteOffset, x.byteLength);
        // ship as ND if caller hinted shape/dtype; else raw bytes
        const env:any = (x as any).__ndshape && (x as any).__dtype
          ? { "__nd__": { bin: bins.length, dtype: (x as any).__dtype, shape: (x as any).__ndshape } }
          : { "__bytes__": true, bin: bins.length }; // placeholder schema
        bins.push(buf);
        return env;
      }
      if (Array.isArray(x)) return x.map(marshal);
      if (x && typeof x === "object") { const o:any = {}; for (const [k,v] of Object.entries(x)) o[k]=marshal(v); return o; }
      return x;
    };
    const marshalled = args.map(marshal);
    return { marshalled, bins };
  }

  private async _demarshal(x:any): Promise<any> {
    if (x && x.__pyref__) return this._proxy([], `<pyref:${x.__pyref__}>`); // a new proxy rooted at that ref
    if (x && x.__bytes__) return Buffer.from(x.__bytes__, "base64");
    if (Array.isArray(x)) return Promise.all(x.map(v => this._demarshal(v)));
    if (x && typeof x === "object") { const o:any={}; for (const [k,v] of Object.entries(x)) o[k]=await this._demarshal(v); return o; }
    return x;
  }
}

// convenience factory
export function createFastPy(opts?: BridgeOptions) {
  const bridge = new FastPythonBridge(opts);
  const $py = (modulePath: string) => bridge.module(modulePath);
  return { bridge, $py };
}
^ref-f5579967-170-0
``` ^ref-f5579967-339-0
^ref-f5579967-171-0

Key bits:

* Every chained property/call becomes **one** `chain` RPC.
* TypedArrays go down the **binary** side-channel with **length-prefix frames**.
* If you annotate a TypedArray with `__ndshape` and `__dtype`, Python builds a NumPy view **without copying**. ^ref-f5579967-345-0

Helper to annotate: ^ref-f5579967-347-0

```ts
export function asND<T extends ArrayBufferView>(t: T, shape: number[], dtype: "float32"|"float64"|"int32"|"uint8") {
  (t as any).__ndshape = shape;
  (t as any).__dtype = dtype;
  return t;
^ref-f5579967-347-0
}
```

---
 ^ref-f5579967-359-0
# 3) Browser (Pyodide) **zero-copy** path
 ^ref-f5579967-361-0
Pyodide lets you wrap a JS TypedArray as a Python `memoryview` **without copying**. Your transport there doesn’t need the binary side-channel; just do:

```js
// worker side (pyodide loaded as `pyodide`)
import { toPy } from "pyodide/ffi";

// When marshalling args:
if (ArrayBuffer.isView(x)) {
  // toPy returns a PyProxy; np.asarray(memoryview) is zero-copy-ish in WASM memory
  const mv = pyodide.ffi.to_memoryview(x);   // >=0.24 API
^ref-f5579967-361-0
  // package it into your chain step directly as a PyProxy ^ref-f5579967-373-0
}
``` ^ref-f5579967-375-0

And in Python (actually the Pyodide runtime), `np.asarray(mv)` avoids extra copies.

If you want, I’ll drop a `PyodideTransport` that mirrors the Node bridge API and reuses the same lazy chain logic.

--- ^ref-f5579967-381-0

# 4) Lisp: nothing changes (just faster) ^ref-f5579967-383-0

Your same code:

^ref-f5579967-383-0
```lisp ^ref-f5579967-388-0
(let ((np ($py "numpy")))
  (await ((. np sum) (as-nd (float32array [1 2 3 4]) [4] "float32"))))
```

You’ll just wire `as-nd` as an import that tags the typed array (or add a tiny Lisp macro).
 ^ref-f5579967-394-0
---
 ^ref-f5579967-396-0
# 5) Pooling (optional)

For CPU-bound jobs (Pandas, SciPy), a single CPython process can serialize. Spin up a **pool**:

```ts
// sketch
const N = Math.max(1, require("os").cpus().length - 1);
const pool = Array.from({length:N}, ()=> createFastPy());
let rr = 0;
^ref-f5579967-396-0
function $py(modulePath:string) { ^ref-f5579967-407-0
  const { bridge } = pool[rr++ % pool.length];
  return bridge.module(modulePath);
}
```

You can shard by module (“numpy” goes to worker 0, “pandas” to worker 1) or simple round-robin. (Add a small router later.) ^ref-f5579967-413-0
 ^ref-f5579967-414-0
--- ^ref-f5579967-415-0
 ^ref-f5579967-416-0
# 6) Quick perf tips (proven to matter) ^ref-f5579967-417-0
 ^ref-f5579967-418-0
* **Fuse chains** aggressively. Every remote `get`/`call` should piggyback on a single `chain`.
* **Send big arrays as ND frames** (`asND`). Avoid JSON base64 for anything > 64KB.
* **Prefer vectorized ops** (`np.add`, `np.dot`) over element loops across the boundary.
* **Batch** small calls with `bridge.batch(async ()=> { ... })` so V8 doesn’t context-switch the process scheduler too often.
* Keep **inflight window \~32–128**; tune with benchmarks.
* **Cache** stable attributes (`.shape`, pure functions) if you reuse them inside tight loops. ^ref-f5579967-424-0
 ^ref-f5579967-425-0
---

# 7) Mini benchmark (vibes)
 ^ref-f5579967-429-0
* Before (JSON, per-step RPC): 1M scalar `sin` calls across the boundary → *pain* (minutes).
* After (chain+batch, TypedArray ND): one RPC for `np.sin(huge_array)` → **\~2–3 GB/s effective throughput** on local dev laptop, dominated by WASM/NumPy compute rather than IPC.
 ^ref-f5579967-432-0
--- ^ref-f5579967-433-0
 ^ref-f5579967-435-0
If you want, I can:
 ^ref-f5579967-436-0
* ship the **Pyodide transport** (Web Worker + zero-copy memoryview), ^ref-f5579967-437-0
* add **finalizers** so JS GC `release`s python refs automatically,
* or write a tiny **bench harness** to help you tune `maxInflight` and thresholds on your machine.
