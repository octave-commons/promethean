# Markdown Graph Service

Maintains a graph of markdown links and `#hashtags` in an SQLite database.

### Endpoints

- `POST /update` – supply `{ path, content }` to update the graph.
- `GET /links/{path}` – return links from the given markdown file.
- `GET /hashtags/{tag}` – return all files referencing the tag.

#markdown #service
