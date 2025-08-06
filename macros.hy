

;; -----------------------------------------------------------------------------
;; Macros
;; -----------------------------------------------------------------------------
(import os.path [isdir basename])
(import glob)

(defmacro define-service-list [name root-dir]
          `(setv ~name
                 (lfor p (sorted (glob.glob (+ ~root-dir "/*")))
                       :if (isdir p)
                       p)))




(defmacro defn-cmd [name args #* body]
          `(setv (get commands (str (quote ~name)))
                 (setx ~name (fn ~args ~@body)))
          )


