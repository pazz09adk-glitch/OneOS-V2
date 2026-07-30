#!/usr/bin/env python3
"""Strip Alibaba Cloud S3 credentials from axhub.config.json before git commit/push."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

SECRET_KEYS = ("accessKeyId", "secretAccessKey")
DEFAULT_CONFIG = Path(".axhub/make/axhub.config.json")


def scrub_obj(data: dict) -> bool:
    changed = False
    s3 = data.get("cloudPublishing", {}).get("s3")
    if not isinstance(s3, dict):
        return False
    for key in SECRET_KEYS:
        if s3.get(key):
            s3[key] = ""
            changed = True
    return changed


def scrub_text(text: str) -> tuple[str, bool]:
    data = json.loads(text)
    changed = scrub_obj(data)
    return json.dumps(data, ensure_ascii=False, indent=2) + "\n", changed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "path",
        nargs="?",
        default=str(DEFAULT_CONFIG),
        help="Config file to scrub in place (default: .axhub/make/axhub.config.json)",
    )
    parser.add_argument(
        "--stdin",
        action="store_true",
        help="Read JSON from stdin and write scrubbed JSON to stdout",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Exit 1 if secrets are present (no write)",
    )
    args = parser.parse_args()

    if args.stdin:
        text = sys.stdin.read()
        out, changed = scrub_text(text)
        if args.check:
            return 1 if changed else 0
        sys.stdout.write(out)
        return 0

    path = Path(args.path)
    if not path.exists():
        return 0
    text = path.read_text(encoding="utf-8")
    out, changed = scrub_text(text)
    if args.check:
        if changed:
            print(f"ERROR: {path} still contains S3 access keys", file=sys.stderr)
            return 1
        return 0
    if changed:
        path.write_text(out, encoding="utf-8")
        print(f"scrubbed S3 secrets from {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
