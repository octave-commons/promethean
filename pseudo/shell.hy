(import util [sh run-dirs])
(defmacro is-shell-escappe [])
(defmacro some [])
(defmacro shell-cmd [cwd name #* args]
          (setv arg-strings (lfor arg args
                                  (if (is-shell-escape arg)
                                      arg
                                      `(str (quote ~arg)))))
          `(sh [(str (quote ~name))
               ~@arg-strings ]
               :cwd ~cwd
               :shell True))
(defmacro shell [cwd #* cmds]
          (setv cmds (lfor cmd (let [cmd-name (str (quote (get cmd [0])))
                                    main-arg-string  (str (quote (get cmd [1])))
                                    ]
                                    (if (some ["lfor","for"] (= cmd-name ))
                                        `(for (shell ~cwd ))
                                        (= cmd-name "cd")
                                        `(setv cwd ~main-arg-string)
                                        `(shell-cmd cwd ~@cmd)
                                        ))))
          `(do
            (setv cwd ~cwd)
            ~@cmds))
(shell "./cwd/path"
 (python -m pipenv sync --dev)
 (pip3 install torch torchvision torchaudio --index-url "https://download.pytorch.org/whl/cu128")
 (flake8 ~(join "foo/" "bar"))
 (for [d SERVICES_PY]
      
      (python -m pip install --user -r requirements.txt) ))
