;; -*- lexical-binding: t; -*-
(defvar-local pm2-dashboard--refresh-timer nil
  "Buffer-local timer for auto-refreshing the PM2 dashboard.")

(defun pm2--restart-and-refresh (name)
  "Restart PM2 process NAME and refresh the dashboard."
  (let ((default-directory "~/")) ;; Optional: ensure shell runs somewhere sane
    (start-process "pm2-restart" "*PM2 Restart*"
                   "pm2" "restart" name))
  (message "Restarting %s..." name)
  (run-at-time "0.5 sec" nil #'pm2-dashboard))

(defun pm2-dashboard--start-refresh (buffer interval)
  "Auto-refresh the dashboard in BUFFER every INTERVAL seconds."
  (with-current-buffer buffer
    (when (bound-and-true-p pm2-dashboard--refresh-timer)
      (cancel-timer pm2-dashboard--refresh-timer))
    (setq-local pm2-dashboard--refresh-timer
                (run-at-time interval interval
                             (lambda ()
                               (when (buffer-live-p buffer)
                                 (pm2-dashboard--start-process buffer t)))))

    ;; stop timer when buffer is killed
    (add-hook 'kill-buffer-hook
              (lambda ()
                (when (bound-and-true-p pm2-dashboard--refresh-timer)
                  (cancel-timer pm2-dashboard--refresh-timer)))
              nil t)))


(defun pm2-dashboard (&optional no-timer)
  "Display a formatted dashboard of running PM2 processes.
If NO-TIMER is non-nil, do not start the auto-refresh timer."
  (interactive)
  (let ((buffer (get-buffer-create "*PM2 Dashboard*"))
        (first-time (not (get-buffer-window "*PM2 Dashboard*" t))))
    (with-current-buffer buffer
      (read-only-mode -1)
      (read-only-mode 1))
    ;; Only show the buffer if it's not already visible
    (when (and (not no-timer) first-time)
      (display-buffer buffer))
    (pm2-dashboard--start-process buffer no-timer)))

(defun pm2-dashboard--start-process (buffer no-timer)
  "Start the PM2 process list as an async command into BUFFER."
  (make-process
   :name "pm2-dashboard-process"
   :buffer "*pm2-raw-output*"
   :command '("pm2" "jlist")
   :noquery t
   :sentinel (lambda (proc event)
               (when (and (eq (process-status proc) 'exit)
                          (= (process-exit-status proc) 0))
                 (when (buffer-live-p (process-buffer proc))
                   (with-current-buffer (process-buffer proc)
                     (let ((json-array-type 'list)
                           (output (buffer-substring-no-properties (point-min) (point-max))))
                       (kill-buffer (current-buffer))
                       (when (buffer-live-p buffer) ;; 💡 only touch if still open
                         (with-current-buffer buffer
                           (let ((inhibit-read-only t))
                             (erase-buffer)
                             (pm2-dashboard--render output)
                             (read-only-mode 1)
                             (goto-char (point-min))))))))
                 (when (and (not no-timer) (buffer-live-p buffer))
                   (pm2-dashboard--start-refresh buffer 5))))
   ))


(defun pm2-dashboard--render (json-output)
  "Render the PM2 dashboard using JSON-OUTPUT."
  (let ((process-list (ignore-errors (json-read-from-string json-output))))
    (insert (propertize "PM2 Dashboard [LIVE]\n"
                        'face '(:height 1.5 :weight bold :foreground "green")))
    (insert (make-string 80 ?=) "\n\n")
    (insert (format "%-3s  %-20s  %-10s  %-10s  %-8s  %-10s  %-8s\n"
                    "ID" "Name" "Mode" "Status" "CPU" "Memory" "Uptime"))
    (insert (make-string 80 ?-) "\n")
    (dolist (proc process-list)
      (let* ((env (alist-get 'pm2_env proc))
             (monit (alist-get 'monit proc))
             (status (alist-get 'status env))
             (pm-id (alist-get 'pm_id proc))
             (name (alist-get 'name proc))
             (mode (alist-get 'exec_mode env))
             (cpu (or (alist-get 'cpu monit) 0))
             (mem (or (alist-get 'memory monit) 0))
             (uptime (or (alist-get 'pm_uptime env) "N/A"))
             (color (cond
                     ((string= status "online") 'success)
                     ((string= status "stopped") 'warning)
                     (t 'error))))
        (insert (format "%-3s  " pm-id))
        (let ((process-name name))
          (insert-text-button (format "%-20s" process-name)
                              'action (lambda (_btn)
                                        (pm2--restart-and-refresh process-name))
                              'help-echo (format "Restart %s" process-name)
                              'follow-link t
                              'face 'link))
        (insert (format "  %-10s  %s  %-8.1f  %-10.1f  %-8s\n"
                        mode
                        (propertize status 'face `(:foreground ,(face-foreground color)))
                        cpu
                        (/ mem 1048576.0)
                        uptime))))))
