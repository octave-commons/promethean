---
uuid: 2d0982f7-7518-432a-80b3-e89834cf9ab3
created_at: i3-config-validation-methods.md
filename: i3 Config Validation Methods
title: i3 Config Validation Methods
description: >-
  Explains how to validate i3 config files without disrupting your current
  session. Provides three methods: using `i3 -C` for syntax checks, running i3
  in a nested X server with Xephyr for sandboxed testing, and inline validation
  for automation scripts.
tags:
  - i3
  - config validation
  - syntax check
  - Xephyr
  - sandbox testing
  - automation
---
Good question — you don’t want to risk a bad config soft-locking your session. ^ref-d28090ac-1-0

There’s no `i3 --check-config` switch (like with `nginx -t`), but i3 actually **does parse and validate configs at startup**. The trick is to point i3 at your config file in a way that doesn’t replace your real session. You’ve got a couple of options: ^ref-d28090ac-3-0

---

### 1. Use `i3 -C` (check config only)

Run: ^ref-d28090ac-9-0

```bash
i3 -C -c /path/to/your/config
```
^ref-d28090ac-11-0 ^ref-d28090ac-14-0
 ^ref-d28090ac-15-0
* `-C` tells i3 to check the config and exit. ^ref-d28090ac-16-0
* `-c` lets you pass an alternate config path. ^ref-d28090ac-17-0
* If there are errors, they’ll print to stderr. If all’s well, you’ll see nothing or just some info logs.

This is the **safe** way — it doesn’t start a new X session or kill your current one.

---

### 2. Run i3 in a nested X server (sandbox)
 ^ref-d28090ac-25-0
If you want to **see** how the config behaves without replacing your WM:
 ^ref-d28090ac-27-0
```bash
Xephyr -br -ac -noreset -screen 1280x720 :1 &
DISPLAY=:1 i3 -c /home/err/.config/i3/config
^ref-d28090ac-27-0
``` ^ref-d28090ac-32-0
^ref-d28090ac-28-0
 ^ref-d28090ac-33-0 ^ref-d28090ac-34-0
* Starts a fresh X server inside a window (`Xephyr`). ^ref-d28090ac-34-0
* Runs i3 with your config inside that sandbox.
* Lets you test without risking your real session.

---
 ^ref-d28090ac-40-0
### 3. Inline validation for automation ^ref-d28090ac-40-0

If you’re scripting, you can parse logs:

```bash
i3 -C -c /path/to/config 2>&1 | grep ERROR
``` ^ref-d28090ac-46-0

That way you can CI-check your dotfiles before deploying them.
 ^ref-d28090ac-50-0
--- ^ref-d28090ac-50-0

👉 Question for you: ^ref-d28090ac-53-0
Do you want **just syntax checking** (like `-C` gives you), or do you want to actually **sandbox-run the config** (like with Xephyr) so you can check keybind behavior and window rules too?
