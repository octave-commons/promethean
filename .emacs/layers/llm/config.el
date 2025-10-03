;;; config.el --- llm layer config  -*- lexical-binding: t; -*-

;; Minimal, local-first MCP servers. Adjust to your paths.
;; Example: Filesystem server rooted at your repo/workspace.
(with-eval-after-load 'mcp
  ;; Do not block startup if node/npm missing; user can start later.
  (unless (fboundp 'mcp-hub-start-all-server)
    (message "[llm] mcp-hub not loaded yet; servers will start when available.")))


;; AUTO GENERATED MCP SERVER CONFIG BY mk.mcp-cli START
(with-eval-after-load 'mcp
  (setq mcp-hub-servers
        '(( "duckduckgo" .
            (:command "/home/err/devel/promethean/scripts/mcp/bin/duck.sh"))
          ( "eslint" .
            (:command "npx"
                      :args ("-y" "@uplinq/mcp-eslint")
                      :cwd "$HOME/devel/promethean"))
          ( "file-system" .
            (:command "/home/err/devel/promethean/scripts/mcp/bin/filesystem.sh"))
          ( "github" .
            (:command "/home/err/devel/promethean/scripts/mcp/bin/github.sh"))
          ( "github-chat" .
            (:command "/home/err/devel/promethean/scripts/mcp/bin/github_chat.sh"))
          ( "haiku-rag" .
            (:command "uvx"
                      :args ("haiku-rag" "serve" "--stdio" "--db" "/home/err/.local/share/haiku-rag")
                      :cwd "$HOME/devel/promethean"))
          ( "npm-helper" .
            (:command "npx"
                      :args ("-y" "@pinkpixel/npm-helper-mcp")
                      :cwd "$HOME/devel/promethean"))
          ( "obsidian" .
            (:command "/home/err/devel/promethean/scripts/mcp/bin/obsidian.sh"))
          ( "playwright" .
            (:command "npx"
                      :args ("@playwright/mcp@latest")
                      :cwd "$HOME/devel/promethean"))
          ( "serena" .
            (:command "uvx"
                      :args ("--from" "git+https://github.com/oraios/serena" "serena" "start-mcp-server")
                      :cwd "$HOME/devel/promethean"))
          ( "sonarqube" .
            (:command "/home/err/devel/promethean/scripts/mcp/bin/sonarqube.sh"))
          ( "ts-ls-lsp" .
            (:command "npx"
                      :args ("tritlo/lsp-mcp" "typescript" "/home/err/.volta/bin/typescript-language-server" "--stdio")
                      :cwd "$HOME/devel/promethean"))
          )))
