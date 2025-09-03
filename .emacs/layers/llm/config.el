;;; config.el --- llm layer config  -*- lexical-binding: t; -*-

;; Minimal, local-first MCP servers. Adjust to your paths.
;; Example: Filesystem server rooted at your repo/workspace.
(with-eval-after-load 'mcp
  (setq mcp-hub-servers
        '(("filesystem" . (:command "npx"
                                    :args ("-y" "@modelcontextprotocol/server-filesystem"
                                           "~/devel/promethean")))))
  ;; Do not block startup if node/npm missing; user can start later.
  (unless (fboundp 'mcp-hub-start-all-server)
    (message "[llm] mcp-hub not loaded yet; servers will start when available.")))
