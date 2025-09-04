---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Ollama GPU error troubleshooting"
conversation_id: 68b30535-af2c-8324-9c95-e7e38dc06baf
create_time: 08/30/2025 at 9:05 AM
update_time: 08/31/2025 at 8:09 AM
---

# Title: Ollama GPU error troubleshooting

Created: 08/30/2025 at 9:05 AM
Last Updated: 08/31/2025 at 8:09 AM
Chat URL: https://chat.openai.com/c/68b30535-af2c-8324-9c95-e7e38dc06baf


>[!nexus_user] **User** - 08/30/2025 at 9:05 AM
> Aug 30 09:03:23 systemd[1]: Stopping ollama.service - Ollama Service...
> Aug 30 09:03:23 systemd[1]: ollama.service: Deactivated successfully.
> Aug 30 09:03:23 systemd[1]: Stopped ollama.service - Ollama Service.
> Aug 30 09:03:23 systemd[1]: ollama.service: Consumed 7h 31min 9.520s CPU time, 6.2G memory peak, 126.4M memory swap peak.
> Aug 30 09:03:23 systemd[1]: Started ollama.service - Ollama Service.
> Aug 30 09:03:23 ollama[3013710]: time=2025-08-30T09:03:23.832-05:00 level=INFO source=routes.go:1297 msg="server config" env="map[CUDA_VISIBLE_DEVICES: GPU_DEVICE_ORDINAL: HIP_VISIBLE_DEVICES: HSA_OVERRIDE_GFX_VERSION: HTTPS_PROXY: HTTP_PROXY: NO_PROXY: OLLAMA_CONTEXT_LENGTH:4096 OLLAMA_DEBUG:INFO OLLAMA_FLASH_ATTENTION:false OLLAMA_GPU_OVERHEAD:0 OLLAMA_HOST:http://127.0.0.1:11434 OLLAMA_INTEL_GPU:false OLLAMA_KEEP_ALIVE:5m0s OLLAMA_KV_CACHE_TYPE: OLLAMA_LLM_LIBRARY: OLLAMA_LOAD_TIMEOUT:5m0s OLLAMA_MAX_LOADED_MODELS:0 OLLAMA_MAX_QUEUE:512 OLLAMA_MODELS:/usr/share/ollama/.ollama/models OLLAMA_MULTIUSER_CACHE:false OLLAMA_NEW_ENGINE:false OLLAMA_NOHISTORY:false OLLAMA_NOPRUNE:false OLLAMA_NUM_PARALLEL:1 OLLAMA_ORIGINS:[http://localhost https://localhost http://localhost:* https://localhost:* http://127.0.0.1 https://127.0.0.1 http://127.0.0.1:* https://127.0.0.1:* http://0.0.0.0 https://0.0.0.0 http://0.0.0.0:* https://0.0.0.0:* app://* file://* tauri://* vscode-webview://* vscode-file://*] OLLAMA_SCHED_SPREAD:false ROCR_VISIBLE_DEVICES: http_proxy: https_proxy: no_proxy:]"
> Aug 30 09:03:23 ollama[3013710]: time=2025-08-30T09:03:23.834-05:00 level=INFO source=images.go:477 msg="total blobs: 39"
> Aug 30 09:03:23 ollama[3013710]: time=2025-08-30T09:03:23.835-05:00 level=INFO source=images.go:484 msg="total unused blobs removed: 0"
> Aug 30 09:03:23 ollama[3013710]: time=2025-08-30T09:03:23.835-05:00 level=INFO source=routes.go:1350 msg="Listening on 127.0.0.1:11434 (version 0.11.3)"
> Aug 30 09:03:23 ollama[3013710]: time=2025-08-30T09:03:23.835-05:00 level=INFO source=gpu.go:217 msg="looking for compatible GPUs"
> Aug 30 09:03:23 ollama[3013710]: time=2025-08-30T09:03:23.843-05:00 level=WARN source=gpu.go:605 msg="unknown error initializing cuda driver library /usr/lib/x86_64-linux-gnu/libcuda.so.575.64.03: cuda driver library init failure: 999. see https://github.com/ollama/ollama/blob/main/docs/troubleshooting.md for more information"
> Aug 30 09:03:23 ollama[3013710]: time=2025-08-30T09:03:23.849-05:00 level=INFO source=gpu.go:377 msg="no compatible GPUs were discovered"
> Aug 30 09:03:23 ollama[3013710]: time=2025-08-30T09:03:23.849-05:00 level=INFO source=types.go:130 msg="inference compute" id=0 library=cpu variant="" compute="" driver=0.0 name="" total="31.0 GiB" available="13.0 GiB"
<!-- UID: 6127ae6e-0acb-4730-92c5-9e9daa8d33c1 -->




>[!nexus_agent] **Assistant** - 08/30/2025 at 9:06 AM
> You restarted Ollama and it fell back to CPU. The smoking gun is right here:
> 
> - `unknown error initializing cuda driver library /usr/lib/x86_64-linux-gnu/libcuda.so.575.64.03: cuda driver library init failure: 999`
> - `no compatible GPUs were discovered`
> - `inference compute … library=cpu`
> 
> That `999` is CUDA’s “¯\_(ツ)_/¯” error. It usually means one of: driver/library mismatch, the NVIDIA kernel modules aren’t loaded (or got wedged after suspend), permissions to `/dev/nvidia*` are wrong, or your service env neutered GPU visibility. All of those are fixable. cite
> 
> # Do the 5-minute triage
> 
> ### 1) Sanity-check the driver and devices
> ```bash
> nvidia-smi
> lsmod | grep -E 'nvidia|nouveu' # make sure nouveau is NOT loaded
> ls -l /dev/nvidia* # expect nvidia0, nvidiactl, nvidia-uvm
> id -nG ollama 2>/dev/null || echo "service user isn't 'ollama' (that's ok)"
> ```
> - If `nvidia-smi` errors or shows a different driver version than `575.64.03`, you’ve got a mismatch. Reinstall the recommended NVIDIA driver for your kernel and reboot. cite 
> - If the GPU worked right after boot but dies later (post-sleep), that’s a known failure mode—driver stack gets grumpy. See workaround below. cite
> 
> ### 2) Make sure systemd didn’t hide your GPU
> Your log shows `CUDA_VISIBLE_DEVICES:` **present but blank** in the service env. A blank value can effectively hide all GPUs for CUDA contexts. Kill that.
> 
> Create a systemd drop-in:
> ```bash
> sudo systemctl edit ollama.service
> ```
> Paste:
> ```ini
> [Service]
> # Remove any inherited GPU-hiding env
> UnsetEnvironment=CUDA_VISIBLE_DEVICES
> # Optional: nudge Ollama to the NVIDIA path explicitly
> Environment=OLLAMA_LLM_LIBRARY=cublas
> Environment=OLLAMA_DEBUG=INFO
> # Ensure the driver is live before Ollama starts
> ExecStartPre=/usr/sbin/modprobe nvidia
> ExecStartPre=/usr/sbin/modprobe nvidia_uvm
> ```
> Then:
> ```bash
> sudo systemctl daemon-reload
> sudo systemctl restart ollama
> journalctl -u ollama -b -n 200 | sed -n '1,120p'
> ```
> You want to see something like `library=cublas` and a discovered GPU, not `library=cpu`.
> 
> ### 3) If 999 persists: kick the driver stack (no reboot)
> Sometimes UVM gets wedged; reloading the modules clears `999`. cite
> ```bash
> sudo modprobe -r nvidia_uvm nvidia_drm nvidia_modeset nvidia || true
> sudo modprobe nvidia && sudo modprobe nvidia_uvm
> sudo systemctl restart ollama
> ```
> 
> ### 4) Permissions / groups
> If `/dev/nvidia*` are 0660 and group-owned by `video` or `render`, make sure the service’s user is in those groups:
> ```bash
> sudo usermod -aG video,render ollama # if the service runs as user 'ollama'
> # then log out/in for that user or restart the service
> ```
> (Users fixing AMD/ROCm issues often had to add `render`/`video`; same principle applies for NVIDIA.) cite
> 
> ### 5) Reinstall/align the driver if needed
> If `nvidia-smi` still fails or versions don’t line up with `libcuda.so.575.64.03`, clean out mismatched installs and reinstall the correct driver package for your kernel, then reboot. Mixed “runfile vs apt” installs commonly cause 999/mismatch hell. cite
> 
> ---
> 
> # Notes for your hybrid setup (NVIDIA + Intel Arc)
> 
> - **NVIDIA is fully supported** in Ollama via cuBLAS when the driver is sane. That’s the path we’re fixing above. 
> - **Intel Arc** support has been evolving: official threads discuss it and community setups use Intel’s IPEX-LLM/OpenVINO path. If you want to experiment on Arc, look at those guides; expect some rough edges compared to NVIDIA. cite
> 
> If you do test Arc on this box, add a **separate** service unit or profile so you’re not cross-contaminating CUDA and Level-Zero/SYCL envs.
> 
> ---
> 
> # If it breaks after suspend/hibernation
> Enable persistence so the driver stays loaded:
> ```bash
> sudo systemctl enable --now nvidia-persistenced.service
> ```
> Or just re-run the module reload snippet when you resume; that’s been a common workaround reported by users hitting 999 hours after boot. cite
> 
> ---
> 
> ## Quick success check
> After the fixes, `journalctl -u ollama | tail -n 50` should include lines like:
> ```
> ... msg="looking for compatible GPUs"
> ... msg="discovered NVIDIA GPU ..."
> ... msg="inference compute" library=cublas ...
> ```
> If you still see `library=cpu` (with no error), it’s almost always env hiding the GPU or missing `/dev/nvidia*`.
> 
> ---
> 
> If you want, paste the output of:
> ```bash
> nvidia-smi; \
> ldconfig -p | grep libcuda; \
> ls -l /dev/nvidia*; \
> systemctl cat ollama | sed -n '1,120p'
> ```
> and I’ll pinpoint the exact culprit.
> 
> #hashtags
> #ollama #cuda #nvidia #gpu #linux #systemd #intel-arc #debugging
<!-- UID: 6b01893b-8c73-4115-81ff-f0d4aa1d1172 -->

---




>[!nexus_user] **User** - 08/30/2025 at 11:00 AM
> hmm... I either need to start managing the ollama service as a docker container where it has been more reliable for me in the past, or I need to make this more deterministic. It sometimes does this, but it usually doesn't.
<!-- UID: 870b91da-d8d0-40b8-aa6c-b3d5637df19b -->




>[!nexus_agent] **Assistant** - 08/30/2025 at 11:00 AM
> Yep—this is a race/entropy problem. Sometimes the NVIDIA stack is ready when Ollama boots, sometimes it isn’t, and your service inherits a blank `CUDA_VISIBLE_DEVICES` or sees a wedged driver and drops to CPU. Two sane paths:
> 
> ---
> 
> # Path A — Make the native systemd service deterministic
> 
> ## 0) One-time hygiene
> - Pin a known-good NVIDIA driver (and blacklist `nouveau`).
> - Enable persistence so the kernel modules stay loaded:
> ```bash
> sudo systemctl enable --now nvidia-persistenced.service
> ```
> 
> ## 1) Preflight that refuses to start unless the GPU is truly ready
> Create `/usr/local/bin/gpu-preflight.sh`:
> ```bash
> #!/usr/bin/env bash
> set -euo pipefail
> 
> # Un-hide GPUs if a blank var leaked in
> if [[ "${CUDA_VISIBLE_DEVICES-__unset__}" != "__unset__" && -z "${CUDA_VISIBLE_DEVICES}" ]]; then
>  unset CUDA_VISIBLE_DEVICES
> fi
> 
> # Load modules (no-op if already present)
> modprobe nvidia || true
> modprobe nvidia_uvm || true
> 
> # Devices must exist
> [[ -e /dev/nvidiactl ]] || { echo "no /dev/nvidiactl"; exit 1; }
> [[ -e /dev/nvidia0 ]] || { echo "no /dev/nvidia0"; exit 1; }
> 
> # Wait until nvidia-smi works & libcuda is queryable
> tries=12
> while (( tries-- > 0 )); do
>  if nvidia-smi >/dev/null 2>&1; then
>  exit 0
>  fi
>  sleep 2
> done
> 
> echo "nvidia-smi never stabilized"
> exit 1
> ```
> ```bash
> sudo chmod +x /usr/local/bin/gpu-preflight.sh
> ```
> 
> ## 2) Harden the Ollama unit with ordering, env, and retries
> ```bash
> sudo systemctl edit ollama.service
> ```
> Paste:
> ```ini
> [Unit]
> After=network-online.target nvidia-persistenced.service
> Wants=network-online.target nvidia-persistenced.service
> ConditionPathExists=/dev/nvidia0
> 
> [Service]
> # Kill inherited GPU-hiding env; make intent explicit
> UnsetEnvironment=CUDA_VISIBLE_DEVICES
> Environment=OLLAMA_LLM_LIBRARY=cublas
> Environment=OLLAMA_DEBUG=INFO
> 
> # Refuse to start until GPU is sane
> ExecStartPre=/usr/local/bin/gpu-preflight.sh
> 
> # If driver wedges later, auto-restart
> Restart=always
> RestartSec=3s
> StartLimitIntervalSec=0
> ```
> Then:
> ```bash
> sudo systemctl daemon-reload
> sudo systemctl restart ollama
> ```
> 
> ## 3) Recover after suspend/hibernate
> Create `/lib/systemd/system-sleep/90-ollama-gpu`:
> ```bash
> #!/usr/bin/env bash
> case "$1" in
>  post)
>  # Kick the driver if it wedged, then restart Ollama
>  modprobe -r nvidia_uvm nvidia_drm nvidia_modeset nvidia 2>/dev/null || true
>  modprobe nvidia || true
>  modprobe nvidia_uvm || true
>  systemctl restart ollama.service
>  ;;
> esac
> ```
> ```bash
> sudo chmod +x /lib/systemd/system-sleep/90-ollama-gpu
> ```
> 
> This gives you: no-start unless GPU is legit, automatic recovery after sleep, and zero tolerance for blank/poisoned env.
> 
> ---
> 
> # Path B — Run Ollama in Docker and treat the host like firmware
> 
> This isolates the mess behind the NVIDIA container stack and a healthcheck. It’s often more reliable on mixed GPU boxes.
> 
> ## 1) Prereqs
> - Install **nvidia-container-toolkit**.
> - Verify `docker run --rm --gpus all nvidia/cuda:12.4.1-base-ubuntu22.04 nvidia-smi` works.
> 
> ## 2) docker-compose.yml
> Put this in `/opt/ollama/docker-compose.yml`:
> ```yaml
> services:
>  ollama:
>  image: ollama/ollama:0.11.3
>  restart: unless-stopped
>  ports: ["127.0.0.1:11434:11434"]
>  volumes:
>  - /usr/share/ollama/.ollama/models:/root/.ollama/models
>  environment:
>  OLLAMA_HOST: "0.0.0.0:11434"
>  OLLAMA_DEBUG: "INFO"
>  OLLAMA_LLM_LIBRARY: "cublas"
>  deploy: {}
>  healthcheck:
>  test: ["CMD", "bash", "-lc", "curl -fsS http://127.0.0.1:11434/api/tags >/dev/null && nvidia-smi >/dev/null 2>&1"]
>  interval: 10s
>  timeout: 5s
>  retries: 6
>  runtime: nvidia # or: add 'deploy.resources.reservations.devices' in newer Compose
>  # For newer Compose spec, prefer:
>  # deploy:
>  # resources:
>  # reservations:
>  # devices:
>  # - capabilities: ["gpu"]
> ```
> 
> If you also want to experiment with **Intel Arc** builds on this host, keep that **in a separate container** with:
> - `devices: ["/dev/dri"]`
> - `group_add: ["render"]`
> - and an Intel-appropriate `OLLAMA_LLM_LIBRARY` (don’t cross-contaminate CUDA/Level-Zero in one container).
> 
> ## 3) Systemd wrapper for Compose
> ```ini
> # /etc/systemd/system/ollama-docker.service
> [Unit]
> Description=Ollama via Docker Compose
> After=network-online.target nvidia-persistenced.service docker.service
> Wants=network-online.target nvidia-persistenced.service docker.service
> 
> [Service]
> Type=oneshot
> WorkingDirectory=/opt/ollama
> RemainAfterExit=yes
> ExecStart=/usr/bin/docker compose up -d
> ExecStop=/usr/bin/docker compose down
> ExecStartPre=/usr/local/bin/gpu-preflight.sh
> TimeoutStartSec=0
> 
> [Install]
> WantedBy=multi-user.target
> ```
> ```bash
> sudo systemctl daemon-reload
> sudo systemctl enable --now ollama-docker
> ```
> 
> **Why this helps:** Docker’s healthcheck makes failures visible, Compose restart policy keeps it up, and the container’s libcuda picks up the host driver cleanly when `nvidia-smi` passes the preflight.
> 
> ---
> 
> ## Which should you pick?
> 
> - **If you’re staying put on this single box with NVIDIA as the primary accelerator:** Path A (hardened systemd) is clean and fast. 
> - **If you’re juggling multiple accelerators (Arc + 4070 Ti) or want environment hermeticity and easy replication to other hosts:** Path B (Docker) is the safer bet. You can promote the exact Compose bundle to other machines and get identical behavior.
> 
> ---
> 
> ## Determinism checklist (regardless of path)
> - [ ] `nvidia-smi` works post-boot and post-resume.
> - [ ] `CUDA_VISIBLE_DEVICES` is either unset or explicit (never blank).
> - [ ] `OLLAMA_LLM_LIBRARY` explicitly set (`cublas` for NVIDIA).
> - [ ] Service is **After=** `nvidia-persistenced.service` and **gates** on `/dev/nvidia0`.
> - [ ] There’s a **preflight** that fails fast if the GPU isn’t ready.
> - [ ] There’s a **resume hook** or auto-restart logic after sleep.
> 
> Want me to generate the exact files as a patch (unit + scripts + compose) tailored to your current paths? Say the word and I’ll spit out a ready-to-apply diff.
> 
> #hashtags
> #ollama #docker #systemd #nvidia #gpu #determinism #linux #debugging #ops
<!-- UID: 180d5437-6ee4-40c1-9046-fd81a780f60c -->

---




>[!nexus_agent] **Assistant** - 08/30/2025 at 11:08 AM
> You’re right: either isolate it (Docker) or make startup deterministic (systemd hardening). Given your logs and hybrid GPU setup, my blunt take:
> 
> - If you want **maximum reliability fast** → run Ollama in **Docker** with a GPU preflight + healthcheck. Treat the host like “firmware.”
> - If you want to keep it native → add a **strict preflight**, **ordering**, and **resume hooks** so the service never starts on a wedged driver.
> 
> Pick one. Here are both, clean and ready.
> 
> ---
> 
> # Option A — Docker (most reliable on mixed-GPU boxes)
> 
> ## 1) Preconditions
> - Install `nvidia-container-toolkit` and confirm:
> ```bash
> docker run --rm --gpus all nvidia/cuda:12.4.1-base-ubuntu22.04 nvidia-smi
> ```
> 
> ## 2) GPU preflight (fail fast if the driver isn’t sane)
> ```bash
> sudo tee /usr/local/bin/gpu-preflight.sh >/dev/null <<'SH'
> #!/usr/bin/env bash
> set -euo pipefail
> # Un-hide GPUs if a blank var leaked in
> if [[ "${CUDA_VISIBLE_DEVICES-__unset__}" != "__unset__" && -z "${CUDA_VISIBLE_DEVICES}" ]]; then
>  unset CUDA_VISIBLE_DEVICES
> fi
> modprobe nvidia || true
> modprobe nvidia_uvm || true
> [[ -e /dev/nvidiactl && -e /dev/nvidia0 ]] || { echo "NVIDIA devices missing"; exit 1; }
> tries=12
> while (( tries-- > 0 )); do
>  if nvidia-smi >/dev/null 2>&1; then exit 0; fi
>  sleep 2
> done
> echo "nvidia-smi never stabilized"; exit 1
> SH
> sudo chmod +x /usr/local/bin/gpu-preflight.sh
> ```
> 
> ## 3) Run with `docker run` (simple + deterministic)
> ```bash
> # Persist models to host (re-use your existing models path)
> sudo install -d -m 775 -o $USER -g $USER /usr/share/ollama/.ollama
> 
> # Stop the native service so it doesn't race
> sudo systemctl disable --now ollama || true
> 
> # Start container (bind to localhost only)
> docker run -d --name ollama \
>  --restart unless-stopped \
>  --gpus all \
>  -p 127.0.0.1:11434:11434 \
>  -e OLLAMA_DEBUG=INFO \
>  -e OLLAMA_LLM_LIBRARY=cublas \
>  -e NVIDIA_VISIBLE_DEVICES=all \
>  -v /usr/share/ollama/.ollama:/root/.ollama \
>  ollama/ollama:0.11.3
> ```
> 
> ## 4) Wrap in systemd so it starts after GPU is ready
> ```ini
> # /etc/systemd/system/ollama-docker.service
> [Unit]
> Description=Ollama (Docker)
> After=network-online.target nvidia-persistenced.service docker.service
> Wants=network-online.target nvidia-persistenced.service docker.service
> 
> [Service]
> Type=oneshot
> RemainAfterExit=yes
> ExecStartPre=/usr/local/bin/gpu-preflight.sh
> ExecStart=/usr/bin/docker start -a ollama
> ExecStop=/usr/bin/docker stop -t 10 ollama
> TimeoutStartSec=0
> 
> [Install]
> WantedBy=multi-user.target
> ```
> ```bash
> sudo systemctl daemon-reload
> sudo systemctl enable --now ollama-docker
> ```
> 
> ## 5) Healthcheck (optional, adds self-healing)
> If you prefer Compose later, move to a `docker compose` file with:
> - `healthcheck: ["CMD", "bash", "-lc", "curl -fsS http://127.0.0.1:11434/api/tags >/dev/null && nvidia-smi >/dev/null 2>&1"]`
> - `restart: unless-stopped`
> - `environment: OLLAMA_LLM_LIBRARY=cublas, NVIDIA_VISIBLE_DEVICES=all`
> (Compose GPU flags are messy across versions; `docker run --gpus all` is the least-surprising path.)
> 
> ---
> 
> # Option B — Native systemd, but deterministic
> 
> ## 0) One-time hygiene
> ```bash
> sudo systemctl enable --now nvidia-persistenced.service
> sudo bash -lc 'lsmod | grep nouveau && echo "Blacklist nouveau and reboot" || true'
> ```
> 
> ## 1) Preflight (same script as above)
> Make sure `/usr/local/bin/gpu-preflight.sh` exists and is executable.
> 
> ## 2) Harden your unit
> ```bash
> sudo systemctl edit ollama.service
> ```
> Paste:
> ```ini
> [Unit]
> After=network-online.target nvidia-persistenced.service
> Wants=network-online.target nvidia-persistenced.service
> ConditionPathExists=/dev/nvidia0
> 
> [Service]
> UnsetEnvironment=CUDA_VISIBLE_DEVICES
> Environment=OLLAMA_LLM_LIBRARY=cublas
> Environment=OLLAMA_DEBUG=INFO
> ExecStartPre=/usr/local/bin/gpu-preflight.sh
> Restart=always
> RestartSec=3s
> StartLimitIntervalSec=0
> ```
> Then:
> ```bash
> sudo systemctl daemon-reload
> sudo systemctl restart ollama
> ```
> 
> ## 3) Recover after resume
> ```bash
> sudo tee /lib/systemd/system-sleep/90-ollama-gpu >/dev/null <<'SH'
> #!/usr/bin/env bash
> case "$1" in
>  post)
>  modprobe -r nvidia_uvm nvidia_drm nvidia_modeset nvidia 2>/dev/null || true
>  modprobe nvidia || true
>  modprobe nvidia_uvm || true
>  systemctl restart ollama.service
>  ;;
> esac
> SH
> sudo chmod +x /lib/systemd/system-sleep/90-ollama-gpu
> ```
> 
> ---
> 
> ## What this buys you
> 
> - **No silent CPU fallbacks.** If the GPU isn’t ready, the service refuses to start.
> - **No race with resume.** You reload driver modules post-sleep and restart Ollama cleanly.
> - **Explicit library.** `OLLAMA_LLM_LIBRARY=cublas` avoids ambiguous autodetect paths.
> - **No env poisoning.** Blank `CUDA_VISIBLE_DEVICES` gets nuked.
> 
> ---
> 
> ## My recommendation for you
> Given your box (Arc + 4070 Ti) and the fact Docker has been “more reliable for you,” go **Option A**. It’s reproducible and hermetic; you can move it between hosts without re-tuning systemd each time. Keep **Option B** as a fallback on bare-metal nodes.
> 
> If you want, I can output a ready-to-commit patch (unit files + scripts + a minimal README) tailored to your exact model path and service user.
> 
> #hashtags
> #ollama #docker #systemd #nvidia #gpu #linux #ops #determinism #reliability
<!-- UID: 3567772f-dffb-4f6c-8d3d-64636abaadce -->

---




>[!nexus_user] **User** - 08/30/2025 at 11:16 AM
> yeap lets full send it on the docker compose, and keep a second host for intel hacks.
<!-- UID: f28d3062-1e0a-4a00-b681-867385ca048d -->




>[!nexus_agent] **Assistant** - 08/30/2025 at 11:16 AM
> Solid. Let’s lock it down with Docker Compose on the NVIDIA box, and keep a separate Intel host for experiments. Below is a **drop-in, deterministic setup** with a GPU preflight, healthcheck, and systemd unit. No more “sometimes CPU fallback”.
> 
> ---
> 
> # NVIDIA host — production setup
> 
> ## 0) Pre-reqs (once)
> ```bash
> # 1) NVIDIA container runtime
> sudo apt-get update
> # Follow NVIDIA's official nvidia-container-toolkit install for your distro, then:
> sudo systemctl restart docker
> 
> # 2) Kill the native Ollama service to avoid port conflicts
> sudo systemctl disable --now ollama || true
> 
> # 3) Ensure persistence daemon runs (prevents post-resume weirdness)
> sudo systemctl enable --now nvidia-persistenced.service || true
> ```
> 
> ## 1) Directory layout
> ```bash
> sudo install -d -m 755 /opt/ollama
> sudo install -d -m 775 /usr/share/ollama/.ollama
> ```
> 
> ## 2) GPU preflight (host-level, fail fast if driver isn’t sane)
> ```bash
> sudo tee /usr/local/bin/gpu-preflight.sh >/dev/null <<'SH'
> #!/usr/bin/env bash
> set -euo pipefail
> 
> # Un-hide GPUs if a blank var leaked in from the environment
> if [[ "${CUDA_VISIBLE_DEVICES-__unset__}" != "__unset__" && -z "${CUDA_VISIBLE_DEVICES}" ]]; then
>  unset CUDA_VISIBLE_DEVICES
> fi
> 
> # Load modules (no-op if already present)
> modprobe nvidia || true
> modprobe nvidia_uvm || true
> 
> # Devices must exist
> [[ -e /dev/nvidiactl && -e /dev/nvidia0 ]] || { echo "NVIDIA devices missing"; exit 1; }
> 
> # Wait until nvidia-smi responds
> tries=15
> while (( tries-- > 0 )); do
>  if nvidia-smi >/dev/null 2>&1; then exit 0; fi
>  sleep 2
> done
> 
> echo "nvidia-smi never stabilized"
> exit 1
> SH
> sudo chmod +x /usr/local/bin/gpu-preflight.sh
> ```
> 
> ## 3) `docker-compose.yml`
> Create `/opt/ollama/docker-compose.yml`:
> ```yaml
> services:
>  ollama:
>  image: ollama/ollama:0.11.3
>  container_name: ollama
>  restart: unless-stopped
>  # Bind to localhost for safety; reverse-proxy if you need LAN
>  ports: ["127.0.0.1:11434:11434"]
>  environment:
>  OLLAMA_HOST: "0.0.0.0:11434"
>  OLLAMA_DEBUG: "INFO"
>  OLLAMA_LLM_LIBRARY: "cublas" # force NVIDIA path, no guessing
>  OLLAMA_KEEP_ALIVE: "5m"
>  volumes:
>  - /usr/share/ollama/.ollama:/root/.ollama
>  # Healthcheck: proves API is up. GPU sanity is handled in ExecStartPre on host.
>  healthcheck:
>  test: ["CMD", "bash", "-lc", "curl -fsS http://127.0.0.1:11434/api/version >/dev/null"]
>  interval: 10s
>  timeout: 5s
>  retries: 6
>  # Prefer recent Compose that supports this:
>  gpus: all
>  # If your Compose doesn't support 'gpus', comment the line above and uncomment this:
>  # runtime: nvidia
> ```
> 
> ## 4) systemd unit wrapping Compose
> Create `/etc/systemd/system/ollama-docker.service`:
> ```ini
> [Unit]
> Description=Ollama via Docker Compose (GPU-gated)
> After=network-online.target nvidia-persistenced.service docker.service
> Wants=network-online.target nvidia-persistenced.service docker.service
> # Refuse to start if Docker directory missing
> ConditionPathExists=/opt/ollama/docker-compose.yml
> 
> [Service]
> Type=oneshot
> WorkingDirectory=/opt/ollama
> RemainAfterExit=yes
> # Fail fast if the GPU/driver is not ready
> ExecStartPre=/usr/local/bin/gpu-preflight.sh
> ExecStart=/usr/bin/docker compose up -d
> ExecStop=/usr/bin/docker compose down
> TimeoutStartSec=0
> 
> [Install]
> WantedBy=multi-user.target
> ```
> 
> Enable:
> ```bash
> sudo systemctl daemon-reload
> sudo systemctl enable --now ollama-docker
> ```
> 
> ## 5) Post-resume recovery (optional but recommended)
> If your machine sleeps/hibernates:
> ```bash
> sudo tee /lib/systemd/system-sleep/90-ollama-gpu >/dev/null <<'SH'
> #!/usr/bin/env bash
> case "$1" in
>  post)
>  # Nudge driver stack after resume
>  modprobe -r nvidia_uvm nvidia_drm nvidia_modeset nvidia 2>/dev/null || true
>  modprobe nvidia || true
>  modprobe nvidia_uvm || true
>  systemctl restart ollama-docker.service
>  ;;
> esac
> SH
> sudo chmod +x /lib/systemd/system-sleep/90-ollama-gpu
> ```
> 
> ## 6) Smoke test
> ```bash
> # Should show a running container
> docker compose -f /opt/ollama/docker-compose.yml ps
> 
> # API should respond
> curl -s http://127.0.0.1:11434/api/version && echo
> 
> # Check logs if needed
> docker logs -n 200 ollama
> ```
> 
> You should **never** see silent CPU fallback now; preflight blocks start if the GPU isn’t truly ready.
> 
> ---
> 
> # Intel host — sandbox for Arc/OpenVINO hacks
> 
> Keep this on a **separate box** so you don’t cross-contaminate CUDA and Level-Zero stacks.
> 
> ## 0) Pre-reqs (host)
> - Intel drivers + Level-Zero runtime installed (Arc).
> - Add your service user to the `render` group if needed:
>  ```bash
>  sudo usermod -aG render $USER
>  newgrp render
>  ```
> 
> ## 1) Compose file
> `/opt/ollama-intel/docker-compose.yml`:
> ```yaml
> services:
>  ollama:
>  image: ollama/ollama:0.11.3
>  container_name: ollama-intel
>  restart: unless-stopped
>  ports: ["127.0.0.1:11434:11434"]
>  environment:
>  OLLAMA_HOST: "0.0.0.0:11434"
>  OLLAMA_DEBUG: "INFO"
>  # If your build supports OpenVINO/Level-Zero, try:
>  # OLLAMA_LLM_LIBRARY: "openvino"
>  # Otherwise, expect CPU fallback until you use a build/image with Intel backend enabled.
>  devices:
>  - /dev/dri:/dev/dri
>  group_add:
>  - "render"
>  volumes:
>  - /usr/share/ollama/.ollama:/root/.ollama
>  healthcheck:
>  test: ["CMD", "bash", "-lc", "curl -fsS http://127.0.0.1:11434/api/version >/dev/null"]
>  interval: 10s
>  timeout: 5s
>  retries: 6
> ```
> 
> ## 2) Optional: Intel preflight (host)
> ```bash
> sudo tee /usr/local/bin/gpu-preflight-intel.sh >/dev/null <<'SH'
> #!/usr/bin/env bash
> set -euo pipefail
> # Require at least one render node
> compgen -G "/dev/dri/renderD*" >/dev/null || { echo "No /dev/dri/renderD* found"; exit 1; }
> exit 0
> SH
> sudo chmod +x /usr/local/bin/gpu-preflight-intel.sh
> ```
> 
> ## 3) systemd wrapper
> `/etc/systemd/system/ollama-intel-docker.service`:
> ```ini
> [Unit]
> Description=Ollama (Intel) via Docker Compose
> After=network-online.target docker.service
> Wants=network-online.target docker.service
> ConditionPathExists=/opt/ollama-intel/docker-compose.yml
> 
> [Service]
> Type=oneshot
> WorkingDirectory=/opt/ollama-intel
> RemainAfterExit=yes
> ExecStartPre=/usr/local/bin/gpu-preflight-intel.sh
> ExecStart=/usr/bin/docker compose up -d
> ExecStop=/usr/bin/docker compose down
> TimeoutStartSec=0
> 
> [Install]
> WantedBy=multi-user.target
> ```
> ```bash
> sudo systemctl daemon-reload
> sudo systemctl enable --now ollama-intel-docker
> ```
> 
> ---
> 
> ## Observability & ops
> 
> - **Status**
>  ```bash
>  systemctl status ollama-docker
>  docker compose -f /opt/ollama/docker-compose.yml ps
>  ```
> - **Logs**
>  ```bash
>  docker logs -f ollama
>  ```
> - **Quick API checks**
>  ```bash
>  curl -s http://127.0.0.1:11434/api/tags | jq .
>  ```
> - **Upgrade image**
>  ```bash
>  docker pull ollama/ollama:0.11.3
>  sudo systemctl restart ollama-docker
>  ```
> - **Roll back**: pin a different tag in `docker-compose.yml` and restart.
> 
> ---
> 
> ## Why this is deterministic
> 
> - **GPU preflight** blocks startup until the driver is alive (no random CPU fallback).
> - **Localhost bind + healthcheck** gives you safe networking and self-heal signals.
> - **systemd wrapper** ensures consistent ordering (after Docker + persistence daemon).
> - **Separate Intel host** prevents CUDA ↔ Level-Zero interference.
> 
> If you want this as a **single patch** (files + paths exactly as above), say the word and I’ll output a ready-to-apply `git diff` you can drop into your infra repo.
> 
> #hashtags
> #ollama #docker #compose #nvidia #intel-arc #openvino #systemd #devops #determinism #linux
<!-- UID: 7717ba1b-6ffc-46d0-83c0-c91bbe5d9b3b -->

---




>[!nexus_user] **User** - 08/30/2025 at 1:04 PM
> so what you're saying is that containers support NPUs?
<!-- UID: 6671674e-051f-4b40-bcc3-2a9f3ff5bbfe -->




>[!nexus_agent] **Assistant** - 08/30/2025 at 1:05 PM
> Short answer: **sometimes**. Containers don’t magically “support NPUs.” They can **use** an NPU *if and only if* the host OS exposes it as a device and the userspace runtime inside the container knows how to drive it.
> 
> Here’s the state of play (Aug 30, 2025):
> 
> - **Intel Core Ultra NPU on Linux**: Yes, via **OpenVINO**. The Linux NPU driver exposes `/dev/accel/accel0` and friends; you pass those into the container and run an OpenVINO-based stack that targets `NPU`. Permissions typically use the `render` group. cite 
>  OpenVINO 2025.x explicitly supports NPUs (and even enables text-gen on NPU in recent releases) and ships a containerized **OpenVINO Model Server** you can run. cite 
>  There’s also an **Ollama <-> OpenVINO** integration, but it’s not “drop your GGUF and go”; you’re generally using OpenVINO IR models and an OV-enabled build/workflow. citeturn2view0
> 
> - **NVIDIA**: This is the one that’s solid today (CUDA via NVIDIA Container Toolkit). You already did this. (Just noting for contrast.) cite
> 
> - **Apple ANE (macOS)**: **No** practical Docker access. Docker on macOS runs in a VM; ANE is only reachable via Core ML APIs on the host. There’s chatter about Apple’s new container backend, but **ANE passthrough isn’t a thing** for Dockerized Linux workloads. cite
> 
> - **Qualcomm/Windows Copilot+ (Snapdragon NPU)**: **Not supported** by Docker Desktop today; there are open issues and frustrated reports. (DirectML works for some GPU paths in WSL2, but NPU to containers isn’t there.) cite
> 
> ---
> 
> ## What it looks like on your **Intel sandbox host** (Linux)
> 
> 1) Host must have Intel’s **linux-npu-driver** installed and working (`/dev/accel/accel0`, user in `render`). cite
> 
> 2) In Docker/Compose, pass the device and group:
> 
> ```yaml
> services:
>  ovms:
>  image: openvino/model_server:latest
>  restart: unless-stopped
>  ports: ["127.0.0.1:9001:9001"] # example
>  devices:
>  - /dev/accel:/dev/accel # NPU device nodes
>  group_add:
>  - "render"
>  volumes:
>  - /opt/models:/models
>  command: ["--model_path", "/models/your_model", "--port", "9001", "--target_device", "NPU"]
>  healthcheck:
>  test: ["CMD", "bash", "-lc", "curl -fsS http://127.0.0.1:9001/v1/models >/dev/null"]
>  interval: 10s
>  timeout: 5s
>  retries: 6
> ```
> 
> That `--target_device NPU` (or the equivalent config field) tells **OpenVINO** to use the NPU inside the container; the `/dev/accel` pass-through + host driver makes it real. cite
> 
> If you want this for **Ollama** specifically, you’d run an **OV-enabled** flavor/workflow and use **OpenVINO IR** models (not plain GGUF), then select the `NPU` device. The OpenVINO team’s write-up walks through it. citeturn2view0
> 
> ---
> 
> ### Bottom line
> - **Linux + Intel NPU**: yes (Docker works **if** you pass the device and use OpenVINO). 
> - **macOS ANE**: no (Docker can’t get to it). 
> - **Windows Snapdragon NPU**: no (as of today, Docker Desktop doesn’t expose it).
> 
> If you want, I’ll generate a Compose file + systemd unit for an **OVMS-on-NPU** sidecar that you can hit from your main stack.
> 
> #hashtags
> #containers #npu #intel-npu #openvino #docker #ollama #linux #devops
<!-- UID: 1bdc3b30-32e0-40c5-9bd8-bfea1bd5e23f -->

---




>[!nexus_user] **User** - 08/30/2025 at 1:06 PM
> how about amd gpu?
<!-- UID: e69b6be6-6693-4030-a208-a4086967aff6 -->




>[!nexus_agent] **Assistant** - 08/30/2025 at 1:06 PM
> Short version: **yes—on Linux via ROCm.** Containers can use AMD GPUs reliably if you (1) have ROCm working on the host and (2) pass the right device nodes into the container (mainly `/dev/kfd` and `/dev/dri`). Ollama even ships a `:rocm` image. Windows/WSL is still shaky; plan on **Linux** for AMD. cite
> 
> Below is a clean, deterministic **Docker Compose** setup for an AMD box, mirroring what we did for NVIDIA.
> 
> # AMD (ROCm) host — production Compose
> 
> ## Pre-reqs (host)
> - ROCm installed and **working** on the host (you should be able to run `rocminfo` and see your GPU). 
> - Your service user in the `render` (and usually `video`) group. 
> - This is **Linux-only**; ROCm on Windows/WSL doesn’t expose `/dev/kfd` to Docker in a stable way today. cite
> 
> ## 1) GPU preflight (fail fast if the driver/devices aren’t sane)
> ```bash
> sudo tee /usr/local/bin/gpu-preflight-amd.sh >/dev/null <<'SH'
> #!/usr/bin/env bash
> set -euo pipefail
> 
> # Un-hide GPU if a blank var leaked in
> if [[ "${HIP_VISIBLE_DEVICES-__unset__}" != "__unset__" && -z "${HIP_VISIBLE_DEVICES}" ]]; then
>  unset HIP_VISIBLE_DEVICES
> fi
> 
> # Devices must exist
> [[ -e /dev/kfd ]] || { echo "missing /dev/kfd"; exit 1; }
> compgen -G "/dev/dri/renderD*" >/dev/null || { echo "missing /dev/dri/renderD*"; exit 1; }
> 
> # Optional: if rocminfo exists, make sure the stack answers
> if command -v rocminfo >/dev/null 2>&1; then
>  rocminfo >/dev/null 2>&1 || { echo "rocminfo failed"; exit 1; }
> fi
> SH
> sudo chmod +x /usr/local/bin/gpu-preflight-amd.sh
> ```
> (Those device checks are straight from AMD’s ROCm-in-Docker guidance.) cite
> 
> ## 2) `docker-compose.yml`
> Create `/opt/ollama-amd/docker-compose.yml`:
> ```yaml
> services:
>  ollama:
>  image: ollama/ollama:rocm
>  container_name: ollama-amd
>  restart: unless-stopped
>  ports: ["127.0.0.1:11434:11434"]
>  environment:
>  OLLAMA_HOST: "0.0.0.0:11434"
>  OLLAMA_DEBUG: "INFO"
>  # Force ROCm path; Ollama's rocm image will do the right thing.
>  # Uncomment if you need to restrict devices:
>  # HIP_VISIBLE_DEVICES: "0"
>  # Only if your GPU needs a gfx override (rare; e.g., some RDNA3 iGPUs):
>  # HSA_OVERRIDE_GFX_VERSION: "10.3.0"
>  volumes:
>  - /usr/share/ollama/.ollama:/root/.ollama
>  devices:
>  - /dev/kfd
>  - /dev/dri
>  group_add:
>  - "render"
>  healthcheck:
>  test: ["CMD", "bash", "-lc", "curl -fsS http://127.0.0.1:11434/api/version >/dev/null"]
>  interval: 10s
>  timeout: 5s
>  retries: 6
> ```
> - The **official Docker Hub page** for Ollama shows using `:rocm` and passing `/dev/kfd` + `/dev/dri`. We’re doing exactly that. cite 
> - If your specific GPU reports as an unsupported GFX ID, some users set `HSA_OVERRIDE_GFX_VERSION` (commented above). Use only if you actually need it. cite
> 
> ## 3) systemd wrapper (deterministic boot ordering)
> `/etc/systemd/system/ollama-amd-docker.service`:
> ```ini
> [Unit]
> Description=Ollama (AMD ROCm) via Docker Compose
> After=network-online.target docker.service
> Wants=network-online.target docker.service
> ConditionPathExists=/opt/ollama-amd/docker-compose.yml
> 
> [Service]
> Type=oneshot
> WorkingDirectory=/opt/ollama-amd
> RemainAfterExit=yes
> ExecStartPre=/usr/local/bin/gpu-preflight-amd.sh
> ExecStart=/usr/bin/docker compose up -d
> ExecStop=/usr/bin/docker compose down
> TimeoutStartSec=0
> 
> [Install]
> WantedBy=multi-user.target
> ```
> Enable:
> ```bash
> sudo systemctl daemon-reload
> sudo systemctl enable --now ollama-amd-docker
> ```
> 
> ## 4) Smoke test
> ```bash
> docker compose -f /opt/ollama-amd/docker-compose.yml ps
> curl -s http://127.0.0.1:11434/api/version && echo
> docker logs -n 200 ollama-amd
> ```
> 
> ---
> 
> ## Notes, gotchas, and when to reach for AMD’s container toolkit
> 
> - If you run many AMD containers or want auto-device injection, install **AMD Container Toolkit** (like NVIDIA’s). It wires Docker to pass `/dev/kfd`/`/dev/dri` for you and handles a bunch of footguns. cite
> - **Windows/WSL**: current reality is… not good for ROCm containers. Don’t waste cycles here if your goal is reliability. Use Linux. cite
> - **Permissions**: If the container runs as a non-root UID, make sure the inside-container GID matches host `render` GID, or run `group_add: ["render"]` as shown. This trips people up. cite
> 
> ---
> 
> ## Determinism checklist (AMD)
> - [ ] `/dev/kfd` and `/dev/dri/renderD*` exist on host. cite 
> - [ ] `gpu-preflight-amd.sh` blocks startup if ROCm stack isn’t ready. 
> - [ ] `:rocm` image + devices mapped in Compose. cite 
> - [ ] Optional: `HIP_VISIBLE_DEVICES` pinned to avoid device order surprises. cite 
> - [ ] Only set `HSA_OVERRIDE_GFX_VERSION` if the GPU needs it. cite
> 
> If you want, I can spit out a repo-ready patch (scripts + unit + compose) and a tiny README so this drops into your infra alongside the NVIDIA box.
> 
> #hashtags
> #amd #rocm #docker #ollama #containers #linux #devops #determinism
<!-- UID: a5700a1d-3b92-4454-98fd-ae59dcbcafee -->

---




>[!nexus_user] **User** - 08/30/2025 at 1:08 PM
> continue
<!-- UID: 35b9ac06-c5e5-4a9c-be7d-4987638cb0e0 -->




>[!nexus_agent] **Assistant** - 08/30/2025 at 1:08 PM
> Got it—here’s the AMD side finished out: ops-proof, predictable, and fast to debug.
> 
> # AMD/ROCm containers — the bits that bite (and how to tame them)
> 
> ## 1) Deterministic GPU selection (multi-GPU boxes)
> By default `devices: [/dev/kfd, /dev/dri]` exposes **all** GPUs. To pin just the first two render nodes:
> ```yaml
> devices:
>  - /dev/kfd
>  - /dev/dri/renderD128
>  - /dev/dri/renderD129
> environment:
>  # HIP isolation (HIP uses this); some stacks look at ROCR_VISIBLE_DEVICES
>  HIP_VISIBLE_DEVICES: "0,1"
>  ROCR_VISIBLE_DEVICES: "0,1"
> ```
> AMD’s own docs show explicitly passing particular `renderD*` nodes; relying only on env vars is fragile. cite
> 
> ## 2) Definitive “is the GPU actually in use?” checks
> - **Host preflight already passed** (`gpu-preflight-amd.sh`). 
> - **Inside container** (shell into `ollama-amd`):
>  ```bash
>  ls -l /dev/kfd /dev/dri/renderD* # devices mapped?
>  test -r /dev/kfd || echo "kfd perms!"
>  ```
> - **Ollama logs** (should mention ROCm/hip/rocBLAS, not CPU):
>  ```bash
>  docker logs -n 200 ollama-amd | grep -i "inference compute"
>  ```
> - **If in doubt** run a tiny model once and time first token vs CPU; GPU path is obvious.
> 
> ## 3) Known failure modes → fast fixes
> - `failed to check permission on /dev/kfd` → container user not in `render`, wrong mapping, or security profile too strict. Add `group_add: ["render"]` and ensure `/dev/kfd` is passed. Some distros needed relaxed seccomp; worst-case test with `--privileged` to isolate cause (don’t keep it). cite
> - `hipErrorNoBinaryForGpu` (a.k.a. “no code object”) → GPU arch unsupported by your ROCm userland. Fix by (a) moving to a supported GPU/ROCm combo, or (b) last-resort `HSA_OVERRIDE_GFX_VERSION` “pretend to be X” (brittle; only if you know the matching gfx target). cite
> - “rocBLAS/TensileLibrary… not found” → userland/arch mismatch in container; pull a matching ROCm image or ensure the container’s rocBLAS ships the right **lazy** Tensile DB for your `gfx****`. cite
> - WSL2/Windows: expect pain (no `/dev/kfd`). Use Linux for reliability. cite
> 
> ## 4) Compose you can paste (AMD)
> (If you already created `/opt/ollama-amd/docker-compose.yml`, update as needed.)
> ```yaml
> services:
>  ollama:
>  image: ollama/ollama:rocm
>  container_name: ollama-amd
>  restart: unless-stopped
>  ports: ["127.0.0.1:11434:11434"]
>  environment:
>  OLLAMA_HOST: "0.0.0.0:11434"
>  OLLAMA_DEBUG: "INFO"
>  # Optional isolation on multi-GPU
>  # HIP_VISIBLE_DEVICES: "0"
>  # ROCR_VISIBLE_DEVICES: "0"
>  # Only if you *must* spoof arch (rare; test carefully):
>  # HSA_OVERRIDE_GFX_VERSION: "10.3.0"
>  volumes:
>  - /usr/share/ollama/.ollama:/root/.ollama
>  devices:
>  - /dev/kfd
>  - /dev/dri
>  group_add: ["render"]
>  healthcheck:
>  test: ["CMD", "bash", "-lc", "curl -fsS http://127.0.0.1:11434/api/version >/dev/null"]
>  interval: 10s
>  timeout: 5s
>  retries: 6
> ```
> This mirrors AMD’s official container guidance (map `/dev/kfd` and `/dev/dri`), and the `render` group rule from ROCm. cite
> 
> ## 5) Optional: AMD Container Toolkit (nice QoL)
> If you plan to run multiple AMD GPU containers, install **AMD Container Toolkit** so Docker auto-handles device hooks and library mounts (NVIDIA-style). It’s new but legit. cite
> 
> ## 6) Sanity script (host) to catch regressions
> ```bash
> #!/usr/bin/env bash
> set -euo pipefail
> echo "== devices"; ls -l /dev/kfd /dev/dri/renderD* || true
> echo "== groups"; id -nG
> echo "== rocminfo (host)"; command -v rocminfo && rocminfo | sed -n '1,80p' || echo "no rocminfo"
> echo "== docker ps"; docker ps --format 'table {{.Names}}\t{{.Status}}'
> echo "== ollama logs"; docker logs --tail 50 ollama-amd | sed -n '1,50p'
> ```
> 
> ---
> 
> If you want, I’ll generate a **single patch** that drops in: preflight script, AMD compose, systemd unit, and a `README.md` with the checks above. Then you’ve got: NVIDIA box = prod, AMD box = sane sandbox, and no more “maybe it’s CPU today.” 
> 
> #hashtags 
> #amd #rocm #docker #ollama #containers #linux #devops #determinism #troubleshooting
<!-- UID: 2922fe77-96dc-4ca8-87a2-d996b3554d98 -->

---


