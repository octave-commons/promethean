# SPDX-License-Identifier: GPL-3.0-only
import json
from pathlib import Path

import hy
from mk.generator import collect_commands, render_rules


def test_collect_commands_json(tmp_path):
    descriptor = tmp_path / "cmds.json"
    descriptor.write_text(json.dumps({"sample": "echo hi"}))
    data = collect_commands(str(descriptor))
    assert "sample" in data["commands"]


def test_render_rules_phony_block():
    data = collect_commands()
    rendered = render_rules(data["patterns"])
    assert len(rendered["phony-lines"]) > 0
