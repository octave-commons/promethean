

;; -----------------------------------------------------------------------------
;; Macros
;; -----------------------------------------------------------------------------
(import os.path [isdir basename])
(import glob)

(defmacro define-service-list [name root-dir #* f]
          `(setv ~name
                 (lfor p (filter (fn [path] ~@f)(sorted (glob.glob (+ ~root-dir "/*"))))
                       :if (isdir p)
                       p)))




(defmacro defn-cmd [name args #* body]
          `(setv (get commands (str (quote ~name)))
                 (setx ~name (fn ~args (try ~@body
                                            (except [e Exception]
                                                    (.append exceptions [
                                                             (str (quote ~name))
                                                             e ])))))))

