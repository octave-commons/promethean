from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parent))
from utils import load_script_module

cw = load_script_module("convert_wikilinks")


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
