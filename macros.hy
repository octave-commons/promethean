

;; -----------------------------------------------------------------------------
;; Macros
;; -----------------------------------------------------------------------------
(defmacro define-service-list [name root-dir &optional [exclude []]]
  `(setv ~name
         (list
           ~@(for [p (sorted (glob.glob (str ~root-dir "/*")))]
               (if (and (isdir p)
                        (not (in (basename p) ~exclude)))
                   `~p)))))

(defmacro define-patterns [&rest groups]
  `(setv patterns
     (list
      ~@(for [[lang commands] groups
              [action fn] commands]
          `[~(str action "-" lang "-service-") ~fn]))))

(defmacro defn-cmd [name args &rest body]
  `(setv @name (let [[func (fn @args ~@body)]]
                 (.append commands
                          [(quote @name) func])
                 func)))

