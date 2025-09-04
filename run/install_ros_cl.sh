#!/usr/bin/env bash
# Roswell (Common Lisp env/impl manager)
# macOS: brew install roswell
# Linux: follow distro instructions then:
ros setup     # initializes ~/.roswell

# Common Lisp implementation (SBCL) via Roswell
ros install sbcl
ros use sbcl   # ensure Roswell picks SBCL

# Quicklisp inside SBCL (first run triggers Quicklisp bootstrap)
ros run
# in the SBCL prompt:
# (load "quicklisp.lisp")  ; if downloaded, or follow quicklisp.org bootstrap
# (quicklisp-quickstart:install)
# (ql:add-to-init-file)
# (ql:quickload "quicklisp-slime-helper")
# (quit)

ros install cxxxr/cl-lsp
# verify:
~/.roswell/bin/cl-lsp --help
ros install cxxxr/sblint
~/.roswell/bin/sblint -h
