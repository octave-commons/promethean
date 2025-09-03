# SPDX-License-Identifier: GPL-3.0-only
"""Tests for ``scripts.convert_wikilinks``."""

import scripts.convert_wikilinks as cw


def test_convert_wikilinks_replaces_links(tmp_path):
    md = tmp_path / "note.md"
    md.write_text("See [[Target Page|Alias]] and [[Another]].", encoding="utf-8")

    cw.convert_wikilinks(md)

    text = md.read_text(encoding="utf-8")
    assert text == "See [Alias](Target%20Page.md) and [Another](Another.md)."


def test_convert_wikilinks_no_change(tmp_path):
    md = tmp_path / "plain.md"
    original = "No links here."
    md.write_text(original, encoding="utf-8")

    cw.convert_wikilinks(md)

    text = md.read_text(encoding="utf-8")
    assert text == original
