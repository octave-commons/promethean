# Promethean - Using NPU in Docker...
Exported on 03/08/2025 at 03:57:58 [from ChatGPT](https://chatgpt.com/g/g-p-6883d8e9569c8191aad0cfd2a5bf3af3-promethean/c/688e55d0-8e24-8322-972e-0dc0454fea01$$
) - with [SaveMyChatbot](
$$https://save.hugocollin.com)

## User
Is there any way to use an NPU from docker?

## ChatGPT
Yes—**you can use an NPU from within Docker containers**, but it requires setting up your host properly and explicitly exposing device nodes, drivers, and SDKs. Here’s a breakdown of what that means for each major platform, along with examples:

* * *

1\. 📦 General architecture: how NPUs work in Docker
----------------------------------------------------

*   Docker containers can access **host device files** just like they access disks or USBs.
    
*   You need to:
    
    1.  **Install the NPU driver and runtime on the host**, so that `/dev/…` nodes $e.g. `davinci0`, `apex_0`, `renderD128`$ are created and the kernel module is loaded.
        
    2.  **Mount the driver libraries into the container** $e.g. `libedgetpu`, `libnpu.so`, `/usr/local/Ascend/driver`$.
        
    3.  **Pass through the devices** using `--device`, `--group-add`, or (for Huawei Ascend) the **Ascend Docker runtime plugin**.
        
    4.  **Set environment variables** so the vendor runtime knows which NPU IDs to use $e.g. `ASCEND_VISIBLE_DEVICES=0`$.
        
    5.  Use a container image that includes the NPU SDK (e.g. OpenVINO‑based containers, Intel DL Streamer, Huawei CANN toolkit) because the container loader needs the .so files at runtime.
        

* * *

2\. By vendor: usage examples
-----------------------------

### 🪨 Huawei Ascend NPU $e.g. Atlas 800, Ascend‑310/910$

Huawei supports native Docker support via the **Ascend docker-runtime plugin**:

*   **On the host**: install Ascend driver & firmware and then:
    
    ```bash
    ./Ascend‑docker‑runtime‑<version>.run --install
    systemctl restart docker
    ```
    
    The plugin mounts driver paths automatically. [Huawei Support](https://support.huawei.com/enterprise/en/doc/EDOC1100356040/2daffcc5/deploying-ascend-docker-container-engine-plugin)[Huawei Support](https://support.huawei.com/enterprise/en/doc/EDOC1100356040/5aa8cc53/deploying-a-container)
    
*   **Running a container** (example from Huawei docs):
    
    ```bash
    docker run -itd -u root \
      --device=/dev/davinci0 \
      --device=/dev/davinci_manager \
      --device=/dev/devmm_svm \
      --device=/dev/hisi_hdc \
      -v /usr/local/Ascend/driver:/usr/local/Ascend/driver \
      -e ASCEND_VISIBLE_DEVICES=0 \
      ascendhub.huawei.com/infer-modelzoo:<tag> /bin/bash
    ```
    *   The `--device=` flags expose the NPU and kernel control device.
        
    *   The `-v /usr/local/Ascend/driver` injects the shared libraries needed.
        
    *   `ASCEND_VISIBLE_DEVICES=0` instructs the CNTK/ACL runtime to use `/dev/davinci0`. [Huawei Support](https://support.huawei.com/enterprise/en/doc/EDOC1100356040/5aa8cc53/deploying-a-container)[Huawei Support](https://support.huawei.com/enterprise/en/doc/EDOC1100356040/5aa8cc53/deploying-a-container)
        

* * *

### 💻 Intel Integrated NPU $e.g. Meteor Lake / Core Ultra via Linux NPU driver + OpenVINO$

Intel’s drivers expose the NPU as a **"Versatile Processing Unit (VPU)"** via a kernel module. You do not need a special plugin—just install the driver on the host, then:

*   **Use an Intel-provided Docker image**, such as the official **Intel DL‑Streamer** or **OpenVINO** container that includes NPU runtime. [GitHub](https://github.com/intel/linux-npu-driver?utm_source=chatgpt.com)[Deep Learning Streamer](https://dlstreamer.github.io/get_started/tutorial.html?utm_source=chatgpt.com)[Docker Hub](https://hub.docker.com/r/intel/dlstreamer/?utm_source=chatgpt.com)[OpenVINO Documentation](https://docs.openvino.ai/2025/openvino-workflow/running-inference/inference-devices-and-modes/npu-device.html?utm_source=chatgpt.com)
    
*   **When starting the container**:
    
    *   Pass `/dev/dri/renderD*` if that's used,
        
    *   Add your user to the `render` group $`--group-add=$(getent group render | cut -d: -f3)`$,
        
    *   Or run as a user with the correct group ID inside the container if using a non-root user.
        

Example snippet:

```bash
docker run --device /dev/dri/renderD128 \
  --group-add=render \
  intel/dlstreamer \
  /bin/bash -c "python3 your_npu_model.py"
```

Intel docs emphasize that the container user needs correct `render` group privileges to access the device. [Deep Learning Streamer](https://dlstreamer.github.io/get_started/tutorial.html?utm_source=chatgpt.com)

* * *

### ⚙️ Google Coral Edge TPU $USB / PCIe$

Google Coral NPUs (Edge TPU) expose `/dev/apex_0` and use `libedgetpu.so` to talk to the device.

Simple Docker usage:

```bash
docker run --device=/dev/apex_0:/dev/apex_0 \
  your‑coral‐container-image /bin/bash
```

There are ready-made Docker images $e.g., coral-python, classify-image$ that include `libedgetpu` and can boot with this setup. [Jeff Geerling](https://www.jeffgeerling.com/blog/2023/testing-coral-tpu-accelerator-m2-or-pcie-docker?utm_source=chatgpt.com)[GitHub](https://github.com/pklinker/coral-container?utm_source=chatgpt.com)

* * *

3\. Quick comparison 👇
-----------------------

| Vendor / NPU Type | Host driver needed? | Docker injection method | GPU isolation key |
$$
| --- | --- | --- | --- |
$$
| Huawei Ascend (DaVinci) | Yes – Ascend driver + firmware, plus ascend‑docker‑runtime | --device flags + mount /usr/local/Ascend/driver, ASCEND_VISIBLE_DEVICES | ASCEND_VISIBLE_DEVICES, uses /dev/davinci* nodes |
| Intel Integrated $Core Ultra / VPU$ | Yes – Intel linux‑npu‑driver & OpenVINO libs (optional) | --device, --group-add (often render, drm), use official Intel container | --group-add=render, render group ID must match host |
| Google Coral Edge TPU | Yes – host driver/runtime libedgetpu.so | --device=/dev/apex_0, + v‑mount libedgetpu.so if not baked into image | N/A |

> ✅ In container benchmarking (from 2017 and later), deep‑learning workloads show near‑native inference speed. Docker overhead is minimal as long as you pass device nodes and mount the correct driver directories. [GitHub](https://github.com/intel/linux-npu-driver?utm_source=chatgpt.com)

* * *

4\. When Docker does NOT support NPU
------------------------------------

Some ARM-based laptops or tablet platforms (e.g. Qualcomm Snapdragon with built‑in NPU) are **not recognized by the Docker engine** on Windows/Linux, and do not expose `/dev/npu` by default. There is no software path to pass them through unless Docker Desktop adds NPU-aware virtualization support. Docker issue #14313 confirms such cases. [Reddit](https://www.reddit.com/r/docker/comments/1gdlhcp/docker_doesnt_seem_to_support_snapdragon_gpu_and/?utm_source=chatgpt.com)[GitHub](https://github.com/docker/for-win/issues/14313?utm_source=chatgpt.com)

Similarly, for embedded NPUs (Rockchip AI, Hailo, Sophon, etc.), you must check whether a proper Linux driver exists on the host, and whether there are shared libraries compatible with Alpine, Ubuntu, or your container base.

* * *

✅ TL;DR
-------

*   **Yes**, Docker containers can use NPUs, but only if:
    
    1.  The **driver & firmware are installed on the host**.
        
    2.  You **inject device nodes and libraries** via `--device`, volume mounts, or vendor plugin.
        
    3.  You **run in a container image** that includes the correct NPU SDK (CANN, OpenVINO, libedgetpu, etc.).
        
*   The most "Docker-friendly" NPUs today are:
    
    *   **Huawei Ascend** (via their `ascend‑docker‑runtime` plugin),
        
    *   **Intel Core Ultra / VPU** $via Intel‑optimized containers and `--device/--group-add`$,
        
    *   **Google Coral Edge TPU** $via USB/PCIe passthrough$.
        
*   **ARM consumer NPUs (e.g. Snapdragon)** usually **don’t work with today's Docker Desktop**, and require kernel-level device support or custom container runtime.
    

* * *

🧪 Example: Ascend‑910 on Ubuntu
--------------------------------

```bash
# On host:
sudo bash Ascend‑docker‑runtime‑<ver>.run --install
sudo apt install ascend‑driver ascend‑cann
sudo systemctl restart docker
ls /dev | grep davinci

# Run container
docker run --rm -it \
  --device /dev/davinci0 \
  --device /dev/davinci_manager \
  --device /dev/devmm_svm \
  --device /dev/hisi_hdc \
  -v /usr/local/Ascend/driver:/usr/local/Ascend/driver:ro \
  -e ASCEND_VISIBLE_DEVICES=0 \
  huawei/ascend-infer:latest \
  /bin/bash
exec run_your_inference_program
```

You'll then see `/dev/davinci0` inside the container; Open the SDK $MindSpore, PyTorch + torch‑npu, etc.$ and it can immediately run inference on the actual NPU. [Huawei Support](https://support.huawei.com/enterprise/en/doc/EDOC1100356040/5aa8cc53/deploying-a-container)[Huawei Support](https://support.huawei.com/enterprise/en/doc/EDOC1100356040/5aa8cc53/deploying-a-container)

* * *

### ❓Still not working?

*   Double-check the nodes: are `/dev/davinci0` (Huawei), `/dev/apex_0` (Edge TPU), or `/dev/dri/renderD*` (Intel VPU) visible on the host?
    
*   Is the Docker image **compiled for the same host architecture** $e.g. `x86_64`, `arm64`$? Especially critical for Arm‑based systems.
    
*   Does your container base match the **vendor runtime’s C++ loader dependencies** $glibc, LD\_LIBRARY\_PATH, etc.$?
    
*   Are you setting the right **group ID** inside the container? (e.g. for Intel `render` group must match real GID)
    
*   Make sure you're **not using Docker Desktop on WSL2 or macOS without real Linux passthrough** for NPU drivers.
    

* * *

In summary
----------

If you’ve got an accessible host‑level NPU and a corresponding SDK that installs shared libraries and device nodes, you can absolutely access it from a Docker container by mounting the right files, using `--device`, setting the right environment variable, and using a container that knows how to talk to it. The most mature and Docker-friendly NPUs in 2025 are from **Huawei Ascend**, **Intel integrated NPU (Core Ultra)**, and **Google Coral Edge TPU**, each with their own guide and container image available.

Need help customizing this for your device (e.g. an embedded board or Windows host)? Let me know what hardware and Linux distro you’re on and I can tailor the docker command for you!undefined

## User
Specifically on windows... it is possible then?

## ChatGPT
**TL;DR: Unfortunately, running a Linux-based NPU workload inside Docker on Windows Desktop is _not supported_ as of ℅ August 2025.**

* * *

1\. 🚧 Why (standard) Docker on Windows can't see NPUs
------------------------------------------------------

### A. NPU drivers are Linux‑only Deep‑Kernel modules

Most NPU vendors (Intel Core Ultra NPU, Huawei Ascend, Google Coral Edge TPU) ship **Linux kernel drivers and libraries**. Even if you install their runtime on Windows, there’s **no corresponding Linux driver** inside the Docker‑WSL VM to access the hardware.

### B. Docker on Windows uses WSL 2 under the hood

Docker Desktop for Windows runs containers inside a **WSL 2 virtual machine**. Only _paravirtualized drivers_ are passed in—currently limited to NVIDIA GPU $via `--gpus`$ and DirectX-based acceleration. There is **no paravirtual support for NPU hardware** [GitHub](https://github.com/intel/intel-npu-acceleration-library/issues/13?utm_source=chatgpt.com).

### C. Linux container inside WSL2 can't access host NPUs

Even if a Windows user-space runtime “sees” the NPU, _Linux containers don’t_. The Intel “intel\_npu\_acceleration\_library” has been tested on WSL2 and **fails to detect the NPU**, instead defaulting to CPU fallback [GitHub](https://github.com/intel/intel-npu-acceleration-library/issues/13?utm_source=chatgpt.com). That means containers cannot call `device=NPU` or load the NPU shared libraries under WSL.

* * *

2\. Breakdown by NPU platform
-----------------------------

| NPU Platform | Windows host support (native) | Linux driver in WSL2 | Pass-through to Linux container |
$$
| --- | --- | --- | --- |
$$
| Intel Core Ultra NPU | ✔️ Yes – via WindowsDriver & OpenVINO SDK | ❌ Not available | ❌ Not recognized at runtime |
| Coral Edge TPU $USB/PCIe$ | ✔️ Yes – Windows installable runtime & driver | (Linux driver absent) | ❌ Container sees USB device, but no Linux driver → “No EdgeTPU detected” GitHub |
| Huawei Ascend | ❌ No – firmware & drivers are Linux-only | ❌ No support | ❌ N/A |

**Bottom line:** WSL2 containers only see Linux-compatible NPUs if the underlying host kernel has driver. Windows kernel cannot share that to Linux guest.

* * *

3\. Windows Containers don’t help either
----------------------------------------

Windows containers $process-isolated or Hyper‑V‑isolated$ support **DirectX GPU acceleration** only, not arbitrary PCIe or USB devices like NPUs. While you can pass through a GPU (e.g. for DirectX workloads), **you can’t expose a Coral TPU or an Intel NPU to a Windows container** in an official manner [Microsoft Learn](https://learn.microsoft.com/en-us/virtualization/windowscontainers/deploy-containers/gpu-acceleration?utm_source=chatgpt.com).

* * *

4\. 🤔 Better workarounds
-------------------------

1.  **Dual‑boot or VPN-access Linux host**—runs NPU drivers natively and supports Docker device pass‑through $`--device=/dev/davinci0`, `/dev/apex_0`, `/dev/dri/render*`, etc.$.
    
2.  **Linux VM with PCI‑passthrough**—e.g. Proxmox, KVM, unRAID, Hyper‑V Gen2, exposing the NPU. Not Docker on Windows.
    
3.  **Windows Server + DDA**—requires **Windows Server 2022 or 2025 Datacenter**, specialized hardware, and manual PCIe passthrough to Hyper‑V VMs. _Not supported by Docker Desktop._
    

* * *

👉 Summary
----------

*   **You cannot access an NPU from within a Linux container on Windows Desktop**—Docker Desktop doesn’t pass NPU drivers into WSL2.
    
*   **Native Windows applications may use some NPUs**, but there's no container-friendly pass‑through available.
    
*   **Your best bet is using a Linux environment** if you need NPU acceleration inside a container.
    

If you tell me exactly which NPU hardware you're using $Intel/Acer Core Ultra, Ascend, Coral$, and whether you’re open to using WSL Linux or dual‑boot, I can help you design the safest path forward.undefined

## User
Gah I hate trying to get linux to work on a laptop... I don't have a USB drive right now either.

## ChatGPT
### Hey there—good news and a friendly workaround

You're right: trying to get Linux + Docker to play nice with Intel/Edge TPU NPUs from Windows is a pain, especially without a USB installer handy. 🥲 But you don’t _actually_ need Linux or Docker on your laptop to use your NPU.

* * *

✅ Path #1: Run on **Windows directly** (no Linux, no USB needed)
----------------------------------------------------------------

If you have an **Intel Core Ultra** processor $aka Meteor/Lunar/Arrow Lake$ on Windows 11 $22H2 / 23H2 / 24H2$, **you can install the Intel NPU driver and use OpenVINO for inference just like you would on Linux**—no container required. Just run your Python or C++ app and call `ov::Core().compile_model(model, "NPU")`. The runtime will schedule onto the NPU device automatically without any blessed Linux driver or permissions drama $for instance, no `/dev/Accel*`$ [Intel](https://www.intel.com/content/www/us/en/download/794734/intel-npu-driver-windows.html?utm_source=chatgpt.com)[OpenVINO Documentation](https://docs.openvino.ai/2025/openvino-workflow/running-inference/inference-devices-and-modes/npu-device.html?utm_source=chatgpt.com).

You can even keep coding and prototyping in **WSL2**, but the NPU part must stay in Windows user space for now—OpenVINO running inside Linux still falls back to CPU because **WSL2 does not support the Linux Intel NPU driver** yet [GitHub](https://github.com/intel/intel-npu-acceleration-library/issues/13?utm_source=chatgpt.com).

* * *

🌐 Path #2: Use a remote Linux host as a “server”—skip USB completely
---------------------------------------------------------------------

If you _really_ want Docker/Ubuntu/Linux to drive the NPU, one of the best approaches is to run Docker **on another Linux machine** that already has working drivers—perhaps a desktop, server, or even a cloud instance (e.g. a rented GPU workstation with Intel hardware).

*   On that machine, spin up **OpenVINO Model Server (OVMS)** in Docker. It exposes a **REST or gRPC API** and runs your NPU-powered inference inside its container $GitHub+5GitHub+5GitHub+5$(https://github.com/openvinotoolkit/model_server?utm_source=chatgpt.com).
    
*   From your laptop (Windows), you can then call that server via HTTP to get inference results—**no Linux OS or USB drive needed on your laptop**.
    
*   You can still develop code locally, CLI inside Docker via VS Code Remote SSH, etc.—but inference runs off-host.
    

This approach is also safer for deployment if you want to scale up later or hijack cloud CPU/GPU machines with better uptime than a laptop.

* * *

🧭 Path #3: WSL2 pure development, NPU in your native Windows
-------------------------------------------------------------

If you don’t mind switching environments:

1.  **Use Linux $WSL2 + Docker$** on your Windows laptop for development tasks—Convert models, test compatibility, etc.
    
2.  **Run inference on Windows** itself using the Intel NPU driver + OpenVINO runtime.
    
3.  When you need to test on Linux containerized NVIDIA/CUDA or ONNX runtime logic, do that in WSL2—but again, NPU is offline there.
    

This split setup is popular in data science workflows—code in Linux, compute on native or remote host with hardware access.

* * *

⚠️ TL;DR Table
--------------

| Scenario | Requires Linux or USB | NPU Accessible | Ease |
$$
| --- | --- | --- | --- |
$$
| Win 11 + Intel NPU + OpenVINO | ❌ No | ✅ Yes | ✅ Easiest |
| Remote Linux VM + OVMS Docker | ✅ Yes (remotely) | ✅ Yes | ⭐ Good |
| WSL2 + Docker on your laptop | ✅ Yes (WSL2) | ❌ No | Low latency |
| Running Windows container/WSL2 | ✅ Yes | ❌ No | 😞 Not usable |

* * *

🧪 Example: using OpenVINO on Windows with NPU
----------------------------------------------

```powershell
# 1. Install Intel NPU driver executable from intel.com for Win11
Start-Process -Wait -FilePath intel_npu_driver_*.exe

# 2. Install OpenVINO 2025.2 and run:
C:\Program Files\Intel\openvino_2025\bin\setupvars.bat

# 3. In Python:
import openvino as ov
core = ov.Core()
print(core.available_devices())  # should list ["CPU", "GPU", "NPU"]
compiled = core.compile_model(model, "NPU")
results = compiled(inputs)
```

You can also feed multiple models to the **AUTO** device to distribute across CPU/GPU/NPU automatically—OpenVINO handles operator-level scheduling if the main model doesn't fit entirely on NPU $GitHub+1GitHub+1$(https://github.com/openvinotoolkit/model_server?utm_source=chatgpt.com$$
)[GitHub+2GitHub+2GitHub+2](
$$https://github.com/openvinotoolkit/openvino/wiki/Project-ideas-for-2025?utm_source=chatgpt.com).

* * *

When this still won’t work
--------------------------

*   If your CPU is older (e.g. 12th Gen or earlier), **you don’t have an NPU**, so this won’t work.
    
*   Not all laptops expose the NPU over WDDM—some OEMs disable it. You can check with `DeviceManager → Intel® Neural Processing Unit`.
    
*   Some remote servers do not provide Intel NPU hardware; check OpenVINO output whether NPU appears.
    

Let me know your exact CPU model (e.g. Intel Core Ultra 7 155H) and Windows version—I can share a quick compatibility check or driver link for you.undefined

## User
Ok, I know I can do it on windows naitively...
I've been thinking that... you can still run windows programs from the WSL bash... it just might get confusing in cases where I am running the same commands $node/python$ on windows as I am for linux jobs. It should work though right? Being explicit and calling python.exe should make it run inside of windows, even if I am in wsl bash?

## ChatGPT
Absolutely — **you can call Windows executables like `python.exe` from WSL bash**, and they run as real native Windows apps. That includes Intel OpenVINO installations that target the NPU. Here's how it works and what to expect:

* * *

### ✅ WSL Interop Magic

*   WSL auto-recognizes any `.exe` in your `$PATH` and runs it via binfmt\_misc → Microsoft People call this “interop.”
    
    *   Example: `notepad.exe` or `ipconfig.exe` works seamlessly from bash $Emacs Stack Exchange+2Unix & Linux Stack Exchange+2Visual Studio Code+2$(https://unix.stackexchange.com/questions/42617/how-to-change-the-working-directory-for-a-shell-script?utm_source=chatgpt.com).
        
*   The working directory is preserved, environment variables are translated (using `WSLENV`), and you can pipe to PowerShell and Linux commands as if you were on Windows [Microsoft Learn](https://learn.microsoft.com/en-us/windows/wsl/filesystems?utm_source=chatgpt.com).
    

* * *

### 🐍 Calling `python.exe` from WSL

```bash
$ python.exe --version  
Python 3.12.1
$ python.exe yourfile.py  
# or use venv / pip as usual
```

*   This runs the Windows-installed Python, **not** the Ubuntu `/usr/bin/python` in WSL.
    
*   If you omit the `.exe`, Linux’s `python` is used instead.
    
*   Inside `python.exe`, tools like OpenVINO will work and NPU will be accessible (since it's the Windows driver), but note that file paths $`C:\…`$ are translated automatically via `\\wsl$\...` access.
    
$$
**Caveats:**
$$
*   If you run `python.exe test.py`, the working directory may default to your Windows home drive, **not** your current WSL folder—so your script might not be found unless you specify full paths [askubuntu.com](https://askubuntu.com/questions/1044698/how-to-use-the-same-python-for-windows-and-linux-on-windows-subsystem-for-linux).
    
*   Line endings (CRLF) and symlinks in WSL/Linux filesystems may confuse Windows Python.
    
*   Virtual environments and `pip` path isolation may risk duplication or version conflicts between Linux and Windows envs.
    

* * *

### ⚠️ When name collisions occur

If both Windows and Linux versions of a tool are on your `PATH`, WSL decides which to run as follows:

*   If you type `python`, the Linux version wins.
    
*   If you type `python.exe`, it forces the Windows version.
    
*   To control paths explicitly, use the full path like `/mnt/c/Windows/Python/python.exe` or quote-mount via WSLENV.
    

* * *

### 🛠 Suggested workflow 📋

For clarity, consider an alias in `.bashrc`:

```bash
alias winpy='python.exe'
alias winnode='node.exe'
```

Then in WSL:

```bash
winpy -m OpenVINO.demo ...   # Runs windows OpenVINO + Intel NPU
pip freeze                    # Should mirror Windows pip if same venv
```

* * *

### ✅ TL;DR Table

| Use Case | Command | Interpreter Used | NPU <br> Accessible? |
$$
| --- | --- | --- | --- |
$$
| Windows Python + OpenVINO | python.exe ... | Native Windows .exe | ✅ (via Windows driver) |
| WSL Linux Python | python ..., pip3 | Linux (apt install) | ❌ (no Linux NPU driver) |
| Default python | python (no .exe) | Linux | ❌ |
| Explicit shutdown / stop NPU | wsl --shutdown etc. | — | — |

* * *

### 🚀 Pro tip for reliability

*   Run Windows Python only from a WSL path that’s also accessible on Windows $e.g. `/mnt/c/…`$.
    
*   Printers, GUI tools, `explorer.exe .`, and even DreamStudio CLI will work seamlessly when called from `.exe`.
    
*   Avoid CRLF by using `.gitattributes` or `dos2unix`, especially in WSL's `/home/…`.
    

* * *

### 🧠 Final Thought

Yes — as long as you explicitly invoke `python.exe` from WSL bash, it runs in Windows land. That means you get full NPU driver support via OpenVINO (or Node apps targeting the NPU). Just be careful with file paths, virtual environments, and cross-OS scripts. If you stick with those rules, it’s surprisingly stable. Let me know if you'd like help writing a `.bashrc` shim or ensuring your project folder works transparently across both worlds!undefined

