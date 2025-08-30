(import json)
(import os.path [isfile])
(import mk.util [sh])
(import sys)

(import mk.commands [load])

(defn collect-commands [[descriptor-path "mk/commands.json"]]
  "Load command definitions and optional JSON descriptors."
  (setv data (load))
  (setv commands (get data "commands"))
  (setv patterns (get data "patterns"))
  (setv exceptions (get data "exceptions"))
  (when (isfile descriptor-path)
    (with [f (open descriptor-path)]
      (for [[name cmd] (.items (json.load f))]
        (setv (get commands name)
              (fn [] (sh cmd :shell True))))))
  {"commands" commands "patterns" patterns "exceptions" exceptions})

(defn render-rules [patterns]
  "Render PHONY and rule blocks from patterns."
  (setv phony-lines [])
  (setv rule-lines [])
  (for [[prefix func] patterns]
    (when (not (= prefix ""))
      (setv target (.replace prefix "%" "%"))
      (when (not (in target phony-lines))
        (+= phony-lines [target])
        (+= rule-lines [(+ target "%:\n\t@hy Makefile.hy $@")]))))
  {"phony-lines" phony-lines "rule-lines" rule-lines})

(defn render-makefile [commands patterns [path "Makefile"]]
  "Write a Makefile from commands and patterns."
  (setv header "# Auto-generated Makefile. DO NOT EDIT MANUALLY.\n\n")
  (setv command-section (.join "" ["COMMANDS := \\\n  " (.join " \\\n  " commands) "\n\n"]))
  (setv rendered (render-rules patterns))
  (setv phony-lines (get rendered "phony-lines"))
  (setv rule-lines (get rendered "rule-lines"))
  (setv static-phony ".PHONY: \\\n  $(COMMANDS) \\\n  ")
  (setv phony-block (.join " \\\n  " phony-lines))
  (setv rules (.join "\n\n" rule-lines))
  (with [f (open path "w")]
    (.write f header)
    (.write f command-section)
    (.write f static-phony)
    (.write f phony-block)
    (.write f "\n\n")
    (.write f "$(COMMANDS):\n\t@hy Makefile.hy $@\n\n")
    (.write f rules)
    (.write f "\n")))

(defn handle-command [argv commands patterns exceptions]
  "Dispatch a command based on argv."
  (if (< (len argv) 2)
      (do (print "No command provided") (sys.exit 1))
      (let [cmd (get argv 1)]
        (if (in cmd commands)
            ((get commands cmd))
            (do
              (setv handled False)
              (for [[prefix func] patterns]
                (when (.startswith cmd prefix)
                  (func (.replace cmd prefix "" 1))
                  (setv handled True)
                  (break)))
              (unless handled
                (print (.format "Unknown command: {}" cmd))
                (sys.exit 1))))
        (when (> (len exceptions) 0)
          (print "commands failed:" #* (lfor [name e] exceptions name))
          (.exit sys 1)))))
