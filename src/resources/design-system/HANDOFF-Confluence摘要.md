# OneOS V2 设计规范 · 其他前端接入（Confluence 摘要）

> 可贴到 Confluence / 飞书 / 钉钉文档。完整步骤见同目录 `HANDOFF-其他前端.md`。

---

## 一句话

**另一套前端（Vue / Antd / 自研等）不拷贝本仓库 React 组件，只接入「DESIGN + Token + AI 口令」，组件按规范自研等价实现。**

---

## 预览（人眼对齐）

| 页面 | 链接 |
|---|---|
| 控件展厅 | https://prototype.lnoneos.com/oneos-v2/index.html |
| 台账三视角母版 | https://prototype.lnoneos.com/lease-contract-management/index.html |

主色：**Stripe Violet `#533AFD`**（禁止旧绿 `#32a06e`、若依蓝 `#409EFF` 当 V2 主色）

---

## 对方要做什么（3 步）

1. **落盘**  
   外发包解压后放到：`docs/oneos-v2/`（含 `DESIGN.md`、`tokens`、`HANDOFF`、`ai-prompt-template`）。

2. **映射 Token**  
   引入 `oneos-ds-tokens.css`，或把 `tokens.json` 接到 Antd / Element / Tailwind 主题；颜色走 `--oneos-primary` / `--ln-*`。

3. **喂给 AI**  
   把 `HANDOFF-其他前端.md` 第 4 节 System Prompt 贴进 Cursor / Claude；任务里写「按 docs/oneos-v2/DESIGN.md」。

---

## 必给文件（外发包内）

- `00-请先阅读.md`
- `HANDOFF-其他前端.md` / 本摘要
- `DESIGN.md` + `chapters/`
- `tokens.json`、`oneos-ds-tokens.css`、`oneos-ds-filter-affordance.css`
- `ai-prompt-template.md`
- 若依可选：`ruoyi-*.json/css`

**不含**：`UIComponents.tsx`、业务原型源码。

---

## 硬性验收（打勾即可）

- 主色 / 浅深色与展厅一致
- 无原生 `<select>` / `<input type="date">`；H5 触控 ≥44px
- 同一操作区只有一个主按钮；弹窗取消左、确认右
- 台账：主搜索 +「更多筛选」强化；查询/重置后收起筛选
- 操作列：编辑/处理外显，查看记录等进「更多」
- 车牌无间隔点 `·`；金额等宽数字

---

## 如何打外发包（规范维护方）

在 OneOS 仓库根目录执行：

```bash
node scripts/pack-oneos-v2-design-handoff.mjs
# 或指定输出目录
node scripts/pack-oneos-v2-design-handoff.mjs --out ~/Desktop
```

产出：`dist/oneos-v2-design-handoff-v{版本}-{日期}.zip`

---

## 联系与版本

- 规范事实源：`DESIGN.md` 页眉版本（与展厅发布一致）
- 问题对接：OneOS 产品 / 设计规范负责人
