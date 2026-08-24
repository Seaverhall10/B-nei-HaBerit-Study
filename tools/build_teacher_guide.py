#!/usr/bin/env python3
"""Build the facilitator guide outside the GitHub Pages publish directory."""

from __future__ import annotations

import html
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WEEKS = ROOT / "public" / "weeks.json"
OUTPUT = ROOT / "teacher" / "guide.html"


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def bullets(items: list[str]) -> str:
    return "<ul>" + "".join(f"<li>{esc(item)}</li>" for item in items) + "</ul>"


def main() -> None:
    weeks = json.loads(WEEKS.read_text(encoding="utf-8"))
    sections = []
    for week in weeks:
        sections.append(f"""
<section>
  <p class="number">Week {week['n']}</p>
  <h2>{esc(week['title'])}</h2>
  <p><strong>Spine:</strong> {esc(week['spine'])}</p>
  <p><strong>Big idea:</strong> {esc(week['big'])}</p>
  <h3>Facilitator moves</h3>{bullets(week['teacherMoves'])}
  <h3>What participants should notice</h3>{bullets(week['observe'])}
  <p><strong>Question:</strong> {esc(week['question'])}</p>
  <p><strong>Guardrail:</strong> {esc(week['guard'])}</p>
  <p><strong>Response:</strong> {esc(week['response'])}</p>
</section>""")
    document = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>B’nei Haberit Facilitator Guide</title><style>
body{{font:18px/1.55 Georgia,serif;color:#211d17;max-width:800px;margin:auto;padding:32px 20px;background:#f5eddb}}h1,h2,h3{{color:#173d39}}h1{{border-bottom:4px solid #c9a24a;padding-bottom:12px}}section{{background:#fff;padding:24px;margin:24px 0;border:1px solid #cdbb8d}}.number{{text-transform:uppercase;letter-spacing:.12em;font-weight:bold;color:#72571c}}li{{margin:.4em 0}}@media print{{body{{background:#fff}}section{{break-inside:avoid;border:0;border-top:1px solid #999}}}}
</style></head><body><h1>B’nei Haberit Facilitator Guide</h1>
<p>This guide is generated from the same twelve-week source as the participant site. It is intentionally excluded from the public website deployment.</p>
{''.join(sections)}</body></html>"""
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(document, encoding="utf-8")
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
