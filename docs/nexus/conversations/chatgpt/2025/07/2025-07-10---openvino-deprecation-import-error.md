---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "OpenVINO Deprecation Import Error"
conversation_id: 686ff9a6-b144-8004-8b8e-9196968ca446
create_time: 07/10/2025 at 12:34 PM
update_time: 07/10/2025 at 12:35 PM
---

# Title: OpenVINO Deprecation Import Error

Created: 07/10/2025 at 12:34 PM
Last Updated: 07/10/2025 at 12:35 PM
Chat URL: https://chat.openai.com/c/686ff9a6-b144-8004-8b8e-9196968ca446


>[!nexus_user] **User** - 07/10/2025 at 12:34 PM
> C:\Users\foamy\.virtualenvs\2.0-jCi5YG-k\Lib\site-packages\openvino\runtime\__init__.py:10: DeprecationWarning: The `openvino.runtime` module is deprecated and will be removed in the 2026.0 release. Please replace `openvino.runtime` with `openvino`.
>  warnings.warn(
> Traceback (most recent call last):
>  File "C:\Users\foamy\devel\duck\versions\2.0\scripts\tts.py", line 5, in <module>
>  from ..lib.models.forward_tacotron_ie import ForwardTacotronIE
> ImportError: attempted relative import with no known parent package
<!-- UID: 28082c2e-09d1-4162-9f0d-0853b565f0d2 -->




>[!nexus_agent] **Assistant** - 07/10/2025 at 12:34 PM
> You're hitting **two separate issues** here: 
> 
> ---
> 
> ### ✅ 1. **OpenVINO Deprecation Warning**
> This is just a **deprecation warning**, not a crash:
> 
> > ⚠️ `openvino.runtime` will be removed in 2026.0. Use `openvino` instead.
> 
> #### ✅ Fix:
> In your import statements, change:
> ```python
> from openvino.runtime import Core
> ```
> to:
> ```python
> from openvino import Core
> ```
> 
> ---
> 
> ### ❌ 2. **Relative Import Error**
> The actual crash is this:
> ```
> ImportError: attempted relative import with no known parent package
> ```
> 
> This means Python doesn’t know it’s supposed to treat your script (`tts.py`) as part of a package. Relative imports (like `from ..lib.models...`) **only work when run as part of a package**, not as a standalone script.
> 
> #### 🔧 Fix Option A: Run as a Module
> Use `python -m` from the *root of your package*:
> 
> ```sh
> cd C:\Users\foamy\devel\duck\versions\2.0\
> python -m scripts.tts
> ```
> 
> This tells Python to treat `scripts.tts` as a module inside a package, so relative imports work.
> 
> #### 🔧 Fix Option B: Change to Absolute Imports
> If your folder structure looks like this:
> 
> ```
> 2.0/
> ├── lib/
> │ └── models/
> │ └── forward_tacotron_ie.py
> └── scripts/
>  └── tts.py
> ```
> 
> Then in `tts.py`, replace:
> ```python
> from ..lib.models.forward_tacotron_ie import ForwardTacotronIE
> ```
> 
> With:
> ```python
> from lib.models.forward_tacotron_ie import ForwardTacotronIE
> ```
> 
> And make sure `2.0` is on your `PYTHONPATH`. You can do this at runtime with:
> ```python
> import sys
> sys.path.append("C:/Users/foamy/devel/duck/versions/2.0")
> ```
> 
> ---
> 
> Let me know if you want a launcher script or setup file to make this easier to manage.
<!-- UID: 20a79475-1a96-4a83-820d-454199654a6a -->

---




>[!nexus_user] **User** - 07/10/2025 at 12:35 PM
> C:\Users\foamy\.virtualenvs\2.0-jCi5YG-k\Scripts\python.exe: Relative module names not supported
<!-- UID: 49fa5bea-6270-4b9f-a3af-f3a895b4ea9d -->




>[!nexus_agent] **Assistant** - 07/10/2025 at 12:35 PM
> That error:
> ```
> Relative module names not supported
> ```
> means you're running your script **directly** like this:
> ```sh
> python scripts/tts.py
> ```
> And Python **won’t allow relative imports** in that context.
> 
> ---
> 
> ### ✅ **Fix this by running as a module**:
> 
> From the root directory of your project (probably `C:\Users\foamy\devel\duck\versions\2.0`), run:
> 
> ```sh
> python -m scripts.tts
> ```
> 
> This makes Python treat it as part of a package, so relative imports like `from ..lib.models...` will work.
> 
> ---
> 
> ### 🛠️ If you can't or don't want to run with `-m`, then:
> 
> You have two options:
> 
> #### 1. **Convert to absolute imports**
> Edit `scripts/tts.py`:
> ```python
> from lib.models.forward_tacotron_ie import ForwardTacotronIE
> ```
> 
> Then add this at the top of the script:
> ```python
> import sys
> import os
> sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
> ```
> 
> This forces Python to treat `lib/` as importable.
> 
> #### 2. **Refactor your repo into a proper Python package**
> If you want to go full-clean, add an empty `__init__.py` file in each directory (`scripts`, `lib`, and `models`), and use only **absolute imports** from the package root.
> 
> ---
> 
> ### TL;DR
> 
> Use this if you want relative imports:
> ```sh
> cd C:\Users\foamy\devel\duck\versions\2.0
> python -m scripts.tts
> ```
> 
> Or convert the imports to absolute paths and add your project root to `sys.path`.
> 
> Want me to give you a starter package layout or entry point script to clean this up?
<!-- UID: 8c7fe83b-4215-4ebb-ab6b-5d0e4a0e86fc -->

---


