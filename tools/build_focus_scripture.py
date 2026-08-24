#!/usr/bin/env python3
"""Build the focused, public-domain Scripture used by the participant page."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


REFERENCE = re.compile(r"^(?P<book>(?:[1-3] )?[A-Za-z ]+?) (?P<chapter>\d+)(?::(?P<start>\d+)(?:-(?P<end>\d+))?)?$")


def book_file(book: str) -> str:
    normalized = book.lower().replace(" ", "")
    return "psalms" if normalized == "psalm" else normalized


def extract(reference: str, web_dir: Path) -> dict:
    match = REFERENCE.fullmatch(reference)
    if not match:
        raise ValueError(f"Unsupported reference: {reference}")
    source = web_dir / f"{book_file(match.group('book'))}.json"
    if not source.exists():
        raise FileNotFoundError(f"No WEB source for {reference}: {source}")
    book = json.loads(source.read_text(encoding="utf-8"))
    chapter_number = match.group("chapter")
    chapter = book.get(chapter_number)
    if not chapter:
        raise ValueError(f"Chapter not found: {reference}")
    start = int(match.group("start") or min(map(int, chapter)))
    end = int(match.group("end") or match.group("start") or max(map(int, chapter)))
    verses = [
        {"n": number, "text": chapter[str(number)]}
        for number in range(start, end + 1)
        if str(number) in chapter
    ]
    if not verses:
        raise ValueError(f"No verses extracted: {reference}")
    return {"reference": reference, "verses": verses}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--web-dir", required=True, type=Path)
    parser.add_argument("--weeks", type=Path, default=Path("public/weeks.json"))
    parser.add_argument("--output", type=Path, default=Path("public/scripture_focus.json"))
    args = parser.parse_args()

    weeks = json.loads(args.weeks.read_text(encoding="utf-8"))
    result = {
        "translation": "World English Bible",
        "abbreviation": "WEB",
        "license": "Public Domain",
        "source": "https://ebible.org/find/show.php?id=eng-web",
        "note": "Focused passages are included so participants can begin with Scripture. Compare with your preferred translation.",
        "weeks": {
            str(week["n"]): [extract(reference, args.web_dir) for reference in week["focus"]]
            for week in weeks
        },
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {args.output} with {sum(map(len, result['weeks'].values()))} passages")


if __name__ == "__main__":
    main()
