---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "PYTHONPATH multiple paths"
conversation_id: 688d105f-f408-8321-bc04-8791b43c38a4
create_time: 08/01/2025 at 2:07 PM
update_time: 08/01/2025 at 2:08 PM
---

# Title: PYTHONPATH multiple paths

Created: 08/01/2025 at 2:07 PM
Last Updated: 08/01/2025 at 2:08 PM
Chat URL: https://chat.openai.com/c/688d105f-f408-8321-bc04-8791b43c38a4


>[!nexus_agent] **Assistant** - 08/01/2025 at 2:07 PM
> Yes, the `PYTHONPATH` environment variable **can contain multiple paths**, and that's exactly what it's designed for.
> 
> ### ✅ Format (platform-specific):
> 
> - **Unix/macOS**: colon-separated 
>  ```bash
>  export PYTHONPATH="/path/to/dir1:/path/to/dir2"
>  ```
> 
> - **Windows**: semicolon-separated 
>  ```cmd
>  set PYTHONPATH=C:\path\to\dir1;C:\path\to\dir2
>  ```
> 
> Each path added will be **prepended** to Python’s `sys.path`, which is what Python uses to search for modules and packages. This means modules in those directories will be importable *before* the standard library or site-packages, which is both powerful and potentially dangerous.
> 
> ---
> 
> ### 🧠 Notes:
> - This does **not** override the built-in libraries unless something with the same name appears earlier in the list. So you could accidentally shadow `json`, `os`, etc.
> - You can inspect it at runtime:
>  ```python
>  import sys
>  print(sys.path)
>  ```
> - It’s not `PYTHON_PATH` (underscore) — the correct variable is `PYTHONPATH` (no underscore). The wrong one will be ignored.
> 
> ---
> 
> ### 🧪 Example Use Case
> 
> ```bash
> export PYTHONPATH="$HOME/my-libs:$HOME/projects/duck/services/py/tts"
> ```
> 
> Now you can:
> ```python
> from mylib import something
> from tts.utils import do_speech
> ```
> 
> Let me know if you want to programmatically modify it or set it in a script or `.env` file.
<!-- UID: 0e85c8ac-4d34-4d5f-a507-79a90fab0dd0 -->

---




>[!nexus_user] **User** - 08/01/2025 at 2:07 PM
> can the ENV var value of PYTHON_PATH contain more than one path?
<!-- UID: 109d482b-2182-4d66-aa36-46234f636750 -->




>[!nexus_agent] **Assistant** - 08/01/2025 at 2:08 PM
> Nope — **they do not have to be absolute**, but they are **resolved relative to the current working directory** *at the time Python is launched*. That distinction matters.
> 
> ---
> 
> ### 🔍 Example
> 
> Say your project structure is:
> 
> ```
> /home/err/project/
> ├── script.py
> ├── lib/
> │ └── mymodule.py
> ```
> 
> If you do:
> 
> ```bash
> cd /home/err/project
> export PYTHONPATH="lib"
> python script.py
> ```
> 
> Then inside `script.py`, this will work:
> 
> ```python
> from mymodule import something
> ```
> 
> But if you run it from **somewhere else**, like:
> 
> ```bash
> cd /
> export PYTHONPATH="lib"
> python /home/err/project/script.py
> ```
> 
> Then Python will look for `lib/` **relative to `/`**, not relative to the script. And you'll get `ModuleNotFoundError`.
> 
> ---
> 
> ### 💡 TL;DR
> - **Relative paths are allowed**, but they are resolved **relative to `cwd`**, not the script location.
> - If you want reliability: **use absolute paths**, or resolve relative ones in code using `__file__`.
> 
> ---
> 
> Want a snippet to dynamically modify `sys.path` relative to the script instead of the working dir?
<!-- UID: aa463c38-d8e7-46b1-8700-51cb04daca5a -->

---




>[!nexus_user] **User** - 08/01/2025 at 2:08 PM
> do they all have to be absolute?
<!-- UID: 0f410fce-c913-4608-bd27-0671997dc8dd -->


