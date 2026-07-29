# 10. 主题变体（官方默认 + 实验室比稿）

> **已确认（2026-07-23 修订）**：结构采用 **Linear**；**官方默认主色 = Stripe Violet `#533AFD`**（租赁合同台账母版）。  
> **官方事实源**：母版 `LeaseContractHub` · [`DESIGN.md`](../DESIGN.md) · [`tokens.json`](../tokens.json) · [`oneos-ds-tokens.css`](../oneos-ds-tokens.css)  
> **机器可读**：[`theme-variants.json`](../theme-variants.json)（实验室预设可保留；**默认项须为 Violet**）  
> **可运行预览**：`lease-contract-management` / `oneos-v2` 入口

---

## 1. 确认结论

| 项 | 决定 |
|----|------|
| 结构 / 字号 / 圆角 / 台账壳 | Linear + 母版三视图（列表 / 看板 / 主从） |
| 当前默认主色 | `#533AFD`（Stripe Violet） |
| Hover / Focus / Soft | `#6346FF` / `#4226E8` / `#E0E7FF`（Dark soft: `rgba(83,58,253,0.18)`） |
| 正式暗色 | **支持**（与母版一致） |
| 旧品牌绿 `#32a06e` | 仅存量未迁页；**V2 新页禁止** |
| 若依蓝 `#409EFF` | 仅主题实验室比稿；**非官方默认** |

实验室可继续切换比稿色；**合入 V2 / 迁页验收一律以 Violet 为准**。

---

## 2. 实验室预设（非默认）

见 `theme-variants.json` → 若依色板等仅供比稿预览，不得覆盖官方 Token 默认值。

---

## 3. 比稿主题 A–E（保留切换，非默认）

| ID | 名称 | 现状 |
|----|------|------|
| 官方 | Stripe Violet | **与母版 / tokens 一致** |
| 其它 | 若依蓝 / 绿等 | 实验室可切，验收不通过 |

---

## 4. 验收

- [ ] 新页默认主色为 `#533AFD`
- [ ] 浅/深双色可用
- [ ] 对标 `oneos-v2/DESIGN.md` 迁页清单
