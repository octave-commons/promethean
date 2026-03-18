(Π_STATE
  (time "2026-03-18T00:04:56-05:00")
  (branch "device/stealth")
  (pre_head "e8a58debc")
  (dirty true)
  (checks
    (check (status passed) (command "packages/lmdb-cache pnpm typecheck"))
    (check (status skipped) (note "pointer-only snapshot in parent repo"))
  )
  (repo_notes
    (upstream "origin/device/stealth")
    (status_digest "bedd-d6be-002c-7522")
    (submodule (path "packages/lmdb-cache") (to "58283fd") (tag "Π/2026-03-18/050421-58283fd"))
  )
)
