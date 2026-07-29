#!/usr/bin/env python3
"""afterAgentResponse: count turns for long-session guard."""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

STATE_DIR = Path(__file__).resolve().parent / "state"


def main() -> None:
    # Drain stdin even if unused
    sys.stdin.read()
    session_id = os.environ.get("ONEOS_TOKEN_BUDGET_SESSION")
    if not session_id:
        latest = STATE_DIR / "latest-session.json"
        if latest.exists():
            try:
                session_id = json.loads(latest.read_text(encoding="utf-8")).get("session_id")
            except Exception:
                session_id = None
    session_id = session_id or "unknown"
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    path = STATE_DIR / f"session-{session_id}.json"
    state = {"session_id": session_id, "turns": 0, "warned_long": False, "warned_expensive": False}
    if path.exists():
        try:
            state.update(json.loads(path.read_text(encoding="utf-8")))
        except Exception:
            pass
    state["turns"] = int(state.get("turns") or 0) + 1
    path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    print("{}")


if __name__ == "__main__":
    try:
        main()
    except Exception:
        print("{}")
