(ns mk.macros)

;; Hy macros were used to auto-register commands and build service lists.
;; In the Babashka port:
;; - Command registration is handled declaratively in `bb.edn :tasks`.
;; - Service discovery is implemented as plain functions in `mk.configs`.
;; This namespace intentionally remains minimal.

