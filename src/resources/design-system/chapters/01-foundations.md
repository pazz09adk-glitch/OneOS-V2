# 01 · Foundations（设计原子）

跨端共享的视觉原子。组件与页面只许引用 Token，不许发明第二套。

---

## 1. 设计原则（体验基线）

1. **一致性**：同语义同外观；复用公共类名与组件。
2. **可扫描**：表头弱、正文强；数字等宽。
3. **密度可控**：`compact`（台账）/ `standard`（默认列表）/ `comfortable`（App 表单）。
4. **可访问**：对比度、可见 focus、不单靠颜色表意；尊重减少动态。
5. **触控优先**：App / 小程序 / 窄屏 Web 热区达标；关键操作有可见按钮，不靠纯手势。
6. **反馈完整**：加载 / 成功 / 失败 / 空态均有统一口径（见 04、05）。

---

## 2. 色彩

### 2.1 品牌与中性（对齐母版 LeaseContractHub / tokens.json v2.4）

| Token | 浅色值 | 用途 |
|-------|--------|------|
| `--oneos-primary` | `var(--ln-primary, #533AFD)` | 若依 (RuoYi) 动态主题色注入变量，响应若依主题设置 |
| `--ln-primary` | `#533AFD` | 主按钮、链接、选中、编号高亮（Stripe Violet，作为若依 Default 兜底） |
| `--ln-primary-hover` | `#6346FF` | 悬停 |
| `--ln-primary-focus` | `#4226E8` | 按下 / 强调 |
| `--ln-primary-soft` | `#E0E7FF` / Dark `rgba(83,58,253,0.18)` | 浅选中底、Tag |
| `--ln-ink` | `#0A2540` | 标题、强调正文 |
| `--ln-body` | `#425466` | 正文 |
| `--ln-muted` | `#627D98` | 次要文字、表头 |
| `--ln-muted-soft` | `#9FB3C8` | 占位符 |
| `--ln-canvas-parchment` | `#F6F9FC` | 页面画布 |
| `--ln-surface-card` | `#FFFFFF` | 卡片、输入、表容器 |
| `--ln-canvas-soft` | `#F8FAFC` | 表头底、辅助容器 |
| `--ln-hairline` | `#E3E8EE` | 边框、分割线 |
| `--ln-hairline-strong` | `#D4D4D8` | 输入框边框 |
| `--ln-on-primary` | `#FFFFFF` | 主色上的文字 |
| `--ln-link` | `#533AFD` | 链接（同主色） |
| `--ln-overlay` | `rgba(10,37,64,0.45)` | 遮罩 |

暗色映射以 `oneos-ds-tokens.css` / `tokens.json` 的 `colors.dark` 为准。

### 2.2 语义色

| Token | 值 | Soft 底（浅） | 用途 |
|-------|-----|---------------|------|
| `--ln-success` | `#10B981` | `#ECFDF5` | 履约中、成功 |
| `--ln-warning` | `#D97706` | `#FEFCE8` | 待审批、预警 |
| `--ln-error` | `#EF4444` | `#FEE2E2` | 终止、危险、草稿强调 |
| `--ln-info` | `#3B82F6` | `#EFF6FF` | 信息提示（非主色） |

### 2.3 图表色板（顺序）

`#533AFD` → `#10B981` → `#D97706` → `#3B82F6` → `#EF4444` → `#7C3AED` → `#0891B2` → `#64748B`

- 禁止仅用颜色区分系列；图例必须有文字。
- 色盲场景优先形状/虚线辅助。

### 2.4 Don't

- 组件内写死与 Token 不符的 hex。
- 另起第二主色（含旧品牌绿 `#32a06e`、legacy `#10b981`、若依蓝 `#409EFF`）。
- 灰字叠灰底导致对比不足。

---

## 3. 字体与排版

### 3.1 字体族

| 角色 | Web / H5 | iOS | Android | 小程序 |
|------|----------|-----|---------|--------|
| Body | `Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif` | 系统 SF Pro + 苹方 | `sans-serif`（Roboto / 思源） | 系统默认中英栈 |
| Mono | `ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, Consolas, monospace` | 系统等宽 | `monospace` | 系统等宽 |

### 3.2 字号阶梯与语义角色

| 角色 | Web PC | App / 小程序 | 字重 | 行高 |
|------|--------|--------------|------|------|
| 角标 / 辅助 | 12px | 12px | 400–500 | 1.33 |
| 表头 / 筛选标签 | 12px | 12–13px | 500 | 1.33 |
| 表格单元格 | 13px | —（改用列表行） | 400 | 1.4 |
| 正文 | 14px | ≥16px（输入与正文） | 400 | 1.5 |
| 区块标题 | 16px | 16–17px | 600 | 1.4 |
| 筛选/页内标题 | 18px | 18px | 600 | 1.3 |
| 页面大标题（详情等） | 20px | 20px | 600 | 1.25 |
| KPI 数字 | 20–24px | 22–28px | 600 | 1.2 |

数字/金额：`--vm-font-mono` + `font-variant-numeric: tabular-nums`。金额格式见 `src/common/format-number.js`。

### 3.3 截断

- 单行：`ellipsis`；关键字段提供 Tooltip / 长按复制（App）。
- 多行：最多 2–3 行 `line-clamp`；详情页默认不截断正文。
- App 动态字号：布局以换行优先，禁止靠缩小字号硬塞。

---

## 4. 间距与尺寸标尺

- 基础网格：**4px**；常用节奏 **8px**。
- Spacing scale：`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48`。

| Token / 项 | Web PC | App / 小程序 |
|------------|--------|--------------|
| 页面 padding | `24px 32px 32px`（≤640px → 16px） | 水平 16px；底含安全区 |
| 卡片内边距 | 24px（筛选）/ 16–20px（内容卡） | 16px |
| 区块垂直间隙 | 16–20px | 12–16px |
| 控件高 `--vm-control-height` | 32px | 视觉 ≥40；热区 ≥44 |
| 按钮高 `--vm-btn-height` | 36px | ≥44pt/dp |
| 触控热区 | 可点击 ≥36；窄屏 ≥40 | **≥44×44**；间距 ≥8 |

热区可大于视觉尺寸（透明扩大点击区）。

---

## 5. 圆角 / 边框 / 阴影

| Token | 值 | 用途 |
|-------|-----|------|
| `--ln-radius-xs` | 4px | 小提示、Tag 微圆 |
| `--ln-radius-sm` | 6px | 多选框 |
| `--ln-radius-control` | 8px | 按钮、输入、分页 |
| `--ln-radius-card` | 12px | 卡片、筛选、表容器 |
| `--ln-radius-xl` | 16px | 大面板 |
| `--ln-radius-sheet` | 16px 16px 0 0 | App 底部 Sheet |
| `--ln-radius-pill` | 9999px | 徽章 |

边框默认 **1px**；强调/错误可用 1px 语义色。Focus（Web 列表壳层）：**边框变色**（`.vm-focus-border`），与现场端 `outline` 二选一按模板，同一页面不混用两套 focus 语言。

| 阴影 Token | 值 | 用途 |
|------------|-----|------|
| `soft` | `0 1px 2px rgba(24,24,27,0.06)` | 轻浮起 |
| `hover` | `0 8px 24px rgba(24,24,27,0.1)` | 卡片悬停 |
| `float` | `0 12px 32px rgba(24,24,27,0.12)` | 下拉 |
| `modal` | `0 20px 40px rgba(24,24,27,0.14)` | 弹窗 |

禁止多层重阴影、霓虹 glow。

---

## 6. 图标与插图

- 库：Lucide / Heroicons（SVG）。
- 尺寸：16 / 20 / 24；与文字并排默认 16–20。
- 线宽与当前套件默认一致，不混用 filled/outline 无规则切换。
- **禁止** emoji 作功能图标。
- 空态：简洁线稿或单色插画；色值取自 Token；非必要不使用摄影图。

---

## 7. 动效

| 项 | 规则 |
|----|------|
| 时长 | 150–300ms；页面转场 ≤350ms |
| 缓动 | `ease-out` 进入；`ease-in` 退出 |
| 允许 | opacity、transform（translate/scale） |
| 禁止 | 无意义循环闪烁、动画 width/height 导致重排、>500ms 装饰动画 |
| 减少动态 | 遵守 `prefers-reduced-motion` / 系统「减少动态效果」→ 关闭过渡 |
| App 触感 | 仅确认删除、提交成功等关键节点；禁止密集震动 |
| 转场 | Push 列表→详情；Modal/Sheet 用于编辑与确认 |

---

## Do / Don't

### Do

- 所有颜色、圆角、关键间距走 Token。
- 金额等宽数字 + 统一格式化函数。

### Don't

- 不要在业务 CSS 写死另一套主色或字号阶梯。
- 不要用过重阴影或渐变背景充当「高级感」。
