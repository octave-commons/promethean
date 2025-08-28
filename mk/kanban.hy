
(defn-cmd board-sync []
  (sh ["python" "scripts/github_board_sync.py"]))

(defn-cmd kanban-from-tasks []
  (sh "python scripts/hashtags_to_kanban.py > docs/agile/boards/kanban.md" :shell True))

(defn-cmd kanban-to-hashtags []
  (sh ["python" "scripts/kanban_to_hashtags.py"]))

(defn-cmd kanban-to-issues []
  (sh ["python" "scripts/kanban_to_issues.py"]))