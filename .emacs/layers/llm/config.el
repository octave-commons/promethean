;;; config.el -*- lexical-binding: t; -*-

(defgroup llm nil
  "Spacemacs layer: LLM tooling via gptel + MCP."
  :group 'tools)

(defcustom llm-mcp-install-scope 'buffer
  "Where to install generated gptel tools. 'buffer or 'global."
  :type '(choice (const buffer) (const global))
  :group 'llm)

;; Optional: default server examples (user can override in dotspacemacs)
(defcustom llm-mcp-default-servers
  '(("filesystem" . (:command "npx"
                      :args ("-y" "@modelcontextprotocol/server-filesystem" "~")))
     ;; Add your servers here
     )
  "Example MCP servers; override in dotspacemacs."
  :type '(alist :key-type string :value-type plist)
  :group 'llm)

(defvar mcp-gptel--registry (make-hash-table :test 'equal)
  "Map from gptel tool name → metadata plist including original MCP name, arg spec, etc.")

(defun mcp-gptel--sanitize (mcp-name)
  "Sanitize MCP action name (like “files.read_file”) into a gptel-safe tool name."
  (let ((s (replace-regexp-in-string "[^a-zA-Z0-9_-]" "_" mcp-name)))
    ;; avoid leading digit
    (if (string-match-p "^[0-9]" s)
      (concat "_" s)
      s)))

(defun mcp-gptel--register-one (mcp-meta)
  "Register one MCP action described by MCP-META (a plist).
MCP-META must include at least :name (string), optionally :args, :description, :category."
  (let* ((mcp-name (plist-get mcp-meta :name))
          (tool-name (mcp-gptel--sanitize mcp-name)))
    ;; collision detection
    (when (gethash tool-name mcp-gptel--registry)
      (error "Name collision: sanitized tool name %s already registered (for %s)"
        tool-name (plist-get (gethash tool-name mcp-gptel--registry) :name)))
    (puthash tool-name mcp-meta mcp-gptel--registry)
    (gptel-make-tool
      :name tool-name
      :function (lambda (&rest args)
                  (let* ((meta (gethash tool-name mcp-gptel--registry))
                          (orig-name (plist-get meta :name))
                          (arg-names (mapcar (lambda (a) (plist-get a :name))
                                       (plist-get meta :args)))
                          ;; zip names to passed args
                          (arg-alist (cl-pairlis arg-names args)))
                    ;; Here you can validate, coerce types, handle optional args, etc.
                    (apply #'mcp-call orig-name (mapcar (lambda (pair) (cdr pair)) arg-alist))))
      :description (or (plist-get mcp-meta :description)
                     (format "MCP action %s" mcp-name))
      :args (plist-get mcp-meta :args)
      :category (plist-get mcp-meta :category)))
  tool-name)

(defun mcp-gptel-register-all (mcp-list)
  "Given MCP-LIST (list of plists), register all as gptel tools.
MCP-LIST elements should each have at least :name and optionally :args, :description, :category."
  (mapcar #'mcp-gptel--register-one mcp-list)
  ;; Return list of sanitized names
  (hash-table-keys mcp-gptel--registry))

;; Example integration hook: call this once after connecting to MCP
(defun mcp-gptel-setup (mcp-list)
  "Initialize gptel with all MCP tools in MCP-LIST."
  (mcp-gptel-register-all mcp-list)
  ;; Optionally, tell the LLM about available tools via system prompt injection, etc.
  (message "Registered %d MCP tools for gptel" (hash-table-count mcp-gptel--registry)))

;;; Placeholder stub — you must wire this to your MCP client
(defun mcp-call (action &rest args)
  "Invoke MCP ACTION with ARGS. Replace stub with your actual logic."
  (message "mcp-call: %s %S" action args)
  ;; you’d send request over JSON, await response, parse, etc.
  )

(with-eval-after-load 'gptel
  (setq gptel-log-level 'trace
    debug-on-error t)
  ;; (advice-add 'gptel-send :around #'err--gptel-sanitize-before-send)
  (gptel-make-ollama "ollama"
    :host "localhost:11434"
    :stream t
    :models '(qwen3:8b llama3.2:3b qwen2.5:7b
               qwen2.5-coder:7b
               qwen2.5-instruct:3b
               gemma3:latest
               qwen3:4b
               llama3.1:8b
               ))
  (gptel-make-gh-copilot "Copilot")
  ;; AI/ML API offers an OpenAI compatible API
  (gptel-make-openai "zai"        ;Any name you want
    :host "api.z.ai"
    :endpoint "/api/coding/paas/v4/chat/completions"
    :key (auth-source-pick-first-password :host "api.z.ai")
    :stream t
    :models '(glm-4.6 glm-4.5 glm-4-plus glm-4.5-X))
  (gptel-make-preset 'z-ai-glm-coding                       ;preset name, a symbol
    :description "A preset optimized for coding tasks" ;for your reference
    :backend "zai"                     ;gptel backend or backend name
    :model 'GLM-4.6
    :system "You are an expert coding assistant. Your role is to provide high-quality code solutions, refactorings, and explanations."
    :tools '("read_buffer" "modify_buffer")) ;gptel tools or tool names

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
      (setq path (err--ensure-under-project path))
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
      (setq path (err--ensure-under-project path))
      (when (and (file-exists-p path) (not overwrite))
        (error "File exists: %s (set overwrite=true)" path))
      (make-directory (file-name-directory path) t)
      (let ((coding-system-for-write 'utf-8-unix))
        (with-temp-file path (insert content)))
      (list :ok t :path (expand-file-name path))))

  ;; --- root detection ----------------------------------------------------
  (defun err--safe-root (&optional dir)
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
      (let* ((root (file-name-as-directory (or root (err--safe-root))))
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
      (setq root (err--ensure-under-project root))
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
      (setq dir (err--ensure-under-project dir))
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
      (setq root (err--ensure-under-project root))
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
      (setq dir (err--ensure-under-project dir))
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
      (setq dir (err--ensure-under-project dir))
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
        (buffer-substring-no-properties (point-min) (point-max)))))



  ;; Finally, set only these tools:
  )
;; AUTO-GENERATED by mk.mcp-cli -- edits will be overwritten.
(with-eval-after-load 'mcp
  (setq mcp-hub-servers
    '(("duckduckgo" .
        (:command "/home/err/devel/promethean/scripts/mcp/bin/duck.sh"))
       ("eslint" .
         (:command "npx"
           :args ("-y" "@uplinq/mcp-eslint"))
         )
       ("file-system" .
         (:command "/home/err/devel/promethean/scripts/mcp/bin/filesystem.sh"))
       ("github" .
         (:command "/home/err/devel/promethean/scripts/mcp/bin/github.sh"))
       ("github-chat" .
         (:command "/home/err/devel/promethean/scripts/mcp/bin/github_chat.sh"))
       ("haiku-rag" .
         (:command "uvx"
           :args ("haiku-rag" "serve" "--stdio" "--db" "/home/err/.local/share/haiku-rag"))
         )
       ("http-default" .
         (:url "http://127.0.0.1:3210/mcp"))
       ("http-discord" .
         (:url "http://127.0.0.1:3210/discord"))
       ("http-exec" .
         (:url "http://127.0.0.1:3210/exec"))
       ("http-files" .
         (:url "http://127.0.0.1:3210/files"))
       ("http-github" .
         (:url "http://127.0.0.1:3210/github"))
       ("http-github-review" .
         (:url "http://127.0.0.1:3210/github/review"))
       ("http-kanban" .
         (:url "http://127.0.0.1:3210/kanban"))
       ("http-process" .
         (:url "http://127.0.0.1:3210/process"))
       ("http-workspace" .
         (:url "http://127.0.0.1:3210/workspace"))
       ("npm-helper" .
         (:command "npx"
           :args ("-y" "@pinkpixel/npm-helper-mcp"))
         )
       ("obsidian" .
         (:command "/home/err/devel/promethean/scripts/mcp/bin/obsidian.sh"))
       ("playwright" .
         (:command "npx"
           :args ("@playwright/mcp@latest"))
         )
       ("serena" .
         (:command "uvx"
           :args ("--from" "git+https://github.com/oraios/serena" "serena" "start-mcp-server"))
         )
       ("sonarqube" .
         (:command "/home/err/devel/promethean/scripts/mcp/bin/sonarqube.sh"))
       ("ts-ls-lsp" .
         (:command "npx"
           :args ("tritlo/lsp-mcp" "typescript" "/home/err/.volta/bin/typescript-language-server" "--stdio"))
         )
       )
    )
  (mcp-hub-start-all-server)
  (setq llm-mcp-default-servers mcp-hub-servers)
  (llm/mcp-connect-defaults)

  )
