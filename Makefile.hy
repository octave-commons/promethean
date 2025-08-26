(import sys)
(import mk.generator [collect-commands render-makefile handle-command])

(setv data (collect-commands))
(setv commands (get data "commands"))
(setv patterns (get data "patterns"))
(setv exceptions (get data "exceptions"))

(defn generate-makefile []
  (render-makefile commands patterns))

(setv (get commands "generate-makefile") generate-makefile)

(defn main []
  (handle-command sys.argv commands patterns exceptions))

(when (= __name__ "__main__")
  (main))
