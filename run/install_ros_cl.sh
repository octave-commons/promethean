#!/usr/bin/env bash
set -euo pipefail

# Roswell (Common Lisp env/impl manager)
# macOS: brew install roswell
# Linux: follow distro instructions then:
ros setup     # initializes ~/.roswell

# Common Lisp implementation (SBCL) via Roswell
ros install sbcl || true
ros use sbcl   # ensure Roswell picks SBCL

# Ensure Roswell bin on PATH for the current session
export PATH="${HOME}/.roswell/bin:${PATH}"
# Quicklisp inside SBCL (first run triggers Quicklisp bootstrap)
# Quicklisp inside SBCL (first run triggers Quicklisp bootstrap)
if [ ! -d "${HOME}/quicklisp" ]; then
  curl -fsSL -o /tmp/quicklisp.lisp https://beta.quicklisp.org/quicklisp.lisp
  ros -L sbcl run -- --non-interactive \
    --load /tmp/quicklisp.lisp \
    --eval '(quicklisp-quickstart:install)' \
    --eval '(ql:add-to-init-file)' \
    --quit
fi

ros install cxxxr/cl-lsp
# verify:
~/.roswell/bin/cl-lsp --help
ros install cxxxr/sblint
~/.roswell/bin/sblint -h
