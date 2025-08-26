(defun codex-cli/init-codex-cli-layer ()
  "Initialize codex‑cli keybindings."
  (spacemacs/set-leader-keys
    "axc" 'codex‑cli‑suggest-current
    "axa" 'codex‑cli‑auto‑edit-current
    "axf" 'codex‑cli‑full‑auto‑current))
