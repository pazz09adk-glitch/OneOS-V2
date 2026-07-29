#!/usr/bin/env python3
"""subagentStart: block default parallel / best-of-n workers to save tokens."""
from __future__ import annotations

import json
import sys


def main() -> None:
    raw = sys.stdin.read().strip()
    payload = json.loads(raw) if raw else {}
    subagent_type = str(payload.get("subagent_type") or "")
    is_parallel = bool(payload.get("is_parallel_worker"))
    task = str(payload.get("task") or "")
    allow_high = "确认高耗" in task

    if (subagent_type == "best-of-n-runner" or is_parallel) and not allow_high:
        print(
            json.dumps(
                {
                    "permission": "deny",
                    "user_message": (
                        "已自动拦截并行/Best-of-N 子代理（省用量）。"
                        "如确需并行，请在需求里写明「确认高耗」。"
                    ),
                },
                ensure_ascii=False,
            )
        )
        return

    print(json.dumps({"permission": "allow"}))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        print(json.dumps({"permission": "allow"}))
