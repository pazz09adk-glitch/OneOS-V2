# 物流业务条线

**闭环一句话**：物流合同生效 → 轻量调度派车派司机（未交车强校验）→ 办结落账 → 氢费/ETC 补录 → 项目盈亏与收款核销。

## 责任部门

业务管理（物流）、调度/运维、财务、能源（氢费补录协同）。

## 标准步骤

1. 物流合同要素录入并确认生效。
2. 调度任务：派车派司机；未交车不可办结出车。
3. 物流业务明细 / 台账落账。
4. 补录氢费/ETC，计入项目盈亏；关联收款。

## 模块索引

| 模块 | 规则卡 | 置信度 |
|------|--------|--------|
| 物流合同 | [self-operated-contract](../modules/self-operated-contract.md) | architecture |
| 调度任务 | [self-operated-dispatch-task](../modules/self-operated-dispatch-task.md) | architecture |
| 物流台账/盈亏 | [self-operated-business-ledger](../modules/self-operated-business-ledger.md) | architecture |
