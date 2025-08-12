(defun dotspacemacs/layers ()
  (setq-default
   dotspacemacs-distribution 'spacemacs
   dotspacemacs-enable-lazy-installation 'unused
   dotspacemacs-ask-for-lazy-installation nil
   dotspacemacs-configuration-layer-path '()
   dotspacemacs-elpa-subdirectory 'emacs-version
   dotspacemacs-install-packages 'used-only
   dotspacemacs-configuration-layers
   '(
     (spacemacs-evil)  ; vim keys
     (ivy)
     (git)
     emacs-lisp
     markdown
     org
     )
   dotspacemacs-additional-packages '()
   dotspacemacs-excluded-packages '()))

(defun dotspacemacs/init ()
  (setq-default
   dotspacemacs-editing-style 'vim
   dotspacemacs-verbose-loading nil
   dotspacemacs-elpa-https t
   dotspacemacs-elpa-timeout 10
   dotspacemacs-check-for-update nil
   dotspacemacs-startup-lists '()
   dotspacemacs-startup-banner 'official))

(defun dotspacemacs/user-init ()
  ;; Keep rescue packages isolated from your main profile
  (setq package-user-dir (expand-file-name "elpa" user-emacs-directory)))

(defun dotspacemacs/user-config ()
  (global-display-line-numbers-mode 1)
  (setq inhibit-startup-screen t))
