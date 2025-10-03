;;; config.el --- llm layer config  -*- lexical-binding: t; -*-

;; Minimal, local-first MCP servers. Adjust to your paths.
;; Example: Filesystem server rooted at your repo/workspace.
(with-eval-after-load 'mcp
  ;; Do not block startup if node/npm missing; user can start later.
  (unless (fboundp 'mcp-hub-start-all-server)
    (message "[llm] mcp-hub not loaded yet; servers will start when available.")))


;; AUTO GENREATED MCP SERVER CONFIG BY mk.mcp-cli START
(with-eval-after-load 'mcp
  (setq mcp-hub-servers
    '(( "duckduckgo" .
        (:command "/home/err/devel/promethean/scripts/mcp/bin/duck.sh"))
       ( "github" .
         (:command "/home/err/devel/promethean/scripts/mcp/bin/github.sh"))
       ( "github-chat" .
         (:command "/home/err/devel/promethean/scripts/mcp/bin/github_chat.sh"))
       ( "lsp-mcp" .
         (:command "npx"
           :args ("tritlo/lsp-mcp" "typescript" "/home/err/.volta/bin/typescript-language-server" "--stdio")))
       ( "sonarqube" .
         (:command "/home/err/devel/promethean/scripts/mcp/bin/sonarqube.sh"))
       )))
