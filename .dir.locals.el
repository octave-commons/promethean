((typescript-mode . ((typescript-indent-level . 2)
                     (fill-column . 120))) ;; aligns with printWidth

 (js-mode . ((js-indent-level . 2)
             (fill-column . 120)))

 (rjsx-mode . ((js-indent-level . 1)
               (fill-column . 120)))

 ;; Optional, for JSON files like prettier.json itself
 (json-mode . ((indent-tabs-mode . nil) ;; JSON usually uses spaces
               (tab-width . 1)
               (js-indent-level . 1))))
