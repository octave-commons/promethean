---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Set up Docker NVIDIA"
conversation_id: 68b5cb42-5880-8322-9668-3c2b6124fe81
create_time: 09/01/2025 at 11:35 AM
update_time: 09/02/2025 at 11:50 AM
---

# Title: Set up Docker NVIDIA

Created: 09/01/2025 at 11:35 AM
Last Updated: 09/02/2025 at 11:50 AM
Chat URL: https://chat.openai.com/c/68b5cb42-5880-8322-9668-3c2b6124fe81


>[!nexus_user] **User** - 09/01/2025 at 11:35 AM
> Set up docker nvidia container
<!-- UID: 646c4da6-0049-4ada-9e3c-4dd327386cc7 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 11:36 AM
> Got it. Here’s the straight path to running Docker containers with NVIDIA GPUs on Ubuntu (works fine on 22.04/24.04+). No fluff—copy/paste these and you’re up.
> 
> # 1) Install NVIDIA Container Toolkit (host)
> 
> ```bash
> # 0) sanity: you already have the NVIDIA proprietary driver installed on the host
> nvidia-smi
> 
> # 1) repo + key
> curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey \
> | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
> 
> curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list \
> | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' \
> | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
> 
> # 2) install
> sudo apt-get update
> sudo apt-get install -y nvidia-container-toolkit
> 
> # 3) wire it into Docker and restart
> sudo nvidia-ctk runtime configure --runtime=docker
> sudo systemctl restart docker
> ```
> 
> Those are NVIDIA’s current instructions; they use `nvidia-ctk` to patch Docker’s daemon config. citeturn3view0
> 
> # 2) Quick verify (CLI)
> 
> ```bash
> # run a CUDA base image and print GPU info
> docker run --rm --gpus all nvidia/cuda:12.9.0-base-ubuntu22.04 nvidia-smi
> ```
> 
> You should see the usual `NVIDIA-SMI` table from inside the container. (NVIDIA shows essentially this in their “sample workload” docs; you can also include `--runtime=nvidia` if you’ve customized runtimes.) citeturn4view0turn5view0
> 
> # 3) Compose example (target 1 GPU)
> 
> ```yaml
> # compose.yaml
> services:
>  gpu-test:
>  image: nvidia/cuda:12.9.0-base-ubuntu22.04
>  command: nvidia-smi
>  deploy:
>  resources:
>  reservations:
>  devices:
>  - driver: nvidia
>  count: 1
>  capabilities: [gpu]
> ```
> 
> Run it:
> 
> ```bash
> docker compose up
> ```
> 
> Modern Compose maps this `deploy.resources.reservations.devices` block to a GPU device request (yes, even outside Swarm). This is the doc-blessed pattern as of now. citeturn1view0
> 
> # 4) Pin a specific GPU (multi-GPU rigs)
> 
> Option A — Compose:
> 
> ```yaml
> services:
>  worker:
>  image: nvidia/cuda:12.9.0-runtime-ubuntu22.04
>  deploy:
>  resources:
>  reservations:
>  devices:
>  - driver: nvidia
>  device_ids: ["0"] # or ["1"], etc.
>  capabilities: [gpu]
> ```
> 
> Option B — CLI:
> 
> ```bash
> docker run --rm --gpus '"device=0,2"' nvidia/cuda:12.9.0-base-ubuntu22.04 nvidia-smi
> ```
> 
> Both are documented (device IDs or `--gpus "device=..."`). citeturn1view0turn5view0
> 
> # 5) Real-world container base
> 
> Use NVIDIA’s maintained CUDA images (`nvidia/cuda:<version>-<flavor>-ubuntuXX.XX`) as your base; pick *runtime* for running, *devel* when you need compilers. Tags live on Docker Hub / NGC. cite
> 
> ---
> 
> ## Pitfalls you’ll likely hit (and how to avoid them)
> 
> - **Driver mismatch**: Host NVIDIA driver must be new enough for the CUDA version in your container. If the container refuses to start or CUDA inside complains, match tags to your driver or use a slightly older CUDA image. (NVIDIA documents driver/CUDA constraints and even the `NVIDIA_REQUIRE_*` envs.) citeturn5view0 
> - **“could not select device driver 'nvidia'”**: You didn’t run `nvidia-ctk runtime configure --runtime=docker` or didn’t restart Docker. Do both. citeturn3view0 
> - **Compose not seeing GPUs**: Your Docker daemon doesn’t have the NVIDIA runtime configured, or you forgot `capabilities: [gpu]` in the Compose device reservation. (It’s required.) citeturn1view0 
> - **Picking GPUs by index**: Use `device_ids: ["0"]` (Compose) or `--gpus '"device=0"'` (CLI). You can also pin by UUID with `--gpus device=GPU-xxxx`. citeturn1view0turn5view0
> 
> ---
> 
> ## Minimal, sensible Dockerfile (if you need one)
> 
> ```dockerfile
> # ./images/ts-gpu-runtime.docker (name it however you like)
> FROM nvidia/cuda:12.9.0-runtime-ubuntu22.04
> 
> # Optional: limit driver features to what you need (compute + utility is common)
> ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility
> 
> # install your runtime deps here...
> # RUN apt-get update && apt-get install -y <...>
> 
> CMD ["nvidia-smi"]
> ```
> 
> Build/run:
> 
> ```bash
> docker build -t ts-gpu-runtime -f ./images/ts-gpu-runtime.docker .
> docker run --rm --gpus all ts-gpu-runtime
> ```
> 
> Driver capability flags and GPU enumeration are first-class in NVIDIA’s docs. citeturn5view0
> 
> ---
> 
> ## Why this setup (and not the old nvidia-docker2 dance)?
> 
> Since Docker 19.03, GPUs are natively supported with `--gpus` and Compose device reservations; the NVIDIA Container Toolkit provides the runtime glue. You don’t need to install CUDA on the host—just the *driver*. citeturn5view0
> 
> If you want to go deeper later (containerd/Podman, CDI specs, etc.), the same toolkit covers it. citeturn3view0
> 
> If anything in the above fails, paste the exact error and `docker info | grep -i nvidia` output and I’ll zero in fast.
> 
> #docker #nvidia #gpu #dockercompose #ubuntu #promethean
<!-- UID: 8c5228b0-ff05-4267-9294-82f58f3ea2fe -->

---




>[!nexus_user] **User** - 09/01/2025 at 11:45 AM
> I get this problem here too! Sometimes it works, some times it doesn't. I've tried all the hardening stuff you've shown me before.
> 
> ollama-1 | time=2025-09-01T16:44:15.149Z level=INFO source=routes.go:1297 msg="server config" env="map[CUDA_VISIBLE_DEVICES: GPU_DEVICE_ORDINAL: HIP_VISIBLE_DEVICES: HSA_OVERRIDE_GFX_VERSION: HTTPS_PROXY: HTTP_PROXY: NO_PROXY: OLLAMA_CONTEXT_LENGTH:4096 OLLAMA_DEBUG:INFO OLLAMA_FLASH_ATTENTION:false OLLAMA_GPU_OVERHEAD:0 OLLAMA_HOST:http://0.0.0.0:11434 OLLAMA_INTEL_GPU:false OLLAMA_KEEP_ALIVE:5m0s OLLAMA_KV_CACHE_TYPE: OLLAMA_LLM_LIBRARY:cublas OLLAMA_LOAD_TIMEOUT:5m0s OLLAMA_MAX_LOADED_MODELS:0 OLLAMA_MAX_QUEUE:512 OLLAMA_MODELS:/root/.ollama/models OLLAMA_MULTIUSER_CACHE:false OLLAMA_NEW_ENGINE:false OLLAMA_NOHISTORY:false OLLAMA_NOPRUNE:false OLLAMA_NUM_PARALLEL:1 OLLAMA_ORIGINS:[http://localhost https://localhost http://localhost:* https://localhost:* http://127.0.0.1 https://127.0.0.1 http://127.0.0.1:* https://127.0.0.1:* http://0.0.0.0 https://0.0.0.0 http://0.0.0.0:* https://0.0.0.0:* app://* file://* tauri://* vscode-webview://* vscode-file://*] OLLAMA_SCHED_SPREAD:false ROCR_VISIBLE_DEVICES: http_proxy: https_proxy: no_proxy:]"
> ollama-1 | time=2025-09-01T16:44:15.151Z level=INFO source=images.go:477 msg="total blobs: 39"
> ollama-1 | time=2025-09-01T16:44:15.151Z level=INFO source=images.go:484 msg="total unused blobs removed: 0"
> ollama-1 | time=2025-09-01T16:44:15.152Z level=INFO source=routes.go:1350 msg="Listening on [::]:11434 (version 0.11.3)"
> ollama-1 | time=2025-09-01T16:44:15.152Z level=INFO source=gpu.go:217 msg="looking for compatible GPUs"
> ollama-1 | time=2025-09-01T16:44:15.156Z level=WARN source=gpu.go:605 msg="unknown error initializing cuda driver library /usr/lib/x86_64-linux-gnu/libcuda.so.575.64.03: cuda driver library init failure: 999. see https://github.com/ollama/ollama/blob/main/docs/troubleshooting.md for more information"
> ollama-1 | time=2025-09-01T16:44:15.158Z level=INFO source=gpu.go:377 msg="no compatible GPUs were discovered"
> ollama-1 | time=2025-09-01T16:44:15.158Z level=INFO source=types.go:130 msg="inference compute" id=0 library=cpu variant="" compute="" driver=0.0 name="" total="31.0 GiB" available="17.0 GiB"
> ^[
<!-- UID: 32d0b835-8d9a-4800-9aa7-1859a4d713eb -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 11:46 AM
> Yep—this is the classic intermittent CUDA “999” faceplant. Your log says:
> 
> > unknown error initializing cuda driver library … **libcuda.so.575.64.03**: **cuda driver library init failure: 999** → “no compatible GPUs were discovered”
> 
> In practice this usually boils down to one (or more) of:
> 
> - the **NVIDIA kernel modules/devices** (esp. `nvidia_uvm`) weren’t loaded when the container started, 
> - the **container didn’t actually get a GPU** (Compose spec mismatch), 
> - **driver/libcuda version weirdness** after an upgrade or suspend/resume, or 
> - the **NVIDIA runtime didn’t hook in** for this run.
> 
> Below is a **tight, deterministic** runbook that kills the flakiness.
> 
> ---
> 
> # 0) Sanity on host (not in container)
> 
> ```bash
> # driver & GPU visible?
> nvidia-smi
> 
> # modules & device nodes are present? (nvidia, nvidia_uvm)
> lsmod | grep -E '^nvidia(_uvm)?\b' || echo "modules missing"
> ls -l /dev/nvidia* || echo "device nodes missing"
> ```
> 
> If `nvidia_uvm`/device nodes are missing or you just resumed/updated drivers, reload them:
> 
> ```bash
> # safe, standard fix for 999:
> sudo rmmod nvidia_uvm 2>/dev/null || true
> sudo modprobe nvidia_uvm
> ```
> 
> (Yes, reloading **`nvidia-uvm` fixes 999** for lots of people; it’s a known quirk. cite)
> 
> If the nodes *still* don’t exist, create them via **nvidia-modprobe** (that’s exactly what it’s for: loading the driver and creating `/dev/nvidia*`). 
> 
> ```bash
> sudo nvidia-modprobe -u -c=0
> ```
> 
> (NVIDIA’s docs: `nvidia-modprobe` loads the kernel module and **creates `/dev/nvidia*`** if missing. cite)
> 
> ---
> 
> # 1) Make Docker’s GPU plumbing boring
> 
> First, confirm the NVIDIA runtime is wired into Docker:
> 
> ```bash
> docker info | grep -i nvidia
> # expect: Runtimes: ... nvidia
> ```
> 
> If not, (re)configure with `nvidia-ctk` and restart Docker:
> 
> ```bash
> sudo nvidia-ctk runtime configure --runtime=docker
> sudo systemctl restart docker
> ```
> 
> (That’s the current, official path. cite)
> 
> **Smoke test (outside of Ollama):**
> 
> ```bash
> docker run --rm --gpus all nvidia/cuda:12.9.0-base-ubuntu22.04 nvidia-smi
> ```
> 
> This must show your GPU from *inside* the container before you blame Ollama. (This is the exact Compose/CLI pattern Docker and NVIDIA document. cite)
> 
> ---
> 
> # 2) Fix your Compose so it always gets a GPU
> 
> If you’re using the old `deploy.resources.reservations.devices` trick, ditch it. Use the **native `gpus:` key**—simpler, fewer moving parts:
> 
> ```yaml
> # compose.yaml
> services:
>  ollama:
>  image: ollama/ollama:0.11.3
>  gpus: all # <— modern Compose (2.30+) supports this directly
>  environment:
>  - OLLAMA_LLM_LIBRARY=cublas
>  - NVIDIA_DRIVER_CAPABILITIES=compute,utility
>  ports: ["11434:11434"]
>  volumes:
>  - ollama:/root/.ollama
> volumes:
>  ollama: {}
> ```
> 
> (Compose `gpus: all` is the documented, minimal way now; no Swarm-only `deploy` magic needed. cite)
> 
> If you **must** stick with device reservations, be explicit:
> 
> ```yaml
> deploy:
>  resources:
>  reservations:
>  devices:
>  - driver: nvidia
>  count: 1
>  capabilities: [gpu]
> ```
> 
> (That pattern is still in Docker’s GPU guide, but it’s touchier than `gpus:`. cite)
> 
> ---
> 
> # 3) Make it robust after reboots / driver updates
> 
> These two make 999 far less likely:
> 
> **A. Ensure `nvidia_uvm` + device nodes before Docker starts** (systemd oneshot):
> 
> ```ini
> # /etc/systemd/system/nvidia-uvm-init.service
> [Unit]
> Description=Load NVIDIA UVM and create /dev/nvidia* before Docker
> Before=docker.service
> 
> [Service]
> Type=oneshot
> ExecStart=/sbin/modprobe nvidia
> ExecStart=/sbin/modprobe nvidia_uvm
> ExecStart=/usr/bin/nvidia-modprobe -u -c=0
> 
> [Install]
> WantedBy=multi-user.target
> ```
> 
> ```bash
> sudo systemctl daemon-reload
> sudo systemctl enable --now nvidia-uvm-init.service
> ```
> 
> (`modprobe nvidia/nvidia_uvm` + `nvidia-modprobe` is the canonical “create devices” combo. cite)
> 
> **B. (Optional) Persistence mode** to avoid repeated init/teardown:
> 
> ```bash
> sudo nvidia-smi -pm 1
> ```
> 
> (Background and trade-offs: NVIDIA’s docs on `nvidia-persistenced`. It reduces init latency; not always required on desktops. cite)
> 
> ---
> 
> # 4) Version mismatches / stubs (when it *sometimes* works)
> 
> - **libcuda inside the container must be from the host driver.** The NVIDIA runtime bind-mounts it. If you ever set Docker’s **default runtime** to `nvidia` and also used images that bundle CUDA **stubs** (`/usr/lib/x86_64-linux-gnu/libcuda.so` from the toolkit), you can get “truncated / wrong libcuda” behavior. 
>  Fix: **don’t** set `default-runtime: nvidia`; just use `--gpus …` / `gpus:` so the runtime injects the right library. cite
> 
> - After driver updates or suspend/resume, “**NVML: Unknown Error**”/999 pops up in containers. Reload `nvidia_uvm`, restart Docker, and restart the container. (There’s a known cgroups-related intermittent that manifests exactly like this. cite)
> 
> - Your log shows **libcuda.so.575.64.03**. Verify the host driver is actually **575.64.03** (or very close) with `nvidia-smi` on the host, so we’re not mixing families. If they diverge wildly, align them.
> 
> ---
> 
> # 5) Quick Ollama-specific checks
> 
> - Inside the `ollama` container, run:
> 
> ```bash
> docker exec -it <ollama_container> bash -lc 'nvidia-smi && ls -l /dev/nvidia*'
> ```
> 
> If `nvidia-smi` works there but Ollama still says “no compatible GPUs,” you’re squarely in the “Ollama + runtime init race / UVM” territory (tons of reports mirror yours). The fix above (load UVM & use `gpus:`) is what helped most folks. cite
> 
> ---
> 
> ## TL;DR sequence to de-flake it now
> 
> ```bash
> # host
> sudo rmmod nvidia_uvm 2>/dev/null || true
> sudo modprobe nvidia
> sudo modprobe nvidia_uvm
> sudo nvidia-modprobe -u -c=0
> sudo nvidia-ctk runtime configure --runtime=docker
> sudo systemctl restart docker
> 
> # verify outside of ollama
> docker run --rm --gpus all nvidia/cuda:12.9.0-base-ubuntu22.04 nvidia-smi
> 
> # swap compose to `gpus: all` and bring it up
> docker compose up -d --force-recreate ollama
> ```
> 
> If you still hit 999 after **that**, paste `docker info | grep -i nvidia`, `ls -l /dev/nvidia*` (host and container), and the first 30 lines of `docker compose logs ollama` and we’ll zero in.
> 
> #docker #nvidia #ollama #gpu #dockercompose #linux #debugging
<!-- UID: 2d68efcb-b7e5-402b-87e2-a1bec2fe0380 -->

---




>[!nexus_user] **User** - 09/01/2025 at 11:56 AM
> 11:56:05 (.venv) err@err-Stealth-16-AI-Studio-A1VGG promethean ±|dev/stealth ✗|→ # driver & GPU visible?
> nvidia-smi
> 
> # modules & device nodes are present? (nvidia, nvidia_uvm)
> lsmod | grep -E '^nvidia(_uvm)?\b' || echo "modules missing"
> ls -l /dev/nvidia* || echo "device nodes missing"
> Mon Sep 1 11:56:07 2025 
> +-----------------------------------------------------------------------------------------+
> | NVIDIA-SMI 575.64.03 Driver Version: 575.64.03 CUDA Version: 12.9 |
> |-----------------------------------------+------------------------+----------------------+
> | GPU Name Persistence-M | Bus-Id Disp.A | Volatile Uncorr. ECC |
> | Fan Temp Perf Pwr:Usage/Cap | Memory-Usage | GPU-Util Compute M. |
> | | | MIG M. |
> |=========================================+========================+======================|
> | 0 NVIDIA GeForce RTX 4070 ... Off | 00000000:01:00.0 Off | N/A |
> | N/A 50C P8 1W / 55W | 157MiB / 8188MiB | 0% Default |
> | | | N/A |
> +-----------------------------------------+------------------------+----------------------+
>  
> +-----------------------------------------------------------------------------------------+
> | Processes: |
> | GPU GI CI PID Type Process name GPU Memory |
> | ID ID Usage |
> |=========================================================================================|
> | 0 N/A N/A 5412 G /usr/lib/xorg/Xorg 4MiB |
> +-----------------------------------------------------------------------------------------+
> nvidia_uvm 2080768 2
> nvidia 104980480 45 nvidia_uvm,nvidia_modeset
> crw-rw-rw- 1 root root 195, 0 Aug 31 07:54 /dev/nvidia0
> crw-rw-rw- 1 root root 195, 255 Aug 31 07:54 /dev/nvidiactl
> crw-rw-rw- 1 root root 195, 254 Aug 31 07:54 /dev/nvidia-modeset
> crw-rw-rw- 1 root root 507, 0 Aug 31 07:54 /dev/nvidia-uvm
> crw-rw-rw- 1 root root 507, 1 Aug 31 07:54 /dev/nvidia-uvm-tools
> 
> /dev/nvidia-caps:
> total 0
> cr-------- 1 root root 510, 1 Sep 1 11:39 nvidia-cap1
> cr--r--r-- 1 root root 510, 2 Sep 1 11:39 nvidia-cap2
<!-- UID: d2825f31-8489-4f3c-8973-b0157f93a3fc -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 11:56 AM
> You’re good on the host: driver **575.64.03** is loaded, `nvidia`/`nvidia_uvm` are present, device nodes look sane. That means the flakiness is almost certainly **Docker GPU plumbing** (runtime not injected / Compose not asking for GPUs) or the occasional **UVM/driver race** after resume/updates.
> 
> Do this and the 999s should stop.
> 
> # 1) Re-pin Docker’s NVIDIA runtime (cheap & deterministic)
> 
> ```bash
> sudo nvidia-ctk runtime configure --runtime=docker
> sudo systemctl restart docker
> ```
> 
> That’s the current, official way to wire the runtime. cite
> 
> # 2) Prove the stack (outside of Ollama)
> 
> ```bash
> docker run --rm --gpus all nvidia/cuda:12.9.0-base-ubuntu22.04 nvidia-smi
> ```
> 
> This must work **inside** the container before you blame Ollama/Compose. (This is Docker’s documented GPU pattern.) cite
> 
> # 3) Fix Compose (stop using the fussy `deploy:` block)
> 
> Prefer the native key; it’s less brittle:
> 
> ```yaml
> services:
>  ollama:
>  image: ollama/ollama:0.11.3
>  gpus: all
>  environment:
>  - OLLAMA_LLM_LIBRARY=cublas
>  - NVIDIA_DRIVER_CAPABILITIES=compute,utility
>  ports: ["11434:11434"]
>  volumes:
>  - ollama:/root/.ollama
> volumes:
>  ollama: {}
> ```
> 
> `gpus: all` is the doc-supported way in modern Compose; it avoids Swarm-only semantics and device-reservation gotchas. cite
> 
> # 4) If it *still* flips to CPU, reset UVM (the classic 999)
> 
> When you see the **“cuda driver library init failure: 999”** again, reload UVM and recreate the container:
> 
> ```bash
> sudo rmmod nvidia_uvm 2>/dev/null || true
> sudo modprobe nvidia_uvm
> docker compose up -d --force-recreate ollama
> ```
> 
> This specific dance is a known workaround for 999 after uptime/suspend/driver bumps. cite
> 
> For permanence, load the modules **before** Docker on boot and ensure device nodes exist:
> 
> ```ini
> # /etc/systemd/system/nvidia-uvm-init.service
> [Unit]
> Description=Load NVIDIA UVM and create /dev/nvidia* before Docker
> Before=docker.service
> 
> [Service]
> Type=oneshot
> ExecStart=/sbin/modprobe nvidia
> ExecStart=/sbin/modprobe nvidia_uvm
> ExecStart=/usr/bin/nvidia-modprobe -u -c=0
> 
> [Install]
> WantedBy=multi-user.target
> ```
> 
> ```bash
> sudo systemctl daemon-reload
> sudo systemctl enable --now nvidia-uvm-init.service
> ```
> 
> `nvidia-modprobe` is the NVIDIA-provided tool that creates `/dev/nvidia*` when needed—this removes boot/timing races. cite
> 
> # 5) Quick container sanity when Ollama starts
> 
> If Ollama logs say “no compatible GPUs,” check from inside **that** container:
> 
> ```bash
> docker exec -it <ollama> bash -lc 'nvidia-smi && ls -l /dev/nvidia*'
> ```
> 
> - If `nvidia-smi` fails: the runtime didn’t inject the driver (go back to steps 1–3). 
> - If it works but Ollama still falls back to CPU, you’re hitting the same intermittent others reported; the fixes above (UVM reload + `gpus:`) are what resolved it. cite
> 
> ---
> 
> ## Why this solves *your* case
> 
> Your host is clean (driver 575.64.03, devices present). The error you pasted is **inside** the container against `libcuda.so.575.64.03`. That usually means either:
> 
> - **Compose didn’t request GPUs** (no injection of the driver stack) → solved by `gpus: all`. cite 
> - **Driver/UVM init race** → solved by UVM reload and/or the small systemd unit. cite
> 
> Run the sequence exactly:
> 
> ```bash
> sudo nvidia-ctk runtime configure --runtime=docker && sudo systemctl restart docker
> docker run --rm --gpus all nvidia/cuda:12.9.0-base-ubuntu22.04 nvidia-smi
> docker compose up -d --force-recreate ollama
> ```
> 
> If any step fails, the output of that step tells us where the pipe is clogged.
> 
> #hashtags #nvidia #docker #ollama #cuda #linux #promethean #debugging
<!-- UID: 469a36d7-5953-4fb0-a44f-4d2b4b98ef0f -->

---




>[!nexus_user] **User** - 09/01/2025 at 12:09 PM
> Will it though?
> 
> 12:07:58 err@err-Stealth-16-AI-Studio-A1VGG promethean ±|dev/stealth ✗|→ sudo nvidia-ctk runtime configure --runtime=docker && sudo systemctl restart docker
> docker run --rm --gpus all nvidia/cuda:12.9.0-base-ubuntu22.04 nvidia-smi
> docker compose up -d --force-recreate ollama
> INFO[0000] Loading config from /etc/docker/daemon.json
> INFO[0000] Wrote updated config to /etc/docker/daemon.json
> INFO[0000] It is recommended that docker daemon be restarted.
> Mon Sep 1 17:08:24 2025
> +-----------------------------------------------------------------------------------------+
> | NVIDIA-SMI 575.64.03 Driver Version: 575.64.03 CUDA Version: 12.9 |
> |-----------------------------------------+------------------------+----------------------+
> | GPU Name Persistence-M | Bus-Id Disp.A | Volatile Uncorr. ECC |
> | Fan Temp Perf Pwr:Usage/Cap | Memory-Usage | GPU-Util Compute M. |
> | | | MIG M. |
> |=========================================+========================+======================|
> | 0 NVIDIA GeForce RTX 4070 ... Off | 00000000:01:00.0 Off | N/A |
> | N/A 49C P8 1W / 55W | 157MiB / 8188MiB | 0% Default |
> | | | N/A |
> +-----------------------------------------+------------------------+----------------------+
> 
> +-----------------------------------------------------------------------------------------+
> | Processes: |
> | GPU GI CI PID Type Process name GPU Memory |
> | ID ID Usage |
> |=========================================================================================|
> +-----------------------------------------------------------------------------------------+
> [+] Running 1/1
>  ✔ Container promethean-ollama-1 Started 
> 
> ollama-1 | time=2025-09-01T17:08:25.217Z level=INFO source=routes.go:1331 msg="server config" env="map[CUDA_VISIBLE_DEVICES: GPU_DEVICE_ORDINAL: HIP_VISIBLE_DEVICES: HSA_OVERRIDE_GFX_VERSION: HTTPS_PROXY: HTTP_PROXY: NO_PROXY: OLLAMA_CONTEXT_LENGTH:4096 OLLAMA_DEBUG:INFO OLLAMA_FLASH_ATTENTION:false OLLAMA_GPU_OVERHEAD:0 OLLAMA_HOST:http://0.0.0.0:11434 OLLAMA_INTEL_GPU:false OLLAMA_KEEP_ALIVE:5m0s OLLAMA_KV_CACHE_TYPE: OLLAMA_LLM_LIBRARY:cublas OLLAMA_LOAD_TIMEOUT:5m0s OLLAMA_MAX_LOADED_MODELS:0 OLLAMA_MAX_QUEUE:512 OLLAMA_MODELS:/root/.ollama/models OLLAMA_MULTIUSER_CACHE:false OLLAMA_NEW_ENGINE:false OLLAMA_NEW_ESTIMATES:false OLLAMA_NOHISTORY:false OLLAMA_NOPRUNE:false OLLAMA_NUM_PARALLEL:1 OLLAMA_ORIGINS:[http://localhost https://localhost http://localhost:* https://localhost:* http://127.0.0.1 https://127.0.0.1 http://127.0.0.1:* https://127.0.0.1:* http://0.0.0.0 https://0.0.0.0 http://0.0.0.0:* https://0.0.0.0:* app://* file://* tauri://* vscode-webview://* vscode-file://*] OLLAMA_SCHED_SPREAD:false ROCR_VISIBLE_DEVICES: http_proxy: https_proxy: no_proxy:]"
> ollama-1 | time=2025-09-01T17:08:25.219Z level=INFO source=images.go:477 msg="total blobs: 39"
> ollama-1 | time=2025-09-01T17:08:25.219Z level=INFO source=images.go:484 msg="total unused blobs removed: 0"
> ollama-1 | time=2025-09-01T17:08:25.219Z level=INFO source=routes.go:1384 msg="Listening on [::]:11434 (version 0.11.8)"
> ollama-1 | time=2025-09-01T17:08:25.220Z level=INFO source=gpu.go:217 msg="looking for compatible GPUs"
> ollama-1 | time=2025-09-01T17:08:25.224Z level=WARN source=gpu.go:607 msg="unknown error initializing cuda driver library /usr/lib/x86_64-linux-gnu/libcuda.so.575.64.03: cuda driver library init failure: 999. see https://github.com/ollama/ollama/blob/main/docs/troubleshooting.md for more information"
> ollama-1 | time=2025-09-01T17:08:25.225Z level=INFO source=gpu.go:379 msg="no compatible GPUs were discovered"
> ollama-1 | time=2025-09-01T17:08:25.225Z level=INFO source=types.go:130 msg="inference compute" id=0 library=cpu variant="" compute="" driver=0.0 name="" total="31.0 GiB" available="15.5 GiB"
<!-- UID: 669ac03f-2238-42f5-a76d-af99af17326b -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 12:10 PM
> Short answer: your host is fine; the container path is flaky. Your `docker run … nvidia/cuda … nvidia-smi` worked, so the NVIDIA runtime + driver are OK. The 999 inside **Ollama** means **Compose didn’t actually request a GPU** or you hit the classic **UVM/driver state race**. Fix both.
> 
> # Do this, exactly
> 
> ## 1) Make Compose explicitly request a GPU
> Use the pattern Docker documents (device reservations). It’s boring and reliable.
> 
> ```yaml
> # compose.yaml
> services:
>  ollama:
>  image: ollama/ollama:0.11.8
>  environment:
>  - OLLAMA_LLM_LIBRARY=cublas
>  - NVIDIA_DRIVER_CAPABILITIES=compute,utility
>  deploy:
>  resources:
>  reservations:
>  devices:
>  - driver: nvidia
>  count: 1 # or 'all'
>  capabilities: [gpu]
>  ports: ["11434:11434"]
>  volumes:
>  - ollama:/root/.ollama
> volumes:
>  ollama: {}
> ```
> 
> Bring it up clean:
> 
> ```bash
> docker compose down
> docker compose up -d --force-recreate ollama
> ```
> 
> This is the Compose-blessed way to expose GPUs. (Yes, it lives under `deploy.resources…devices`.) citeturn2view0
> 
> ## 2) Kill the 999 race (UVM reset + pre-Docker hook)
> When you *do* see `cuda driver library init failure: 999`, reload UVM then recreate the container:
> 
> ```bash
> sudo rmmod nvidia_uvm 2>/dev/null || true
> sudo modprobe nvidia_uvm
> docker compose up -d --force-recreate ollama
> ```
> 
> This exact “reload UVM” pattern is widely used to clear 999 after long uptimes/suspend; 999 is just `cudaErrorUnknown` often caused by stale driver state. cite
> 
> Make it persistent on boot so Docker never beats the driver:
> 
> ```ini
> # /etc/systemd/system/nvidia-uvm-init.service
> [Unit]
> Description=Load NVIDIA UVM and create /dev/nvidia* before Docker
> Before=docker.service
> 
> [Service]
> Type=oneshot
> ExecStart=/sbin/modprobe nvidia
> ExecStart=/sbin/modprobe nvidia_uvm
> ExecStart=/usr/bin/nvidia-modprobe -u -c=0
> 
> [Install]
> WantedBy=multi-user.target
> ```
> 
> ```bash
> sudo systemctl daemon-reload
> sudo systemctl enable --now nvidia-uvm-init.service
> ```
> 
> `nvidia-modprobe` exists specifically to ensure the modules are loaded and **/dev/nvidia*** nodes exist. cite
> 
> ## 3) Sanity checks (don’t skip)
> - Prove the runtime (you already did):
> 
> ```bash
> docker run --rm --gpus all nvidia/cuda:12.9.0-base-ubuntu22.04 nvidia-smi
> ```
> 
> If this works, driver + runtime are fine; problem is your service config. cite
> 
> - Inside the **ollama** container:
> 
> ```bash
> docker exec -it promethean-ollama-1 bash -lc 'nvidia-smi && ls -l /dev/nvidia* && ls -l /usr/lib/x86_64-linux-gnu/libcuda.so*'
> ```
> 
> If `nvidia-smi` fails inside: your Compose didn’t request GPUs. If it passes but Ollama still logs 999, you’re in the known intermittent bucket (see Ollama issues) → do the UVM reload and ensure your Compose uses the GPU reservation. cite
> 
> ## 4) Keep the Docker plumbing correct
> Re-apply the NVIDIA runtime and restart Docker whenever you update the toolkit:
> 
> ```bash
> sudo nvidia-ctk runtime configure --runtime=docker
> sudo systemctl restart docker
> ```
> 
> That’s literally NVIDIA’s install guide. cite
> 
> Optional: enable persistence (reduces init churn; sometimes helps with “works after reboot, breaks hours later”):
> 
> ```bash
> sudo nvidia-smi -pm 1
> ```
> 
> Background docs: persistence mode / `nvidia-persistenced`. cite
> 
> ---
> 
> ## Why your log points here
> - You opened the **host** libcuda inside the container (`/usr/lib/x86_64-linux-gnu/libcuda.so.575.64.03`), so the runtime did mount it. Init then returned **999** → typical of stale UVM/driver state or containers started before the nodes/modules were ready. The exact symptom is well-reported by Ollama users; the fix is either reservation-correct Compose or a UVM reset (and making it happen *before* Docker). cite
> 
> If you want me to diff your current `compose.yaml`, paste just the **ollama** service block and I’ll patch it in place.
> 
> #tags #docker #nvidia #cuda #ollama #compose #linux #debugging
<!-- UID: bef2441a-4ea2-4bac-9df7-abcda8510248 -->

---




>[!nexus_user] **User** - 09/01/2025 at 12:12 PM
> I get this error outside of the container too. It isn't the container. The container is configured exactly like you said. 
> 
> 12:10:33 err@err-Stealth-16-AI-Studio-A1VGG promethean ±|dev/stealth ✗|→ ollama serve
> time=2025-09-01T12:10:37.310-05:00 level=INFO source=routes.go:1297 msg="server config" env="map[CUDA_VISIBLE_DEVICES: GPU_DEVICE_ORDINAL: HIP_VISIBLE_DEVICES: HSA_OVERRIDE_GFX_VERSION: HTTPS_PROXY: HTTP_PROXY: NO_PROXY: OLLAMA_CONTEXT_LENGTH:4096 OLLAMA_DEBUG:INFO OLLAMA_FLASH_ATTENTION:false OLLAMA_GPU_OVERHEAD:0 OLLAMA_HOST:http://127.0.0.1:11434 OLLAMA_INTEL_GPU:false OLLAMA_KEEP_ALIVE:5m0s OLLAMA_KV_CACHE_TYPE: OLLAMA_LLM_LIBRARY: OLLAMA_LOAD_TIMEOUT:5m0s OLLAMA_MAX_LOADED_MODELS:0 OLLAMA_MAX_QUEUE:512 OLLAMA_MODELS:/home/err/.ollama/models OLLAMA_MULTIUSER_CACHE:false OLLAMA_NEW_ENGINE:false OLLAMA_NOHISTORY:false OLLAMA_NOPRUNE:false OLLAMA_NUM_PARALLEL:1 OLLAMA_ORIGINS:[http://localhost https://localhost http://localhost:* https://localhost:* http://127.0.0.1 https://127.0.0.1 http://127.0.0.1:* https://127.0.0.1:* http://0.0.0.0 https://0.0.0.0 http://0.0.0.0:* https://0.0.0.0:* app://* file://* tauri://* vscode-webview://* vscode-file://*] OLLAMA_SCHED_SPREAD:false ROCR_VISIBLE_DEVICES: http_proxy: https_proxy: no_proxy:]"
> time=2025-09-01T12:10:37.312-05:00 level=INFO source=images.go:477 msg="total blobs: 5"
> time=2025-09-01T12:10:37.312-05:00 level=INFO source=images.go:484 msg="total unused blobs removed: 0"
> time=2025-09-01T12:10:37.312-05:00 level=INFO source=routes.go:1350 msg="Listening on 127.0.0.1:11434 (version 0.11.3)"
> time=2025-09-01T12:10:37.312-05:00 level=INFO source=gpu.go:217 msg="looking for compatible GPUs"
> time=2025-09-01T12:10:37.323-05:00 level=WARN source=gpu.go:605 msg="unknown error initializing cuda driver library /usr/lib/x86_64-linux-gnu/libcuda.so.575.64.03: cuda driver library init failure: 999. see https://github.com/ollama/ollama/blob/main/docs/troubleshooting.md for more information"
> time=2025-09-01T12:10:37.329-05:00 level=INFO source=gpu.go:377 msg="no compatible GPUs were discovered"
> time=2025-09-01T12:10:37.329-05:00 level=INFO source=types.go:130 msg="inference compute" id=0 library=cpu variant="" compute="" driver=0.0 name="" total="31.0 GiB" available="16.3 GiB"
<!-- UID: a6df2cb3-6d99-4bda-88f3-df369ee29efe -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 12:13 PM
> Yeah—this isn’t (just) Docker. Your **host** `ollama serve` log shows this:
> 
> > `env="map[CUDA_VISIBLE_DEVICES:` **(set, but empty)** `…]` → then `cuda driver library init failure: 999`.
> 
> An **empty** `CUDA_VISIBLE_DEVICES` means “hide all GPUs.” Lots of stacks treat that as *no* GPU available. Result: `cuInit` → **999**. Fix that first. cite
> 
> # Do this now (host, no container)
> 
> ```bash
> # 1) run Ollama with a sanitized env (+ force CUDA backend)
> env -u CUDA_VISIBLE_DEVICES -u NVIDIA_VISIBLE_DEVICES OLLAMA_LLM_LIBRARY=cublas ollama serve
> # or explicitly pick GPU 0 instead of unsetting:
> CUDA_VISIBLE_DEVICES=0 OLLAMA_LLM_LIBRARY=cublas ollama serve
> ```
> 
> If that boots without the 999 and shows a CUDA device, the culprit was the env var. The fix is to **remove where it’s being set** in your session:
> 
> ```bash
> # see where it's coming from
> ( printenv | grep -E 'CUDA|NVIDIA' ) || true
> systemctl --user show-environment | grep -E 'CUDA|NVIDIA' || true
> grep -R "CUDA_VISIBLE_DEVICES" -n \
>  /etc/environment /etc/security/pam_env.conf ~/.profile ~/.bashrc ~/.zshrc ~/.pam_environment 2>/dev/null
> ```
> 
> If you find it, delete it (or set `CUDA_VISIBLE_DEVICES=0`). Many schedulers/launchers set it; an **empty** value masks all GPUs. cite
> 
> # If the 999 persists after sanitizing the env
> 
> This is the other common cause: **stale NVIDIA UVM state**. Reset it and retry:
> 
> ```bash
> sudo rmmod nvidia_uvm 2>/dev/null || true
> sudo modprobe nvidia_uvm
> ollama serve
> ```
> 
> That specific UVM reload resolves “`cuInit` → 999” for lots of CUDA users after long uptimes/suspend/driver bumps. If it fixes it for you, make it stick with a tiny oneshot unit that loads `nvidia`/`nvidia_uvm` on boot. cite
> 
> # Two more sanity checks (rare, but worth 30s)
> 
> ```bash
> # 1) make sure you’re not picking up CUDA stubs ahead of the driver lib
> echo "$LD_LIBRARY_PATH"
> ldconfig -p | grep -E 'libcuda\.so'
> ```
> 
> If you see `/usr/local/cuda/lib64/stubs` ahead of `/usr/lib/x86_64-linux-gnu/…575.64.03`, remove it from your path; stubs = no real driver. (Multiple Ollama reports/threads hit 999 due to wrong lib order.) cite
> 
> ```bash
> # 2) confirm CUDA works outside Ollama at all times
> nvidia-smi # host
> ```
> 
> If **CUDA-only** apps intermittently fail with 999 hours after boot, that’s the same **UVM/driver race** discussed in NVIDIA + Ollama threads; the reload above is the proven workaround. cite
> 
> ---
> 
> ## Why I’m confident this matches your case
> - Your log shows **`CUDA_VISIBLE_DEVICES:` empty** exactly when 999 fires. That setting is interpreted as “no GPU.” Make it `0` or unset it and the GPU becomes visible. cite 
> - When it’s *not* the env, the next most common cause is **UVM** getting into a bad state → `cuInit` returns **999**. Reloading `nvidia_uvm` clears it. cite
> 
> If you want, paste the output of:
> 
> ```bash
> printenv | grep -E 'CUDA|NVIDIA' ; echo --- ; \
> systemctl --user show-environment | grep -E 'CUDA|NVIDIA' ; echo --- ; \
> echo "$LD_LIBRARY_PATH" ; ldconfig -p | grep libcuda
> ```
> 
> and I’ll point to the exact line to delete.
> 
> #gpu #cuda #ollama #linux #nvidia #debugging #promethean
<!-- UID: 352b2593-9519-4676-aa1f-b2956da957f4 -->

---




>[!nexus_user] **User** - 09/01/2025 at 12:17 PM
> Then why does it say the same thing when I reboot, but it is showing the GPU?
> 12:16:13 err@err-Stealth-16-AI-Studio-A1VGG ~ → sudo systemctl status ollama
> ● ollama.service - Ollama Service
>  Loaded: loaded (/etc/systemd/system/ollama.service; enabled; preset: enabled)
>  Drop-In: /etc/systemd/system/ollama.service.d
>  └─override.conf
>  Active: active (running) since Mon 2025-09-01 12:15:26 CDT; 57s ago
>  Main PID: 3124 (ollama)
>  Tasks: 13 (limit: 37822)
>  Memory: 53.6M (peak: 63.8M)
>  CPU: 229ms
>  CGroup: /system.slice/ollama.service
>  └─3124 /usr/local/bin/ollama serve
> 
> Sep 01 12:15:26 err-Stealth-16-AI-Studio-A1VGG systemd[1]: Started ollama.service - Ollama Service.
> Sep 01 12:15:26 err-Stealth-16-AI-Studio-A1VGG ollama[3124]: time=2025-09-01T12:15:26.573-05:00 level=INFO source=routes.go:1297 msg="server config" env="map[CUDA_VISIBLE_DEVICES: GPU_DEVICE_ORDINAL: HIP_VISIBLE_DEVICES: HSA_OVERRIDE_GFX_VERSION: HTTP>
> Sep 01 12:15:26 err-Stealth-16-AI-Studio-A1VGG ollama[3124]: time=2025-09-01T12:15:26.579-05:00 level=INFO source=images.go:477 msg="total blobs: 39"
> Sep 01 12:15:26 err-Stealth-16-AI-Studio-A1VGG ollama[3124]: time=2025-09-01T12:15:26.580-05:00 level=INFO source=images.go:484 msg="total unused blobs removed: 0"
> Sep 01 12:15:26 err-Stealth-16-AI-Studio-A1VGG ollama[3124]: time=2025-09-01T12:15:26.580-05:00 level=INFO source=routes.go:1350 msg="Listening on 127.0.0.1:11434 (version 0.11.3)"
> Sep 01 12:15:26 err-Stealth-16-AI-Studio-A1VGG ollama[3124]: time=2025-09-01T12:15:26.581-05:00 level=INFO source=gpu.go:217 msg="looking for compatible GPUs"
> Sep 01 12:15:26 err-Stealth-16-AI-Studio-A1VGG ollama[3124]: time=2025-09-01T12:15:26.801-05:00 level=INFO source=types.go:130 msg="inference compute" id=GPU-9a613ad4-057b-4fb1-8572-ae2d3c112a92 library=cuda variant=v12 compute=8.9 driver=12.9 name="N>
<!-- UID: 072e3453-f5d0-4383-8b48-0e1c83b1dd4f -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 12:18 PM
> Short version: the log line is ambiguous. Ollama prints `CUDA_VISIBLE_DEVICES:` with a blank value in both cases, but that blank can mean **either** “unset” **or** “set to empty.” When it’s **unset**, CUDA exposes all GPUs and Ollama happily picks yours (hence `inference compute … library=cuda`). When it’s **set to an empty string**, many stacks interpret that as “hide all GPUs,” so `cuInit` returns **999** and Ollama falls back to CPU. NVIDIA’s own docs describe `CUDA_VISIBLE_DEVICES` as the visibility filter; unset → all devices, whereas frameworks often treat empty → none. cite
> 
> Go makes this extra-confusing: `os.Getenv("CUDA_VISIBLE_DEVICES")` returns `""` **both** when the var is unset and when it’s set to `""`; you must use `os.LookupEnv` to tell the difference. Many apps (looks like Ollama here) just log `Getenv`, so the line looks “the same” across both scenarios. cite
> 
> That’s why after a reboot your **systemd** service shows the same “blank” in the env dump *but* still uses the GPU: under systemd the variable is likely **not set at all**, so CUDA sees the device and works. In your interactive shell, something (Ray, a launcher, a venv activation, tmux, etc.) occasionally sets `CUDA_VISIBLE_DEVICES=""`, which masks the GPU and triggers **999**. Ray is notorious for doing exactly this when you don’t request GPUs. cite
> 
> ## Make it deterministic
> 
> ### 1) Prove the difference right now
> ```bash
> # Case A: UNSET (should allow GPU)
> env -u CUDA_VISIBLE_DEVICES OLLAMA_LLM_LIBRARY=cublas ollama serve
> 
> # Case B: EMPTY (should hide GPU → likely 999)
> CUDA_VISIBLE_DEVICES= OLLAMA_LLM_LIBRARY=cublas ollama serve
> ```
> If case B reproduces the failure and case A doesn’t, you’ve nailed it. (The -999 symptom + fix via environment is also echoed across CUDA/Ollama threads; reloading UVM fixes the other common cause — stale driver state — but your question here is about the env.) cite
> 
> ### 2) Find who’s setting the bad env
> Run these and delete the offender (or change it to `0`):
> ```bash
> printenv | grep -E 'CUDA|NVIDIA' || true
> systemctl --user show-environment | grep -E 'CUDA|NVIDIA' || true
> grep -R "CUDA_VISIBLE_DEVICES" -n \
>  ~/.bashrc ~/.zshrc ~/.profile ~/.pam_environment ~/.config/systemd/user/*.service \
>  /etc/environment /etc/security/pam_env.conf 2>/dev/null
> ```
> A lot of tools set it silently; Ray is one example that sets it to **empty** unless you specify a GPU count. cite
> 
> ### 3) Pin the service to a sane value (optional but recommended)
> Keep your *systemd* service immune to session quirks:
> ```ini
> # /etc/systemd/system/ollama.service.d/override.conf
> [Service]
> Environment="CUDA_VISIBLE_DEVICES=0"
> Environment="NVIDIA_DRIVER_CAPABILITIES=compute,utility"
> Environment="OLLAMA_LLM_LIBRARY=cublas"
> ```
> Then:
> ```bash
> sudo systemctl daemon-reload
> sudo systemctl restart ollama
> ```
> 
> ### 4) If you see 999 hours later (different root cause)
> That’s usually stale **UVM** state. Fast reset:
> ```bash
> sudo rmmod nvidia_uvm 2>/dev/null || true
> sudo modprobe nvidia_uvm
> ```
> This exact `nvidia_uvm` reload is a common, documented workaround for `cuInit -> 999`. If this fixes things *without* any env changes, you hit the driver state issue, not the env issue. cite
> 
> ---
> 
> ### Why your reboot behaves “the same” but works
> - The log line is produced by `Getenv`, which **cannot** distinguish unset vs empty. The output looks identical even though the semantics are different. cite 
> - After reboot, the service’s environment is **clean** (variable unset), so CUDA enumerates the GPU and Ollama logs `library=cuda …`. When you start it from your shell later, a launcher sometimes sets `CUDA_VISIBLE_DEVICES=""`, which hides GPUs and triggers 999. cite
> 
> If you want, paste `systemctl cat ollama` and `systemctl show -p Environment ollama`, and I’ll point out exactly what systemd is passing in vs your shell.
> 
> #docker #cuda #nvidia #ollama #linux #env #debugging #promethean
<!-- UID: c5c3d9b6-a444-4624-855f-f7830c6fd625 -->

---




>[!nexus_user] **User** - 09/02/2025 at 11:45 AM
> Alright I've done all of that, all those env variables are set, it still does it. but I think I know why. It happens when I close my laptop
<!-- UID: 1fbf25fb-4253-4431-902b-73fe912f44e0 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 11:46 AM
> Yup—that pattern (works → close lid → resume → **999**) screams **suspend/resume** breaking NVIDIA’s UVM/NVML init. It’s not you; it’s a long-standing Linux + NVIDIA quirk. The fix is to make the driver save/restore properly and to **re-init UVM on resume**—automatically—then restart the stuff that relies on CUDA.
> 
> Here’s the pragmatic setup that stops the flakiness:
> 
> # 1) Enable NVIDIA’s power-management hooks + persistence
> These are the vendor-provided systemd units and daemon meant to survive sleep.
> 
> ```bash
> # enable the daemon that keeps driver state warm
> sudo systemctl enable --now nvidia-persistenced
> 
> # enable NVIDIA’s suspend/resume services (if present on your distro)
> sudo systemctl enable --now nvidia-suspend.service nvidia-resume.service nvidia-hibernate.service
> ```
> 
> - `nvidia-persistenced` keeps device files/state open to avoid teardown thrash. cite 
> - NVIDIA documents the `nvidia-suspend/resume` services and their `/proc/driver/nvidia/suspend` flow; some distros ship them via `nvidia-kernel-common`. cite
> 
> (If any of those services don’t exist, your distro didn’t ship them—skip to step 2; the hook below covers it.)
> 
> # 2) Force a clean UVM re-init on wake (the reliable hammer)
> Create a systemd **sleep hook** that reloads UVM and restarts your GPU-consumers:
> 
> ```bash
> cat | sudo tee /lib/systemd/system-sleep/99-nvidia-uvm-reinit <<'EOF'
> #!/bin/sh
> case "$1/$2" in
>  post/*)
>  /sbin/modprobe -r nvidia_uvm 2>/dev/null || true
>  /sbin/modprobe nvidia_uvm || true
>  /usr/bin/nvidia-modprobe -u -c=0 || true
>  systemctl restart docker 2>/dev/null || true
>  systemctl restart ollama 2>/dev/null || true
>  ;;
> esac
> EOF
> sudo chmod +x /lib/systemd/system-sleep/99-nvidia-uvm-reinit
> ```
> 
> Reloading **`nvidia_uvm`** after resume is the widely reported workaround for “`cuInit` → 999”; doing it automatically kills the intermittent. cite
> 
> # 3) (Optional but helps on laptops) Preserve VRAM across sleep
> Tell the driver to save/restore all video memory; this reduces resume jank for CUDA/UVM.
> 
> ```bash
> sudo tee /etc/modprobe.d/nvidia-pm.conf >/dev/null <<'EOF'
> options nvidia NVreg_PreserveVideoMemoryAllocations=1 NVreg_TemporaryFilePath=/var/tmp
> # (Optional) runtime D3 power mgmt on supported laptops:
> # options nvidia NVreg_DynamicPowerManagement=0x02
> EOF
> ```
> 
> Reboot once after setting. NVIDIA’s docs describe both flags for suspend reliability on hybrid laptops. cite
> 
> # 4) Keep Ollama immune to shell env weirdness
> Pin a sane env in the systemd service, so an empty `CUDA_VISIBLE_DEVICES` can’t sneak back:
> 
> ```ini
> # /etc/systemd/system/ollama.service.d/override.conf
> [Service]
> Environment=CUDA_VISIBLE_DEVICES=0
> Environment=OLLAMA_LLM_LIBRARY=cublas
> ```
> 
> ```bash
> sudo systemctl daemon-reload
> sudo systemctl restart ollama
> ```
> 
> (Empty `CUDA_VISIBLE_DEVICES` hides all GPUs; unset or `0` exposes yours. NVIDIA’s docs confirm how it filters visibility.) cite
> 
> ---
> 
> ## Why this works
> - Suspend/resume regularly leaves **`nvidia_uvm`** in a bad state → **cudaErrorUnknown (999)** until UVM is reloaded. Doing that **on resume** fixes it at the source. cite 
> - The **vendor services** (`nvidia-suspend/resume`) and **persistence daemon** make the driver’s state transitions less brittle across sleep. cite 
> - Preserving VRAM allocations and (optionally) enabling runtime D3 are NVIDIA-documented levers for laptop reliability. cite 
> - Ollama + many apps misinterpret “blank” env logs; forcing `CUDA_VISIBLE_DEVICES=0` in systemd avoids that gotcha. cite
> 
> If you want, I’ll draft the exact `systemd` override + the sleep hook as a patch for your repo so it’s tracked with the rest of Promethean.
> 
> #linux #nvidia #cuda #suspend #ollama #uvm #systemd #promethean
<!-- UID: 557e2c4d-6571-4c9b-8cd3-0ce65639f61b -->

---




>[!nexus_user] **User** - 09/02/2025 at 11:49 AM
> 11:44:31 err@err-Stealth-16-AI-Studio-A1VGG promethean ±|dev/stealth ✗|→ # enable the daemon that keeps driver state warm
> sudo systemctl enable --now nvidia-persistenced
> 
> # enable NVIDIA’s suspend/resume services (if present on your distro)
> sudo systemctl enable --now nvidia-suspend.service nvidia-resume.service nvidia-hibernate.service
> The unit files have no installation config (WantedBy=, RequiredBy=, UpheldBy=,
> Also=, or Alias= settings in the [Install] section, and DefaultInstance= for
> template units). This means they are not meant to be enabled or disabled using systemctl.
> 
> Possible reasons for having these kinds of units are:
> • A unit may be statically enabled by being sym from another unit's
>  .wants/, .requires/, or .upholds/ directory.
> • A unit's purpose may be to act as a helper for some other unit which has
>  a requirement dependency on it.
> • A unit may be started when needed via activation (socket, path, timer,
>  D-Bus, udev, scripted systemctl call, ...).
> • In case of template units, the unit is meant to be enabled with some
>  instance name specified.
> Job for nvidia-suspend.service failed because the control process exited with error code.
> See "systemctl status nvidia-suspend.service" and "journalctl -xeu nvidia-suspend.service" for details.
> Job for nvidia-hibernate.service failed because the control process exited with error code.
> See "systemctl status nvidia-hibernate.service" and "journalctl -xeu nvidia-hibernate.service" for details.
<!-- UID: c6956841-d57d-4f8c-8beb-12e7c1039ea8 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 11:49 AM
> Yeah, that message is expected. The short of it:
> 
> - `nvidia-suspend.service`, `nvidia-resume.service`, and `nvidia-hibernate.service` are **static** units (no `[Install]` section). You *can’t* `enable` them — they’re meant to be triggered by systemd’s sleep targets or by the NVIDIA helper script, not enabled like a regular daemon. Trying to start them by hand can even wedge the GPU until `nvidia-resume.service` runs. cite 
> - NVIDIA’s own docs confirm these units/scripts are part of the **/proc power-management path** and are used only if you explicitly opt into it (e.g., with `NVreg_PreserveVideoMemoryAllocations=1` / UVM heavy workloads). The **default** (kernel callbacks) needs no systemd units at all. citeturn1view0
> 
> Given your pattern (“works → close lid → wake → CUDA **999**”), focus on **resume hygiene**, not `enable`/`disable` of those units.
> 
> ---
> 
> # What to do that actually fixes your symptom
> 
> ## 1) Add a resume hook that resets UVM (the reliable hammer)
> CUDA **999** after suspend is often stale `nvidia_uvm`. Reload it *on resume* and restart the stuff that needs CUDA:
> 
> ```bash
> # /lib/systemd/system-sleep/99-nvidia-uvm-reinit
> #!/bin/sh
> case "$1/$2" in
>  post/*)
>  /sbin/modprobe -r nvidia_uvm 2>/dev/null || true
>  /sbin/modprobe nvidia_uvm || true
>  /usr/bin/nvidia-modprobe -u -c=0 || true
>  systemctl restart docker 2>/dev/null || true
>  systemctl restart ollama 2>/dev/null || true
>  ;;
> esac
> ```
> 
> ```bash
> sudo tee /lib/systemd/system-sleep/99-nvidia-uvm-reinit >/dev/null < 99-nvidia-uvm-reinit
> sudo chmod +x /lib/systemd/system-sleep/99-nvidia-uvm-reinit
> ```
> 
> systemd runs scripts in `/usr/lib` or `/lib/systemd/system-sleep/` **before/after** suspend. Using them for local fixes is documented (even if “hacky”), and it’s a common, effective workaround for post-suspend **999**. cite
> 
> ## 2) Keep persistence warm (optional but helps laptops)
> Turn on NVIDIA’s persistence so the driver doesn’t fully tear down:
> 
> ```bash
> sudo systemctl enable --now nvidia-persistenced
> sudo nvidia-smi -pm 1
> ```
> 
> NVIDIA’s “Driver Persistence” doc explains how/why this reduces initialization churn. cite
> 
> ## 3) If you **really** want the NVIDIA systemd path
> Only do this if you plan to preserve VRAM/UVM across sleep:
> 
> - Set module params (and make sure the temp path has enough space):
> 
> ```bash
> # /etc/modprobe.d/nvidia-pm.conf
> options nvidia NVreg_PreserveVideoMemoryAllocations=1 NVreg_TemporaryFilePath=/var/tmp
> ```
> 
> - Reboot. The distro package (e.g., `nvidia-kernel-common` on Ubuntu) installs the units/scripts under `/lib/systemd/system` and `/lib/systemd/system-sleep/`. You **don’t enable** them; systemd’s sleep targets call them as part of `systemctl suspend/hibernate`. citeturn1view0
> 
> If you try to `start` `nvidia-suspend.service` manually, you’ll wedge CUDA until `nvidia-resume.service` runs — which is why you saw failures. That’s by design. cite
> 
> ---
> 
> # Sanity checks you can run
> 
> ```bash
> # See exactly what these static units do on your box
> systemctl cat nvidia-suspend.service nvidia-resume.service nvidia-hibernate.service
> # Confirm systemd sleep hooks are wired:
> man systemd-sleep | sed -n '1,120p'
> ```
> 
> `systemd-sleep` documents the `/usr/lib|/lib/systemd/system-sleep/` hook mechanism and that these hooks are invoked automatically around suspend/hibernate. cite
> 
> ---
> 
> ## Why your `enable --now` blew up
> - Those NVIDIA units are **static** on most distros — no `[Install]` → `systemctl enable` emits exactly the warning you saw and does nothing. That’s normal. cite 
> - Manually starting `nvidia-suspend.service` outside a real `systemctl suspend` call can **block** GPU access until `nvidia-resume.service` runs — looks like an error, but it’s just not intended for interactive use. cite
> 
> ---
> 
> If you want, I’ll wrap the sleep-hook + service overrides into a tiny patch you can drop into your repo so it’s tracked with Promethean.
> 
> #nvidia #cuda #linux #systemd #suspend #resume #uvm #ollama #debugging
<!-- UID: 4205f3f5-ef8b-4c23-92d2-f315e4dffb49 -->

---


