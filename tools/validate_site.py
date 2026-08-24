#!/usr/bin/env python3
"""Fail fast when participant content or deployment structure drifts."""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
ERRORS: list[str] = []

def fail(message: str) -> None: ERRORS.append(message)

class AssetParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(); self.assets: list[tuple[str, str]] = []; self.has_skip = False; self.has_current = False
    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = dict(attrs)
        if "skip-link" in data.get("class", ""): self.has_skip = True
        if data.get("aria-current") == "page": self.has_current = True
        for key in ("href", "src"):
            if data.get(key): self.assets.append((key, data[key] or ""))

def validate_json() -> None:
    weeks = json.loads((PUBLIC / "weeks.json").read_text(encoding="utf-8"))
    scripture = json.loads((PUBLIC / "scripture_focus.json").read_text(encoding="utf-8"))
    recap = json.loads((PUBLIC / "recap.json").read_text(encoding="utf-8"))
    required = {"n", "title", "theme", "spine", "big", "student", "focus", "question", "observe", "teacherMoves", "app", "guard", "response"}
    if [week.get("n") for week in weeks] != list(range(1, 13)): fail("weeks.json must contain weeks 1 through 12 exactly once and in order")
    for week in weeks:
        missing = required - set(week)
        if missing: fail(f"Week {week.get('n')} missing fields: {sorted(missing)}")
        passages = scripture.get("weeks", {}).get(str(week.get("n")), [])
        if [item.get("reference") for item in passages] != week.get("focus"): fail(f"Week {week.get('n')} embedded Scripture does not match focus references")
        for passage in passages:
            if not passage.get("verses") or any(not verse.get("text", "").strip() for verse in passage["verses"]): fail(f"Empty embedded Scripture in {passage.get('reference')}")
    if scripture.get("license") != "Public Domain" or scripture.get("abbreviation") != "WEB": fail("Embedded Scripture must retain WEB Public Domain attribution")
    if len(recap.get("spine", [])) != 12: fail("recap.json must contain twelve story-map stations")

def validate_html() -> None:
    for filename in ("index.html", "map.html", "job.html"):
        path = PUBLIC / filename; text = path.read_text(encoding="utf-8"); parser = AssetParser(); parser.feed(text)
        if not parser.has_skip: fail(f"{filename} is missing a skip link")
        if not parser.has_current: fail(f"{filename} is missing aria-current navigation")
        if "manifest.webmanifest" not in text: fail(f"{filename} is missing the app manifest")
        if re.search(r"firebase|REPLACE_ME", text, re.IGNORECASE): fail(f"{filename} contains unfinished Firebase behavior")
        for _, target in parser.assets:
            parsed = urlsplit(target)
            if parsed.scheme or parsed.netloc or target.startswith(("#", "mailto:", "tel:")): continue
            if not (path.parent / parsed.path).resolve().exists(): fail(f"{filename} references missing local asset: {target}")
    for removed in ("teacher.html", "teacher.js"):
        if (PUBLIC / removed).exists(): fail(f"{removed} must not be deployed from public/")

def main() -> int:
    try: validate_json(); validate_html()
    except (OSError, ValueError, json.JSONDecodeError) as exc: fail(str(exc))
    if ERRORS:
        print("VALIDATION FAILED")
        for error in ERRORS: print(f"- {error}")
        return 1
    print("VALIDATION PASSED: 12 weeks, 59 focused passages, deploy boundary, accessibility hooks, and local assets")
    return 0

if __name__ == "__main__": sys.exit(main())
