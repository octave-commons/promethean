---
uuid: 2478e18c-f621-4b0c-a4c5-9637d213cccf
created_at: cross-language-runtime-polymorphism.md
filename: Cross-Language Runtime Polymorphism
title: Cross-Language Runtime Polymorphism
description: >-
  A system for enabling cross-language communication through staged
  polymorphism, where the meta runtime handles serialization, deserialization,
  and metadata management to facilitate interoperability between different
  language runtimes (e.g., Python, Node.js, Rust) using JSON as an initial
  communication layer. This design supports dynamic dispatch and phased
  transitions to typed buffers and shared memory for advanced use cases.
tags:
  - cross-language
  - runtime-polymorphism
  - meta-runtime
  - json-serialization
  - interoperability
  - staged-polymorphism
  - typed-buffers
---
**Exactly. You’re describing a staged polymorphic runtime with runtime-boundary awareness.** ^ref-c34c36a6-1-0

Let’s unpack and design this properly. ^ref-c34c36a6-3-0

---

## 🧠 Core Idea: Cross-Language Communication in Promethean

| Layer                    | Role                                                | ^ref-c34c36a6-9-0
| ------------------------ | --------------------------------------------------- |
| **Meta runtime**         | Sibilant kernel running at compile-time or as shell |
| **Language runtimes**    | Node, Python, Rust, etc. — actual execution engines |
| **Communication medium** | JSON strings for now, typed buffers later           |
| **Data model**           | Abstracted object model with metadata and bindings  |

---

## 🔁 Phase 1: **JSON Message Passing**

Use JSON as your **lingua franca** between: ^ref-c34c36a6-20-0

* Meta <-> Python ^ref-c34c36a6-22-0
* Meta <-> Node.js ^ref-c34c36a6-23-0
* Meta <-> Rust (via stdin/stdout or FFI) ^ref-c34c36a6-24-0
* Meta <-> Shell (via string streams) ^ref-c34c36a6-25-0

### Why JSON first?

* Ubiquitous
* Typed enough for dynamic dispatch ^ref-c34c36a6-30-0
* Readable, inspectable ^ref-c34c36a6-31-0
* Supports nested structures and arrays ^ref-c34c36a6-32-0

---

## 🧪 Pseudocode API: Message Interface

```sibilant
(meta

  ;; serialize data to JSON and send to runtime
  (def send-json (lang payload)
    `(eval-in ,lang (json.stringify ,payload)))

  ;; deserialize from JSON (simulate callback)
  (def receive-json (lang result)
    (json.parse result)) ; pretend this is a registered event/callback

)
```
^ref-c34c36a6-38-0

---

## 💬 Example Usage
 ^ref-c34c36a6-56-0
```sibilant
(def data (object :msg "hello" :lang "js"))

(send-json "js" data)

;; Output in JS runtime:
;; console.log(JSON.stringify({ msg: "hello", lang: "js" }))
^ref-c34c36a6-56-0
```

---

## 🧠 Phase 2: Metadata for Block Interop ^ref-c34c36a6-69-0

You’ll want your meta runtime to: ^ref-c34c36a6-71-0
 ^ref-c34c36a6-72-0
1. Detect when a block will be executed **in another runtime**
2. Know how to: ^ref-c34c36a6-74-0

   * Format arguments correctly ^ref-c34c36a6-76-0
   * Marshal/unmarshal data
   * Wrap results in consistent meta-wrappers

---

### 🔍 Detecting Cross-Runtime Blocks ^ref-c34c36a6-82-0

```sibilant
(macro py:fn (name args ...body)
  `(:target "py"
     :name ,name
     :args ,args
^ref-c34c36a6-82-0
     :body ,body)) ^ref-c34c36a6-90-0
```
 ^ref-c34c36a6-92-0
Compiler can detect: ^ref-c34c36a6-93-0
 ^ref-c34c36a6-94-0
* That `:target = py`
* Body needs to be rendered in Python
* Output/result needs to be routed back via eval hooks

---
 ^ref-c34c36a6-100-0
### 🧠 Meta object wrapper

```sibilant
(var MetaObject
  (fn (source data)
    (object
      :_type "MetaObject"
^ref-c34c36a6-100-0
      :source source ^ref-c34c36a6-109-0
      :data data)))
```
^ref-c34c36a6-111-0

So when a Python function returns JSON, the meta runtime wraps it:
^ref-c34c36a6-111-0

```sibilant
(receive-json "py" (MetaObject "py" parsed-data))
```
 ^ref-c34c36a6-119-0
---
 ^ref-c34c36a6-121-0 ^ref-c34c36a6-122-0
## 🔀 Phase 3: **Typed Buffers & Shared Memory**
 ^ref-c34c36a6-123-0
Once basic JSON piping is solid, we move to: ^ref-c34c36a6-125-0

* **Buffers**: shared memory, `ArrayBuffer`, `TypedArray`, `numpy`, `Rust slices`, etc.

^ref-c34c36a6-125-0 ^ref-c34c36a6-129-0
* **Metadata registration**: ^ref-c34c36a6-129-0
 ^ref-c34c36a6-131-0
  ```sibilant ^ref-c34c36a6-131-0
  (register-buffer-type "ImageRGB" :layout [height width channels]) ^ref-c34c36a6-132-0
^ref-c34c36a6-133-0
^ref-c34c36a6-132-0
^ref-c34c36a6-131-0
  ``` ^ref-c34c36a6-133-0
^ref-c34c36a6-134-0
^ref-c34c36a6-132-0
 ^ref-c34c36a6-139-0
* **Shared reference model**: ^ref-c34c36a6-139-0
 ^ref-c34c36a6-141-0
  * Use memory-mapped files ^ref-c34c36a6-141-0
  * Or long-lived IPC pipes
  * Or gRPC/WebSockets for bidirectional flow ^ref-c34c36a6-139-0

---

## 📦 Metadata for Buffers

Each buffer object includes:
 ^ref-c34c36a6-151-0
```json
{
  "_type": "Buffer",
^ref-c34c36a6-141-0
  "buffer_id": "abc123", ^ref-c34c36a6-151-0
  "format": "float32",
^ref-c34c36a6-155-0 ^ref-c34c36a6-157-0
^ref-c34c36a6-154-0
^ref-c34c36a6-153-0 ^ref-c34c36a6-159-0
^ref-c34c36a6-151-0
  "shape": [256, 256, 3], ^ref-c34c36a6-153-0
  "language": "py" ^ref-c34c36a6-154-0
} ^ref-c34c36a6-155-0
^ref-c34c36a6-159-0
^ref-c34c36a6-157-0
^ref-c34c36a6-155-0
^ref-c34c36a6-154-0
^ref-c34c36a6-153-0 ^ref-c34c36a6-169-0
^ref-c34c36a6-151-0
```
^ref-c34c36a6-159-0
^ref-c34c36a6-157-0
^ref-c34c36a6-155-0
^ref-c34c36a6-154-0
^ref-c34c36a6-153-0
 ^ref-c34c36a6-157-0 ^ref-c34c36a6-177-0
And the meta context knows:

* Which runtime owns that buffer
* What shape/type is expected
* What function to call to extract data
 ^ref-c34c36a6-183-0
^ref-c34c36a6-169-0
^ref-c34c36a6-159-0
^ref-c34c36a6-177-0
You could call:
 ^ref-c34c36a6-183-0
^ref-c34c36a6-186-0
^ref-c34c36a6-185-0
```sibilant ^ref-c34c36a6-184-0
(def image (fetch-image "img.png")) ^ref-c34c36a6-177-0 ^ref-c34c36a6-185-0
(buffer.shape image) ;; [256 256 3] ^ref-c34c36a6-186-0 ^ref-c34c36a6-193-0
(buffer.view image "grayscale") ;; sends a msg to owning runtime
```

--- ^ref-c34c36a6-197-0

## 📡 Runtime Dispatch Map
^ref-c34c36a6-184-0 ^ref-c34c36a6-185-0
^ref-c34c36a6-183-0 ^ref-c34c36a6-186-0
^ref-c34c36a6-169-0
^ref-c34c36a6-193-0
 ^ref-c34c36a6-177-0 ^ref-c34c36a6-197-0
^ref-c34c36a6-203-0 ^ref-c34c36a6-205-0
^ref-c34c36a6-202-0 ^ref-c34c36a6-206-0
^ref-c34c36a6-201-0 ^ref-c34c36a6-207-0
^ref-c34c36a6-200-0 ^ref-c34c36a6-208-0
^ref-c34c36a6-199-0 ^ref-c34c36a6-209-0
^ref-c34c36a6-198-0 ^ref-c34c36a6-210-0 ^ref-c34c36a6-211-0
```sibilant
(def runtime-dispatch ^ref-c34c36a6-199-0 ^ref-c34c36a6-212-0
  (object ^ref-c34c36a6-200-0
    :js {:eval js.eval, :marshal js.serialize} ^ref-c34c36a6-201-0 ^ref-c34c36a6-214-0
    :py {:eval py.eval, :marshal py.serialize} ^ref-c34c36a6-193-0 ^ref-c34c36a6-202-0 ^ref-c34c36a6-215-0
    :sh {:eval sh.eval, :marshal sh.serialize})) ^ref-c34c36a6-183-0 ^ref-c34c36a6-203-0
^ref-c34c36a6-211-0
``` ^ref-c34c36a6-184-0 ^ref-c34c36a6-217-0
^ref-c34c36a6-212-0
 ^ref-c34c36a6-185-0 ^ref-c34c36a6-205-0
Your meta runtime becomes a **router** between brains. ^ref-c34c36a6-186-0 ^ref-c34c36a6-197-0 ^ref-c34c36a6-206-0 ^ref-c34c36a6-219-0
 ^ref-c34c36a6-207-0 ^ref-c34c36a6-220-0
--- ^ref-c34c36a6-199-0 ^ref-c34c36a6-208-0 ^ref-c34c36a6-221-0
 ^ref-c34c36a6-200-0 ^ref-c34c36a6-209-0 ^ref-c34c36a6-222-0
## 🔧 What To Build Next? ^ref-c34c36a6-201-0 ^ref-c34c36a6-210-0 ^ref-c34c36a6-223-0
 ^ref-c34c36a6-202-0 ^ref-c34c36a6-224-0
* `MetaObject` wrapper w/ source metadata ^ref-c34c36a6-203-0 ^ref-c34c36a6-212-0 ^ref-c34c36a6-225-0
* `(send-json)` + `(receive-json)` dispatcher macro ^ref-c34c36a6-193-0 ^ref-c34c36a6-226-0
* `(eval-in ...)` rewrite to auto-wrap MetaObject results ^ref-c34c36a6-205-0 ^ref-c34c36a6-214-0 ^ref-c34c36a6-227-0
* `register-buffer-type` registry ^ref-c34c36a6-206-0 ^ref-c34c36a6-215-0 ^ref-c34c36a6-228-0
* Hook for `(buffer.view)` to reroute extract calls to the owning runtime ^ref-c34c36a6-207-0 ^ref-c34c36a6-229-0
 ^ref-c34c36a6-197-0 ^ref-c34c36a6-208-0 ^ref-c34c36a6-217-0 ^ref-c34c36a6-230-0
--- ^ref-c34c36a6-209-0 ^ref-c34c36a6-231-0
 ^ref-c34c36a6-199-0 ^ref-c34c36a6-210-0 ^ref-c34c36a6-219-0
## 🏷️ Tags ^ref-c34c36a6-200-0 ^ref-c34c36a6-220-0 ^ref-c34c36a6-233-0
 ^ref-c34c36a6-201-0 ^ref-c34c36a6-212-0 ^ref-c34c36a6-221-0 ^ref-c34c36a6-234-0
\#sibilant #dsl #crosslanguage #json #buffers #ffi #metaprogramming #promethean #runtimeinterop #macrointerop ^ref-c34c36a6-202-0 ^ref-c34c36a6-222-0 ^ref-c34c36a6-235-0
 ^ref-c34c36a6-203-0 ^ref-c34c36a6-214-0 ^ref-c34c36a6-223-0 ^ref-c34c36a6-236-0
--- ^ref-c34c36a6-215-0 ^ref-c34c36a6-224-0 ^ref-c34c36a6-237-0
 ^ref-c34c36a6-205-0 ^ref-c34c36a6-225-0 ^ref-c34c36a6-238-0
You want to sketch the `MetaObject` and `register-buffer-type` interfaces next? Or write the macro wrapper that detects if a block is cross-runtime and rewrites it to a `send-json` call?
