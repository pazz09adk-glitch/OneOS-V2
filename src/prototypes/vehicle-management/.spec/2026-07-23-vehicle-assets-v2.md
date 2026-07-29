# 2026-07-23 · 车辆资产 V2 设计决策快照

## 已确认

| 项 | 决策 |
|----|------|
| 产品范围 | A：列表 + 详情完整重做 |
| 设计基底 | OneOS V2（`src/resources/design-system/DESIGN.md`），禁止 themes 比选 |
| 布局 | 默认列表；详情独立全页；看板/主从提供可切换入口 |
| 视觉 | Stripe Violet `#533AFD` + Linear；`--ln-*` token；浅/深色 |
| 数据 | 复用 1.2 `vehicles.json` 等种子与筛选/KPI 业务规则 |

## 不做

- 旧 `vm-*` 绿系壳层直接换色
- 本轮 H5
