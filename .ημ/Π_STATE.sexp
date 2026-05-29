(handoff
  (kind eta-mu-kanban-migration)
  (time "2026-05-29T04:02:26Z")
  (repo "orgs/octave-commons/promethean")
  (manifest "/tmp/eta-mu-kanban-batches/agent_octave_commons.json")
  (verification "eta-mu-beta kanban count --tasks-dir <boardDir>")
  (entries
    (entry (spec-dir "orgs/octave-commons/promethean/docs/specs") (board-dir "orgs/octave-commons/promethean/docs/kanban") (cards 2))
    (entry (spec-dir "orgs/octave-commons/promethean/spec") (board-dir "orgs/octave-commons/promethean/kanban") (cards 101)))
  (concurrent-policy "path-scoped staging only; unrelated dirt preserved"))
