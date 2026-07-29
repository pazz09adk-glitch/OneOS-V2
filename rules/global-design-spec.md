# ONE-OS V2 全局定版设计规范（开发与 Agent 规范）

> **【事实源文档】**：[`src/resources/design-system/DESIGN.md`](../src/resources/design-system/DESIGN.md)（与 `src/prototypes/oneos-v2/DESIGN.md` 同步）。本文件为项目内 Agent 指引副本。

| 项 | 说明 |
|---|---|
| 文档版本 | **v2.5.0 定版** |
| 适用范围 | OneOS V2 目录下所有原型页面、新增页面、改版页面以及 H5 嵌入式移动端 |
| 视觉基底 | **Stripe Violet 紫光高规 + Linear 扁平微结构**（品牌主色 `#533AFD`） |
| 事实源 Token | `src/resources/design-system/oneos-ds-tokens.css` · `tokens.json` |
| 全量 UI 控件库 | `src/resources/design-system/components/UIComponents.tsx` |
| 交互规范展示页 | `src/prototypes/oneos-v2/DesignSystemShowcase.tsx` |
| 唯一逻辑与页面母版 | `src/prototypes/lease-contract-management/LeaseContractHub.tsx` |

---

## 1. AI Agent 页面生成硬性约束 (Mandatory Rules for AI Agent)

1. **强前置步骤**：在生成任何新页面或修改页面前，AI **必须首先 Read** `src/resources/design-system/DESIGN.md`。
2. **禁止原生 HTML 控件**：禁止直接使用原生 `<select>`、`<input type="date">` 或未经 Style 的原生控件。必须统一从 `UIComponents.tsx` 导入对应的封装组件（如 `V2Select`、`V2SingleInputDateRangePicker`、`V2RadioGroup`、`V2Switch`、`V2Steps` 等）。
3. **PC / H5 双端响应式**：页面必须同时支持 PC 屏宽 (≥1024px) 与 H5 移动端屏宽 (≤767px)。移动端下控件触控高度 **`≥ 44px`**，下拉/日期组件自动转换为 **Bottom Sheet** 面板。
4. **统一 3 视角架构**：中后台台账与管理页面统一集成 **【1. 列表模式 List】**、**【2. 看板模式 Kanban】**、**【3. 主从表单模式 Split Master-Detail】** 顶部切换器。
5. **若依 (RuoYi) 框架 CSS 变量消费**：所有颜色必须消费 `var(--oneos-primary, var(--ln-primary, #533AFD))`，支持若依后台的主题色动态切换。
6. **车牌号格式**：取消中间间隔点 `·`，统一为 `浙A88888F`。

---

## 2. Design Tokens (核心色彩与变量)

- **主色 (Primary Accent)**：`#533AFD` (`--ln-primary` / `--oneos-primary`)
- **Hover 态**：`#6346FF` (`--ln-primary-hover`)
- **Focus 光环**：`#4226E8` (`--ln-primary-focus`)
- **浅亮背景 / 卡片**：画布 `#F6F9FC` / 卡片 `#FFFFFF` / 边框 `#E3E8EE`
- **深色背景 / 卡片**：画布 `#0A0B0D` / 卡片 `#121418` / 边框 `#23272F`
- **等宽数字**：所有金额、单价、车辆数、VIN 码、时间与日期强制开启 `tabular-nums`，货币统一带前缀 `¥`（加粗 `#533AFD`）。

---

## 3. 全量组件与布局索引

详细控件 API 参数、卡片阴影、Grid 栅格布局、禁用态、Step 步骤条与 Timeline 时间轴等规范，请直接参阅：
- [`src/resources/design-system/DESIGN.md`](../src/resources/design-system/DESIGN.md)
- [`src/prototypes/oneos-v2/DesignSystemShowcase.tsx`](../src/prototypes/oneos-v2/DesignSystemShowcase.tsx)
