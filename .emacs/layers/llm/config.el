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
        '(( "backseat-driver" .
            (:command "/home/err/.config/calva/backseat-driver/calva-mcp-server.js"
                      :args ("1664")))
          ( "duckduckgo" .
            (:command "/home/err/devel/promethean/scripts/mcp/bin/duck.sh"))
          ( "file-system" .
            (:command "/home/err/devel/promethean/scripts/mcp/bin/filesystem.sh"))
          ( "github" .
            (:command "/home/err/devel/promethean/scripts/mcp/bin/github.sh"))
          ( "github-chat" .
            (:command "/home/err/devel/promethean/scripts/mcp/bin/github_chat.sh"))
          ( "haiku-rag" .
            (:command "uvx"
                      :args ("haiku-rag" "serve" "--stdio" "--db" "/home/err/.local/share/haiku-rag/db")))
          ( "lsp-mcp" .
            (:command "npx"
                      :args ("tritlo/lsp-mcp" "typescript" "/home/err/.volta/bin/typescript-language-server" "--stdio")))
          ( "npm-helper" .
            (:command "npx"
                      :args ("-y" "npm-helper-mcp")))
          ( "obsidian" .
            (:command "/home/err/devel/promethean/scripts/mcp/bin/obsidian.sh"))
          ( "sonarqube" .
            (:command "/home/err/devel/promethean/scripts/mcp/bin/sonarqube.sh"))
          )))
;; AUTO GENREATED MCP SERVER CONFIG BY mk.mcp-cli END

(setq mcp-server-programs
      '(
  ("backseat-driver" . ("/home/err/.config/calva/backseat-driver/calva-mcp-server.js" ["1664"]))
  ("duckduckgo" . ("/home/err/devel/promethean/scripts/mcp/bin/duck.sh"))
  ("file-system" . ("/home/err/devel/promethean/scripts/mcp/bin/filesystem.sh"))
  ("github" . ("/home/err/devel/promethean/scripts/mcp/bin/github.sh"))
  ("github-chat" . ("/home/err/devel/promethean/scripts/mcp/bin/github_chat.sh"))
  ("haiku-rag" . ("uvx" ["haiku-rag" "serve" "--stdio" "--db" "/home/err/.local/share/haiku-rag/db"]))
  ("npm-helper" . ("npx" ["-y" "@pinkpixel/npm-helper-mcp"]))
  ("obsidian" . ("/home/err/devel/promethean/scripts/mcp/bin/obsidian.sh"))
  ("sonarqube" . ("/home/err/devel/promethean/scripts/mcp/bin/sonarqube.sh"))
  ("ts-ls-lsp" . ("npx" ["tritlo/lsp-mcp" "typescript" "/home/err/.volta/bin/typescript-language-server" "--stdio"]))
      ))
