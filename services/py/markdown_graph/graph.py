import os
import re
import sqlite3
from collections import deque
from typing import Iterable, List


LINK_PATTERN = re.compile(r"\[[^\]]*\]\(([^)]+\.md)\)")
TAG_PATTERN = re.compile(r"(?<!\w)#(\w+)")


class GraphDB:
    """Maintain links and hashtags for markdown files in SQLite."""

    def __init__(self, db_path: str, repo_path: str) -> None:
        self.repo_path = os.path.abspath(repo_path)
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self._init_db()

    def _init_db(self) -> None:
        cur = self.conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                path TEXT UNIQUE
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS links (
                src INTEGER,
                dst INTEGER,
                FOREIGN KEY(src) REFERENCES files(id),
                FOREIGN KEY(dst) REFERENCES files(id)
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS hashtags (
                file_id INTEGER,
                tag TEXT,
                FOREIGN KEY(file_id) REFERENCES files(id)
            )
            """
        )
        self.conn.commit()

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _rel(self, path: str) -> str:
        abs_path = os.path.abspath(
            path if os.path.isabs(path) else os.path.join(self.repo_path, path)
        )
        return os.path.relpath(abs_path, self.repo_path)

    def _get_file_id(self, path: str) -> int:
        rel = self._rel(path)
        cur = self.conn.cursor()
        cur.execute("INSERT OR IGNORE INTO files(path) VALUES (?)", (rel,))
        self.conn.commit()
        cur.execute("SELECT id FROM files WHERE path=?", (rel,))
        row = cur.fetchone()
        assert row is not None
        return row[0]

    def _parse_links(self, content: str) -> Iterable[str]:
        return LINK_PATTERN.findall(content)

    def _parse_tags(self, content: str) -> Iterable[str]:
        return TAG_PATTERN.findall(content)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def update_file(self, path: str, content: str) -> None:
        file_id = self._get_file_id(path)
        cur = self.conn.cursor()
        cur.execute("DELETE FROM links WHERE src=?", (file_id,))
        cur.execute("DELETE FROM hashtags WHERE file_id=?", (file_id,))
        for link in self._parse_links(content):
            target_path = os.path.normpath(os.path.join(os.path.dirname(path), link))
            target_id = self._get_file_id(target_path)
            cur.execute(
                "INSERT INTO links(src, dst) VALUES (?, ?)", (file_id, target_id)
            )
        for tag in self._parse_tags(content):
            cur.execute(
                "INSERT INTO hashtags(file_id, tag) VALUES (?, ?)", (file_id, tag)
            )
        self.conn.commit()

    def get_links(self, path: str) -> List[str]:
        rel = self._rel(path)
        cur = self.conn.cursor()
        cur.execute(
            """
            SELECT f2.path FROM links
            JOIN files f1 ON f1.id = links.src
            JOIN files f2 ON f2.id = links.dst
            WHERE f1.path=?
            """,
            (rel,),
        )
        return [row[0] for row in cur.fetchall()]

    def get_files_with_tag(self, tag: str) -> List[str]:
        cur = self.conn.cursor()
        cur.execute(
            """
            SELECT files.path FROM hashtags
            JOIN files ON files.id = hashtags.file_id
            WHERE tag=?
            """,
            (tag,),
        )
        return [row[0] for row in cur.fetchall()]

    def cold_start(self) -> None:
        start = os.path.join(self.repo_path, "readme.md")
        queue: deque[str] = deque([start])
        seen = set()
        while queue:
            path = queue.popleft()
            if path in seen or not os.path.isfile(path):
                continue
            seen.add(path)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            self.update_file(path, content)
            for link in self._parse_links(content):
                next_path = os.path.normpath(os.path.join(os.path.dirname(path), link))
                if next_path.startswith(self.repo_path):
                    queue.append(next_path)
