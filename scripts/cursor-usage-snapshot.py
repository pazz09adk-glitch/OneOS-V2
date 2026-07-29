#!/usr/bin/env python3
"""本地用量快照：不消耗 Cursor Agent token，直接读官方 API。"""
from __future__ import annotations

import datetime as dt
import json
import sqlite3
import urllib.request
from collections import defaultdict

STATE_DB = "/Users/sylvawong/Library/Application Support/Cursor/User/globalStorage/state.vscdb"
TZ = dt.timezone(dt.timedelta(hours=8))


def token() -> str:
    conn = sqlite3.connect(STATE_DB)
    try:
        row = conn.execute(
            "SELECT value FROM ItemTable WHERE key='cursorAuth/accessToken'"
        ).fetchone()
    finally:
        conn.close()
    if not row:
        raise SystemExit("未找到 Cursor accessToken，请先在 Cursor 登录。")
    return row[0]


def post(path: str, body: dict | None = None) -> dict:
    req = urllib.request.Request(
        f"https://api2.cursor.sh/{path}",
        data=json.dumps(body or {}).encode(),
        headers={
            "Authorization": f"Bearer {token()}",
            "Content-Type": "application/json",
            "Connect-Protocol-Version": "1",
            "User-Agent": "oneos-token-budget/1.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode() or "{}")


def ms_to_local(ms: str | int) -> str:
    return dt.datetime.fromtimestamp(int(ms) / 1000, TZ).strftime("%Y-%m-%d %H:%M")


def main() -> None:
    usage = post("aiserver.v1.DashboardService/GetCurrentPeriodUsage")
    plan = post("aiserver.v1.DashboardService/GetPlanInfo")
    pu = usage.get("planUsage") or {}
    info = plan.get("planInfo") or {}

    print("=== Cursor 用量快照 ===")
    print(f"套餐: {info.get('planName')} ({info.get('price')})")
    print(f"账期: {ms_to_local(usage.get('billingCycleStart'))} → {ms_to_local(usage.get('billingCycleEnd'))}")
    print(f"Auto+Composer: {float(pu.get('autoPercentUsed') or 0):.2f}%")
    print(f"API:            {float(pu.get('apiPercentUsed') or 0):.2f}%")
    print(f"综合 total:     {float(pu.get('totalPercentUsed') or 0):.2f}%")
    print(
        f"等价花费: ${float(pu.get('totalSpend') or 0)/100:.2f} / ${float(pu.get('limit') or 0)/100:.2f}"
    )

    # Today since 00:00
    now = dt.datetime.now(TZ)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    data = post(
        "aiserver.v1.DashboardService/GetFilteredUsageEvents",
        {
            "startDate": str(int(start.timestamp() * 1000)),
            "endDate": str(int(now.timestamp() * 1000)),
            "page": 1,
            "pageSize": 200,
        },
    )
    events = list(data.get("usageEventsDisplay") or [])
    total = int(data.get("totalUsageEventsCount") or 0)
    pages = max(1, (total + 199) // 200)
    for page in range(2, pages + 1):
        more = post(
            "aiserver.v1.DashboardService/GetFilteredUsageEvents",
            {
                "startDate": str(int(start.timestamp() * 1000)),
                "endDate": str(int(now.timestamp() * 1000)),
                "page": page,
                "pageSize": 200,
            },
        )
        events.extend(more.get("usageEventsDisplay") or [])

    tot = defaultdict(int)
    by_model = defaultdict(lambda: defaultdict(int))
    for e in events:
        tu = e.get("tokenUsage") or {}
        inp = int(tu.get("inputTokens") or 0)
        out = int(tu.get("outputTokens") or 0)
        cache = int(tu.get("cacheReadTokens") or 0)
        model = e.get("model") or "unknown"
        tot["events"] += 1
        tot["input"] += inp
        tot["output"] += out
        tot["cache"] += cache
        tot["all"] += inp + out + cache
        tot["io"] += inp + out
        by_model[model]["all"] += inp + out + cache
        by_model[model]["events"] += 1

    print(f"\n=== 今日（自 {start.strftime('%H:%M')}）===")
    print(f"请求: {tot['events']:,}")
    print(f"输入+输出: {tot['io']:,}")
    print(f"含缓存合计: {tot['all']:,}")
    print("按模型:")
    for model, b in sorted(by_model.items(), key=lambda kv: -kv[1]["all"]):
        print(f"  - {model}: {b['events']} 次, 含缓存 {b['all']:,}")


if __name__ == "__main__":
    main()
