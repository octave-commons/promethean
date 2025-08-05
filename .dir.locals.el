((typescript-mode . ((indent-tabs-mode . t)
                     (tab-width . 2)
                     (typescript-indent-level . 2)
                     (fill-column . 120))) ;; aligns with printWidth

 (js-mode . ((indent-tabs-mode . t)
             (tab-width . 2)
             (js-indent-level . 2)
             (fill-column . 120)))

 (rjsx-mode . ((indent-tabs-mode . t)
               (tab-width . 2)
               (js-indent-level . 2)
               (fill-column . 120)))

 ;; Optional, for JSON files like prettier.json itself
 (json-mode . ((indent-tabs-mode . nil) ;; JSON usually uses spaces
               (tab-width . 2)
               (js-indent-level . 2)))
 )
