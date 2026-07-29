# 03 · Components（组件规范）

每个组件约束：**变体、尺寸、圆角、状态、用法、Web/App 差异**。  
状态全集：`Default | Hover | Active | Focus | Disabled | Loading | Error`（App 无 Hover 则忽略）。

Web 列表相关类名以 `vehicle-management/style.css` 为准。

---

## 1. 通用基础

### 1.1 Button（OneOS V2：`V2Button`）

> **定版**：主文档 `DESIGN.md` §3.0。新 V2 / 迁入页强制 `V2Button`；旧 vm-page 可暂留 `vm-btn-*`。

| 变体 | 组件 | 用途 |
|------|----------|------|
| 主 | `V2Button variant="primary"` | 查询、保存、提交 |
| 次 | `secondary` | 暂存、导出 |
| 描边 | `outline` | 弱强调次操作 |
| 幽灵 | `ghost` | 取消、重置 |
| 危险 | `danger` | 删除、终止、驳回 |
| 返回 | `back` | 详情/表单顶栏返回 |
| 文字链 | `link` | 轻量文字；表内优先 `OperationActions` |

| 端 | 高度（size） | 圆角 | 字号 |
|----|------|------|------|
| Web PC 工具栏 | `md` 36px（默认）/ `sm` 32px | 8px | 12–13 |
| 页级 CTA / H5 | `lg` 44px（窄屏 md 自动抬升） | 8px | 13–14 |

- Loading：`loading` 禁用重复点击并显示 spinner。
- 同一操作区 **仅一个主按钮**。
- 弹窗按钮顺序（强制）：**取消在左，确认在右**。
- 主色：`var(--oneos-primary, var(--ln-primary, #533AFD))`，禁止硬编码 HEX。

兼容类名（存量）：`vm-btn vm-btn-primary` 等，见 `vehicle-management/style.css`。

### 1.1b 图片上传（OneOS V2：`V2ImageUpload`）

> **定版**：主文档 `DESIGN.md` §3.17。

| 端 | 主入口 | 补传 |
|----|--------|------|
| Web PC | 虚线 Dropzone：点击 + **拖拽** | 缩略图网格 +「＋ 新增」 |
| H5 ≤767 | **拍照** / **相册** 双按钮（≥44px），不以拖拽为主 | 网格 3 列 + 双按钮仍保留 |

- 默认：图片类型、单张 ≤10MB、最多 9 张（业务可覆盖，hint 写明）。
- 状态：Dragging / Uploading / Error / Disabled / Full。
- 禁止裸 `input[type=file]` 无外壳；旧 Ant Upload 迁入对齐本规范。

### 1.2 Link / Icon / Avatar / Badge / Tag

- Link：主色；表内优先 `vm-btn-link` 或 `OperationActions`。
- Icon：16/20/24；图标按钮必须有 `aria-label` / 无障碍标签。
- Badge：圆角 pill；数字封顶 `99+`。
- Tag：状态映射见 [05-content](./05-content.md)；勿用纯色块无文字。
- Status Dot：与文字标签同时出现。

### 1.3 Divider / Skeleton / Spinner / Progress

- 分割线：`--ln-hairline`。
- 列表首屏加载用 Skeleton，禁止空白闪烁。
- Spinner 颜色用 primary；按钮内 spinner 用 on-primary 或当前文字色。

### 1.4 Tooltip / Popover / Dropdown

- Web：悬停/点击触发；移动端改用点击或长按，不依赖 hover。
- 下拉菜单危险项用 error 色文字，置于底部。

---

## 2. 表单控件

> **OneOS V2 统一实现**：`src/common/oneos-v2-form/`（`O2Input` / `O2Select` / `O2MultiSelect` / `O2DatePicker` / `O2DateRangePicker` / `O2TimePicker`）  
> 预览：`/prototypes/oneos-v2-form-kit` 或 `/prototypes/oneos-v2?view=form-kit`  
> 新 V2 / 迁入页 **必须**用 `O2*`；旧 vm 页可暂留 `FilterPickerField` / `DateRangeFilterField`。

### 2.1 通用 Form 规则

| 项 | 规则 |
|----|------|
| Label | 必须可见；**禁止**仅用 placeholder 当标签 |
| 布局 | 默认标签在上（vertical） |
| 必填 | 标签旁红色胶囊 **必填**（`V2FieldLabel` / §3.1.2）；禁止仅黑色 `*` |
| 选填 | 易误解字段挂灰色胶囊 **选填** |
| 帮助文案 | 控件下，muted |
| 错误文案 | 控件正下方，error 色；勿只在顶部汇总 |
| 校验时机 | 提交时全量；失焦校验已触碰字段 |
| 只读 vs 禁用 | 只读可复制、无禁用灰；禁用不可聚焦 |
| 主色 | Stripe Violet `#533AFD`（禁止旧绿 / 若依蓝作主色） |

### 2.2 V2 控件规格（O2*）

| 项 | 规格 |
|----|------|
| 高度 | `sm` 筛选 **32px** · `md` 表单 **36px**（默认） |
| 字号 | sm 12–13px · md 13–14px |
| 圆角 | 控件 **8px**（`--ln-radius-control`）；浮层/卡片 **12px** |
| 边框 | 默认 `--ln-hairline` / 强 `--ln-hairline-strong` |
| 背景 | 浅 `--ln-canvas-soft` / `#F8FAFC`；深 `#1A1D24` |
| Focus | 边框 `--ln-primary` + 环 `0 0 0 3px` primary-soft |
| Error | 边框 `--ln-error` + 红 soft 环 |
| Disabled | 灰底、降低对比、`not-allowed` |
| 图标 | Lucide（ChevronDown / Calendar / Clock / X），禁止 emoji |
| 双色 | 根节点 `data-ds-mode` / `data-oneos-theme` |

| 控件 | 组件 | 要点 |
|------|------|------|
| Input | `O2Input` | 可选 `tabularNums`；支持 help / error |
| Select 单选 | `O2Select` | 可搜索、可清空；选中项 soft 底 |
| MultiSelect | `O2MultiSelect` | Tag 可单独移除；Backspace 删末项 |
| 单日日期 | `O2DatePicker` | `YYYY-MM-DD`；单月历 |
| 区间日期 | `O2DateRangePicker` | **开始「至」结束** + 双月历；对标旧 `DateRangeFilterField` |
| 时间 | `O2TimePicker` | `format="HH:mm"` / `"HH:mm:ss"`；「此刻」「确定」 |

### 2.3 控件清单（含兼容说明）

| 控件 | Web V2 | 旧 vm / App |
|------|--------|-------------|
| Input / Password / Search | `O2Input` | 高 32 筛选 / 36 表单；App ≥40 |
| TextArea | 沿用规范高度与 Token | 键盘避免挡底栏 |
| Select | `O2Select` | 旧页可暂留 `FilterPickerField` |
| MultiSelect | `O2MultiSelect` | — |
| Checkbox / Radio | `vm-checkbox` 等 | 热区扩大到整行 |
| Switch | 语义：右=开 | 同左 |
| DatePicker | `O2DatePicker` | App 系统日期 |
| DateRange | **`O2DateRangePicker`**（「至」） | 旧筛选可暂留 `DateRangeFilterField`；禁止裸 Ant RangePicker |
| Time | `O2TimePicker` | — |
| Upload | **`V2ImageUpload`**（Web 拖拽 + H5 拍照/相册） | 拍照 + 相册双入口 |
| InputNumber | 左对齐 + tabular-nums | 数字键盘 |

---

## 3. 数据展示

### 3.1 Table（Web）

- 类名：`.vm-table`；表头 sticky + `--ln-canvas-soft`。
- 行 hover：浅灰底。
- 金额列：左对齐 + `tabular-nums`；**禁止右对齐**。
- 勾选列：宽 48px 居中；样式走 `vm-checkbox.css`。
- 操作列（强制）`OperationActions`：常用 `[编辑] [处理]` 外显，低频「查看记录」等进 `[⋮ 更多]`；列宽 148–168；推荐 `fixed: 'right'`。详见 `vm-shared/DESIGN.md`。
- 空态 / 加载：表区内统一 Empty / Skeleton。

### 3.2 List / Description / KPI / Card

- KPI：`.vm-kpi-row` 默认 6 列；带尾部卡片 7 列；选中绿色描边。
- Description：两列标签-值；标签 muted，值 ink/body。
- Card：圆角 12；白底 + hairline；非交互卡避免重阴影。

### 3.3 Tabs / Steps / Timeline / Collapse

- Tabs：当前项主色下划线或填充；数量角标用 Badge。
- Steps：横向（Web）/ 纵向（窄屏与 App）。
- Timeline：审批流节点色走语义色。

### 3.4 Empty / Result / Image

- Empty：插图可选 + 一句话 + 可选操作按钮。
- Result：见页面模板 4.10。
- 图片预览允许双指缩放；业务列表默认不缩放。

---

## 4. 反馈与浮层

### 4.1 Modal / Drawer / Sheet

| 项 | Web Modal | Web Drawer | App Sheet |
|----|-----------|------------|-----------|
| 位置 | `centered: true` | 右侧或左侧 | 底部 |
| 高度 | body `maxHeight: 78vh` + 滚 | 满高可滚 | 半屏/满屏 |
| 圆角 | 12 | 0 或左侧 12 | `sheet` 顶圆角 |
| 按钮 | 取消左、确认右 | 同左 | 主按钮在 Sheet 内底 |

弹窗内明细表：`ln-modal-detail-table` + `tableLayout="fixed"` + 列宽显式。

### 4.2 Toast / Message / Notification / Alert

| 类型 | 用途 | 时长 |
|------|------|------|
| Toast / Message | 轻反馈（保存成功） | 2–3s |
| Notification | 可含操作的通知 | 手动关或 4–5s |
| Alert / Banner | 页内持续警告 | 常驻至解除 |
| Confirm | 破坏性确认 | 必须二次确认 |

危险确认文案模板见 [05-content](./05-content.md)。

### 4.3 Loading

- 全页：半透明遮罩 + spinner（短请求优先按钮 Loading）。
- 局部：容器内居中。
- 按钮：进入 Loading 至请求结束。

---

## 5. 导航类

### 5.1 Pagination（Web 强制）

```ts
import { TablePagination, DEFAULT_PAGE_SIZE } from '../../common/TablePagination';
```

顺序：`共 {total} 条 → 上一页/页码/下一页 → 每页 N 条`

| 项 | 值 |
|----|-----|
| 默认每页 | 20 |
| 选项 | 10 / 20 / 50 / 100 |
| 紧凑选项 | 5 / 10 / 20 / 50 |
| 筛选/重置/KPI 切换 | `page = 1` |
| 无数据 | 显示「共 0 条」；隐藏页码与每页条数 |

禁止手写分页或 Ant `Pagination` 替代（除非 `.spec` 排除）。

### 5.2 App 导航组件

| 组件 | 规则 |
|------|------|
| Navbar | 标题居中或左；右侧操作 ≤2 |
| TabBar | ≤5 项；选中主色；图标+文字 |
| ActionBar | 底栏主操作；注意安全区 |
| SearchBar | 圆角 control；清除按钮可见 |

---

## 6. OneOS 复合组件

| 组件 | 强制规则 |
|------|----------|
| 筛选卡 | `vm-filter-card` + `vm-filter-title`「筛选条件」 |
| 日期区间 | V2：`O2DateRangePicker`（「至」）；旧 vm：`DateRangeFilterField` |
| KPI 行 | 6/7 列规则 |
| 表工具栏 | 有 KPI 或底部分页时 **禁止** 再显示总条数 |
| 操作列 | `OperationActions` |
| 现场 VIN/拍照/签名 | 业务模块扩展；色与按钮走本规范 Token |

---

## Do / Don't

### Do

- 复用 `vm-*` 与 `src/common` 公共组件。
- 每个浮层提供明确关闭/取消路径。

### Don't

- 不要自建分页、多选皮肤、操作列 pipe 链接。
- 不要在筛选区用 Ant `RangePicker`。
