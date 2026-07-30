#!/usr/bin/env python3
"""Merge local-only S3 secrets into axhub.config.json for Make publishing."""

from __future__ import annotations

import json
import sys
from pathlib import Path

CONFIG = Path(".axhub/make/axhub.config.json")
LOCAL = Path(".axhub/make/s3.secrets.local.json")
SECRET_KEYS = ("accessKeyId", "secretAccessKey")


def main() -> int:
    if not CONFIG.exists():
        print(f"skip: missing {CONFIG}", file=sys.stderr)
        return 0
    if not LOCAL.exists():
        print(
            f"skip: missing {LOCAL} (create it locally with accessKeyId/secretAccessKey)",
            file=sys.stderr,
        )
        return 0

    local = json.loads(LOCAL.read_text(encoding="utf-8"))
    data = json.loads(CONFIG.read_text(encoding="utf-8"))
    s3 = data.setdefault("cloudPublishing", {}).setdefault("s3", {})
    changed = False
    for key in SECRET_KEYS:
        value = local.get(key) or ""
        if value and s3.get(key) != value:
            s3[key] = value
            changed = True
    if changed:
        CONFIG.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"applied local S3 secrets into {CONFIG}")
    else:
        print("local S3 secrets already applied")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
