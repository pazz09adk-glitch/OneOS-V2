---
version: "2.3"
name: ONE-OS-design-system-v2
description: ONE-OS V2 全局定版设计规范文件。基于 Stripe Fintech UI (紫光高规) + Linear 扁平微结构，包含全量 UI 控件（输入框、单/多选、单日/区间日期与时间选择器等）、PC/H5 移动端 App 嵌入式响应式规范、深浅双色模式及三视角视图模板标准。
---

# OneOS V2 全局定版设计规范（ONE-OS Design System V2 Standard）

| 规范属性 | 标准内容 |
|---|---|
| 文档版本 | **v2.8 三视角术语澄清 + 列表嵌套主子表定版**（2026-07-29） |
| 视觉基底 | **Stripe Fintech UI**（Stripe Violet 紫光高规 B2B SaaS） + **Linear** 扁平微结构 |
| 主色调 | Stripe Violet **`#533AFD`**（Hover: `#6346FF`, Focus-Ring: `#4226E8`, Soft: `#E0E7FF` / Dark Soft: `rgba(83, 58, 253, 0.18)`） |
| 主题支持 | **100% 浅色 (Light Mode) / 暗色 (Dark Mode) 全局双色无缝适配** |
| 视口响应 | **PC 🖥️ 全宽 (≥1024px)** & **H5 📱 移动端与 App 嵌入式 (≤767px, 375px/390px)** |
| 三视角模式 | **1. 列表模式 (List)** · **2. 看板模式 (Kanban)** · **3. 主从表单模式 (Split Master-Detail)** |
| 作用域 | `src/prototypes/oneos-v2/`、`src/prototypes/lease-contract-management/` 及所有 ONE-OS V2 迁移页面 |

---

## 1. 设计原则

1. **Stripe Violet 紫光高规质感**：以 Stripe Violet（`#533AFD`）作为统一品牌主色，采用精细微边框（浅色 `#E3E8EE` / 暗色 `#23272F`）、无重阴影的扁平浮层与沉浸式卡片容器。
2. **PC / H5 移动端与 App 嵌入式 100% 响应式**：原生支持 PC 🖥️ 桌面大屏与手机浏览器/App 嵌入式 H5 📱 视口。移动端强制 44px 触控热区、智能底部 Bottom Sheet 日历与下拉面板、吸底操作条及表格卡片化转换。
3. **三视角模式原生统一 (Three View Perspectives)**：复杂业务台账与管理页面统一提供**【1. 列表模式】**（高密度台账与筛选，可含**主表+嵌套子表**）、**【2. 看板模式】**（阶段 Pipeline 管线）、**【3. 主从工作台 (Split)**】（左任务单据列表 + 右侧工作台）。**禁止**把「列表内嵌套子表」误称为「主从/表单模式」——二者术语见 §5.0。
4. **数据高可读性 (Tabular Nums)**：所有金额、单价、车辆数、VIN 码、时间与日期统一采用等宽字体 `tabular-nums` (`JetBrains Mono` / `SFMono-Regular`)。
5. **状态语义明确**：全局采用一致的四色语义（成功/绿、预警/橙、危险/红、信息/蓝、次要/灰），配合微徽章（Status Pills）。
6. **无缝双色适配**：所有元素与组件必须完整定义浅色（Light Mode）与暗色（Dark Mode）对应色彩映射，严禁出现外壳暗色而内容浅色的不匹配情况。

### 1.3 若依 (RuoYi) 框架动态主题色适配规范 (RuoYi Dynamic Theme Color Adaptation)

1. **若依 (RuoYi) 动态主题色支持**：平台底座框架采用若依（RuoYi）开源框架，原生支持管理员与用户在系统设置中手动配置主题色（包含默认 Stripe Violet `#533AFD`、若依经典蓝 `#409EFF`、深绿 `#009688`、玫瑰红 `#F5222D` 及自定义 HEX 色系）。
2. **技术实现机制 (Technical Mechanism)**：通过根节点 CSS 变量映射机制（`:root` 下的 `--oneos-primary` 与 `--ln-primary` 双向桥接与动态绑定）。当用户在若依系统设置面板切换主题色时，若依框架动态修改根节点 `--oneos-primary` 与 `--ln-primary` 的 CSS 变量值。
3. **组件全量变量化消费**：全站所有基础控件与 UI 组件（包括 `V2Select`、`V2DatePicker` / `V2SingleInputDateRangePicker`、`V2RadioGroup`、`V2CheckboxGroup`、`V2Switch`、`V2Steps`、`V2Timeline`、`V2ApprovalProgress`、主次按钮 Buttons、Tabs 选项卡、Table 选中/激活行等）**严禁使用硬编码 HEX 颜色**，必须统一通过 `var(--oneos-primary, var(--ln-primary, #533AFD))` 或 CSS 变量消费主题色。在若依切换主题色时，全站 100% 自动无缝响应并切换各 UI 元素主题高亮色。
4. **Ant Design Component / Token 绑定**：使用 Ant Design 等第三方组件库的模块，统一通过 `ConfigProvider` 进行 Token 绑定：
   ```tsx
   <ConfigProvider theme={{ token: { colorPrimary: "var(--oneos-primary)" } }}>
     {/* App Components */}
   </ConfigProvider>
   ```
5. **CSS 变量 Fallback 兜底与兼容性**：所有组件样式与 Token 声明必须保留 Fallback 兜底机制（格式如 `var(--oneos-primary, var(--ln-primary, #533AFD))`），确保在若依框架外单体运行、微前端沙箱隔离或若依全局变量未注入时，能稳定降级展示默认 Stripe Violet（`#533AFD`）。

---

## 2. Design Tokens 全局设计变量

### 2.1 全局色彩 Token 表

| 语义 Token | 浅色模式 (Light Mode) | 暗色模式 (Dark Mode) | 用途说明 |
|---|---|---|---|
| `--oneos-primary` | `var(--ln-primary, #533AFD)` | `var(--ln-primary, #533AFD)` | 若依 (RuoYi) 框架动态主题色注入变量，自动响应若依主题设置 |
| `--ln-primary` | `#533AFD` | `#533AFD` | Stripe Violet 主色：主按钮、高亮指示条、链接、选中态 (若依 Default 兜底) |
| `--ln-primary-hover` | `#6346FF` | `#6346FF` | 主按钮悬停态、高亮悬停 |
| `--ln-primary-focus` | `#4226E8` | `#4226E8` | 控件 Focus 焦点环、强光轮廓 |
| `--ln-primary-soft` | `#E0E7FF` | `rgba(83, 58, 253, 0.18)` | 选中态背景、Tag 浅底、高亮 Pill |
| `--ln-canvas` | `#F6F9FC` | `#0A0B0D` | 最外层画布背景底色 |
| `--ln-surface-card` | `#FFFFFF` | `#121418` | 卡片容器、表单面板、Modal / Drawer 底色 |
| `--ln-surface-pearl` | `#F8FAFC` | `#16181F` | 表头底色、辅助容器、禁用态背景 |
| `--ln-surface-strong` | `#F1F5F9` | `#1E222D` | 输入框/搜索框背景、Tab 激活底色 |
| `--ln-hairline` | `#E3E8EE` | `#23272F` | 标准边框线、分割线 |
| `--ln-hairline-strong` | `#D4D4D8` | `#2D3748` | 输入框 Hover/Focus 边框线 |
| `--ln-ink` | `#0A2540` | `#F7FAFC` | 一级标题、强对比数字与正文 |
| `--ln-body` | `#425466` | `#A0AEC0` | 标准正文、表单 Label |
| `--ln-muted` | `#627D98` | `#718096` | 次要描述文字、占位符 (Placeholder) |
| `--ln-success` | `#10B981` | `#10B981` | 履约进行中、成功态、已支付 |
| `--ln-success-soft` | `#DCFCE7` | `rgba(16, 185, 129, 0.15)` | 成功态浅底背景 |
| `--ln-warning` | `#D97706` | `#D97706` | 待审批、预警态、审批中 |
| `--ln-warning-soft` | `#FEF3C7` | `rgba(217, 119, 6, 0.15)` | 预警态浅底背景 |
| `--ln-error` | `#EF4444` | `#EF4444` | 欠费、超期、终止、驳回、危险态 |
| `--ln-error-soft` | `#FEE2E2` | `rgba(239, 68, 68, 0.15)` | 错误态浅底背景 |
| `--ln-info` | `#3B82F6` | `#3B82F6` | 待提交、提示信息 |
| `--ln-info-soft` | `#DBEAFE` | `rgba(59, 130, 246, 0.15)` | 提示态浅底背景 |

### 2.2 字体排版 Token

- **正文字体**：`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif`
- **等宽数字字体**：`"JetBrains Mono", SFMono-Regular, Consolas, monospace`
- **数字控制**：全局开启 `font-variant-numeric: tabular-nums`
- **车牌号格式规范**：统一使用标准中国车牌格式 `浙A88888F` 或 `沪B12345F`，禁止中间添加中圈点 `·` 或短横线，保持真实车辆管理系统权威感知。
- **字号阶梯**：
  - `Caption (11px~12px / 1.33)`：次要微标、时间戳、次级 Label（H5 下正文提示建议 ≥ 12px）
  - `Body-Sm (12px / 1.4)`：PC 表格单元格、次要描述
  - `Body-Base (13px~14px / 1.5)`：标准正文、表单输入框文本（H5 移动端输入框字号统一 ≥ 14px，防止 iOS 自动放大）
  - `Subhead (14px~15px / 1.4)`：小标题、按钮文案、卡片子标题
  - `Head-Sm (16px / 1.4)`：模块标题、Modal 标题
  - `Head-Lg (18px / 1.3)`：页面大标题、 Drawer 标题
  - `Display (24px / 1.2)`：KPI 分析大数字

### 2.3 间距与圆角 Token

- **圆角 (Radius)**：
  - 小控件 / Tag：`4px` (`--ln-radius-xs`)
  - 按钮 / 输入框 / Select：`8px` (`--ln-radius-control`)
  - 卡片 / Bento / 表格容器 / Modal：`12px` (`--ln-radius-card`)
  - H5 Bottom Sheet 底部抽屉：`20px 20px 0 0`
  - 状态 Pill 胶囊：`9999px` (`--ln-radius-pill`)
- **内边距 (Padding)**：
  - PC 控件内边距：`7px 12px` (标准 Input/Select)
  - H5 移动端控件内边距：`10px 14px`，触控高度 **`≥ 44px`**
  - 按钮内边距：`10px 18px`（触控高 44px）/ `6px 12px` (PC 紧凑按键)
  - 卡片 Padding：`18px 20px` (PC) / `14px 16px` (H5 移动端)

### 2.4 栅格系统与响应式布局 Token (Grid System & Responsive Layout)

#### 2.4.1 全局盒模型与容器防溢出 (Box Sizing & Container Overflow)
- **盒模型强制**：全局所有页面容器、网格 Grid、子列 Item 及表单控件，必须强制配置 `box-sizing: border-box`，严禁因内边距 (Padding) 或边框 (Border) 导致元素溢出或重叠；
- **防溢出约束**：所有 Flex 与 Grid 子列容器必须设置 `min-width: 0`，确保长文本、高宽数据、等宽数字或嵌套表格不会撑爆弹性列容器。

#### 2.4.2 4列 Bento Grid (大盘 / KPI 大盘网格)
- **网格定义**：`grid-template-columns: repeat(4, 1fr)`（PC 屏宽 > 1024px）；
- **响应式降级**：平板屏宽 ≤ 1024px 自动降级为 2 列（`repeat(2, 1fr)`），H5 移动端屏宽 ≤ 767px 降级为单列自适应（`1fr`）；
- **网格间距 (Gap)**：PC 标准 Gap 为 `16px` 或 `20px`，H5 为 `12px`；
- **典型应用**：台账与工作台页顶部的 Bento KPI 分析大盘卡片列。

#### 2.4.3 高阶筛选网格 (FilterBar Grid · 母版上限 13 项)
- **网格定义**：PC 采用 `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`；H5 移动端（≤ 767px）自动切换为单列自适应 `grid-template-columns: 1fr`；
- **网格间距 (Gap)**：Gap 配置为 `16px 12px`（行距 `16px`，列距 `12px`）；
- **垂直对齐**：强制设置 `align-items: end`，保证单行输入框、下拉选择器、日期区间框在同一行底部齐平；
- **项数口径（强制 · 防凑数）**：租赁合同母版示范为最多 **13** 项高阶筛选；**其它业务台账按域选型**，用 `V2Select` / `V2SingleInputDateRangePicker` 等填真实查询维度即可，**禁止**为凑满 13 项而堆无业务语义的空字段。首行工具链仍为 Pill Tabs + 搜索 +「更多筛选」+ 查询/重置。
- **与 Pill Tabs 去重（强制）**：`V2StatusTabs` 已承载的状态/分类，**不得**再在「更多筛选」里重复同一维度；更多筛选只放次要维度（账期区间、合同类型、分级、业务部等）。
- **折叠规则**：PC 默认收起「更多筛选」；展开后按上表网格排布。H5 可 Bottom Sheet。
- **查询收起规则（强制）**：筛选栏 /「更多筛选」处于**展开态**时，点击 **【查询】** 必须：**① 应用当前筛选条件并刷新列表/看板结果；② 自动收起筛选栏**（PC 关闭更多筛选面板；H5 Bottom Sheet 关闭抽屉）。仅修改筛选项、未点查询时不收起。【重置】清空条件后同样收起，避免面板长期占屏。后续所有 OneOS V2 台账页与新迁移页必须遵守本规则。

##### 2.4.3.1 筛选工具条首行布局（强制 · 防错位）

台账连体顶栏结构为：**左侧状态 Pill Tabs** + **右侧工具链**（主搜索 → 更多筛选 → 查询 → 重置；可选导出等）。

| 规则 | 要求 | 禁止 |
|---|---|---|
| PC（≥768px）工具链 | `display: flex; flex-wrap: nowrap; align-items: center; gap: 8px` | 工具链内部换行，导致「重置」掉到搜索框下方 |
| 主搜索伸缩 | 可收缩：`flex: 0 1 220px; min-width: 140px; max-width: 280px`；空间不足时**先缩小搜索框** | 给搜索框写死过大 `min-width`（如 ≥220 且不可缩）导致挤掉按钮 |
| 按钮 | 「更多筛选 / 查询 / 重置 / 导出」等 `flex: 0 0 auto`，与搜索**同一行** | 仅对整条 filter 开 `flex-wrap: wrap` 却不约束工具链 |
| H5（≤767px） | 允许工具链换行；搜索可 `flex: 1 1 100%` 占满首行 | — |

**实现落点（强制）**：

- 样式类：`.v2-filter-toolbar-tools`（`oneos-ds-filter-affordance.css`）包裹搜索与按钮；页面私有类名须等价遵守上表。
- 母版对照：`vehicle-management` 的 `.va-ledger-actions`（`flex-wrap: nowrap` + 搜索可缩）。
- 事实源同步：本小节 + `oneos-ds-filter-affordance.css`；改布局先改规范与公共 CSS，禁止各页自创互相矛盾的 wrap 规则。

##### 2.4.3.2 筛选主入口尺寸与视觉（强制 · 防高低不一）

台账工具栏 **主搜索**（`V2FilterSearch` / `.v2-filter-search`）与 **「更多筛选」**（`V2FilterMoreButton` / `.v2-filter-more-btn`）是同一级「优先点击」入口：用主色浅底 + 主色描边 + 外晕引导，**不得**做成弱 ghost 与导出同级。

| Token / 规则 | PC（≥768px） | H5（≤767px） |
|---|---|---|
| `--v2-filter-entry-height` | **36px**（对齐 `V2Button` `size="md"`） | **44px** |
| `--v2-filter-entry-radius` | `var(--ln-radius-control)` = **8px**（搜索壳与更多筛选必须同圆角） | 同左 |
| 边框 | `1.5px` 主色混入描边；默认外晕 `0 0 0 3px` 主色约 12% | 同左 |
| 字号 / 字重 | 13px；搜索字重 500、更多筛选 600 | 同左 |
| 旁侧导出 / 导入 / 列设置 | 同高 **36px**；视觉保持 secondary/ghost，**不加**主色外晕 | ≥44px |

**禁止**：

1. 页面私有 CSS 改写 `.v2-filter-search` / `.v2-filter-more-btn` 的 `height` / `min-height` / `padding` 垂直值（导致 37px、40px 等漂移）。
2. 对壳内 `.ln-select-trigger` 再套「紧凑 32px / padding 6px」覆盖，破坏壳内填满。
3. 搜索圆角 10px、按钮圆角 8px 等成对不一致。
4. 用放大尺寸代替视觉引导；引导靠描边/浅底/外晕，尺寸锁死 36/44。

**组件**：必须用 `V2FilterSearch` + `V2FilterMoreButton`；样式唯一事实源 `oneos-ds-filter-affordance.css`。

---

## 3. 全量基础 UI 组件与控件规范

### 3.0 按钮规范 (`V2Button`)

> **强制组件**：`V2Button`（`UIComponents.tsx`）。禁止页面内散写硬编码紫/红 HEX 的 `<button className="ds-btn-*">`；旧 `vm-btn-*` 仅存量 vm-page 可暂留，新 V2 / 迁入页必须用 `V2Button`。

#### 3.0.1 变体矩阵（Semantic Variants）

| 变体 `variant` | 视觉 | 用途（动词） | 同一操作区数量 |
|---|---|---|---|
| **`primary`** | 实心主色底 + 白字 + 轻紫阴影 | 查询、提交、确认、新建、保存并生效 | **仅 1 个** |
| **`secondary`** | 白/卡片底 + 描边 + 正文色 | 暂存草稿、导出、次要确认 | 可多个 |
| **`outline`** | 透明底 + 主色描边 + 主色字 | 展开、筛选、弱强调次操作 | 可多个 |
| **`ghost`** | 白/卡片底 + 浅描边 + 次要正文 | 取消、重置、返回列表（页头） | 可多个 |
| **`danger`** | 实心危险红 `#EF4444` + 白字 | 删除、终止、驳回（须二次确认） | 慎用，优先放确认弹窗右键 |
| **`link`** | 无边框主色文字 | 表内轻量链接（优先改用 `OperationActions`） | — |
| **`back`** | 等同 ghost + 左箭头 | 详情/表单顶栏「返回」 | 页头左侧 |

#### 3.0.2 尺寸与触控

| `size` | 高度 | 内边距 | 字号 / 字重 | 场景 |
|---|---|---|---|---|
| `sm` | **32px** | `0 12px` | 12px / 600 | 筛选工具条、紧凑工具栏 |
| `md` | **36px**（默认） | `0 14px` | 13px / 600（primary）· 500（其余） | PC 页头、表格工具栏、弹窗 |
| `lg` | **44px** | `0 18px` | 13–14px / 700（primary） | H5、表单主 CTA、吸底操作条 |

- 圆角统一 `--ln-radius-control`（**8px**）。
- 图标 16px，与文案间距 **6px**；仅图标按钮必须 `aria-label`。
- H5 (≤767px)：页级主/次操作默认按 `lg`（≥44px）；`block` 可拉满宽。

#### 3.0.3 状态

| 状态 | 行为 |
|---|---|
| Default / Hover | 主色走 `var(--oneos-primary)` / `var(--ln-primary-hover)`；禁止写死 `#533AFD` |
| Focus | 可见 Focus 环 `0 0 0 3px` 主色 20% 透明（危险按钮用红环） |
| Disabled | 灰底 + muted 字 + `opacity ≈ 0.65` + `cursor: not-allowed`，无阴影 |
| Loading | `loading` 时禁用点击，左侧 `Loader2` 旋转；尊重 `prefers-reduced-motion` |

#### 3.0.4 布局与文案规则

1. **单一主按钮**：同一页头操作区 / 弹窗底栏 / 吸底条，同时只允许 **一个** `primary`。
2. **弹窗顺序（强制）**：取消（secondary/ghost）在左，确认（primary/danger）在右。
3. **吸底条**：次要 `flex:1` + 主 CTA `flex:2`（或全宽主 CTA）；见 `V2MobileActionBar`。
4. **文案**：动词开头（提交、暂存、导出）；避免「确定吗」作按钮字。
5. **与操作列分工**：表格行内操作用 `OperationActions`，不用一排 `V2Button link`。

#### 3.0.5 用法示例

```tsx
import { V2Button } from './UIComponents';

<V2Button variant="ghost" size="md" icon={<ArrowLeft size={14} />}>返回故障列表</V2Button>
<V2Button variant="secondary" size="md">暂存草稿</V2Button>
<V2Button variant="primary" size="md" icon={<Send size={15} />}>提交处置结果</V2Button>
<V2Button variant="danger" size="md">终止合同</V2Button>
```

#### 3.0.6 现网 / Ant Design → V2Button 映射（强制）

> **原则**：现网只对齐**文案、字段、流程**；视觉一律落在 `V2Button` 变体上。禁止复制 Ant/若依按钮 CSS 类，禁止页面内自造 `ActionButton` / `*-action-btn*`。

| 现网 / Ant 常见形态 | V2 落点 | 说明 |
|---|---|---|
| `ant-btn-primary`（实心主色） | `variant="primary"` | 同一操作区仅 1 个 |
| `ant-btn-default` / 白底灰描边 | `variant="secondary"` | 评论、导出、暂存、弹窗「取消」 |
| 主色描边 / `ghost` 主色字 | `variant="outline"` | 弱强调次操作 |
| 浅描边次要字 / 返回 | `variant="ghost"` 或 `back` | 页头返回用 `back` |
| `ant-btn-dangerous` 实心红 | `variant="danger"` | 弹窗内「确定终止 / 删除」 |
| `primary` + `ghost` + `dangerous`（红描边红字，如审批「终止」） | `variant="secondary"` + `style={{ color: 'var(--ln-error)', borderColor: 'var(--ln-error)', background: 'var(--ln-surface-card)' }}` | **危险次操作在吸底栏**；确认仍进弹窗用 `danger` |
| `ant-btn-link` | 优先 `OperationActions`；否则 `variant="link"` | 表内勿堆一排 link 按钮 |
| 吸底条高度 | `size="lg"`（44px） | 对齐 H5 / 详情吸底触控 |

**交付自检**：操作区源码须出现 `V2Button`；若出现自制按钮皮肤类名，视为未达标。

---

### 3.1 单行输入框与多行文本域 (Input & Textarea)

#### 3.1.0 盒模型与文本超长截断（全局硬性约束）
- **盒模型 (Box Sizing)**：全局所有输入框、选择器、标签及面板元素，必须强制配置 `box-sizing: border-box`；
- **触控高度 (Touch Target)**：在 H5 移动端 (≤ 767px) 下，输入框高度与最小高度统一设置为 **`≥ 44px`**（`min-height: 44px`），字号固定为 `14px` 防止 iOS 自动放大。
- **单行文本超长省略 (Ellipsis)**：统一配置 `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` 呈现优雅 `...` 截断。

#### 3.1.1 样式与参数
- **高度**：PC `36px`（标准）、`32px`（紧凑）；H5 移动端 `44px`；
- **状态响应**：
  - **Hover**：边框变为 `#D4D4D8` / 暗色 `#2D3748`；
  - **Focus**：边框变为 Stripe Violet `#533AFD`，同时附加 `0 0 0 3px rgba(83, 58, 253, 0.2)` 光环；
  - **Error (错误态)**：边框变为 `#EF4444`，附加 `0 0 0 3px rgba(239, 68, 68, 0.15)` 光环；
  - **Disabled (禁用态)**：背景变为 `#F1F5F9` / 暗色 `#16181F`，文字变 `#627D98`，光标 `not-allowed`。

---

### 3.10 步骤条、时间轴与审批流程进度规范 (Steps, Timelines & Approval Workflow Specifications)

#### 3.10.1 步骤条规范 (`V2Steps`)
- **功能定位**：用于引导用户按顺序完成多步骤业务流程（如：填写租赁意向 → 主体资质审核 → 签署合同与付款 → 车辆交付与起租）。
- **组件形态**：
  - **横向步骤条 (Horizontal)**：适用于 PC 端横向大屏，节点间以水平 2px 链接线贯穿；
  - **垂直步骤条 (Vertical)**：适用于侧边栏、表单抽屉或 H5 移动端，自动以垂直 2px 连接线连通。在 H5 屏宽 (≤ 767px) 下，`V2Steps` 会自动平滑降级为垂直布局。
- **节点状态与色彩定义**：
  - **已完成 (`finish`)**：背景 Stripe Violet `#533AFD`，白色勾选图标 Check，主文本 `--ln-ink`；前序连接线变为 Stripe Violet `#533AFD`；
  - **进行中 (`process`)**：背景 Stripe Violet `#533AFD`，白色步数序号，高亮外光环 `0 0 0 4px rgba(83, 58, 253, 0.18)`，标题 `#533AFD` 加粗；
  - **包含错误 (`error`)**：背景 Error Red `#EF4444`，白色叉号图标 X，高亮外光环 `0 0 0 4px rgba(239, 68, 68, 0.18)`，标题与 Badges 显示 `#EF4444`；
  - **待处理 (`wait`)**：背景 `var(--ln-surface-pearl)`，边框 `var(--ln-hairline-strong)`，次要文本 `var(--ln-muted)`。
- **信息阶梯**：每个步骤节点包含 Step Title（主标题）、Description（说明文案）、SubDescription（等宽时间戳/经办人等次要元数据）。

#### 3.10.2 全生命周期与审计日志时间轴规范 (`V2Timeline`)
- **功能定位**：用于展示单据全生命周期履约轨迹、车载终端部署事件、风控预警记录及系统审计日志。
- **节点语义色彩 Standard**：
  - **Stripe Violet 紫光高规 (`#533AFD` / `violet`)**：硬件部署、终端激活、常规系统操作；
  - **Success 成功绿 (`#10B981` / `success`)**：法务终审完成、归档成功、扣款成功；
  - **Warning 预警橙 (`#D97706` / `warning`)**：风控额度超限预警、保证金即将到期；
  - **Error 错误红 (`#EF4444` / `error`)**：保证金支付逾期、扣款失败、违约驳回；
  - **Muted 灰度 (`#627D98` / `muted`)**：初始草稿创建、常规查询记录。
- **卡片与节点构造**：
  - 左侧垂直节点：12px 圆形状态节点（带 4px 匹配色彩外晕）或 26px 圆形 Icon 徽章，通过 2px 垂直连线串联；
  - 右侧内容结构：标题 (`--ln-ink` 加粗)、状态 Tag Pill、操作人 Badge（带 User 图标与 `--ln-surface-pearl` 胶囊浅底）、`monospace` 等宽时间戳；
  - 详情描述框 (Content Card)：背景 `var(--ln-surface-pearl)`，微边框 `1px solid var(--ln-hairline)`，12px 易读正文。

#### 3.10.3 多阶段审批流程进度规范 (`V2ApprovalProgress`)
- **功能定位**：用于单据与合同的多节点审批流 (Approval Pipeline) 展示，如：`1. 发起租赁申请 → 2. 部门主管复核 → 3. 风控合规审查 → 4. 法务审核盖章 → 5. 财务归档放款`。
- **布局规则 (全局默认 `direction="vertical"`)**：
  - **垂直贯穿式架构**：审批流进度统一采用**垂直方向**渲染，彻底避免横向审批部门/节点过多时出现水平挤压、文字截断或超越一页无法显示的问题；
  - **左侧节点与贯穿轴**：包含 28px 圆形状态徽章（已通过实心 `#10B981` 勾选、审批中实心主色强光圈、已驳回实心 `#EF4444` 叉号、待审批 `#E2E8F0` 底 + `#94A3B8` 描边 Clock）与 2px 垂直贯穿连线；
  - **右侧详情卡片**：包含节点序号与标题 (`14px` 加粗)、状态 Pill、审批人头像与角色；**未指定审批人**用 User 图标 +「待指定」，禁止取「待定」首字做人名缩写；等宽耗时时间戳，以及左侧带有 3px 状态边框的审核意见引述框；
  - **当前高亮节点 (`processing`)**：激活卡片边框 `var(--oneos-primary, #533AFD)`，背景 `rgba(83, 58, 253, 0.04)`，附加 `0 0 0 3px rgba(83, 58, 253, 0.12)` 聚焦外晕；
  - **非当前节点卡片**：已通过浅绿描边底、待审批灰底 + `hairline-strong` 描边，避免与白面板糊成无边框；
  - **水平模式 (`direction="horizontal"`)**：仅在极简 2-3 节点场景下可选，多节点时强制自动折叠转为垂直卡片。

---

### 3.11 控件禁用状态规范 (Disabled Component State Specifications)

- **设计目标**：确保系统在合同归档、单据锁定、权限受限、审批锁定或前置条件未满足时，全站 UI 控件呈现一致、典雅且符合无障碍标准的“禁用灰度”视觉，同时彻底阻断一切非预期交互。
- **全组件 `disabled?: boolean` 统一标准**：
  1. **背景色 (Disabled Background)**：统一采用辅助底色 `var(--ln-surface-pearl)` 或 `#F1F5F9`（Dark 模式：`#16181F`）；
  2. **文本与图标颜色 (Disabled Text & Icon Color)**：统一降级为 `var(--ln-muted)` / `#94A3B8`（透明度 `0.55 ~ 0.65`），保证可读性的同时消除强视觉吸引；
  3. **边框 (Disabled Border)**：统一保留微边框 `1px solid var(--ln-hairline)` / `#E3E8EE`（Dark 模式：`#23272F`），保持界面几何结构的平整一致；
  4. **鼠标指针 (Cursor Indicator)**：鼠标悬停与触控指针强制呈现 `cursor: not-allowed`；
  5. **交互行为阻断 (Interaction Suppression)**：完全屏蔽 Hover 悬停色变、Focus 强光圈、Active 缩放，以及下拉 Popover / 日历 Bottom Sheet 弹窗的唤起；
  6. **子元素与状态防护**：`V2Select` 多选 Tag 隐藏清除 `X` 按钮；`V2Switch` 滑块降级为 `#E2E8F0`；`V2RadioGroup` 与 `V2CheckboxGroup` 保持选中标识但图标降级为灰度；`V2Steps` / `V2Timeline` / `V2ApprovalProgress` 呈现灰度贯穿形态。

---

### 3.12 统一分页控制器规范 (V2Pagination Controller Specifications)

- **设计目标**：面向中后台表格台账、模态框明细表与 H5 移动端场景，提供统一、高度可定制的分页控制器 (`V2Pagination`)，取代原生 HTML 下拉框，确保页码切换、每页条数选择、总数统计与快速跳转符合高规视觉与交互。
- **组件用法**：
  ```tsx
  import { V2Pagination } from './UIComponents';

  <V2Pagination
    page={page}
    pageSize={pageSize}
    total={total}
    onPageChange={setPage}
    onPageSizeChange={setPageSize}
    showQuickJumper={true}
    showSizeChanger={true}
    showTotal={true}
  />
  ```
- **核心交互规格**：
  1. **总数统计 (Total Count Display)**：文案格式 `共 {total} 条记录`，数字强制启用 `font-variant-numeric: tabular-nums` (`JetBrains Mono`) 且突出 Stripe Violet 品牌主色；
  2. **条数选择器 (Page Size Changer)**：采用 `V2Select` 精简下拉控件（高度 32px / 28px），提供 `10 条/页`、`20 条/页`、`50 条/页`、`100 条/页` 快速切换；
  3. **页码导航与指示器 (Page Buttons & Active Indicator)**：
     - 上一页 (`< ChevronLeft />`) 与下一页 (`< ChevronRight />`) 按键在首页/末页或 `disabled` 状态下呈现置灰与 `cursor: not-allowed`；
     - 当前激活页码：使用品牌主色 `var(--oneos-primary, #533AFD)` 填充背景，白色加粗数字，并带有 `box-shadow: 0 2px 8px rgba(83, 58, 253, 0.28)`；
     - 智能省略号 (`…`)：当总页数大于 7 时自动计算智能收断，避免页码拥挤；
  4. **快速跳转 (Quick Jumper)**：`跳至 [ Input 48px/40px ] 页`，支持回车或失焦直接跳转；
  5. **尺寸变体 (Size Variants)**：
     - `size="default"`：控制高度 32px，用于主台账表格底部分页；
     - `size="small"`：控制高度 28px，用于模态框、抽屉、嵌套子表与卡片页脚；
  6. **PC / H5 双端响应式 (Mobile H5 Standard)**：移动端 (≤767px) 下自动转换为紧凑触控栏（呈现 `1 / 10 页` 中间提示 + 36px 触控高上一页/下一页按键），避免窄屏溢出。

---

### 3.13 空状态与异常页规范 (Empty State & Exception View Specifications)

- **设计目标**：在台账暂无数据、高阶筛选未搜索到匹配记录、403 权限受限、500 后端服务超时或网络连接中断等异常或零数据场景下，提供统一、优雅且带导向性的空状态组件 (`V2Empty`)，杜绝原生空白页或无引导的灰字。
- **组件用法**：
  ```tsx
  import { V2Empty } from './UIComponents';

  <V2Empty
    type="empty" // 'empty' | 'no_search' | 'no_permission' | 'server_error' | 'no_network' | 'custom'
    title="暂无租赁合同记录"
    description="当前租户库或选定主体下尚未创建合同，您可以新建第一份正式合同。"
    primaryActionText="新建第一条记录"
    onPrimaryAction={handleCreate}
  />
  ```
- **核心场景预设 (Preset Scenarios)**：
  1. **暂无数据 (`type="empty"`)**：第一主色 `#533AFD` 光环，`<Inbox />` 图标，引导用户新建第一条业务记录；
  2. **无匹配结果 (`type="no_search"`)**：蓝色 `#3B82F6` 光环，`<SearchX />` 图标，引导用户一键重置 13 项筛选条件；
  3. **暂无权限 (`type="no_permission"`)**：琥珀黄 `#D97706` 光环，`<Lock />` 图标，引导用户提交审批申请开通权限；
  4. **服务异常 (`type="server_error"`)**：危险红 `#EF4444` 光环，`<AlertTriangle />` 图标，引导用户一键刷新重试；
  5. **网络断开 (`type="no_network"`)**：灰度 `#6B7280` 光环，`<WifiOff />` 图标，引导用户检查网络连接；
- **尺寸变体 (Size Variants)**：
  - `size="default"`：标准大框空状态（用于页面主台账、看板列、大卡片内容区）；
  - `size="compact"`：紧凑型（用于下拉菜单明细、抽屉子表、模态框内嵌表）；
  - `size="large"` / `fullPage={true}`：整页居中（用于 403/500/404 独立整页）。
- **PC / H5 双端响应式**：移动端 (≤767px) 场景下操作按键自动转为 `min-height: 44px` 触控高，按钮组宽度自动 100% 充满，适应手机端点击。

---

### 3.14 顶栏视图/模式分段切换控件规范 (V2SegmentedControl)

- **设计目标**：面向单大盘/单台账多视图切换场景（如列表模式 List / 看板模式 Kanban / 主从表单模式 Split），提供高规外观、带平滑过渡与阴影光圈的分段控件 (`V2SegmentedControl`)，统一项目内所有模式切换条样式。
- **组件用法**：
  ```tsx
  import { V2SegmentedControl } from './UIComponents';

  <V2SegmentedControl
    value={viewMode}
    onChange={setViewMode}
    options={[
      { key: 'list', label: '列表模式', icon: <List size={14} /> },
      { key: 'kanban', label: '看板模式', icon: <LayoutGrid size={14} /> },
      { key: 'split', label: '主从/表单模式', icon: <Columns size={14} /> }
    ]}
  />
  ```
- **核心视觉与交互规格**：
  1. **外壳底衬 (Outer Shell)**：采用 `var(--ln-surface-strong, var(--ln-surface-pearl, #F1F5F9))` 柔和内衬底色，圆角 `8px`，`1px solid var(--ln-hairline)` 微边框，内边距 `3px`；
  2. **激活分段项 (Active Segment Item)**：采用卡片高亮纯白 `var(--ln-surface-card)`（Dark 模式下 `#262A36`），配以 Stripe Violet 品牌主色 `var(--oneos-primary, #533AFD)` 文本与加粗图标，带有 `0 1px 3px rgba(0,0,0,0.1)` 轻量立浮阴影；
  3. **未激活项 (Inactive Items)**：文字与图标采用 `var(--ln-muted)` 灰度呈现，Hover 时轻微加深，保持低干涉性；
  4. **尺寸规范 (Size Variants)**：提供 `sm` (28px 模态框紧凑型)、`md` (34px 页头默认标配)、`lg` (42px 独立居中放大版)。

---

### 3.15 状态与分类过滤页签条规范 (V2StatusTabs)

- **设计目标**：用于表格台账顶部的分类/状态过滤页签条（如：`全部合同 (4)`、`待我审批 (1)`、`履约执行中 (2)`、`草稿箱 (1)`），替代传统重型 Tabs，更加紧凑平整。
- **组件用法**：
  ```tsx
  import { V2StatusTabs } from './UIComponents';

  <V2StatusTabs
    value={statusTab}
    onChange={setStatusTab}
    options={[
      { key: 'all', label: '全部合同', count: 4 },
      { key: 'approval', label: '待我审批', count: 1 },
      { key: 'active', label: '履约执行中', count: 2 },
      { key: 'draft', label: '草稿箱', count: 1 }
    ]}
  />
  ```
- **核心视觉与交互规格**：
  1. **状态胶囊衬底 (Segmented Container)**：底色 `var(--ln-surface-pearl, #F1F5F9)`，圆角 `8px`，内边距 `4px`，小间距 `4px` 横向排列；
  2. **数字计数标识 (Count Badge)**：页签旁带有等宽字体 `tabular-nums` (`JetBrains Mono`) 的数据量计数，如 `(4)`；
  3. **激活项聚焦**：激活项滑块为 `var(--ln-surface-card)` 白色浮块，文字与括号内数字同步高亮为品牌主色 `#533AFD`；未激活项数字为 opacity `0.8` 灰度描述，保证扫视与信息对比。

### 3.16 列表操作列规范 (`OperationActions`)

- **设计目标**：台账「操作」列统一「常用外置、低频进更多」，降低扫视成本，避免链接横排过载。
- **强制组件**：`src/common/OperationActions.tsx` + `vm-operation-actions.css`（禁止各页自建 pipe / 自定义 more 菜单皮肤）。
- **布局定稿**：

```text
[编辑] [处理/处置] [⋮ 更多]
  ↑ 常用（0–2）      ↑ 查看记录 / 历史 / 危险操作
```

| 优先级 | 动作类型 | 位置 | 示例 |
|---|---|---|---|
| 1 | 常用工作流 | **外侧** | 编辑、处理、处置 |
| 2 | 低频浏览 / 留痕 | **更多** | 查看记录、操作记录、查看详情 |
| 3 | 低频管理 / 危险 | **更多** | 终止、删除、撤回、改负责人 |
| 例外 | 仅只读 | 外侧可单独放「详情」 | 无编辑且无处理时 |

- **参考落地**：车辆资产 `VehicleTable`、故障处置 `FaultHandlingApp`、租赁合同 `LeaseContractHub` / `ContractTable`。
- **细则**：`src/prototypes/vm-shared/DESIGN.md` · `src/common/operation-actions-spec.md`。

### 3.17 图片上传规范 (`V2ImageUpload` · Web / H5)

> **强制组件**：`V2ImageUpload`（`UIComponents.tsx` / `V2ImageUpload.tsx`）。禁止各页自建互不一致的虚线框或裸 `<input type="file">` 无障碍外壳；旧页 Ant Upload 迁入时对齐本规范视觉与交互。

#### 3.17.1 两种主形态

| 形态 | 场景 | 结构 |
|---|---|---|
| **A. 空态拖拽区 (Dropzone)** | 尚未选图 / 表单凭证首次上传 | 虚线框 + 上传图标 + 主文案 + 限制说明 |
| **B. 缩略图网格 + 新增格** | 已有 ≥1 张，或持续补传 | `N` 张预览瓦片 + 「＋ 新增」虚线格；达上限隐藏新增格 |

`layout="auto"`（默认）：无图用 A，有图用 B。`empty` / `grid` 可强制。

#### 3.17.2 Web（PC ≥768px，尤其 ≥1024）

1. **拖拽上传（强制支持）**：可拖入 Dropzone / 网格区域；拖入中边框与浅底切主色 soft，Focus 环 `0 0 0 3px` 主色 16–20% 透明。
2. **点击上传**：点击虚线区或「新增」格打开系统文件选择器；支持 `multiple`（未达 `maxCount`）。
3. **视觉**：
   - 虚线：`2px dashed var(--ln-hairline)`；Hover/Dragging → `var(--oneos-primary)` + `--ln-primary-soft` 底；
   - 圆角 `8px`；图标 40px 圆底浅紫；
   - 主文案 13px / 650；限制说明 11px muted。
4. **预览瓦片**：正方形 `aspect-ratio: 1`；`object-fit: cover`；右上删除钮（桌面 ≥28px）；上传中半透明遮罩「上传中…」；失败红描边 + 错误文案。
5. **默认限制（业务可覆盖，须在 hint 写明）**：`accept` 图片（JPG/PNG/WEBP/GIF）；单张 ≤ **10MB**；默认最多 **9** 张。

#### 3.17.3 H5（≤767px / App 嵌入）

1. **不以拖拽为主路径**：窄屏隐藏大块 Web Dropzone 文案区对拖拽的依赖；改为双入口按钮（触控高 **≥44px**）：
   - **拍照上传**：`capture="environment"`（后置摄像头优先）；
   - **从相册选择**：常规 `input[type=file] accept="image/*"`。
2. **网格**：默认 **3 列**；「新增」格 `min-height ≥ 96px`；删除钮 ≥32px。
3. **已有图片时**：网格下方仍保留「拍照 / 相册」双按钮，避免只能点小「＋」。
4. **预览**：点击缩略图可进入全屏预览（业务页实现）；支持双指缩放（见 chapters 图片预览约定）。
5. **文案**：避免「拖拽到此处」作唯一提示；H5 主文案用「拍照或从相册添加」。

#### 3.17.4 状态与校验

| 状态 | 表现 |
|---|---|
| Default | 虚线 hairline + pearl 底 |
| Hover / Dragging / Focus | 主色描边 + soft 底 + Focus 环 |
| Uploading | 瓦片遮罩「上传中…」，禁止重复点同一文件槽 |
| Error | 瓦片红边；区下红字说明（超大小 / 超数量 / 类型不符） |
| Disabled | `opacity ≈ 0.65`，`cursor: not-allowed`，不可点选/拖入 |
| Full | 达 `maxCount` 隐藏新增与双入口，或入口 disabled |

#### 3.17.5 文案与无障碍

- 主文案动词清晰：「点击或拖拽上传…」（Web）/「拍照或从相册添加」（H5）。
- `aria-label` 描述整块上传区；删除钮带「删除 {文件名}」。
- 键盘：Dropzone / 新增格支持 Enter / Space 触发选择。
- 尊重 `prefers-reduced-motion`。

#### 3.17.6 用法示例

```tsx
import { V2ImageUpload } from './UIComponents';

<V2ImageUpload
  value={images}
  onChange={setImages}
  maxCount={6}
  maxSizeMB={10}
  title="点击或拖拽上传维修工单照片、替换件发票"
  hint="支持 JPG/PNG，单张 ≤10MB，最多 6 张"
/>
```

---

## 4. H5 移动端与 App 嵌入式响应式规范 (Mobile H5 & App Embedded Specifications)

### 4.1 视口断点与响应式策略 (Viewport Breakpoints)

| 视口类型 | 屏幕宽度区间 (Width) | 适配布局策略 | 代表设备 |
|---|---|---|---|
| **PC 大屏 🖥️** | `≥ 1024px` | 完整 4 列 Bento Grid + 13 项多列 FilterBar + 多列 Table 展开子表 | 桌面显示器、MacBook |
| **Tablet 平板 📱** | `768px ~ 1023px` | 2 列 Bento Grid + 2~3 列 FilterBar + 横向可滚动 Table | iPad、折叠屏展开态 |
| **Mobile H5 📱** | `≤ 767px` | **单列自适应 1fr** + 底部 Bottom Sheet 浮层 + 44px 触控高 + 卡片化台账 | iPhone (375px/390px)、Android App H5 嵌入 |

---

### 4.2 44px 移动端触控热区 (Touch Target Standard)

在屏幕宽度 ≤ 767px 或设置 `data-viewport="h5"` 属性时，必须符合移动端 iOS/Android 触控人机交互规范：

1. **按钮 (Buttons)**：所有 Primary、Secondary、Outline 及操作按键的 `min-height` 必须为 **`44px`**（内边距 `10px 18px`）。
2. **表单控件 (Inputs & Selects)**：所有输入框、V2Select 下拉框触发器、V2DatePicker 触发器的 `min-height` 统一为 **`44px`**，内文字号统一配置为 **`14px`**（防止 iOS 手机端唤起输入法时自动变焦放大）。
3. **单选/复选与开关 (Radio, Checkbox & Switch)**：
   - 单选框与复选框标签条点击容器的 `min-height` 设置为 **`44px`**，内边距 `10px 12px`；
   - 开关 (`V2Switch`) 的点击轨道保持 `44px` 宽度与 `24px` 高度，包含 `44px` 垂直触摸区域。

---

### 4.3 智能 Bottom Sheet 面板与日历单列滑动 (Mobile Sheet Popovers)

在 H5 移动端下，由于手机屏幕空间受限，传统的 PC 端绝对定位 Popover 下拉面板自动转换为原生 App 质感固定吸底 **Bottom Sheet 面板**：

```text
┌──────────────────────────────────────────────┐
│  H5 底部 Bottom Sheet 面板 (z-index: 1000)   │
├──────────────────────────────────────────────┤
│  ▲ 面板抓手 (Drag Handle / Header)           │
│                                              │
│  [ 下拉单选/多选/日期时间滚动选择区 ]          │
│                                              │
│  [ 清空/重置 ]           [ 确认完成 (44px) ]  │
└──────────────────────────────────────────────┘
```

#### 4.3.0 何时启用 H5 / Bottom Sheet（强制判定，防 PC Web 误切）

`V2Select` / `V2DatePicker` 等通过 `useIsMobile` 切换形态时，**仅**允许：

| 信号 | 是否启用 H5 形态 | 说明 |
|---|---|---|
| `window.innerWidth ≤ 767` | **是** | 主信号：真·窄视口 |
| 控件祖先 / `html` / `body` 的 `data-viewport="h5"` | **是** | 展厅/预览显式切 H5 |
| 控件容器宽度 ≤767（如主从 340px 侧栏） | **否** | **禁止**：PC Web 台账窄列会误切 Bottom Sheet |
| 页面任意处存在 `[data-viewport=h5]` | **否** | **禁止**全局 `querySelector` 误伤整页 PC 控件 |

PC Web 页面（视口 ≥768）打开下拉/日期，必须是 **Popover 下拉**，不得出现吸底 Sheet。

#### 4.3.1 弹窗与选择器吸底样式
- **CSS 定位**：`position: fixed; bottom: 0; left: 0; right: 0; top: auto; z-index: 1000;`
- **圆角与边框**：顶部圆角 `20px 20px 0 0`，顶边框 `1px solid var(--ln-hairline)`，深柔阴影 `box-shadow: 0 -10px 40px rgba(0,0,0,0.25)`；
- **遮罩层 (Backdrop)**：弹出 Bottom Sheet 时同时显示深色半透明遮罩背景（`background: rgba(0,0,0,0.45); backdrop-filter: blur(4px);`），点击遮罩区域可关闭面板。

#### 4.3.2 跨月双日历 H5 单列自适应 (`V2SingleInputDateRangePicker`)
- PC 端 560px 左右双月日历在 H5 屏宽 (≤ 767px) 下自动切换为**单列垂直滑动日历**；
- 单列月历之间采用清楚的月份标题分隔，月份天数自适应屏幕 100% 宽度，点击选择起点与终点日期的连续区间高亮平滑适应窄屏。

---

### 4.4 H5 固定吸底主操作条 (Sticky Bottom Action Bar)

移动端页面涉及提交表单、审批确认、还车办理或保存草稿时，主操作按钮禁止置于可滚动页面底部，必须配置**固定吸底操作条**：

- **定位样式**：`position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;`
- **容器材质**：背景 `var(--ln-surface-card)`，上边框 `1px solid var(--ln-hairline)`，上方渐变轻阴影 `0 -4px 16px rgba(0,0,0,0.08)`；
- **内边距与 Safe Area**：`padding: 12px 16px; padding-bottom: max(12px, env(safe-area-inset-bottom));`（自动兼容 iPhone 底部 Home 条）；
- **布局分栏**：次要按钮 `flex: 1` + 主操作按键 `flex: 2`（或全宽 `flex: 1`），触控高度统一为 **`44px`**。

---

### 4.5 H5 表格至单列卡片转化规则 (H5 Table to Card Transformation)

在 H5 移动端宽 (≤ 767px) 下，传统多列宽表格转变为高易读性的**单列卡片（Card）列表**：

1. **卡片结构**：
   - 顶部 Header：卡片主标题（项目名/合同名）+ 状态胶囊 Pill（如【履约中】/【待审批】）；
   - 中间 Key-Value 列：包含签约主体、租金金额、车辆数、到期时间等，采用左右分布（左侧 `--ln-muted` 标签，右侧 `--ln-ink` 强对比等宽数值）；
   - 嵌套车辆子表：卡片底部提供折叠式【嵌套车辆子卡片】，将 VIN 码、交车记录、还车状态按垂直堆叠卡片优雅呈现；
   - 底部动作栏：右对齐放置【还车办理】、【下载 PDF】等 44px 触控连接按键。

---

### 4.6 H5 移动端顶部导航栏、底部 TabBar 与操作条组件规范 (Mobile Navigation Specifications)

面向移动端/App 嵌入式 H5 页面提供标准的 3 大导航与操作组件（标准 React TSX 代码见 `UIComponents.tsx`）：

#### 4.6.1 顶部导航栏规范 (`V2MobileHeader`)
- **尺寸与间距**：基础高度为 **`44px`**（或 `48px`/`52px` 视刘海屏/沉浸式状态栏需求而定），同时自动叠加顶部安全区 Padding（`padding-top: env(safe-area-inset-top, 0px)`）。
- **材质与背景**：默认开启 **`backdrop-filter: blur(12px)`** 毛玻璃半透明背景（浅色 `rgba(255, 255, 255, 0.88)` / 暗色 `rgba(18, 20, 24, 0.88)`），配有 `1px solid var(--ln-hairline)` 底边框。
- **元素布局**：
  - **左侧 (Left Area)**：默认放置 `ChevronLeft` 返回按键（触控热区 `≥ 44×44px`），支持自定义关闭 `X` 按键或辅助图标；
  - **中间 (Center Title Area)**：居中单行加粗标题（`16px`，`font-weight: 700`），文本超长优雅 `...` 截断；可附加 `11px` 次要副标题/单据编号；
  - **右侧 (Right Actions Area)**：支持配置最多 3 个右侧动作图标（如：搜索 `Search`、分享 `Share2`、筛选 `Filter`、更多 `MoreHorizontal`），图标触控高 `≥ 44px`，支持右上角带消息/提醒角标红点 (`badge: true` 或数字 `badge: 3`)。

#### 4.6.2 底部 TabBar 选项卡规范 (`V2MobileBottomNav`)
- **尺寸与 Safe Area**：基础高度为 **`50px`**，底部自动包含 iOS/Android 底部安全区（`padding-bottom: env(safe-area-inset-bottom, 0px)`）。
- **定位与样式**：配置 `fixed: true` 时吸附于屏幕最底部（`position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;`），顶部带有 `1px solid var(--ln-hairline)` 边界分割线与轻微顶阴影 `0 -2px 10px rgba(0,0,0,0.04)`。
- **Tab 项标准 (3~5 项)**：
  - 每个 Tab 包含 Lucide 矢量图标（20×20px）+ 10px 说明文字（`font-weight: 600`）；
  - **激活高亮 (Active State)**：激活选项卡图标与文字统一使用 Stripe Violet **`#533AFD`** 高亮，未激活态使用 `--ln-muted`（`#627D98`）；
  - **角标徽章 (Badge Count / Red Dot)**：支持在图标右上角叠加红色数字角标（如未读消息数 `3`）或 7px 提示红点，采用 `background: #EF4444` 和 1.5px 白色边框。

#### 4.6.3 底部浮动提交与操作条规范 (`V2MobileActionBar`)
- **尺寸与触控规范**：基础高度为 **`56px`**，加上底部 Safe Area（`padding-bottom: max(10px, env(safe-area-inset-bottom, 0px))`），主副按钮触控高度统一为 **`44px`**。
- **三种典型形态**：
  - **形态 A (金额汇总 + 主 CTA)**：左侧展示结算/首期汇总金额（如 `¥ 45,000.00`，字号 `17px font-weight: 800`，`font-variant-numeric: tabular-nums`），右侧为 44px Stripe Violet 主提交按钮（如【确认并提交审批】）；
  - **形态 B (次要动作 + 主 CTA)**：左侧为 44px 白底/灰底【暂存草稿】按钮（`flex: 1`），右侧为 44px 紫色【确认提交】按键（`flex: 2`）；
  - **形态 C (全宽主 CTA)**：全宽 44px 按钮，适合单步骤提交或确认唤起。

#### 4.7 车辆资产 H5 移动端设计稿与 3 视角示范 (`oneos-v2-h5-vehicle-assets`)
- **适用原型入口**：`src/prototypes/oneos-v2-h5-vehicle-assets/`（支持在 `oneos-v2` 展厅中切至 `📱 H5 车辆资产设计稿`）
- **核心特性**：
  1. **双模式视口模拟器**：支持 PC 全宽、iPhone 15 (390px)、Android (375px) 硬件手机外壳与浅色/暗色模式 100% 切换；
  2. **1. 列表视角 (List View)**：包含 4 列 Bento KPI 大盘 + 快捷搜索与 13 项条件高阶筛选 Bottom Sheet 抽屉，车辆卡片带无点车牌号（如 `粤AGP3673`）、实时里程 (`JetBrains Mono`)，且支持展开**关联履约与保单子明细**；
  3. **2. 看板视角 (Kanban View)**：包含 4 阶段 Pipeline 管道列横向滑动、阶段计数，以及【更新里程】与【查看工作台】快捷操作；
  4. **3. 档案工作台视角 (Split View)**：顶部焦点车辆水平轮播，主体支持【基础档案】、【履约合同】、【证照年检】、【保险保单】、【出险违章】5 大 Sub-Tabs，吸底放置 `V2MobileActionBar`。

#### 4.8 结构化工单 / 处置表单页母版（定稿 · `FaultDispositionForm` · **布局方案 A**）

> **定稿截图对齐母版**：`车辆故障处置工单填报`（暗色/浅色双模式）。  
> **代码入口**：`src/prototypes/lease-contract-redesign/FaultDispositionForm.tsx`  
> **预览**：`/prototypes/lease-contract-redesign?concept=form` · 或 oneos-v2 展厅「PC 表单母版」· `?view=form`  
> **布局选型**：本页为 **方案 A · 侧栏工作台**；无右栏、需横向空间时改用 **§4.9 方案 B**。

本模板用于**单单据深度填报**（故障处置、验车入库、审批补录等），与「三视角台账」互补：台账用列表/看板/主从；落单填报用本页。

##### 4.8.1 页面骨架（强制）

```text
┌──────────────────────────────────────────────────────────────────┐
│ [← 返回列表] │ 页面标题（20px / 800） · 单号胶囊（若有）  [暂存] [主 CTA] │
├───────────────────────────────────────────────┬──────────────────┤
│ ① 只读上下文卡（车牌/车型/区域 + 优先级徽章）   │ 指派处理人与责任组 │
│    └─ AI/预警摘要条（琥珀底）                  │  · 责任人 Chip     │
│ ② 判定录入卡（必填 * · 2 列网格）              │  · V2CheckboxGroup │
│    └─ 严重等级：四档离散按钮组                ├──────────────────┤
│ ③ 结果说明卡（多行文本 + V2ImageUpload）       │ 响应 SLA 控制计时  │
│                                               │ （紫调强调卡）     │
└───────────────────────────────────────────────┴──────────────────┘
  PC：grid 1fr + 340px；≤1023px：侧栏沉底单列；≤767px：触控 ≥44px
```

> **页头不展示面包屑**：PC 表单/详情页头**不再展示**「条线 / 模块」路径文案。若依等外壳顶部已有标签页/导航切换，页内再挂面包屑易重复。标题行直接展示业务页名；有单据号时在标题旁挂**单号紫色胶囊**。

##### 4.8.2 分区与组件映射

| 区域 | 定稿要点 | 控件 / Token |
|---|---|---|
| 页头 | 返回幽灵按钮 + **页面标题（20px / 800）** + **单号紫色胶囊（若有）**；**不展示**条线/模块面包屑（外壳顶栏标签已承担路径）；右上【暂存草稿】描边 +【提交】Stripe Violet 主色 | Token 画布/卡片/边框；主 CTA `#533AFD` |
| ① 上下文卡 | 三列只读信息；右上红色「优先级：…」；车牌**无间隔点**（如 `浙AFC891`） | 等宽数字 / monospace |
| AI 摘要条 | 琥珀预警底（浅 `#FFFBEB` / 深 `rgba(217,119,6,0.12)`）+ `AlertTriangle` | 语义色预警 `#D97706` |
| ② 录入卡 | Label 在上；必填红 `*`；时间/地点带前缀图标 | 禁原生 `<select>` / `type="date"`；日期时间可用图标+文本或 `V2DatePicker`+`V2TimePicker` 组合 |
| 严重等级 | **特急 / 紧急 / 一般 / 提示** 四档等宽按钮；选中：紫边 + 浅紫底 + 紫色字 | **勿**用顶栏 `V2SegmentedControl`（那是视图切换） |
| ③ 结果卡 | 主结果多行 textarea；建议可单行；凭证用 **`V2ImageUpload`**（Web 拖拽 / H5 拍照·相册，§3.17） | 虚线 `2px dashed`；有图后网格 + 新增 |
| 右栏指派 | 责任人 Chip（浅紫底）；通知通道用 `V2CheckboxGroup` | 禁止原生 checkbox |
| SLA 卡 | 紫调底强调；说明 SLA 时限 + 已用时 + 准时率（tabular-nums） | 暗色 `rgba(83,58,253,0.1)` |

##### 4.8.3 验收清单（对照定稿截图）

- [ ] 布局为「左主表单 + 右 340px 侧栏」，非全宽单列堆叠（PC ≥1024）
- [ ] 三段编号卡片标题：`1.` `2.` `3.` 与截图文案一致（业务可替换，结构不可省）
- [ ] 优先级徽章在①卡右上；AI 摘要为琥珀条而非中性灰条
- [ ] 严重等级为四档离散按钮，选中态为紫边/浅紫底
- [ ] 右栏含指派卡 + SLA 紫卡；通知通道为 V2 复选
- [ ] 车牌无 `·` / 无多余连字符间隔点
- [ ] 浅色/暗色均消费 Token，无「外壳深内容浅」

#### 4.9 表单页双布局（定稿 · A 侧栏工作台 / B 横向整屏 B1）

> **强制**：生成或改版任一表单页前，须声明 `layout: sidebar | fullBleed`（对应 A / B）。同一页禁止混用两套骨架。

##### 4.9.1 选型表

| 方案 | 骨架 | 适用 | 母版 / 章节 |
|---|---|---|---|
| **A · 侧栏工作台** | PC：`grid` **`1fr + 340px`**（右栏固定指派 / SLA / 审批等） | 单单据深度填报且**需要右栏业务** | §4.8 · `FaultDispositionForm` |
| **B · 横向整屏（B1）** | **无**右侧固定 340 栏；主内容相对工作区 **`width: 100%`**，**保留页边距**（非贴浏览器边） | 宽字段矩阵、多列表格录入、合同条款等多列信息密度页 | 本小节 |

```text
方案 A（侧栏）                         方案 B（横向整屏 B1）
┌─────────────────┬────────┐         ┌──────────────────────────────┐
│ 主表单 1fr      │ 340px  │         │ [页边距 20–24]  全宽主区 100% │
│                 │ 侧栏   │         │ 多列网格 / 宽表 / 分段卡     │
└─────────────────┴────────┘         └──────────────────────────────┘
```

**选型强制规则**

1. 有右栏业务（指派、SLA、审批进度、关联单据快捷区）→ **必须 A**。  
2. 无右栏、且需要横向空间 → **必须 B**。  
3. 不得「半套侧栏又强制全宽」；不得把 B 做成贴边 0 padding（那是 B2，本版不定稿）。

##### 4.9.2 方案 B 规格（B1）

| 项 | 规格 |
|---|---|
| 页壳 | 画布 `var(--ln-canvas)` / parchment；卡片 Token 同全局 |
| 内容容器 | `width: 100%; max-width: none; box-sizing: border-box` |
| 水平边距（B1） | **PC：20–24px**；**H5：12–16px** |
| 页头 | 与 A 一致：返回 + 标题（+ 单号胶囊可选）+ 右上暂存 / 主 CTA（`V2Button` §3.0） |
| 主区结构 | 分段卡片**纵向**堆叠；字段网格默认 `repeat(auto-fill, minmax(200px, 1fr))` 或业务约定 3–4 列 |
| 宽表 / 子表 | 允许容器内横向滚动；表体 `min-width: 0`，禁止撑破页壳 |
| ≤1023px | 字段网格降为 1–2 列 |
| ≤767px | 单列 + 触控 ≥44px；主操作可用 `V2MobileActionBar` |
| PC 主 CTA | 页头右上；**勿**默认套 `V2MobileHeader` / BottomNav（仅真 H5/App 页） |

##### 4.9.3 验收清单

**方案 A**

- [ ] PC ≥1024 为「左主表单 + 右 340px」，非全宽单列（见 §4.8.3）

**方案 B**

- [ ] 无右侧固定 340 栏  
- [ ] 主区横向铺满工作区（`width: 100%`），且 PC 仍有 **20–24px** 水平边距  
- [ ] 未使用贴边 0 padding  
- [ ] 宽表仅在内容区内滚动，不撑破视口  
- [ ] 页头按钮区符合单一 primary（§3.0）

---

## 5. 三大原生视图模式规范 (Three Core Views Standard)

页面顶部固定放置 **三视角分段控件切换器**（`V2SegmentedControl`），用户可在同一个页面内无缝切换三种不同显示方式。顶栏结构为：**仅「三视角切换 + 主操作」**，禁止再塞大标题说明卡片。

```text
┌────────────────────────────────────────────────────────┐
│ [ ≡ 1. 列表模式 ]  [ ⊞ 2. 看板模式 ]  [ ◧ 3. 主从工作台 ] │  [主操作]
└────────────────────────────────────────────────────────┘
```

### 5.0 术语门禁（强制 · 防混称）

| 说法 | 是什么 | 不是什么 |
|---|---|---|
| **列表 · 主表 + 嵌套子表** | 列表模式下的可展开行：主行=聚合实体（合同/项目），子表=明细行（车辆期账单、提车收款单等） | **不是**三视角里的「主从工作台」 |
| **主从工作台 (Split)** | 左 `320–340px` 单据列表 + 右深度工作台 | **不是**表格里的展开子表 |
| **单单据填报页** | 离开台账进全页表单（§4.8 / §4.9） | 勿用台账三视角顶栏冒充 |

业财 / 租赁账单等页若采用「合同主表 + 各期账单子表」，必须落在 **列表模式** 的嵌套子表规范上，同时仍须提供看板与 Split 两种视角（阶段列与左侧列表按本域状态定制，见下）。

### 5.1 列表模式 (List View - 默认)

- **骨架**：4 列 Bento KPI（PC gap `16–20px`）+ 台账连体壳（Pill Tabs 带 `count` + 工具链 36px 同高 + 更多筛选）+ 主表（可嵌套子表）+ 分页贴壳。
- **嵌套子表（强制可复用）**：
  - 主行：实体主键（`monospace` 合同号等）+ 项目/客户 + 汇总金额/期数 + 实体级最差状态；左侧 Chevron 展开，触控/点击区清晰。
  - 子表：用 Token 底色（`var(--ln-surface-pearl)` 等），**禁止**硬编码 `#eef2f7`；列密度对齐主表；操作列走 `OperationActions`（常用外置 ≤2，明细/历史进 ⋮）。
  - 母版：租赁合同车辆子表、提车收款「合同+收款单」、租赁账单「合同+期账单」。
- **筛选**：按 §2.4.3；H5 ≤767 卡片化（§4.5）。

### 5.2 看板模式 (Kanban View)

- **结构**：通常 **4 列** Pipeline；**列名按业务域**，不强制照搬合同审批四阶段。
  - 合同域示例：草稿 / 审批盖章 / 履约中 / 终止归档；
  - 账单域示例：待收款 / 部分收款 / 逾期 / 已结清。
- 卡片含主键、客户或项目、关键金额、状态；点击可切入 **主从工作台** 或打开明细全页。
- 列头带计数徽章；空列保留列壳，勿整列消失。

### 5.3 主从工作台 (Split / Master-Detail View)

- 左侧 `320px` ~ `340px` 可搜索单据/合同列表；
- 右侧为选中项的深度工作台（概览、关联子 Tabs、履约/收款图谱等）；
- 与「列表嵌套子表」互补：Split 适合连续办理多单；列表嵌套适合扫合同下的全部明细行。

---

## 6. 开发落地与 TypeScript 代码映射指南

在编写 React / TSX 页面时，统一引入全局 Design Tokens：

```tsx
import '../../resources/design-system/oneos-ds-tokens.css';
import { V2Select, V2DatePicker, V2SingleInputDateRangePicker } from './UIComponents';
```

所有迁移页面与组件必须严格对齐本规范中的色彩、排版、组件形态、PC/H5 响应式规范与 13 项筛选及嵌套子表规范。
