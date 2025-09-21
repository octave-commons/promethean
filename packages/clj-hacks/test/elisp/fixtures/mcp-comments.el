(setq mcp-server-programs
      '(;; Inline comment before entries
        ("alpha" . ("alpha-cmd" ["--stdio"]))
        ;; Blank entries should be ignored
        ("beta" . ("beta-cmd"))
        ;; Mixed whitespace and trailing comment
        ("gamma" . ("gamma" ["--flag1" "--flag2"])) ; ensure comment ignored
        ))
