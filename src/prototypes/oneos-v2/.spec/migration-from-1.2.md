# 1.2 → OneOS V2 迁页清单（首批）

> 决策：以 [`lease-contract-management`](../../lease-contract-management/)（LeaseContractHub）为视觉与三视图母版。  
> 策略：先迁 **租赁条线**，再及其它条线。状态：`待迁` / `进行中` / `已对齐` / `例外说明`。

## 母版（已对齐）

| 模块 | 原型 ID | 状态 | 备注 |
|------|---------|------|------|
| 租赁合同台账 | `lease-contract-management` | 已对齐 | V2 入口直接复用 Hub；规范母版 |
| OneOS V2 入口 | `oneos-v2` | 已对齐 | `index.tsx` re-export Hub |

## Batch 1 · 租赁条线（优先）

| 序 | 模块 | 原型 ID | 建议视图 | 状态 | 迁入要点 |
|----|------|---------|----------|------|----------|
| 1 | 客户管理 | `customer-management` | 列表为主；详情可用主从 | 待迁 | 套 Hub 色与壳；评级/非标标识保留 |
| 2 | 标准合同模板 | `contract-template-management` | 列表 + 主从/表单 | 待迁 | Docx/风控逻辑不变，换皮肤与壳 |
| 3 | 提车应收款 | `vehicle-pickup-receivable` | 列表 + 可选看板（收款状态） | 待迁 | KPI + 工具栏对标 Hub |
| 4 | 租赁业务台账 | `lease-business-ledger` / `lease-business-detail` | 列表（明细可主从） | 待迁 | 账单算法不动；表格/状态 Pill 对齐 |
| 5 | 还车应结款 | `vehicle-return-settlement` | 列表 + 主从（会签） | 待迁 | 多部门审批轨迹用 Sub-tabs |

## Batch 2 · 同壳台账（租赁闭环后）

| 序 | 模块 | 原型 ID | 建议视图 | 状态 |
|----|------|---------|----------|------|
| 6 | 物流合同 | `self-operated-contract` | 列表 + 主从 | 待迁 |
| 7 | 调度任务 | `self-operated-dispatch-task` | 看板优先 + 列表 | 待迁 |
| 8 | 物流业务明细 | `self-operated-business-ledger` | 列表 | 待迁 |
| 9 | 车辆运维综合 | `oneos-web-ops` | 按子页选型 | 待迁 |
| 10 | 故障处置 | `vehicle-fault-handling` | 列表 + 看板 + 主从 | **已对齐** |

## Batch 3 · 能源 / 底座 / 工作台（后续）

见 V2 PRD §5 映射矩阵；每页迁入前先确认「三视图全开或 `.spec` 例外」。

## 单页迁入 SOP

1. 对照母版勾选 [`DESIGN.md`](../DESIGN.md) §4 验收项  
2. 引入 `oneos-ds-tokens.css`；主色改为 `#533AFD` / `--ln-primary`  
3. 台账页挂三视图壳（或写例外）  
4. 浅/深双色自测  
5. 更新该原型 PRD / annotation → `npm run nav:sync -- --prototype <id> --note "迁入 OneOS V2 视觉母版"`
