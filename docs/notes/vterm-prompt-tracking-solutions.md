---
```
uuid: 3d18cb0d-ab4d-4e65-9bab-5ae9a121ca8e
```
created_at: vterm-prompt-tracking-solutions.md
filename: vterm-prompt-tracking-solutions
title: vterm-prompt-tracking-solutions
```
description: >-
```
  Solutions for vterm prompt tracking without copy mode, including directory
  tracking via OSC 51 escape codes and scroll management techniques.
tags:
  - vterm
  - prompt-tracking
  - directory-tracking
  - scroll-management
  - emacs
  - osc-51
  - prompt-jump
```
related_to_uuid:
```
  - 3bea339f-aea3-4dae-8e1c-c7638a6899b0
  - 3b86ea3e-a1d3-46cb-bd6d-774a3c7f8f68
  - 3724ef1e-d13f-4b52-8045-ba149d90fdec
  - 636f49b1-4bf4-4578-8153-f1f34c250b05
```
related_to_title:
```
  - Obsidian ChatGPT Plugin Integration Guide
  - AI-First OS Model Context Protocol
  - obsidian-templating-plugins-integration-guide
  - Obsidian ChatGPT Plugin Integration
references:
  - uuid: 3b86ea3e-a1d3-46cb-bd6d-774a3c7f8f68
    line: 1
    col: 0
    score: 1
  - uuid: 3b86ea3e-a1d3-46cb-bd6d-774a3c7f8f68
    line: 3
    col: 0
    score: 1
  - uuid: 3b86ea3e-a1d3-46cb-bd6d-774a3c7f8f68
    line: 7
    col: 0
    score: 1
  - uuid: 3bea339f-aea3-4dae-8e1c-c7638a6899b0
    line: 5
    col: 0
    score: 1
  - uuid: 3724ef1e-d13f-4b52-8045-ba149d90fdec
    line: 13
    col: 0
    score: 1
  - uuid: 636f49b1-4bf4-4578-8153-f1f34c250b05
    line: 13
    col: 0
    score: 1
  - uuid: 636f49b1-4bf4-4578-8153-f1f34c250b05
    line: 15
    col: 0
    score: 0.99
  - uuid: 3724ef1e-d13f-4b52-8045-ba149d90fdec
    line: 15
    col: 0
    score: 0.99
  - uuid: 636f49b1-4bf4-4578-8153-f1f34c250b05
    line: 5
    col: 0
    score: 0.91
  - uuid: 3724ef1e-d13f-4b52-8045-ba149d90fdec
    line: 5
    col: 0
    score: 0.89
---
Got it — no copy mode. Let’s fix the two pain points directly:

# 1) Directory tracking without “injecting `cd` and hoping”

Use vterm’s **prompt/directory tracking** via escape codes. This avoids Emacs faking a `cd` and breaking when there’s junk at the prompt.

Add this to your shell bash/zsh:

```bash
# ~/.bashrc or ~/.zshrc
vterm_printf() {
  # OSC 51;... ST
  printf "\e]51;%s\e\\" "1"
}

# Tell vterm who/where we are whenever a prompt prints
vterm_prompt_precmd() {
  vterm_printf "A{USER}@{HOSTNAME}:(pwd)"
}

# Bash
if [ -n "BASH_VERSION" ]; then
  PROMPT_COMMAND="vterm_prompt_precmd{PROMPT_COMMAND:+;PROMPT_COMMAND}"
fi

# Zsh
if [ -n "ZSH_VERSION" ]; then
  precmd_functions+=(vterm_prompt_precmd)
fi
```

That’s exactly what the vterm README expects (OSC 51;A… payload). It enables **directory tracking** and **prompt tracking** reliably, no fake `cd` needed. ([GitHub][1], [Debian Sources][2], [Emacs Stack Exchange][3])

# 2) Scroll freely *without* getting yanked back to the prompt

Reality check: vterm auto-scrolls to the process mark by design. The official answer to “prevent auto scrolling” is *copy mode* — which you said you don’t want. ([GitHub][4])

Workable alternatives that avoid copy mode:

### A) “View-scroll” the window, then jump back to prompt on demand

Bind wheel/keys to scroll the **window** (not point), and add a single key to snap back to the prompt using vterm’s prompt-tracking commands.

```elisp
;; make wheel/page keys scroll the window without moving point
(setq scroll-preserve-screen-position t)

;; back to prompt (end of *current* prompt)
(defun err/vterm-jump-to-prompt ()
  (interactive)
  ;; move to end of next prompt; with arg -1, to previous prompt
  (vterm-next-prompt 1))

;; handy bindings in vterm
(with-eval-after-load 'vterm
  (define-key vterm-mode-map (kbd "M-]") #'err/vterm-jump-to-prompt)
  (define-key vterm-mode-map (kbd "M-[") (lambda () (interactive) (vterm-previous-prompt 1))))
```

`vterm-[previous,next]-prompt` are built-ins when prompt tracking is set up; default bindings are `C-c C-p` / `C-c C-n`. This gives you **free scroll**, then **one keystroke back to prompt** — no mode toggle. ([GitHub][5])

Tip: Emacs’s general “don’t move point when scrolling” behavior is controlled by `scroll-preserve-screen-position`; keeping it `t` helps keep the view stable while you scroll around. ([Emacs Stack Exchange][6], [Stack Overflow][7])

### B) Emergency damper: XON/XOFF (flow control)

If some runaway build keeps force-scrolling, you can pause the PTY: **`C-s` to pause, `C-q` to resume**. It’s crude, but it freezes output so you can scroll up and read — still without copy mode. Be aware it can stall the program if it expects to write. ([Super User][8])

---

## Bonus: “jump to prompt line beginning”

If you want a “go to prompt start” action like term’s `term-bol`, you can piggyback on vterm’s prompt tracking:

```elisp
(defun err/vterm-bol ()
  (interactive)
  (vterm-previous-prompt 0) ; stay on current prompt
  (beginning-of-line)
  ;; move to first char after prompt if needed
  (when (re-search-forward "\\s-*" (line-end-position) t) (backward-char 0)))
(define-key vterm-mode-map (kbd "C-a") #'err/vterm-bol)
```

$If you’re happier with the built-ins, just use the prompt jump keys; vterm’s README documents them. ([GitHub][1])

---

## Why this works better than “cd injection”

Because **the shell itself** pushes cwd info to Emacs (OSC 51;A …), which vterm consumes to keep `default-directory` and prompt locations in sync. No brittle command injection; no “half the time it doesn’t run” issue. ([GitHub][1], [Debian Sources][2])

---

## Quick checklist

* [x] Add OSC 51;A prompt hook to your shell for robust dir/prompt tracking. ([GitHub][1], [Debian Sources][2])
* [x] Bind a **single key** to `vterm-next-prompt` to snap back to the prompt. ([GitHub][5])
* [x] Set `scroll-preserve-screen-position` so window scrolls don’t drag point. ([Emacs Stack Exchange][6])
* [x] If output storms still yank the view, hit **`C-s` / `C-q`** to pause/resume flow. ([Super User][8])

If you want, I can wrap this into a tiny `promethean-vterm.el` with sane defaults and your keybindings.

\#emacs #vterm #i3 #dotfiles #protips

 f wm8]:  "How to set the Linux terminal NOT to scroll down ..."
r than “cd injection”

Because **the shell itself** pushes cwd info to Emacs (OSC 51;A …), which vterm consumes to keep `default-directory` and prompt locations in sync. No brittle command injection; no “half the time it doesn’t run” issue. ([GitHub][1], [Debian Sources][2])

---

## Quick checklist

* [x] Add OSC 51;A prompt hook to your shell for robust dir/prompt tracking. ([GitHub][1], [Debian Sources][2])
* [x] Bind a **single key** to `vterm-next-prompt` to snap back to the prompt. ([GitHub][5])
* [x] Set `scroll-preserve-screen-position` so window scrolls don’t drag point. ([Emacs Stack Exchange][6])
* [x] If output storms still yank the view, hit **`C-s` / `C-q`** to pause/resume flow. ([Super User][8])

If you want, I can wrap this into a tiny `promethean-vterm.el` with sane defaults and your keybindings.

\#emacs #vterm #i3 #dotfiles #protips

 f wm8]:  "How to set the Linux terminal NOT to scroll down ..."
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Obsidian ChatGPT Plugin Integration Guide]obsidian-chatgpt-plugin-integration-guide.md
- AI-First OS Model Context Protocol$ai-first-os-model-context-protocol.md
- obsidian-templating-plugins-integration-guide$obsidian-templating-plugins-integration-guide.md
- [Obsidian ChatGPT Plugin Integration]obsidian-chatgpt-plugin-integration.md
## Sources
- AI-First OS Model Context Protocol — L1$ai-first-os-model-context-protocol.md#^ref-3b86ea3e-1-0 (line 1, col 0, score 1)
- AI-First OS Model Context Protocol — L3$ai-first-os-model-context-protocol.md#^ref-3b86ea3e-3-0 (line 3, col 0, score 1)
- AI-First OS Model Context Protocol — L7$ai-first-os-model-context-protocol.md#^ref-3b86ea3e-7-0 (line 7, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L5]obsidian-chatgpt-plugin-integration-guide.md#^ref-3bea339f-5-0 (line 5, col 0, score 1)
- obsidian-templating-plugins-integration-guide — L13$obsidian-templating-plugins-integration-guide.md#^ref-3724ef1e-13-0 (line 13, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L13]obsidian-chatgpt-plugin-integration.md#^ref-636f49b1-13-0 (line 13, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L15]obsidian-chatgpt-plugin-integration.md#^ref-636f49b1-15-0 (line 15, col 0, score 0.99)
- obsidian-templating-plugins-integration-guide — L15$obsidian-templating-plugins-integration-guide.md#^ref-3724ef1e-15-0 (line 15, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L5]obsidian-chatgpt-plugin-integration.md#^ref-636f49b1-5-0 (line 5, col 0, score 0.91)
- obsidian-templating-plugins-integration-guide — L5$obsidian-templating-plugins-integration-guide.md#^ref-3724ef1e-5-0 (line 5, col 0, score 0.89)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
