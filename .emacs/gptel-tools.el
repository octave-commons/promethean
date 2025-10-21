;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; local utility functions used by tools:
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(setq gptel-tools
  (list
    (gptel-make-tool
      :name "read_file"
      :function #'aris-read-file-to-string
      :description (concat "read a file into a string "
                     "(or null if the file doesn't exist "
                     "or can't be read")
      :args '(( :name "file_path" :type string
                :description "the path of the file to read"))
      :category "emacs")
    
    (gptel-make-tool
      :name "web_search_using_duckduckgo"
      :function #'aris-web-search
      :description "search the web using DuckDuckGo."
      :args `(( :name "search_query" :type string
                :description
                ,(concat "the search query to send to DuckDuckGo, "
                   "individual results can be investigated in greater "
                   "detail using get_url_content.")))
      :category "emacs")

    (gptel-make-tool
      :name "web_search_using_perplexica"
      :function #'aris-perplexica-search
      :description (concat "search the web using Perplexica, "
                     "an AI-powered search engine.")
      :args `(( :name "search_query" :type string
                :description
                ,(concat "the search query to send to Perplexica, "
                   "individual results can be investigated in greater "
                   "detail using get_url_content.")))
      :category "emacs")

    (gptel-make-tool
      :name "reddit_search_using_perplexica"
      :function (lambda (query) (aris-perplexica-search query :focusMode "redditSearch"))
      :description (concat "search Reddit using Perplexica, "
                     "an AI-powered search engine.")
      :args `(( :name "search_query" :type string
                :description
                ,(concat "the search query to send to Perplexica, "
                   "individual results can be investigated in greater "
                   "detail using get_url_content.")))
      :category "emacs")

    (gptel-make-tool
      :name "academic_search_using_perplexica"
      :function (lambda (query) (aris-perplexica-search query :focusMode "academicSearch"))
      :description (concat "search academic sources using Perplexica, "
                     "an AI-powered search engine.")
      :args `(( :name "search_query" :type string
                :description
                ,(concat "the search query to send to Perplexica, "
                   "individual results can be investigated in greater "
                   "detail using get_url_content.")))
      :category "emacs")

    (gptel-make-tool
      :name "get_url_content"
      :function #'aris-get-url-content 
      :description (concat "retrieve the content at a URL. reuters.com will block "
                     "to prompt the user for a username/password, so do not use this "
                     "for reuters.com URLs.")
      :args '(( :name "url" :type string
                :description "the URL whose content you'd like to retrieve"))
      :category "emacs")

    (gptel-make-tool
      :name "file_directory_p"
      :function #'file-directory-p
      :description "return true if PATH is a directory"
      :args '(( :name "path" :type string
                :description "the path of the file to test"))
      :category "emacs")

    (gptel-make-tool
      :name "file_regular_p"
      :function #'file-regular-p
      :description "return true if PATH is a regular file"
      :args '(( :name "path" :type string
                :description "the path of the file to test"))
      :category "emacs")

    (gptel-make-tool
      :name "file_symlink_p"
      :function #'file-symlink-p
      :description "return true if PATH is a symbolic link"
      :args '(( :name "path" :type string
                :description "the path of the file to test"))
      :category "emacs")
    
    (gptel-make-tool
      :name "get_filenames_in_directory"
      :function #'aris-directory-files
      :description "retrieve the filenames in a directory"
      :args '( ( :name "directory_path" :type string
                 :description "the path to the directory")
               ( :name "include_regular_files" :type boolean
                 :description "if true, include regular files in the result")
               ( :name "include_symlinks" :type boolean
                 :description "if true, include symlinks in the result")
               ( :name "include_symlinks_files" :type boolean
                 :description "if true, include directories in the result")
               ( :name "return_absolute_paths" :type boolean
                 :description "if true, return absolute paths"))
      :category "emacs")

    (gptel-make-tool
      :name "open_and_display_file"
      :function #'find-file
      :description (concat
                     "open a file in an emacs buffer and select the buffer. "
                     "if you're just opening a file so that you can read it's "
                     "contents  with read_file, use the open_file_no_display tool "
                     "instead so  that you don't change which buffer is displayed "
                     "to the user.")
      :args '(( :name "file" :type string
                :description "the name of the file to open"))
      :category "emacs")

    (gptel-make-tool
      :name "open_file_no_display"
      :function #'find-file-noselect
      :description "open a file in an emacs buffer in the background"
      :args '(( :name "file" :type string
                :description "the name of the file to open"))
      :category "emacs")
    
    (gptel-make-tool
      :name "read_buffer"
      :function (lambda (buffer)
                  (unless (buffer-live-p (get-buffer buffer))
                    (error (concat "error: buffer %s is not live. maybe you can use "
                             "read_file to open the file?" buffer)))
                  (with-current-buffer  buffer
                    (buffer-substring-no-properties (point-min) (point-max))))
      :description "return the contents of an emacs buffer"
      :args '(( :name "buffer" :type string
                :description "the name of the buffer whose contents are to be retrieved"))
      :category "emacs")

    (gptel-make-tool
      :name "kill_buffer"
      :function (lambda (buffer)
                  (when (buffer-live-p (get-buffer buffer))
                    (kill-buffer buffer)))
      :description "kill (close) an open buffer"
      :args '(( :name "buffer" :type string
                :description "the name of the buffer to kill"))
      :category "emacs")

    (gptel-make-tool
      :name "get_buffer_names"    
      :function #'aris-get-buffer-name-list
      :description (concat "get a list of buffers currently open in emacs and their "
                     "associated filenames")
      :args `(( :name "files-only" :type boolean
                :description ,(concat "if true, return only buffers that are "
                                "associated with files (and not, e.g, shell buffers "
                                "or the like")))
      :category "emacs")

    (gptel-make-tool
      :name "symbol_value"
      :function (lambda (symbol-name) (symbol-value (intern symbol-name)))
      :description "retrieve the value of a symbol in your emacs environment."
      :args '(( :name "symbol_name" :type string
                :description "the symbol-name of the symbol"))
      :category "emacs")

    (gptel-make-tool
      :name "find_function_noselect"
      :function (lambda (symbol-name)
                  (let ((found (find-function-noselect (intern symbol-name))))
                    (when found
                      `(,(buffer-file-name (car found)) . ,(cdr found)))))
      :description (concat "retrieve the source location of a symbol's function's "
                     "definition  in the emacs environment as a (FILE-PATH . POINT) pair.")
      :args '(( :name "function_symbol_name" :type string
                :description "the symbol-name of the function's symbol"))
      :category "emacs")

    (gptel-make-tool
      :name "find_variable_noselect"
      :function (lambda (symbol-name)
                  (let ((found (find-variable-noselect (intern symbol-name))))
                    (when found
                      `(,(buffer-file-name (car found)) . ,(cdr found)))))
      :description (concat "retrieve the source location of a symbol's variable in "
                     "the emacs environment as a (FILE-PATH . POINT) pair.")
      :args '(( :name "variable_symbol_name" :type string
                :description "the symbol-name of the variable's symbol"))
      :category "emacs")

    (gptel-make-tool
      :name "eval"
      :confirm t
      :function (lambda (form-string) (eval (read form-string)))
      :description (concat "evaluate a form in your emacs environment. "
                     "this tool should only be used as a last resort if you don't"
                     "have a more specific tool you can use. ")
      :args '(( :name "form_string" :type string
                :description "the Emacs Lisp form as a string to be evaluated"))
      :category "emacs")

    (gptel-make-tool
      :name "add_buffer_to_context"    
      :function #'aris-add-buffer-to-gptel-context
      :description (concat "add an open buffer to the LLM's context. "
                     "returns false if the argument specifies a buffer "
                     "that isn' open.")
      :args '(( :name "buffer_name" :type string
                :description "the name of the buffer to add to the LLM's context"))
      :category "emacs")

    (gptel-make-tool
      :name "clear_context"    
      :function (lambda () (gptel-context-remove-all))
      :description "clears the LLM's context."
      :args nil
      :category "emacs")))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; local utility functions used by tools:
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defun aris-read-file-to-string (file-path)
  "Return the contents of FILEPATH as a string."
  (when (file-readable-p file-path)
    (with-temp-buffer
      (insert-file-contents file-path)
      (buffer-string))))

(defun aris-get-time (include-date include-time)
  (let* ( (time (current-time))
          (date-string (format-time-string "%Y-%m-%d" time))
          (time-string (format-time-string "%H:%M:%S" time))
          (res nil)
          )
    (when include-time (push time-string res))
    (when include-date (push date-string res))
    (string-join res " ")))

(defun aris-directory-files ( directory-path
                              include-regular-files
                              include-symlinks
                              include-directories
                              absolute)
  "Return a list of files in DIRECTORY-PATH."
  (let ( (directory-files (directory-files (expand-file-name directory-path) t))
         (res nil))
    (when   include-regular-files
      (setq res (append res
                  (cl-remove-if-not
                    (lambda (p)
                      (and (file-regular-p p)
                        (not (file-symlink-p p))))
                    directory-files))))
    (when   include-symlinks
      (setq res (append res
                  (cl-remove-if-not
                    (lambda (p) (file-symlink-p p)) directory-files))))
    (when   include-directories
      (setq res (append res
                  (cl-remove-if-not
                    (lambda (p) (and (file-directory-p p)
                             (not (file-symlink-p p))))
                    directory-files))))
    (setq res
      (cl-remove-if
        (lambda (p) (cl-member (file-name-base p) '("." "..") :test #'string-equal))
        res))
    (unless absolute
      (setq res (map #'file-name-base res)))
    res))

(defun aris-parse-html (html)
  (with-temp-buffer
    (insert html)
    (libxml-parse-html-region (point-min) (point-max))))

(setq aris-strip-unwanted-html--discard-attr-prefixes
  '( "target" "class"))

(defun aris-strip-unwanted-html (html)
  (require 'dom)
  (let ((dom (aris-parse-html html)))
    (with-temp-buffer
      (cl-labels
        ((strip-nodes (node)
           (cond
             ((stringp node) (insert node))

             ((memq (car-safe node) '(comment script style)) nil)             

             ((memq (car-safe node) '(a))
               (let ((attrs nil))
                 (dolist (pair (dom-attributes node))
                   (unless
                     (let ((string (symbol-name (car-safe pair))))
                       (when string 
                         (catch 't
                           (dolist (prefix aris-strip-unwanted-html--discard-attr-prefixes)
                             (when (string-prefix-p prefix string)
                               (throw 't t))))))
                     (push pair attrs)))
                 (setq attrs (nreverse attrs))
                 ;; Clean children
                 (let ((children (delq nil (mapcar #'strip-nodes
                                             (dom-children node)))))
                   ;; Drop empty <div>
                   (dom-print (apply #'list (car node) attrs children)))))

             (t
               ;; Clean children
               (let ((children (delq nil (mapcar #'strip-nodes
                                           (dom-children node)))))
                 (dolist (child children)
                   (strip-nodes child)))))))
        (strip-nodes dom))
      (buffer-string))))

(setq aris-compress-html-string--regexes '( ("\r\n"           . "\n")
                                            ("[ \t\n]+"       . " ")
                                            ("[\n]+"          . "")
                                            ))

(defun aris-compress-html-string (string)
  (let* ((regex-pairs aris-compress-html-string--regexes))
    (dolist (pair regex-pairs)
      (setq string (replace-regexp-in-string (car pair) (cdr pair) string)))
    string))

(defun aris-get-raw-url-content (url)
  "Fetch HTML from URL and return it with <script>, <style>, and comments removed."
  (require 'url)
  (with-temp-buffer
    (url-insert-file-contents url)
    (buffer-string)))

(defun aris-get-url-content (url)
  "Fetch HTML from URL and return it with <script>, <style>, and comments removed."
  (aris-compress-html-string
    (aris-strip-unwanted-html
      (aris-get-raw-url-content url))))

(defun aris-web-search (query)
  "Perform a web search using DuckDuckGo and return the top results.
QUERY is the string to search for."
  (require 'url)
  (require 'shr)
  (let ((search-url (concat "https://html.duckduckgo.com/html/?q="
                      (url-hexify-string query))))
    (with-temp-buffer
      (url-insert-file-contents search-url)
      (goto-char (point-min))
      (search-forward "<body>" nil t)
      (let* ((dom (libxml-parse-html-region (point-min) (point-max)))
              (results (dom-by-class dom "result"))
              (output "")
              (count 0)
              (tail results))
        (while tail
          (let ((result (car tail)))
            (if (< count 10)
              (let* ((title-element (car (dom-by-class result "result__a")))
                      (snippet-element (car (dom-by-class result "result__snippet")))
                      (title (and title-element (dom-texts title-element)))
                      (link (and title-element
                              (cdr (assq 'href (dom-attributes title-element)))))
                      (snippet (and snippet-element (dom-texts snippet-element))))
                (if (and title link snippet)
                  (progn
                    (setq output (concat output
                                   "Title: " title "\n"
                                   "Link: " link "\n"
                                   "Snippet: " snippet "\n\n"))
                    (setq count (1+ count)))))))
          (setq tail (cdr tail)))
        (replace-regexp-in-string "[ ]+" " "  output)))))

(defun aris-add-buffer-to-gptel-context (buffer-name)
  "Adds the buffer specified by BUFFER-NAME to gptel's context."
  (let* ((buffer-obj (get-buffer buffer-name)))
    (when buffer-obj
      (with-current-buffer buffer-obj
        (gptel-context--add-region buffer-obj (point-min) (pofnt-max) t)
        (message "buffer \"%s\" added to gptel context." buffer-name)))
    (if buffer-obj
      t
      (message "failed to add \"%s\" add buffer to gptel context!" buffer-name)
      nil)))

(cl-defun aris-json-request-sync (url lisp-object &key (type "POST"))
  "Send a JSON-encoded POST request to the given URL and return the response synchronously."
  (let* ((json-data (json-encode lisp-object))
          (response (request url
                      :type type
                      :data json-data
                      :headers '(("Content-Type" . "application/json"))
                      :sync t
                      :parser 'json-read)))
    (when response
      (let ((status (request-response-status-code response))
             (response-data (request-response-data response)))
        (if (and status (>= status 200) (< status 300))
          (progn
            (message "request successful, status: %s" status)
            ;; (message "response data: %S" response-data)
            response-data)  ;; Return the response-data here
          (message "request failed with status: %s" (or status "unknown"))
          response-data)))))

(cl-defun map-leaves (node type-handlers &key skip-keys)
  "Walk NODE, a tree of alists, and apply TYPE-HANDLERS to atomic leaves."
  (message "look at: %S" node)
  (cond
    ((atom node)
      (let* ( (type-sym (type-of node))
              (handler-pair (cl-find-if (lambda (pair) (eq (car pair) (type-of node)))
                              type-handlers))
              (handler-fun (cdr-safe handler-pair)))
        (if handler-fun
          (funcall handler-fun node)
          node)))
    ((vectorp node)
      (cl-map 'vector (lambda (obj) (map-leaves obj type-handlers :skip-keys skip-keys)) node))
    ((proper-list-p node)
      (cond 
        ((and (atom (car node)) (memql (car node) skip-keys)) node)
        ((atom (car node)) (cons (car node)
                             (mapcar
                               (lambda (obj) (map-leaves obj type-handlers :skip-keys skip-keys))
                               (cdr node))))
        (t (mapcar (lambda (obj) (map-leaves obj type-handlers :skip-keys skip-keys))
             node))))
    ((and (consp node) (atom (car node)))
      (if (memql (car node) skip-keys)
        node
        (cons (car node)
          (map-leaves (cdr node) type-handlers :skip-keys skip-keys))))
    (t (message "unrecognized node type: %S" node)
      node)))

(defun replace-regexps-in-string (string regexps)
  "Replace regexps in STRING with their corresponding values using REGEXPS."
  (dolist (pair regexps)
    (setq string (replace-regexp-in-string (car pair) (cdr pair) string)))
  string)

(cl-defun aris-perplexica-search
  (query &key
    (model-provider "groq")
    (model-name     "moonshotai/kimi-k2-instruct")
    (focusMode      "webSearch")
    ;; webSearch, academicSearch, writingAssistant, wolframAlphaSearch, youtubeSearch, redditSearch
    (optimizationMode  "speed")
    (strip             t)
    ;; speed, balanced
    )
  (let ((res (aris-json-request-sync "http://localhost:3000/api/search"
               `( :chatModel
                  ( :provider ,model-provider
                    :name     ,model-name)
                  :focusMode        ,focusMode
                  :optimizationMode ,optimizationMode
                  :query            ,query))))
    (map-leaves res
      '((string  . (lambda (x)
                     (replace-regexps-in-string x 
                       '( ("\\[[0-9]+\\]" . "")
                          ("[ ]+"         . " ")))))))))



