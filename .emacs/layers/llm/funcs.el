;;; funcs.el -*- lexical-binding: t; -*-

(defvar llm--tool-registry (make-hash-table :test 'equal)
  "Map safe gptel tool name -> plist (:server STR :tool STR).")

(defun llm--safe-name (server tool)
  "Return a provider-safe function name from SERVER + TOOL.
Only [A-Za-z0-9_-], max length 64, and not starting with a digit."
  (let* ((raw (format "%s_%s" server tool))
          (s (replace-regexp-in-string "[^A-Za-z0-9_-]" "_" raw)))
    (when (string-match-p "^[0-9]" s) (setq s (concat "_" s)))
    (substring s 0 (min 64 (length s))))) ;; cap length (OpenAI/Groq limit). :contentReference[oaicite:1]{index=1}

(defun llm--dedupe (name)
  "Avoid name collisions by suffixing _2, _3, … within registry."
  (if (gethash name llm--tool-registry)
    (let ((i 2) cand)
      (setq cand (format "%s_%d" name i))
      (while (gethash (substring cand 0 (min 64 (length cand))) llm--tool-registry)
        (cl-incf i)
        (setq cand (format "%s_%d" name i)))
      (substring cand 0 (min 64 (length cand))))
    name))



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

(defun err--coerce-desc (x &optional limit)
  (let* ((s (cond ((stringp x) x)
              ((null x) "")
              (t (with-output-to-string (prin1 x))))))
    (if (and limit (> (length s) limit))
      (substring s 0 limit)
      s)))

(defun err--sanitize-gptel-tools (&optional limit)
  (setq limit (or limit 1000)) ;; a bit under 1024 for safety
  (setq gptel-tools
    (cl-loop for tool in gptel-tools
      when (and tool (recordp tool) (eq (type-of tool) 'gptel-tool))
      do (let* ((desc (aref tool 3)))
           (print tool)
           (unless (and (stringp desc) (<= (length desc) 1024))
             (setf (aref tool 3) (err--coerce-desc desc limit))))
      and collect tool)))
