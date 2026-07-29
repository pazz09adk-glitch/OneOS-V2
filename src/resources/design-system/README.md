# OneOS V2 设计规范包（v2.4 · 全端）

供产品、设计、前端开发与 AI 代码生成统一引用。覆盖 **Web PC、移动 Web、原生 App、微信小程序、H5 现场端**。

---

## 核心设计标准 (OneOS V2)

- **主色与风格**：Stripe Violet **`#533AFD`** + Linear 扁平微结构
- **若依 (RuoYi) 动态主题色**：支持若依开源框架全局手动配置主题色（默认 Stripe Violet `#533AFD`、若依蓝 `#409EFF`、深绿 `#009688`、玫瑰红 `#F5222D` 等），全量 UI 控件通过 `--oneos-primary` / `--ln-primary` CSS 变量自动响应无缝切换
- **双色模式**：100% 支持浅色 (Light Mode) 与暗色 (Dark Mode) 全局无缝切换
- **三大视图模板**：
  1. **列表模式 (List)**：Bento Grid KPI 大盘 + 搜素控制条 + Stripe 台账表格
  2. **看板模式 (Kanban)**：4 阶段 Pipeline 管道列 + 快速操作卡片（点击无缝切入主从模式）
  3. **主从/表单模式 (Split / Master-Detail)**：左侧 340px 选单 + 右侧详情面板/结构化表单

---

## 文件与目录结构

| 文件 / 目录 | 用途说明 |
|------|------|
| [`DESIGN.md`](./DESIGN.md) | **OneOS V2 全局规范总览**：原则、Tokens、若依 (RuoYi) 注入指南 (§1.4)、三视图标准 |
| [`.cursor/rules/oneos-v2-design-system.mdc`](../../.cursor/rules/oneos-v2-design-system.mdc) | **Cursor Agent 自动执行规则**（作用域：`OneOSV2`） |
| [`src/prototypes/oneos-v2/DESIGN.md`](../../src/prototypes/oneos-v2/DESIGN.md) | **OneOS V2 项目局部规范文件** |
| [`ruoyi-theme-preset.json`](./ruoyi-theme-preset.json) | **若依 (RuoYi) 框架主题预设包**（首选 `#533AFD` 推荐色盘、Element Plus / Layout 变量 JSON） |
| [`ruoyi-oneos-v2-theme.css`](./ruoyi-oneos-v2-theme.css) | **若依 (RuoYi) 全局主题样式**（开箱即用的 CSS 变量桥接与 Element Plus / RuoYi 样式重置覆盖层） |
| [`tokens.json`](./tokens.json) | **机器可读 Tokens**（schemaVersion 2，v2.2.0） |
| [`oneos-ds-tokens.css`](./oneos-ds-tokens.css) | **CSS 变量入口**（`--ln-*` 双色映射） |
| [`ai-prompt-template.md`](./ai-prompt-template.md) | **AI 页面生成提示词模板** |
| [`HANDOFF-其他前端.md`](./HANDOFF-其他前端.md) | **其他技术栈外发接入**（Vue/Antd/自研等，不依赖本仓库 UIComponents） |
| [`HANDOFF-Confluence摘要.md`](./HANDOFF-Confluence摘要.md) | **一页摘要**（可贴 Confluence / 飞书） |
| [`HANDOFF-Codex开发.md`](./HANDOFF-Codex开发.md) | **研发 Codex 接入**：AGENTS.md 强制段 + 任务口令 + PR 自检 |
| [`chapters/00–10`](./chapters/) | **完整约束**：总则 → Foundations → Layout → Components → 检查清单 |

### 外发 ZIP 打包

```bash
# 在仓库根目录
node scripts/pack-oneos-v2-design-handoff.mjs
node scripts/pack-oneos-v2-design-handoff.mjs --out ~/Desktop
```

产出 `oneos-v2-design-handoff-v{版本}-{日期}.zip`（含 DESIGN / Token / HANDOFF / AI 模板，不含 React 组件库）。

---

## 作用域与生态使用

为确保规范的精确收控：

1. **页面母版**：`src/prototypes/lease-contract-management/LeaseContractHub.tsx`（V2 入口已复用）
2. **项目规范**：`src/prototypes/oneos-v2/DESIGN.md` + 迁页清单 `.spec/migration-from-1.2.md`
3. **Agent 触发**：改 `oneos-v2` / `lease-contract-management` / `design-system` 时自动注入 `.cursor/rules/oneos-v2-design-system.mdc`
4. **迁页策略**：1.2 旧页按租赁条线优先迁入 V2 视觉；禁止以 redesign 概念页或旧绿/若依蓝作新皮
