(with-eval-after-load 'gptel

  ;; read_file
  (defvar gptel-tool-read-file
    (gptel-make-tool
      :name "read_file"
      :function (lambda (path &optional max_bytes)
                  (gptel--read-file path max_bytes))
      :description "Read and return the contents of a file. Optional max_bytes to cap read."
      :args (list '(:name "path" :type string :description "Path to file")
              '(:name "max_bytes" :type integer :optional t
                 :description "Hard cap on bytes to read"))
      :category "filesystem"))

  ;; write_file
  (defvar gptel-tool-write-file
    (gptel-make-tool
      :name "write_file"
      :function (lambda (path content &optional overwrite parents)
                  (gptel--write-file path content overwrite parents))
      :description "Write content to a file. When overwrite=false and file exists, error. When parents=true, create parent dirs."
      :args (list '(:name "path" :type string :description "Destination path")
              '(:name "content" :type string :description "File contents")
              '(:name "overwrite" :type boolean :optional t :description "Default true")
              '(:name "parents" :type boolean :optional t :description "Create parent dirs"))
      :category "filesystem"))

  ;; apply_patch
  (defvar gptel-tool-apply-patch
    (gptel-make-tool
      :name "apply_patch"
      :function (lambda (unified_diff &optional root strip)
                  (gptel--patch-apply unified_diff root strip))
      :description "Apply a unified diff under root using the system 'patch'. Args: unified_diff (string), optional root dir, strip (patch -pN). Returns JSON {exit,output}."
      :args (list '(:name "unified_diff" :type string :description "Unified diff text")
              '(:name "root" :type string :optional t :description "Root directory for patch")
              '(:name "strip" :type integer :optional t :description "Strip components for -p"))
      :category "filesystem"))

  ;; search_files
  (defvar gptel-tool-search-files
    (gptel-make-tool
      :name "search_files"
      :function (lambda (root pattern &optional name_glob max_results)
                  (gptel--search-files root pattern name_glob max_results))
      :description "Recursive regex content search. Optionally restrict filenames by glob and max_results. Returns JSON array of {file,line,col,snippet}."
      :args (list '(:name "root" :type string :description "Directory to search")
              '(:name "pattern" :type string :description "Elisp regexp to match")
              '(:name "name_glob" :type string :optional t :description "Filename glob, e.g. *.ts")
              '(:name "max_results" :type integer :optional t :description "Default 500"))
      :category "filesystem"))

  ;; list_dir
  (defvar gptel-tool-list-dir
    (gptel-make-tool
      :name "list_dir"
      :function (lambda (dir &optional full_paths)
                  (gptel--list-dir dir full_paths))
      :description "List entries in a directory. Returns JSON array with {name,path,type,size}. Set full_paths=true to use absolute paths."
      :args (list '(:name "dir" :type string :description "Directory path")
              '(:name "full_paths" :type boolean :optional t :description "Return absolute paths"))
      :category "filesystem"))

  ;; get_dir_tree
  (defvar gptel-tool-get-dir-tree
    (gptel-make-tool
      :name "get_dir_tree"
      :function (lambda (root &optional depth)
                  (gptel--dir-tree root depth))
      :description "Return a textual tree of root (depth default 3)."
      :args (list '(:name "root" :type string :description "Directory root")
              '(:name "depth" :type integer :optional t :description "Max depth (default 3)"))
      :category "filesystem"))

  ;; mkdir
  (defvar gptel-tool-mkdir
    (gptel-make-tool
      :name "mkdir"
      :function (lambda (dir)
                  (make-directory (expand-file-name dir) t)
                  (format "created directory %s" (expand-file-name dir)))
      :description "Create directory (parents created as needed)."
      :args (list '(:name "dir" :type string :description "Directory path to create"))
      :category "filesystem"))

  ;; rmdir
  (defvar gptel-tool-rmdir
    (gptel-make-tool
      :name "rmdir"
      :function (lambda (dir &optional recursive)
                  (delete-directory (expand-file-name dir) (and recursive t))
                  (format "removed directory %s%s"
                    (expand-file-name dir)
                    (if recursive " (recursive)" "")))
      :description "Remove a directory. Set recursive=true to remove non-empty."
      :args (list '(:name "dir" :type string :description "Directory path to remove")
              '(:name "recursive" :type boolean :optional t :description "Recursively delete if non-empty"))
      :category "filesystem"))

  ;; exec (synchronous)
  (defvar gptel-tool-exec
    (gptel-make-tool
      :name "exec"
      :function (lambda (command)
                  (gptel--exec-sync command))
      :description "Run a shell command synchronously. Returns JSON {exit,stdout}."
      :args (list '(:name "command" :type string :description "Shell command"))
      :category "process"))

  ;; spawn_async (asynchronous)
  (defvar gptel-tool-spawn-async
    (gptel-make-tool
      :name "spawn_async"
      :function (lambda (command &optional buffer_name)
                  (gptel--spawn-async command buffer_name))
      :description "Run a shell command asynchronously. Optionally stream output to buffer_name. Returns JSON {name,pid,buffer}."
      :args (list '(:name "command" :type string :description "Shell command")
              '(:name "buffer_name" :type string :optional t
                 :description "Buffer to collect output (optional)"))
      :category "process"))

  ;; read_buffer (yours, kept as-is with a small safety tweak)
  (defvar gptel-tool-read-buffer
    (gptel-make-tool
      :name "read_buffer"
      :function (lambda (buffer)
                  (unless (buffer-live-p (get-buffer buffer))
                    (error "error: buffer %s is not live." buffer))
                  (with-current-buffer buffer
                    (buffer-substring-no-properties (point-min) (point-max))))
      :description "Return the contents of an Emacs buffer."
      :args (list '(:name "buffer" :type string
                     :description "The buffer name to read"))
      :category "emacs"))

  ;; Register tools (extend or set globally)
  (setq gptel-tools
    (append
      (list gptel-tool-read-file
        gptel-tool-write-file
        gptel-tool-apply-patch
        gptel-tool-search-files
        gptel-tool-list-dir
        gptel-tool-get-dir-tree
        gptel-tool-mkdir
        gptel-tool-rmdir
        gptel-tool-exec
        gptel-tool-spawn-async
        gptel-tool-read-buffer)
      gptel-tools))
  (gptel-make-preset 'proofreader
    :description "Preset for proofreading tasks"
    :backend "ChatGPT"
    :model 'gpt-5-nano
    :tools '("read_buffer" )
    :temperature 0.7                      ;sets gptel-temperature
    :use-context 'system)                 ;sets gptel-use-context
  (gptel-make-preset 'pair-programming
    :description "Preset for pair programming"
    :backend "ChatGPT"
    :model 'gpt-5-nano
    :tools '("read_buffer" )
    :temperature 0.7                      ;sets gptel-temperature
    :use-context 'system)
  (gptel-make-tool
    :name "read_buffer"                    ; javascript-style snake_case name
    :function (lambda (buffer)                  ; the function that will run
                (unless (buffer-live-p (get-buffer buffer))
                  (error "error: buffer %s is not live." buffer))
                (with-current-buffer  buffer
                  (buffer-substring-no-properties (point-min) (point-max))))
    :description "return the contents of an emacs buffer"
    :args (list '(:name "buffer"
                   :type string            ; :type value must be a symbol
                   :description "the name of the buffer whose contents are to be retrieved"))
    :category "emacs")                     ; An arbitrary label for grouping
  (gptel-make-tool
    :name "create_file"                    ; javascript-style  snake_case name
    :function (lambda (path filename content)   ; the function that runs
                (let ((full-path (expand-file-name filename path)))
                  (with-temp-buffer
                    (insert content)
                    (write-file full-path))
                  (format "Created file %s in %s" filename path)))
    :description "Create a new file with the specified content"
    :args (list '(:name "path"             ; a list of argument specifications
                   :type string
                   :description "The directory where to create the file")
            '(:name "filename"
               :type string
               :description "The name of the file to create")
            '(:name "content"
               :type string
               :description "The content to write to the file"))
    :category "filesystem")                ; An arbitrary label for grouping

  )
;; AUTO-GENERATED by mk.mcp-cli -- edits will be overwritten.
(with-eval-after-load 'mcp

  (setq mcp-hub-servers
    '(( "duckduckgo" .
        (:command "$HOME/devel/promethean/scripts/mcp/bin/duck.sh"))
       ( "eslint" .
         (:command "npx"
           :args ("-y" "@uplinq/mcp-eslint")))
       ( "github" .
         (:command "$HOME/devel/promethean/scripts/mcp/bin/github.sh"))
       ( "github-chat" .
         (:command "$HOME/devel/promethean/scripts/mcp/bin/github_chat.sh"))
       ( "haiku-rag" .
         (:command "uvx"
           :args ("haiku-rag" "serve" "--stdio" "--db" "$HOME/.local/share/haiku-rag")))
       ( "http-default" .
         (:url "http://127.0.0.1:3210/mcp"))
       ( "http-discord" .
         (:url "http://127.0.0.1:3210/discord"))
       ( "http-exec" .
         (:url "http://127.0.0.1:3210/exec"))
       ( "http-files" .
         (:url "http://127.0.0.1:3210/files"))
       ( "http-github" .
         (:url "http://127.0.0.1:3210/github"))
       ( "http-github-review" .
         (:url "http://127.0.0.1:3210/github/review"))
       ( "http-kanban" .
         (:url "http://127.0.0.1:3210/kanban"))
       ( "http-process" .
         (:url "http://127.0.0.1:3210/process"))
       ( "http-workspace" .
         (:url "http://127.0.0.1:3210/workspace"))
       ( "npm-helper" .
         (:command "npx"
           :args ("-y" "@pinkpixel/npm-helper-mcp")))
       ( "obsidian" .
         (:command "$HOME/devel/promethean/scripts/mcp/bin/obsidian.sh"))
       ( "playwright" .
         (:command "npx"
           :args ("@playwright/mcp@latest")))
       ( "serena" .
         (:command "uvx"
           :args ("--from" "git+https://github.com/oraios/serena" "serena" "start-mcp-server")))
       ( "sonarqube" .
         (:command "$HOME/devel/promethean/scripts/mcp/bin/sonarqube.sh"))
       ;; ( "ts-ls-lsp" .
       ;;   (:command "npx"
       ;;     :args ("tritlo/lsp-mcp" "typescript" "$HOME/.volta/bin/typescript-language-server" "--stdio")))
       )))
