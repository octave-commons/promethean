;;; Sample MCP config for regression testing
(setq some-other-var 'ignored)

(setq mcp-server-programs
      '(("duckduckgo" . ("uvx" ["duck" "--stdio"]))
        ("file-system" . ("/usr/local/bin/filesystem"))
        ("haiku-rag" .
         ("uvx"
          ["haiku-rag" "serve" "--stdio" "--db" "/tmp/db"]))))

(message "done")
