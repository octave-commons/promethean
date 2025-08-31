---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Pipenv install equivalent"
conversation_id: 6872f5e6-3148-8004-a179-f0021b9adb48
create_time: 07/12/2025 at 6:55 PM
update_time: 07/12/2025 at 7:49 PM
---

# Title: Pipenv install equivalent

Created: 07/12/2025 at 6:55 PM
Last Updated: 07/12/2025 at 7:49 PM
Chat URL: https://chat.openai.com/c/6872f5e6-3148-8004-a179-f0021b9adb48


>[!nexus_agent] **Assistant** - 07/12/2025 at 6:55 PM
> The `pipenv` equivalent of:
> 
> ```bash
> $ python3 -m pip install -U .[voice]
> ```
> 
> is:
> 
> ```bash
> $ git clone https://github.com/Rapptz/discord.py
> $ cd discord.py
> $ pipenv install -e .[voice]
> ```
> 
> ### Explanation:
> 
> - `pipenv install` replaces `pip install`.
> - `-e` stands for *editable* install (same as `-U` for local installs—it lets you work with the source code directly).
> - `.[voice]` tells `pipenv` to install the `voice` optional dependencies defined in the `extras_require` of the project's `setup.py` or `pyproject.toml`.
> 
> ### Notes:
> - You must run this inside a Pipenv-managed directory (i.e., where `Pipfile` exists), or Pipenv will generate one for you.
> - After installing, Pipenv will track the package as editable in your `Pipfile`, like this:
> 
>  ```toml
>  [packages]
>  discord.py = {path = ".", editable = true, extras = ["voice"]}
>  ```
> 
> Let me know if you're planning to work on that repo or just use it—you might not need an editable install unless you're modifying the code.
<!-- UID: d1a31f39-cb31-4e59-9f39-47cc3c0a5bb0 -->

---




>[!nexus_user] **User** - 07/12/2025 at 6:55 PM
> What would the equivolent of this command be for a pipenv?
> $ git clone https://github.com/Rapptz/discord.py
> $ cd discord.py
> $ python3 -m pip install -U .[voice]
<!-- UID: a83f3809-5a22-4ad3-b92a-189393ec6d64 -->




>[!nexus_agent] **Assistant** - 07/12/2025 at 6:57 PM
> You're right to question it — yes, in that case, **you want to run**:
> 
> ```bash
> $ cd duck
> $ pipenv install -e ./discord.py[voice]
> ```
> 
> ### Breakdown:
> - You're **inside `./duck`**, where your `Pipfile` lives.
> - `./discord.py` is the **relative path to the cloned library**.
> - `[voice]` installs the **optional `voice` extras** (like `PyNaCl`).
> - `-e` makes it **editable**, meaning any changes you make to `./discord.py` take effect without reinstalling.
> 
> ### Important:
> Make sure you don’t do this **outside** of `./duck` or you’ll end up with the wrong `Pipfile`. `pipenv` works *only within the directory where the `Pipfile` lives*.
> 
> ---
> 
> Let me know if you want to run the bot from within this same Pipenv or isolate things further. You might also want to lock versions or set a `PIPENV_VENV_IN_PROJECT=1` if you're aiming for extra reproducibility.
<!-- UID: 0e08c440-c45a-47ed-a7b1-8912b3b17e64 -->

---




>[!nexus_user] **User** - 07/12/2025 at 6:57 PM
> soooo if I have my pipenv file at ./duck/Pipfile, and this library was cloned to ./duck/discord.py, I would... run that command like that? Or is it pipenv install -e ./discord.py[voice]?
<!-- UID: 38f6fc36-45a8-445e-8f61-b1f2cc5c0e69 -->




>[!nexus_agent] **Assistant** - 07/12/2025 at 7:00 PM
> This error:
> 
> ```
> AttributeError: module 'discord' has no attribute 'DiscordException'
> ```
> 
> is happening because your version of `discord.py` is **missing `DiscordException`**, but `discord.ext.voice_recv` expects it to be there.
> 
> ### Most Likely Cause:
> You're using **a fork or modified version of `discord.py`** that doesn't expose `DiscordException` — **or** you're installing `discord.ext.voice_recv` from a version that expects an upstream `discord.py` structure which your current version no longer has.
> 
> ---
> 
> ### Let's break it down:
> 
> #### 📦 File throwing the error:
> ```
> .../Lib/site-packages/discord/ext/voice_recv/sinks.py
> ```
> 
> ```python
> class VoiceRecvException(discord.DiscordException):
> ```
> 
> But `discord` doesn’t define `DiscordException`. That means the `discord.py` package you’ve got in your environment doesn’t have it — probably because:
> 
> - It’s a newer fork (e.g. `py-cord`, `nextcord`, `discord-py-interactions`)
> - Or you're using a local dev version (`./discord.py`) that diverged
> 
> ---
> 
> ### ✅ How to fix it
> 
> #### Option 1: Patch `sinks.py` to avoid `discord.DiscordException`
> 
> Change this line:
> ```python
> class VoiceRecvException(discord.DiscordException):
> ```
> 
> To something like:
> ```python
> class VoiceRecvException(Exception): # fallback
> ```
> 
> Or:
> ```python
> from discord.errors import DiscordException
> class VoiceRecvException(DiscordException):
> ```
> 
> (Only if `DiscordException` is found in `discord.errors`, which is the case in some forks)
> 
> ---
> 
> #### Option 2: Check your discord.py version
> From inside the Pipenv shell:
> ```bash
> pip show discord.py
> ```
> 
> Or if it’s your local editable install, just inspect:
> ```python
> # ./discord.py/discord/__init__.py
> # or ./discord.py/discord/errors.py
> ```
> 
> You should find a line like:
> ```python
> class DiscordException(Exception):
> ```
> 
> If it’s missing, that’s your problem.
> 
> ---
> 
> #### Option 3: Use a version of `voice_recv` that matches your `discord.py` fork
> 
> Check the source of `discord.ext.voice_recv`. If it's a third-party extension (e.g., from [@Rapptz's voice-recv extension](https://github.com/Rapptz/discord-ext-voice-recv)), it expects to pair with **his version** of `discord.py`.
> 
> If you're using `py-cord` or another fork, there's a decent chance this internal API is no longer compatible.
> 
> ---
> 
> ### TL;DR Fix:
> If you're not married to a forked version, and you're using `voice_recv`, just go with:
> 
> ```bash
> pip uninstall discord.py
> pip install -U git+https://github.com/Rapptz/discord.py
> pip install -U git+https://github.com/Rapptz/discord-ext-voice-recv
> ```
> 
> That guarantees compatibility.
> 
> If you need to keep your current fork, you’ll have to patch the offending line or subclass from `Exception` instead.
> 
> Let me know which direction you're leaning and I can walk you through adjusting your stack.
<!-- UID: f47b73ba-f09d-4b90-a5b2-eeb839721dcb -->

---




>[!nexus_user] **User** - 07/12/2025 at 7:00 PM
> Why might this be happening?
> 2|discord_speaker | Traceback (most recent call last):
> 2|discord_speaker | File "<frozen runpy>", line 198, in _run_module_as_main
> 2|discord_speaker | File "<frozen runpy>", line 88, in _run_code
> 2|discord_speaker | File "C:\Users\foamy\devel\duck\versions\2_0\services\discord_speaker\bot.py", line 6, in <module>
> 2|discord_speaker | from discord.ext import commands, voice_recv, tasks
> 2|discord_speaker | File "C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages\discord\ext\voice_recv\__init__.py", line 3, in <module>
> 2|discord_speaker | from .voice_client import *
> 2|discord_speaker | File "C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages\discord\ext\voice_recv\voice_client.py", line 16, in <module>
> 2|discord_speaker | from .reader import AudioReader
> 2|discord_speaker |
> 2|discord_speaker | File "C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages\discord\ext\voice_recv\reader.py", line 13, in <module>
> 2|discord_speaker | from .sinks import AudioSink
> 2|discord_speaker | File "C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages\discord\ext\voice_recv\sinks.py", line 57, in <module>
> 2|discord_speaker | class VoiceRecvException(discord.DiscordException):
> 2|discord_speaker |
> 2|discord_speaker | ^^^^^^^^^^^^^^^^^^^^^^^^
> 2|discord_speaker | AttributeError: module 'discord' has no attribute 'DiscordException'
<!-- UID: e9fecc8c-83b5-49bb-94b4-c88bac0ab56f -->




>[!nexus_agent] **Assistant** - 07/12/2025 at 7:04 PM
> Ah, now we're getting somewhere.
> 
> You’ve got:
> 
> 1. ✅ A **local editable install** of `discord.py` where `DiscordException` **does exist**.
> 2. ❌ But at runtime, `discord.ext.voice_recv` is importing from **some other version** of `discord`, where it **does not exist**.
> 
> ### 🔍 Most Likely Cause:
> Your code is **not actually using your local `discord.py`**, even though you think it is.
> 
> This can happen **very easily** with Pipenv, `pip install -e`, or multiple virtual environments.
> 
> ---
> 
> ### 🧠 What’s happening under the hood?
> 
> When you run your bot, Python loads `discord` from **whatever is first in `sys.path`**.
> 
> So if your Pipenv environment already had a previously installed `discord.py` (e.g. from PyPI or another fork), that version gets used — not the one at `./discord.py`, even if it’s sitting right there on disk.
> 
> And the error traceback you posted **confirms this**:
> 
> ```
> C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages\discord\
> ```
> 
> That means **Python is loading `discord` from the global site-packages**, not from your local `./discord.py`.
> 
> ---
> 
> ### ✅ How to fix it
> 
> #### 1. Make sure your Pipenv actually installed the local version
> Run this from **inside `./duck`**:
> 
> ```bash
> pipenv uninstall discord.py
> pipenv install -e ./discord.py[voice]
> ```
> 
> You *must* install it with `-e` so that Python uses the local copy.
> 
> ---
> 
> #### 2. Check what version is being used
> 
> Inside your Pipenv shell, run:
> 
> ```bash
> pip show discord.py
> ```
> 
> You should see something like:
> ```
> Location: c:\users\foamy\devel\duck\discord.py
> ```
> 
> If you still see:
> ```
> Location: C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages
> ```
> 
> …then it's **not using the local version**.
> 
> ---
> 
> #### 3. Force-rebuild your venv if needed
> 
> If Pipenv is being weird (which it does sometimes), nuke and recreate:
> 
> ```bash
> cd ./duck
> pipenv --rm
> pipenv install
> pipenv install -e ./discord.py[voice]
> ```
> 
> That guarantees a clean install using your intended version.
> 
> ---
> 
> ### TL;DR
> You’ve got the correct code — it’s just not the version being used at runtime. Python’s importing `discord` from an old site-packages directory. Reinstall the local version with `pipenv install -e ./discord.py[voice]` and confirm with `pip show`. Let me know if it still doesn’t pick it up, and I’ll help you nuke the environment clean.
<!-- UID: 8985f03c-d36e-4042-abfd-26af52612302 -->

---




>[!nexus_user] **User** - 07/12/2025 at 7:04 PM
> OK so I am tryin to use the development version of discord because they patched a bug that is in my way like 2 weeks ago. I'm looking in my local copy of discord.py to find where this error is, it exists. The DiscordException is in there. Why would voice_recv not be finding it?
<!-- UID: f5dd2bf8-451f-40fd-89ff-1277b41291ed -->




>[!nexus_agent] **Assistant** - 07/12/2025 at 7:14 PM
> Yep — classic Windows lock issue. That `.pyd` (a compiled Python extension) is **still being held open by a running process** — likely your `pm2` or whatever was using that virtualenv.
> 
> ---
> 
> ### ✅ Here’s how to fix it:
> 
> #### 1. **Kill any Python processes** using that environment
> 
> In PowerShell or Git Bash:
> 
> ```bash
> tasklist | findstr python
> ```
> 
> Then kill any Python process that might be holding onto that `.pyd`:
> 
> ```bash
> taskkill /F /IM python.exe
> ```
> 
> Or if you're using `pm2` to run Python (unusual, but you've mentioned `pm2` before), make sure to shut it down:
> 
> ```bash
> pm2 stop discord_speaker
> pm2 delete discord_speaker
> ```
> 
> Also check VS Code terminals and Python Language Server (Pylance) — they love to hang onto `.pyd` files.
> 
> ---
> 
> #### 2. **Try removing again**
> 
> Once you're sure nothing is using the environment, run:
> 
> ```bash
> pipenv --rm
> ```
> 
> If it still fails...
> 
> ---
> 
> #### 3. **Manually delete the virtualenv folder**
> 
> Since the folder is:
> ```
> C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc
> ```
> 
> You can delete it manually through:
> - File Explorer (after ending any running Python processes)
> - Or Git Bash:
> 
> ```bash
> rm -rf /c/Users/foamy/.virtualenvs/2_0-xfNAyVgc
> ```
> 
> (You may need to run Git Bash as administrator.)
> 
> ---
> 
> #### 4. **Recreate everything clean**
> 
> Once it's gone:
> 
> ```bash
> cd ~/devel/duck/versions/2_0
> pipenv install # installs from Pipfile
> pipenv install -e ../../discord.py[voice] # use your relative path
> ```
> 
> Make sure this time it points to the correct local `discord.py`.
> 
> ---
> 
> Let me know if you want to harden this setup further (e.g., `PIPENV_VENV_IN_PROJECT=1`), which pins the venv inside your project folder and avoids these issues in the future.
<!-- UID: b92064dc-fc61-47da-abbc-a2e9382abcf6 -->

---




>[!nexus_user] **User** - 07/12/2025 at 7:14 PM
> foamy@MSI MINGW64 ~/devel/duck/versions/2_0 (de-snaking)
> $ pipenv --rm
> Loading .env environment variables...
> Removing virtualenv (C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc)...
> Error: An error occurred while removing C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc!
> [WinError 5] Access is denied: 'C:\\Users\\foamy\\.virtualenvs\\2_0-xfNAyVgc\\Lib\\site-packages\\aiohttp\\_websocket\\mask.cp312-win_amd64.pyd'
<!-- UID: d1c3b817-80a3-42a5-a0fd-80894e76039d -->




>[!nexus_agent] **Assistant** - 07/12/2025 at 7:20 PM
> Fair point — you're absolutely right.
> 
> You're not doing anything weird. It’s just **rare-ish** *in the Python ecosystem*, not because it’s wrong — just because Python devs usually live in the `venv + scripts + cron/service manager` world instead of node-style process management. But given your setup?
> 
> **Using `pm2` for Python on Windows is smart.**
> 
> It gives you:
> - Persistent, restartable processes (with logs and monitoring)
> - Cross-platform control
> - Easy integration later if you add Node-based tools (like frontend overlays, websockets, etc.)
> 
> And yeah — you're completely justified ditching Docker for this.
> 
> > **WSL + Docker + OpenVINO + NPU drivers** = "Here there be dragons."
> 
> There are **too many moving parts**, and Intel's driver model on Windows isn’t even fully consistent between releases yet. Trying to route hardware acceleration through a Linux container on a Windows host with closed driver stacks is... not a hill worth dying on — especially when you're debugging cutting-edge pipelines.
> 
> ---
> 
> ### TL;DR
> 
> - Your choice to run Python on Windows **natively** is 100% sound given the NPU driver situation.
> - Using `pm2` to manage Python services is **reasonable and maintainable** — especially since you’re planning multi-service composition (Discord bot, audio processors, etc.).
> - Docker can come back **later** when Intel/NPU support isn't half-broken in WSL.
> 
> If anything, I’d argue you're ahead of the curve — treating Python services like first-class background daemons instead of fragile CLI scripts. Keep going.
<!-- UID: bb738690-3d61-43bb-ac77-319239329f91 -->

---




>[!nexus_user] **User** - 07/12/2025 at 7:20 PM
> Oh it can't be that unusual to manage python processes with pm2, there are at least a few articles on how to do it. They explain in their docs how to do it.
> 
> I was doing duck as a docker compose file, but wsl/docker in general doesn't support npu drivers yet.
> And whenever they do, I am sure they are going to be a nightmare to install.
> 
> So I wanted to run python on windows natively so I could follow instructions with out constantly considering the extra containerization layer.
<!-- UID: c0b310fa-1241-4886-ad7e-1c936ae86819 -->




>[!nexus_agent] **Assistant** - 07/12/2025 at 7:24 PM
> Thanks — this gives a very clear picture now.
> 
> You've **installed the local version correctly** — Pip sees it as an *editable install*:
> ```
> Editable project location: C:\Users\foamy\devel\duck\versions\2_0\discord.py
> ```
> 
> But Python **at runtime** is still importing from:
> 
> ```
> C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages\discord
> ```
> 
> That suggests one of two things:
> 
> ---
> 
> ## 🔎 Diagnosis
> 
> ### 🔁 1. You have **a leftover `discord` folder** in `site-packages`
> Even with an editable install, if there was an existing `discord` package already in `site-packages/`, **it doesn't get removed**. Python might still import from there **before** the local path.
> 
> 📁 Check this folder:
> ```
> C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages\discord
> ```
> 
> 📁 And this one:
> ```
> C:\Users\foamy\devel\duck\versions\2_0\discord.py\discord
> ```
> 
> If **both exist**, Python might still be pulling from the stale copy — even though Pip knows about the editable one.
> 
> ---
> 
> ### 🛠 Fix:
> Manually nuke the bad one:
> 
> ```bash
> rm -rf C:/Users/foamy/.virtualenvs/2_0-xfNAyVgc/Lib/site-packages/discord
> rm -rf C:/Users/foamy/.virtualenvs/2_0-xfNAyVgc/Lib/site-packages/discord-*.dist-info
> ```
> 
> Then rerun your code.
> 
> ---
> 
> ### 🔄 2. Path precedence is messed up
> Run this tiny script inside your Pipenv shell:
> 
> ```python
> import discord
> print(discord.__file__)
> ```
> 
> You should see:
> ```
> C:\Users\foamy\devel\duck\versions\2_0\discord.py\discord\__init__.py
> ```
> 
> If it still prints:
> ```
> C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages\discord\__init__.py
> ```
> 
> Then your path precedence is still wrong, and you’re not importing the local one.
> 
> ---
> 
> ## ✅ Summary Fix Checklist
> 
> 1. Manually delete old `discord` folders from `site-packages`
> 2. Double-check `discord.__file__` points to your local checkout
> 3. Restart your process (`pm2`, terminal, VSCode Python server — whatever might be caching modules)
> 
> ---
> 
> Let me know if you want to go one step further and lock the virtualenv *inside* the project directory (`PIPENV_VENV_IN_PROJECT=1`), which prevents a lot of these cross-contamination issues in the future.
<!-- UID: 0558c29c-765e-42e2-b418-e7ef4431031a -->

---




>[!nexus_user] **User** - 07/12/2025 at 7:24 PM
> It looks installed correctly, but it's still sayin it can't find discordexception:
>  pip show discord.py
> Name: discord.py
> Version: 2.6.0a5225+ga0051098
> Summary: A Python wrapper for the Discord API
> Home-page:
> Author: Rapptz
> Author-email:
> License: The MIT License (MIT)
> 
> Copyright (c) 2015-present Rapptz
> 
> Permission is hereby granted, free of charge, to any person obtaining a
> copy of this software and associated documentation files (the "Software"),
> to deal in the Software without restriction, including without limitation
> the rights to use, copy, modify, merge, publish, distribute, sublicense,
> and/or sell copies of the Software, and to permit persons to whom the
> Software is furnished to do so, subject to the following conditions:
> 
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
> 
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
> OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
> FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
> DEALINGS IN THE SOFTWARE.
> 
> Location: C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages
> Editable project location: C:\Users\foamy\devel\duck\versions\2_0\discord.py
> Requires: aiohttp
> Required-by: discord-ext-voice_recv
<!-- UID: 8c1e8d15-6d80-41aa-847b-0ade0e136351 -->




>[!nexus_agent] **Assistant** - 07/12/2025 at 7:29 PM
> This new error:
> ```
> ImportError: cannot import name 'voice_recv' from 'discord.ext' (unknown location)
> ```
> 
> is a strong signal that the module `discord.ext.voice_recv` **isn't registered properly** or **is being shadowed** — likely because of the cleanup you just did.
> 
> ---
> 
> ## 🧠 What This Means
> 
> Your line:
> 
> ```python
> from discord.ext import commands, voice_recv, tasks
> ```
> 
> ...tries to import `voice_recv` as a **submodule of `discord.ext`**, meaning Python expects to find:
> 
> ```
> discord/ext/voice_recv/__init__.py
> ```
> 
> But now it says: 
> > `voice_recv` → unknown location
> 
> So either:
> 1. 🧹 It was just uninstalled in the cleanup and never reinstalled
> 2. 📦 It's still installed *but not being found* because of path ordering
> 3. 🧨 The current `discord.py` install is masking the `discord.ext.voice_recv` package somehow
> 
> ---
> 
> ## ✅ Fix: Reinstall `discord-ext-voice-recv` manually
> 
> From your Pipenv shell (in the same directory as your `Pipfile`):
> 
> ```bash
> pipenv install -e git+https://github.com/Rapptz/discord-ext-voice-recv
> ```
> 
> That will reinstall it as an editable module to the correct `discord` namespace.
> 
> If that doesn't work, use the long form:
> 
> ```bash
> pipenv install -e "git+https://github.com/Rapptz/discord-ext-voice-recv.git#egg=discord-ext-voice-recv"
> ```
> 
> ---
> 
> ## 📌 Also double-check:
> 
> 1. **Your `discord.py` is not a namespace package**
>  - If your `discord.py` `setup.py` or `pyproject.toml` doesn’t include `packages=find_packages()` with `discord.ext` in it, Python won't treat `discord.ext` as a proper submodule container.
>  - This can break import resolution for `discord.ext.voice_recv`.
> 
> 2. **There’s no conflict with stale `.pyc` files**
>  - If you switched from one `discord` version to another, `.pyc` bytecode files might be stale and confuse imports.
>  - You can wipe them with:
> 
>  ```bash
>  find . -name '*.pyc' -delete
>  ```
> 
>  Or on Windows:
> 
>  ```powershell
>  Get-ChildItem -Recurse -Include *.pyc | Remove-Item
>  ```
> 
> ---
> 
> ### ✅ Final Test:
> 
> Once installed, check:
> 
> ```python
> import discord.ext.voice_recv
> print(discord.ext.voice_recv.__file__)
> ```
> 
> If that works, you're good. If not, we dig deeper into how the `discord.ext` namespace is being built.
> 
> Let me know how it goes — you're close.
<!-- UID: ece05420-7727-4e45-98ba-b982aef2a1bf -->

---




>[!nexus_user] **User** - 07/12/2025 at 7:29 PM
> 2|discord_speaker | Traceback (most recent call last):
> 2|discord_speaker | File "<frozen runpy>", line 198, in _run_module_as_main
> 2|discord_speaker | File "<frozen runpy>", line 88, in _run_code
> 2|discord_speaker | File "C:\Users\foamy\devel\duck\versions\2_0\services\discord_speaker\bot.py", line 7, in <module>
> 2|discord_speaker | from discord.ext import commands, voice_recv, tasks
> 2|discord_speaker | ImportError: cannot import name 'voice_recv' from 'discord.ext' (unknown location)
> PM2 | App [discord_speaker:2] exited with code [1] via signal [SIGINT]
<!-- UID: 610dee04-c0bf-46f8-b567-0226e0e76f5a -->




>[!nexus_agent] **Assistant** - 07/12/2025 at 7:42 PM
> Yeah, this is one of those **"Pipenv got confused by Git syntax"** problems. It’s barfing on:
> 
> ```
> discord-ext-voice-recv@ac04ea7b0941112e83767cf1c1469b408fa06748#egg=discord-ext-voice-recv
> ```
> 
> because it's **not valid PEP 508**, and `pipenv` is trying (and failing) to parse it as a requirement instead of a Git URL.
> 
> ---
> 
> ## ✅ Fix
> 
> Replace the invalid Git install line in your `Pipfile` with this correct PEP 508 syntax:
> 
> ```toml
> [packages]
> discord-ext-voice-recv = {git = "https://github.com/imayhaveborkedit/discord-ext-voice-recv.git", ref = "ac04ea7b0941112e83767cf1c1469b408fa06748", editable = true}
> ```
> 
> Or, if you don’t care about pinning the commit yet:
> 
> ```toml
> [packages]
> discord-ext-voice-recv = {git = "https://github.com/imayhaveborkedit/discord-ext-voice-recv.git", editable = true}
> ```
> 
> Then run:
> 
> ```bash
> pipenv install
> ```
> 
> ---
> 
> ### 🧠 Why this happens:
> 
> - `pip install -e "git+...#egg=..."` works with plain pip, but **Pipenv tries to parse that into PEP 508 format** and fails hard if the format doesn't match expectations.
> - Pipenv doesn’t support the old `@commit#egg=name` format directly inside `Pipfile`.
> 
> ---
> 
> ### ✅ Bonus: Checking install after
> 
> Once installed, confirm you can import it correctly:
> 
> ```bash
> pipenv run python -c "import discord.ext.voice_recv; print(discord.ext.voice_recv.__file__)"
> ```
> 
> If that works, you’re good to go.
> 
> Let me know if you want to pin that repo into a local folder instead (for offline or patched development), that’s also totally doable.
<!-- UID: 97fa43e3-e2d6-4772-adc3-f3c8b08f76af -->

---




>[!nexus_user] **User** - 07/12/2025 at 7:42 PM
> $ pipenv install
> Loading .env environment variables...
> Pipfile.lock not found, creating...
> Locking [packages] dependencies...
> Building requirements...
> Resolving dependencies...
> Success!
> Warning: INFO:pip.subprocessor:Running command git clone --filter=blob:none --quiet https://github.com/imayhaveborkedit/discord-ext-voice-recv.git 'C:\Users\foamy\AppData\Local\Temp\pip-temp-9b__ckps\discord-ext-voice-recv_7f1dbcb13a6240478e4d4527dbfd4b2c'
> WARNING:pipenv.patched.pip._internal.resolution.resolvelib.candidates:optimum 1.26.1 does not provide the extra 'onnx'
> INFO:pip.subprocessor:Running command git clone --filter=blob:none https://github.com/imayhaveborkedit/discord-ext-voice-recv.git 'C:\Users\foamy\AppData\Local\Temp\tmp26952ad7'
> INFO:pip.subprocessor:Cloning into 'C:\Users\foamy\AppData\Local\Temp\tmp26952ad7'...
> C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\patched\pip\_internal\models\link.py:443: PipDeprecationWarning: DEPRECATION: git+https://github.com/imayhaveborkedit/discord-ext-voice-recv.git#egg=discord-ext-voice-recv@ac04ea7b0941112e83767cf1c1469b408fa06748#egg=discord-ext-voice-recv contains an egg fragment with a non-PEP 508 name pip 25.0 will enforce this behaviour change. A possible replacement is to use the req @ url syntax, and remove the egg fragment. Discussion can be found at https://github.com/pypa/pip/issues/11617
>  deprecated(
> Traceback (most recent call last):
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\patched\pip\_internal\req\constructors.py", line 213, in parse_req_from_editable
>  req: Optional[Requirement] = Requirement(name)
>  ^^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\patched\pip\_vendor\packaging\requirements.py", line 117, in __init__
>  raise InvalidRequirement(f"Invalid URL: {req.url}")
> pipenv.patched.pip._vendor.packaging.requirements.InvalidRequirement: Invalid URL: ac04ea7b0941112e83767cf1c1469b408fa06748#egg=discord-ext-voice-recv
> 
> During handling of the above exception, another exception occurred:
> 
> Traceback (most recent call last):
>  File "<frozen runpy>", line 198, in _run_module_as_main
>  File "<frozen runpy>", line 88, in _run_code
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\Scripts\pipenv.exe\__main__.py", line 7, in <module>
>  # when invoked as python -m pip <command>
>  ^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\vendor\click\core.py", line 1157, in __call__
>  return self.main(*args, **kwargs)
>  ^^^^^^^^^^^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\cli\options.py", line 58, in main
>  return super().main(*args, **kwargs, windows_expand_args=False)
>  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\vendor\click\core.py", line 1078, in main
>  rv = self.invoke(ctx)
>  ^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\vendor\click\core.py", line 1688, in invoke
>  return _process_result(sub_ctx.command.invoke(sub_ctx))
>  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\vendor\click\core.py", line 1434, in invoke
>  return ctx.invoke(self.callback, **ctx.params)
>  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\vendor\click\core.py", line 783, in invoke
>  return __callback(*args, **kwargs)
>  ^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\vendor\click\decorators.py", line 92, in new_func
>  return ctx.invoke(f, obj, *args, **kwargs)
>  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\vendor\click\core.py", line 783, in invoke
>  return __callback(*args, **kwargs)
>  ^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\cli\command.py", line 209, in install
>  do_install(
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\routines\install.py", line 93, in do_install
>  do_init(
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\routines\install.py", line 653, in do_init
>  do_lock(
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\routines\lock.py", line 66, in do_lock
>  venv_resolve_deps(
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\utils\resolver.py", line 899, in venv_resolve_deps
>  return prepare_lockfile(
>  ^^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\utils\locking.py", line 148, in prepare_lockfile
>  lockfile_entry = get_locked_dep(project, dep, pipfile, current_entry)
>  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\utils\locking.py", line 131, in get_locked_dep
>  lockfile_entry = clean_resolved_dep(project, dep, is_top_level, current_entry)
>  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\utils\dependencies.py", line 277, in clean_resolved_dep
>  potential_hashes = unearth_hashes_for_dep(project, dep)
>  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\utils\dependencies.py", line 189, in unearth_hashes_for_dep
>  install_req, markers, _ = install_req_from_pipfile(dep["name"], dep)
>  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\utils\dependencies.py", line 1097, in install_req_from_pipfile
>  install_req, _ = expansive_install_req_from_line(
>  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\utils\dependencies.py", line 962, in expansive_install_req_from_line
>  return install_req_from_editable(pip_line, line_source), name
>  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\patched\pip\_internal\req\constructors.py", line 240, in install_req_from_editable
>  parts = parse_req_from_editable(editable_req)
>  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>  File "C:\Users\foamy\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\site-packages\pipenv\patched\pip\_internal\req\constructors.py", line 215, in parse_req_from_editable
>  raise InstallationError(f"Invalid requirement: '{name}'")
> pipenv.patched.pip._internal.exceptions.InstallationError: Invalid requirement: 'discord-ext-voice-recv@ac04ea7b0941112e83767cf1c1469b408fa06748#egg=discord-ext-voice-recv'
<!-- UID: d94692bb-e522-4dcf-ad03-961cdd36740a -->




>[!nexus_agent] **Assistant** - 07/12/2025 at 7:47 PM
> Alright, we’re back to the original issue — which confirms **this is not about the `voice_recv` install anymore**. That part's working.
> 
> This is 100% about **the `discord` module being incorrectly loaded from the wrong place again**, even though your Pipfile says it should use your local `discord.py` clone.
> 
> Let’s **nail it down cleanly**.
> 
> ---
> 
> ## ✅ Step-by-step diagnosis
> 
> ### 1. Run this to **verify where Python is importing `discord` from**
> 
> ```bash
> pipenv run python -c "import discord; print(discord.__file__)"
> ```
> 
> You want to see something like:
> 
> ```
> C:\Users\foamy\devel\duck\versions\2_0\discord.py\discord\__init__.py
> ```
> 
> If instead you see:
> 
> ```
> C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages\discord\__init__.py
> ```
> 
> then we are **still not using your local dev version**, even though pip *thinks* it is.
> 
> ---
> 
> ### 2. Confirm `pipenv graph` shows the right thing
> 
> Run this:
> 
> ```bash
> pipenv graph | grep discord
> ```
> 
> You should see:
> ```
> discord-py @ file:///C:/Users/foamy/devel/duck/versions/2_0/discord.py
> ```
> 
> If you see something like `discord.py==2.3.2` or anything that’s not a local path, you’ve got a bad install.
> 
> ---
> 
> ## 🧹 If you're still loading from site-packages:
> 
> Manually nuke the leftovers:
> 
> ```bash
> rm -rf C:/Users/foamy/.virtualenvs/2_0-xfNAyVgc/Lib/site-packages/discord
> rm -rf C:/Users/foamy/.virtualenvs/2_0-xfNAyVgc/Lib/site-packages/discord*.dist-info
> ```
> 
> Then **reinstall** your local dev version:
> 
> ```bash
> cd C:/Users/foamy/devel/duck/versions/2_0
> pipenv install -e ./discord.py[voice]
> ```
> 
> Then re-test:
> 
> ```bash
> pipenv run python -c "import discord; print(discord.__file__)"
> ```
> 
> ---
> 
> ### 🧠 What’s going on?
> 
> - Python loads modules based on `sys.path`, which Pipenv configures from the venv.
> - Even if Pipenv says “we’re using an editable install,” **Python doesn’t override installed site-packages unless the editable path is first in `sys.path`**.
> - If an old `discord` dir is still present in `site-packages/`, it gets picked up first.
> 
> This is a **known quirk of editable installs + namespace packages**.
> 
> ---
> 
> ### ✅ Optional: Use `PIPENV_VENV_IN_PROJECT=1`
> 
> You can *avoid this problem forever* by creating your virtualenv **inside the project** so that its environment doesn’t share a big pool with others.
> 
> ```bash
> cd ./duck/versions/2_0
> set PIPENV_VENV_IN_PROJECT=1
> pipenv --rm
> pipenv install
> pipenv install -e ./discord.py[voice]
> ```
> 
> This puts the venv in `./.venv/`, keeps things isolated, and avoids pipenv/path confusion.
> 
> ---
> 
> Let me know the result of `print(discord.__file__)`. That will tell us exactly where the ghost is.
<!-- UID: 148377c4-0d30-46ab-88c3-895e78d934a4 -->

---




>[!nexus_user] **User** - 07/12/2025 at 7:47 PM
> $ pipenv run python -c "import discord.ext.voice_recv; print(discord.ext.voice_recv.__file__)"
> Loading .env environment variables...
> Traceback (most recent call last):
>  File "<string>", line 1, in <module>
>  File "C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages\discord\ext\voice_recv\__init__.py", line 3, in <module>
>  from .voice_client import *
>  File "C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages\discord\ext\voice_recv\voice_client.py", line 16, in <module>
>  from .reader import AudioReader
>  File "C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages\discord\ext\voice_recv\reader.py", line 13, in <module>
>  from .sinks import AudioSink
>  File "C:\Users\foamy\.virtualenvs\2_0-xfNAyVgc\Lib\site-packages\discord\ext\voice_recv\sinks.py", line 57, in <module>
>  class VoiceRecvException(discord.DiscordException):
>  ^^^^^^^^^^^^^^^^^^^^^^^^
> AttributeError: module 'discord' has no attribute 'DiscordException'
<!-- UID: 1e105573-be65-470a-8075-ab47c9a1d02c -->




>[!nexus_agent] **Assistant** - 07/12/2025 at 7:48 PM
> **Boom — that's the smoking gun.**
> 
> When `print(discord.__file__)` returns `None`, that means:
> 
> - `discord` is **not** a regular Python package (i.e., no `__init__.py` file in the `discord/` directory).
> - Or worse — you're hitting a broken namespace package or import conflict, where Python thinks `discord` exists (enough to import it), but it can’t resolve it to a file.
> 
> ---
> 
> ## 🧠 So what happened?
> 
> You likely have:
> 
> 1. Your editable install of `discord.py` in `./discord.py`, which should contain a `discord/` folder.
> 2. A stale or broken `discord.pth`, `.egg-link`, or namespace residue somewhere in your venv or build cache.
> 3. Possibly a corrupted editable install that pipenv *thinks* is there but isn’t properly.
> 
> ---
> 
> ## ✅ Fix: Nuke and rebuild from clean state
> 
> Here's how to wipe the mess and start clean:
> 
> ### 1. 🚽 **Manually remove bad packages**
> Nuke anything `discord` from the venv:
> 
> ```bash
> rm -rf C:/Users/foamy/.virtualenvs/2_0-xfNAyVgc/Lib/site-packages/discord*
> ```
> 
> Check for these:
> - `discord/`
> - `discord.py-*dist-info/`
> - `discord_ext_voice_recv-*dist-info/`
> - Any `*.egg-link` file referencing `discord.py`
> 
> Also check:
> ```bash
> type C:/Users/foamy/.virtualenvs/2_0-xfNAyVgc/Lib/site-packages/easy-install.pth
> ```
> See if `discord` is mentioned — delete that line if so.
> 
> ---
> 
> ### 2. 🔁 Reinstall your local `discord.py`
> 
> ```bash
> cd C:/Users/foamy/devel/duck/versions/2_0
> pipenv install -e ./discord.py[voice]
> ```
> 
> Make sure the local copy has this structure:
> 
> ```
> discord.py/
> ├── discord/ <-- this folder MUST exist
> │ ├── __init__.py <-- must exist
> │ └── client.py (etc.)
> ├── setup.py
> └── pyproject.toml
> ```
> 
> If you're missing `__init__.py` in `discord/`, Python won’t treat it as a proper module.
> 
> ---
> 
> ### 3. ✅ Verify it loaded correctly
> 
> ```bash
> pipenv run python -c "import discord; print(discord.__file__)"
> ```
> 
> You want to see:
> 
> ```
> C:\Users\foamy\devel\duck\versions\2_0\discord.py\discord\__init__.py
> ```
> 
> If you get that, your `voice_recv` problem will vanish.
> 
> ---
> 
> ### 🔒 Optional: Pin your venv inside the project
> 
> If you're tired of venv ghost-chasing forever:
> 
> ```bash
> cd C:/Users/foamy/devel/duck/versions/2_0
> set PIPENV_VENV_IN_PROJECT=1
> pipenv --rm
> pipenv install
> pipenv install -e ./discord.py[voice]
> ```
> 
> That keeps your environment in `./.venv/` and avoids cross-contamination from global venvs.
> 
> ---
> 
> Let me know if you want me to validate the repo structure or setup files — we can fix this for good. You're very close.
<!-- UID: 70d1ea43-94cb-426c-9072-eaf21e7bddf3 -->

---




>[!nexus_user] **User** - 07/12/2025 at 7:48 PM
> $ pipenv run python -c "import discord; print(discord.__file__)"
> Loading .env environment variables...
> None
<!-- UID: e04e4a51-3463-4c79-bc9c-0ea3c06ce43f -->


