;;; llm-tools.el --- Core LLM tools for GPTEL -*- lexical-binding: t; -*-
(require 'gptel)

(defun gptel--read-file (path &optional max-bytes)
  "Return contents of PATH (string). If MAX-BYTES is non-nil, hard-cap read."
  (let ((abs (expand-file-name path)))
    (unless (file-readable-p abs)
      (error "error: file %s is not readable" abs))
    (with-temp-buffer
      (let ((file-size (nth 7 (file-attributes abs))))
        (when (and max-bytes (> file-size max-bytes))
          (error "error: file %s is larger than max-bytes (%s > %s)"
            abs file-size max-bytes)))
      (insert-file-contents-literally abs nil 0 max-bytes)
      (buffer-string))))

(defun gptel--write-file (path content &optional overwrite parents)
  "Write CONTENT to PATH. If OVERWRITE is nil and file exists, error.
If PARENTS non-nil, create parent directories."
  (let* ((abs (expand-file-name path))
          (dir (file-name-directory abs)))
    (when (and parents dir (not (file-directory-p dir)))
      (make-directory dir t))
    (when (and (file-exists-p abs) (not overwrite))
      (error "error: file %s exists and overwrite=false" abs))
    (with-temp-buffer
      (insert content)
      (write-region (point-min) (point-max) abs nil 'silent))
    (format "wrote %d bytes to %s" (length content) abs)))

(defun gptel--list-dir (dir &optional full)
  "Return vector of entries (alist) for DIR.
If FULL non-nil, include absolute paths; else names."
  (let* ((abs (file-name-as-directory (expand-file-name (or dir ".")))))
    (unless (file-directory-p abs)
      (error "error: %s is not a directory" abs))
    (let ((entries (directory-files abs t directory-files-no-dot-files-regexp)))
      (json-serialize
        (cl-map 'vector
          (lambda (p)
            (let* ((attrs (file-attributes p))
                    (is-dir (eq t (car attrs)))
                    (size (nth 7 attrs))
                    (name (if full p (file-name-nondirectory p))))
              `((name . ,name)
                 (path . ,p)
                 (type . ,(if is-dir "dir" "file"))
                 (size . ,(or size 0)))))
          entries)))))

(defun gptel--dir-tree (root &optional depth)
  "Return a simple text tree for ROOT up to DEPTH (default 3)."
  (let* ((abs (file-name-as-directory (expand-file-name (or root ".")))))
    (unless (file-directory-p abs)
      (error "error: %s is not a directory" abs))
    (let ((max-depth (or depth 3)))
      (cl-labels
        ((indent (n) (make-string (* 2 n) ? ))
          (lines (dir d)
            (let* ((children (directory-files dir t directory-files-no-dot-files-regexp))
                    (files (cl-remove-if #'file-directory-p children))
                    (dirs  (cl-remove-if-not #'file-directory-p children))
                    (entries (append (sort files #'string<)
                               (sort dirs  #'string<))))
              (append
                (mapcar (lambda (f) (format "%s- %s" (indent d) (file-name-nondirectory f))) files)
                (cl-mapcan
                  (lambda (sub)
                    (let ((header (format "%s+ %s/" (indent d) (file-name-nondirectory sub))))
                      (if (>= d max-depth)
                        (list header)
                        (cons header (lines sub (1+ d))))))
                  dirs)))))
        (string-join
          (cons (format "%s/" (directory-file-name abs))
            (lines abs 0))
          "\n")))))

(defun gptel--search-files (root pattern &optional name-glob max-results)
  "Search ROOT recursively for PATTERN (elisp regexp) in file contents.
Optionally restrict basenames with NAME-GLOB (shell glob).
Return JSON array of {file,line,col,snippet} up to MAX-RESULTS."
  (let* ((abs (file-name-as-directory (expand-file-name (or root "."))))
          (re pattern)
          (max (or max-results 500))
          (name-re (if (and name-glob (not (string-empty-p name-glob)))
                     (wildcard-to-regexp name-glob)
                     ".*"))
          (files (directory-files-recursively abs name-re))) ; basenames regex
    ;; NOTE: directory-files-recursively is the idiomatic way to walk trees. :contentReference[oaicite:3]{index=3}
    (cl-loop
      with results = (make-vector 0 nil)
      for f in files
      ;; Skip huge or binary-ish files to avoid stalls
      for attrs = (file-attributes f)
      for size  = (nth 7 attrs)
      when (and (numberp size) (< size (* 2 1024 1024))) ; 2MB soft cap
      do (with-temp-buffer
           (insert-file-contents f)
           (let ((ln 1)
                  (pos  (point-min)))
             (while (and (< (length results) max)
                      (re-search-forward re nil t))
               (let* ((end (line-end-position))
                       (beg (line-beginning-position))
                       (col (1- (- (point) beg)))
                       (snippet (buffer-substring-no-properties beg end)))
                 (setq results
                   (vconcat results
                     (vector `((file . ,f)
                                (line . ,ln)
                                (col  . ,col)
                                (snippet . ,snippet))))))
               (forward-line 0) (setq ln (line-number-at-pos)))
             ;; keep compiler quiet
             (ignore pos)))
      finally return (json-serialize results))))

(defun gptel--patch-apply (diff &optional root strip)
  "Apply unified DIFF (string) under ROOT using `patch`.
STRIP corresponds to `patch -p<strip>`. Returns JSON {exit,output}."
  (let* ((default-directory (file-name-as-directory
                              (expand-file-name (or root default-directory))))
          (tmp (make-temp-file "gptel-patch-" nil ".diff")))
    (unwind-protect
      (progn
        (with-temp-file tmp (insert diff))
        ;; Feed diff via stdin using call-process "infile" arg
        ;; (destination = current buffer)  :contentReference[oaicite:4]{index=4}
        (with-temp-buffer
          (let* ((exit (call-process "patch" tmp t t
                         (format "-p%d" (or strip 0))
                         "-s" "-N")) ; silent, skip already-applied hunks
                  (out  (buffer-string)))
            (json-serialize `((exit . ,exit) (output . ,out))))))
      (ignore-errors (delete-file tmp)))))

(defun gptel--exec-sync (command)
  "Run COMMAND synchronously via the shell. Return JSON {exit,stdout}."
  ;; call-process-shell-command is the canonical synchronous shell entrypoint. :contentReference[oaicite:5]{index=5}
  (with-temp-buffer
    (let* ((exit (call-process-shell-command command nil t t))
            (out  (buffer-string)))
      (json-serialize `((exit . ,exit) (stdout . ,out))))))

(defun gptel--spawn-async (command &optional buffer-name)
  "Start COMMAND asynchronously via shell. If BUFFER-NAME is given, stream output there; else no buffer.
Return JSON {name,pid,buffer}."
  ;; start-process-shell-command is the standard async shell launcher. :contentReference[oaicite:6]{index=6}
  (let* ((buf (when buffer-name (get-buffer-create buffer-name)))
          (name (format "gptel-proc:%s"
                  (substring command 0 (min 24 (length command)))))
          (proc (start-process-shell-command name buf command)))
    (json-serialize
      `((name . ,(process-name proc))
         (pid  . ,(or (process-id proc) -1))
         (buffer . ,(if buf (buffer-name buf) ""))))))

;;; --- helpers ---------------------------------------------------------------

(defun gptel--file-bytes (path &optional max-bytes)
  "Return up to MAX-BYTES of PATH as a raw (unibyte) string."
  (let ((coding-system-for-read 'binary))
    (with-temp-buffer
      (insert-file-contents-literally path nil 0 max-bytes)
      (buffer-string))))

(defun gptel--maybe-text (bytes)
  "Return decoded UTF-8 text if BYTES looks like valid UTF-8; else nil."
  (condition-case _
    (decode-coding-string bytes 'utf-8 t) ; 't' = no copy; errors raise
    (error nil)))

(defun gptel--safe-file-payload (path &optional max-bytes)
  "Return a plist describing PATH with text or base64 payload, truncated if needed."
  (let* ((max (or max-bytes (* 200 1024)))      ; 200KB safety default
          (attrs (file-attributes path))
          (size (and attrs (file-attribute-size attrs)))
          (bytes (gptel--file-bytes path max))
          (truncated (and size (> size (length bytes))))
          (text (gptel--maybe-text bytes)))
    (if text
      ;; Plain text payload
      `(:kind "text" :encoding "utf-8" :path ,(expand-file-name path)
         :size ,size :truncated ,(and truncated t) :content ,text)
      ;; Binary payload -> base64 (ASCII; safe for JSON)
      `(:kind "binary" :encoding "base64" :path ,(expand-file-name path)
         :size ,size :truncated ,(and truncated t)
         :content ,(base64-encode-string bytes t)))))

(defun gptel--ensure-under-project (path)
  "Refuse to touch files outside current project root (optional, but sane)."
  (let* ((root (or (and (fboundp 'project-root) (project-root (project-current)))
                 default-directory))
          (abs (expand-file-name path)))
    (unless (string-prefix-p (file-truename root) (file-truename abs))
      (error "Refusing to access %s outside project root %s" abs root))
    abs))
;;;###autoload
(defun llm-tools-setup ()
  (message "setting up llm tools")
  ;; (setq gptel-log-level 'trace
  ;;   debug-on-error t)
  ;; ---- filesystem ----

  (gptel-make-tool
    :name "read_file"
    :description "Read a file. Returns UTF-8 text when possible; otherwise base64 + metadata."
    :category "filesystem"
    :args (list '(:name "path" :type string :description "Path to file")
            '(:name "max_bytes" :type integer :optional t
               :description "Cap on bytes to read (default ~200KB)"))
    :function
    (lambda (path &optional max_bytes)
      (setq path (gptel--ensure-under-project path))
      (unless (file-exists-p path) (error "No such file: %s" path))
      ;; gptel’s helper turns non-text into base64 + mime-ish metadata.
      (if (fboundp 'gptel--safe-file-payload)
        (gptel--safe-file-payload path max_bytes)
        ;; fallback: read as utf-8
        (with-temp-buffer
          (let ((coding-system-for-read 'utf-8))
            (insert-file-contents path))
          (buffer-string)))))

  (gptel-make-tool
    :name "write_file"
    :description "Write UTF-8 CONTENT to PATH. Fails unless overwrite=true."
    :category "filesystem"
    :args (list '(:name "path" :type string :description "File path")
            '(:name "content" :type string :description "UTF-8 text")
            '(:name "overwrite" :type boolean :optional t :description "Allow overwrite?"))
    :function
    (lambda (path content &optional overwrite)
      (setq path (gptel--ensure-under-project path))
      (when (and (file-exists-p path) (not overwrite))
        (error "File exists: %s (set overwrite=true)" path))
      (make-directory (file-name-directory path) t)
      (let ((coding-system-for-write 'utf-8-unix))
        (with-temp-file path (insert content)))
      (list :ok t :path (expand-file-name path))))

  ;; --- root detection ----------------------------------------------------
  (defun gptel--safe-root (&optional dir)
    "Best-effort project root for DIR (or `default-directory`)."
    (let* ((dir (file-name-as-directory (or dir default-directory)))
            ;; Prefer VC root if under Git/other VCS
            (vc (ignore-errors (vc-root-dir)))               ;; nil if not VC
            ;; Fall back to locating a .git up the tree
            (git (or vc (locate-dominating-file dir ".git"))))
      (expand-file-name (or git dir))))

  ;; --- main tool ---------------------------------------------------------
  (gptel-make-tool
    :name "apply_patch"
    :description "Apply a unified diff under a safe root. Prefers git apply with --check; falls back to patch --dry-run. Args: unified_diff (string), optional root dir, strip (-pN)."
    :category "filesystem"
    :args (list '(:name "unified_diff" :type string :description "Unified diff text")
            '(:name "root" :type string :optional t :description "Root directory to apply under")
            '(:name "strip" :type integer :optional t :description "Strip prefix components for -pN"))
    :function
    (lambda (unified_diff &optional root strip)
      (let* ((root (file-name-as-directory (or root (gptel--safe-root))))
              (default-directory root)
              (tmp   (make-temp-file "gptel-patch-" nil ".diff"))
              (strip (or strip 1))                ;; 1 is best for git-style diffs (a/ b/)
              (git-exe (executable-find "git"))
              (out (generate-new-buffer " *gptel-apply-out*"))
              (err (generate-new-buffer " *gptel-apply-err*")))
        (unwind-protect
          (progn
            (with-temp-file tmp (insert unified_diff))
            (cond
              ;; Prefer git when repository present
              ((and git-exe (locate-dominating-file root ".git"))
                (let ((check (call-process git-exe nil (list out err) nil "apply" "--check" tmp)))
                  (if (eq check 0)
                    (let ((status (call-process git-exe nil (list out err) nil "apply" "--index" "--reject" "--whitespace=nowarn" tmp)))
                      (if (eq status 0)
                        (list :ok t :method "git" :root root
                          :stdout (with-current-buffer out (buffer-string)))
                        (error "git apply failed:\n%s" (with-current-buffer err (buffer-string)))))
                    (error "git apply --check failed:\n%s" (with-current-buffer err (buffer-string))))))
              ;; Fallback to patch(1) with a dry-run then real apply
              (t
                (let* ((args (list (format "-p%d" strip) "--batch" "--forward" "--reject-file=-" "--dry-run" "-i" tmp))
                        (dry (apply #'call-process "patch" nil (list out err) nil args)))
                  (if (not (eq dry 0))
                    (error "patch --dry-run failed (strip=%d):\n%s" strip (with-current-buffer err (buffer-string))))
                  (let ((apply (apply #'call-process "patch" nil (list out err) nil
                                 (append (butlast args 2) (list "-i" tmp)))))
                    (if (eq apply 0)
                      (list :ok t :method "patch" :root root :strip strip
                        :stdout (with-current-buffer out (buffer-string)))
                      (error "patch failed:\n%s" (with-current-buffer err (buffer-string)))))))))
          (ignore-errors (delete-file tmp))
          (mapc #'kill-buffer (list out err))))))


  (gptel-make-tool
    :name "search_files"
    :description "Search files under ROOT for PATTERN. Uses ripgrep JSON if available."
    :category "filesystem"
    :args (list '(:name "root" :type string :description "Root directory")
            '(:name "pattern" :type string :description "Regexp or fixed string"))
    :function
    (lambda (root pattern)
      (setq root (gptel--ensure-under-project root))
      (let ((rg (executable-find "rg")))
        (if rg
          (with-temp-buffer
            (let* ((coding-system-for-read 'utf-8)
                    (status (call-process rg nil t nil "--json" "-n" "-S" pattern root)))
              (goto-char (point-min))
              (list :tool "ripgrep" :pattern pattern :root root
                :json (buffer-string) :exit status)))
          ;; fallback: elisp grep
          (let (hits)
            (dolist (f (directory-files-recursively root "" t))
              (when (and (file-regular-p f)
                      (not (string-match-p "/\\." f)))
                (let* ((bytes (with-temp-buffer
                                (insert-file-contents-literally f nil 0 200000)
                                (buffer-string)))
                        (text (condition-case _ (decode-coding-string bytes 'utf-8 t) nil)))
                  (when (and text (string-match-p pattern text))
                    (push f hits)))))
            (list :tool "elisp" :pattern pattern :root root :matches (nreverse hits)))))))

  (gptel-make-tool
    :name "list_dir"
    :description "List directory entries (absolute paths)."
    :category "filesystem"
    :args (list '(:name "dir" :type string :description "Directory")
            '(:name "dotfiles" :type boolean :optional t :description "Include dotfiles?"))
    :function
    (lambda (dir &optional dotfiles)
      (setq dir (gptel--ensure-under-project dir))
      (unless (file-directory-p dir) (error "Not a directory: %s" dir))
      (list :dir (expand-file-name dir)
        :entries (seq-filter (lambda (f) (or dotfiles (not (string-match-p "/\\." f))))
                   (directory-files dir t nil t)))))

  (gptel-make-tool
    :name "get_dir_tree"
    :description "Return a textual tree of root (depth default 3)."
    :category "filesystem"
    :args (list '(:name "root" :type string :description "Directory root")
            '(:name "depth" :type integer :optional t :description "Max depth (default 3)"))
    :function
    (lambda (root &optional depth)
      (setq root (gptel--ensure-under-project root))
      (let ((depth (or depth 3)))
        (cl-labels ((tree (dir d)
                      (when (>= d 0)
                        (concat (make-string (* (- 3 d) 2) ?\s)
                          (file-name-nondirectory (directory-file-name dir)) "/\n"
                          (mapconcat
                            (lambda (f)
                              (if (file-directory-p f)
                                (tree f (1- d))
                                (concat (make-string (* (- 2 d) 2) ?\s)
                                  (file-name-nondirectory f) "\n")))
                            (seq-filter (lambda (f) (not (string-match-p "/\\." f)))
                              (directory-files dir t "^[^.].*" t))
                            "")))))
          (tree root depth)))))

  (gptel-make-tool
    :name "mkdir"
    :description "Create directory. Set parents=true for -p behavior."
    :category "filesystem"
    :args (list '(:name "dir" :type string :description "Directory")
            '(:name "parents" :type boolean :optional t :description "Create parents?"))
    :function
    (lambda (dir &optional parents)
      (setq dir (gptel--ensure-under-project dir))
      (make-directory dir parents)
      (list :ok t :dir (expand-file-name dir))))

  (gptel-make-tool
    :name "rmdir"
    :description "Remove directory. With recursive=true, removes contents."
    :category "filesystem"
    :args (list '(:name "dir" :type string :description "Directory")
            '(:name "recursive" :type boolean :optional t :description "Recurse?"))
    :function
    (lambda (dir &optional recursive)
      (setq dir (gptel--ensure-under-project dir))
      (cond ((and recursive (file-directory-p dir)) (delete-directory dir t))
        ((file-directory-p dir) (delete-directory dir))
        (t (error "Not a directory: %s" dir)))
      (list :ok t :dir (expand-file-name dir))))

  ;; ---- process ----

  (gptel-make-tool
    :name "exec"
    :description "Run a short shell COMMAND synchronously. Returns {exit, stdout}."
    :category "process"
    :args (list '(:name "command" :type string :description "Shell command"))
    :function
    (lambda (command)
      (let* ((shell-file-name (or (getenv "SHELL") shell-file-name))
              (coding-system-for-read 'utf-8)
              (coding-system-for-write 'utf-8)
              (buf (generate-new-buffer " *gptel-exec*"))
              (status (unwind-protect
                        (with-current-buffer buf
                          (call-process shell-file-name nil t nil "-lc" command))
                        0)))
        (unwind-protect
          (list :exit status
            :stdout (with-current-buffer buf (buffer-string)))
          (kill-buffer buf)))))

  (gptel-make-tool
    :name "spawn_async"
    :description "Run a shell command asynchronously. Optionally stream output to buffer_name. Returns {pid, buffer}."
    :category "process"
    :args (list '(:name "command" :type string :description "Shell command")
            '(:name "buffer_name" :type string :optional t :description "Buffer to collect output"))
    :function
    (lambda (command &optional buffer_name)
      (let* ((buf (get-buffer-create (or buffer_name (format "*gptel-proc:%s*" command))))
              (proc (start-process-shell-command "gptel-proc" buf command)))
        (set-process-coding-system proc 'utf-8 'utf-8)
        (set-process-query-on-exit-flag proc nil)
        (set-process-sentinel proc
          (lambda (p _e)
            (when (memq (process-status p) '(exit signal))
              (with-current-buffer (process-buffer p)
                (goto-char (point-max))
                (insert (format "\n\n[process %s finished with %s]\n"
                          (process-id p) (process-status p)))))))
        (list :pid (process-id proc) :buffer (buffer-name buf)))))

  ;; ---- emacs ----

  (gptel-make-tool
    :name "read_buffer"
    :description "Return the contents of an Emacs buffer"
    :category "emacs"
    :args (list '(:name "buffer" :type string :description "Buffer name"))
    :function
    (lambda (buffer)
      (unless (buffer-live-p (get-buffer buffer))
        (error "error: buffer %s is not live." buffer))
      (with-current-buffer buffer
        (buffer-substring-no-properties (point-min) (point-max))))))
(provide 'llm-tools)
