# Markdown Graph Service

Maintains a graph of markdown links and `#hashtags` in a MongoDB database.

- **Cold start:** traverses from `readme.md` and indexes all linked markdown files.
- **Updates:** file watcher services POST file contents to `/update`.
- **Query:** other services access `/links/{path}` or `/hashtags/{tag}`.

Implemented in TypeScript at `services/ts/markdown-graph`.

#markdown #service
