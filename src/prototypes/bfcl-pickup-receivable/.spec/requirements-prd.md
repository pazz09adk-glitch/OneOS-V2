# 业财·提车应收 PRD

| 项 | 内容 |
|---|---|
| 原型 | `/prototypes/bfcl-pickup-receivable` |
| KB | `vehicle-pickup-receivable` · `biz-finance-integration` |
| 对照旧页 | `Desktop/CURSOR/ONE-OS/web端/财务管理/提车应收款*.jsx` |

## 用户故事

合同主表展开提车收款单 → 核对车辆租金/保证金/服务费/氢预付 → 先/后开票 → 关联收款对齐 → 付清或特批 → 生成交车任务。

## 相对 V1.2

- 保留：合同聚合、收款单子表、车辆明细、氢预付、开票方式  
- 新增：财务入账关联门禁、特批放行、交车任务触发  

## 门禁

未对齐且无特批不可交车；无收款关联不得假性付清。
