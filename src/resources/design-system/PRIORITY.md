# OneOS 设计规范 v2 · 编写与落地优先级

> 决策更新日期：2026-07-23  
> **主色冻结**：Stripe Violet `#533AFD`（母版 = `lease-contract-management` / LeaseContractHub）  
> App 范围：原生 App + 微信小程序 + H5 现场端（三端全含）  
> 文档落点：`src/resources/design-system/`（v2.2）；不另建 `design-system-v2`

## 编写顺序（高 → 低）

| 序 | 章节 | 原因 |
|----|------|------|
| 1 | 00 总则与端矩阵 | 先定母版、事实源、命名、端边界 |
| 2 | 01 Foundations | Token 与母版色表一致 |
| 3 | 08 Tokens 附录 + `tokens.json` / CSS | 机器可读与 CSS 入口 |
| 4 | 02 Layout（含三视图模板） | 对标 Hub 列表 / 看板 / 主从 |
| 5 | 04 Patterns | 业务最高频台账模式 |
| 6 | 03 Components | 按钮 / Pill / 表格状态表 |
| 7 | 07 Platform Notes | Web / App / 小程序差异 |
| 8 | 05 Content + 06 Accessibility | 文案与无障碍 |
| 9 | 09 迁移与检查清单 | 1.2 → V2 扫页验收 |

## 工程落地顺序

1. **冻结主色**：`#533AFD`；废弃 V2 新页使用 `#32a06e` / `#409EFF` / `#10b981` 作主色  
2. 保持 `tokens.json` + `oneos-ds-tokens.css` 与母版一致  
3. V2 / 迁入页强制对标 LeaseContractHub；引入 token +（逐步）公共三视图壳  
4. 按 [`oneos-v2/.spec/migration-from-1.2.md`](../../prototypes/oneos-v2/.spec/migration-from-1.2.md) 租赁条线优先迁页  
5. 存量 vm / field 绿皮页：迁入前换 Token，再升布局；未迁前标为 legacy
