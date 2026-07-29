#!/usr/bin/env python3
"""sessionStart: inject token-budget context and init turn counter."""
from __future__ import annotations

import json
import sys
from pathlib import Path

STATE_DIR = Path(__file__).resolve().parent / "state"
CONTEXT = """[Token Budget · auto]
省用量模式已开启：
1) 默认短会话、窄检索，禁止无必要全仓扫描
2) 日常任务用 Auto/Composer；不要主动升到 High/Grok High
3) 禁止默认并行多 Agent / Best-of-N
4) 长会话收口后建议用户新开聊天，先给摘要
用户说「确认高耗」或「继续本会话」时可放宽。"""


def main() -> None:
    raw = sys.stdin.read().strip()
    payload = json.loads(raw) if raw else {}
    session_id = payload.get("session_id") or payload.get("conversation_id") or "unknown"
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    state = {
        "session_id": session_id,
        "turns": 0,
        "warned_long": False,
        "warned_expensive": False,
    }
    state_path = STATE_DIR / f"session-{session_id}.json"
    state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    (STATE_DIR / "latest-session.json").write_text(
        json.dumps({"session_id": session_id}, ensure_ascii=False),
        encoding="utf-8",
    )
    print(
        json.dumps(
            {
                "env": {
                    "ONEOS_TOKEN_BUDGET": "1",
                    "ONEOS_TOKEN_BUDGET_SESSION": str(session_id),
                },
                "additional_context": CONTEXT,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    try:
        main()
    except Exception:
        print("{}")
