# Markdown Graph Service

Maintains a graph of markdown links and `#hashtags` in an SQLite database.

- **Cold start:** traverses from `readme.md` and indexes all linked markdown files.
- **Updates:** file watcher services POST file contents to `/update`.
- **Query:** other services access `/links/{path}` or `/hashtags/{tag}`.

#markdown #service
