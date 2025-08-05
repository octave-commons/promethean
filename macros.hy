

;; -----------------------------------------------------------------------------
;; Macros
;; -----------------------------------------------------------------------------
(import os.path [isdir basename])
(import glob)
(defmacro list-comp [expr binding source condition]
          `(list
            [~expr
            for ~binding in ~source
            ~@(if condition ['if condition] [])]))
(import glob)
(import os.path [isdir])

(defmacro define-service-list [name root-dir]
          `(setv ~name
                 (lfor p (sorted (glob.glob (+ ~root-dir "/*")))
                       :if (isdir p)
                       p)))




;; (defmacro define-service-list [name root-dir]
;;           `(setv ~name
;;                  (list-comp
;;                   p
;;                   [[p] (sorted (glob.glob (+ ~root-dir "/*")))]
;;                   (isdir p))))


(defmacro define-patterns [#* groups]
  `(setv patterns
     (list
      ~@(for [[lang commands] groups
              [action fn] commands]
              `[~(str (+ action "-" lang "-service-")) ~fn]))))

(defmacro defn-cmd [name args #* body]
          `(.append commands
                    [(quote ~name) (setx ~name (fn ~args ~@body))]))

