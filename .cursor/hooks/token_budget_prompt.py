#!/usr/bin/env python3
"""beforeSubmitPrompt: soft-block once for expensive/long-session patterns."""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

STATE_DIR = Path(__file__).resolve().parent / "state"
LONG_TURN_THRESHOLD = 15

EXPENSIVE_RE = re.compile(
    r"(全仓|全部文件|先全局|扫一遍仓库|多开几个\s*agent|并行探索|best[-\s]?of[-\s]?n|同时开\d+个)",
    re.I,
)
ALLOW_LONG_RE = re.compile(r"继续本会话")
ALLOW_EXPENSIVE_RE = re.compile(r"确认高耗")


def load_state(session_id: str) -> tuple[Path, dict]:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    path = STATE_DIR / f"session-{session_id}.json"
    state = {
        "session_id": session_id,
        "turns": 0,
        "warned_long": False,
        "warned_expensive": False,
    }
    if path.exists():
        try:
            state.update(json.loads(path.read_text(encoding="utf-8")))
        except Exception:
            pass
    return path, state


def save_state(path: Path, state: dict) -> None:
    path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    raw = sys.stdin.read().strip()
    payload = json.loads(raw) if raw else {}
    prompt = str(payload.get("prompt") or "")
    session_id = (
        os.environ.get("ONEOS_TOKEN_BUDGET_SESSION")
        or payload.get("conversation_id")
        or payload.get("session_id")
    )
    if not session_id:
        latest = STATE_DIR / "latest-session.json"
        if latest.exists():
            try:
                session_id = json.loads(latest.read_text(encoding="utf-8")).get("session_id")
            except Exception:
                session_id = None
    session_id = session_id or "unknown"
    path, state = load_state(str(session_id))
    turns = int(state.get("turns") or 0)

    # Long session soft gate (once unless user confirms)
    if (
        turns >= LONG_TURN_THRESHOLD
        and not state.get("warned_long")
        and not ALLOW_LONG_RE.search(prompt)
    ):
        state["warned_long"] = True
        save_state(path, state)
        print(
            json.dumps(
                {
                    "continue": False,
                    "user_message": (
                        f"省用量提醒：本会话已约 {turns} 轮，继续长聊会明显烧 token。\n"
                        "建议：复制当前进度摘要 → 新开聊天继续。\n"
                        "若必须继续本会话，请在消息里加上「继续本会话」后再发送。"
                    ),
                },
                ensure_ascii=False,
            )
        )
        return

    # Expensive intent soft gate (once unless user confirms)
    if (
        EXPENSIVE_RE.search(prompt)
        and not state.get("warned_expensive")
        and not ALLOW_EXPENSIVE_RE.search(prompt)
    ):
        state["warned_expensive"] = True
        save_state(path, state)
        print(
            json.dumps(
                {
                    "continue": False,
                    "user_message": (
                        "省用量提醒：这句话容易触发全仓扫描 / 并行多 Agent，费用很高。\n"
                        "更省的写法：点名文件/目录，或拆成短会话。\n"
                        "若确认就要高耗执行，请在消息里加上「确认高耗」后再发送。"
                    ),
                },
                ensure_ascii=False,
            )
        )
        return

    print(json.dumps({"continue": True}))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        print(json.dumps({"continue": True}))
