# 台账类列表页 · 统一设计规范

与 **租赁合同管理**（`vm-page lc-page` + `lease-contract.css`）及 **vehicle-management**（Linear 主题 token）对齐的台账列表壳层规范。

**分页、表格底栏等全局列表交互**见 [`vm-shared/DESIGN.md`](../vm-shared/DESIGN.md)（强制使用 `TablePagination` + `vm-pagination*` 样式）。

## 适用范围

| 模块 | 页面类名 | 样式入口 |
|------|----------|----------|
| 租赁业务台账 | `vm-page ldb-page` | `lease-business-ledger/styles/index.css` |
| 自营业务台账 | `vm-page ldb-page` | 同上（复用租赁台账模块样式） |
| 车辆维修明细 | `vm-page ldb-page mldb-page` | `vehicle-maintenance-ledger/styles/index.css` |
| 租赁合同管理 | `vm-page lc-page` | `lease-contract-management/styles/lease-contract.css` |

台账页（`ldb-page`）与合同列表页（`lc-page`）在以下维度保持一致：

- 页面内边距与底部留白
- 筛选卡片 → KPI → 工具栏 → 表格卡片 的 **16px 垂直节奏**
- 工具栏右对齐、按钮高度与 hover 反馈
- 宽表横向滚动 + 左右冻结列阴影
- 空值留白、操作列文字按钮、删除二次确认

## 页面结构

```text
vm-page ldb-page
├── vm-filter-card ldb-filter-card     # 模块标题 + 4 列筛选 + 更多筛选
├── ldb-kpi-row                        # 6 张 KPI 卡片
├── vm-table-section
│   ├── vm-table-toolbar ldb-table-toolbar   # 仅筛选开关 / 操作按钮，不写总条数
│   └── vm-table-card
│       ├── ldb-table-wrap > ldb-table
│       └── vm-table-footer ldb-table-footer   # TablePagination（见 vm-shared/DESIGN.md）
```

**不写页面级 `h1` 大标题区**（见 `vm-shared/DESIGN.md`「页面壳层」）。

## 类名约定

| 前缀 | 用途 |
|------|------|
| `vm-*` | vehicle-management 基础布局与控件 |
| `ldb-*` | 台账模块共享（筛选展开、KPI、表格、工具栏、弹窗） |
| `lc-*` | 租赁合同 Ant Design 列表专用 |

## 筛选区

- 默认一行 **4 项**，其余放入 `ldb-filter-expand` 动画区（与全局 `vm-filter-expand` / `src/common/vm-filter-panel.ts` 规则一致）
- 筛选项顺序按业务优先级排列后，**必须**经 `splitFilterFields()` 拆分；禁止手写 `PRIMARY_KEYS` 超过 4 项导致首行溢出
- **禁止末行仅 1 项**：展开区项数为 4n+1 时，从首行借调 1 项到展开区（见 `vm-filter-panel.ts` 内 `rebalanceFilterSplit`）
- 日期区间使用 `DateRangeFilterField`（见 `vm-shared/DESIGN.md`），展示分隔符为「**至**」
- 重置 / 查询按钮加 `ldb-toolbar-btn`

## KPI

- 使用 `ldb-kpi-row` + `ldb-kpi-card`（6 列网格，1280/640 断点降列）
- 盈亏类数值：`ldb-kpi-val--profit` / `ldb-kpi-val--loss`

## 表格

- 容器：`ldb-table-wrap` + `ldb-table`
- 底部分页：使用 `src/common/TablePagination.tsx`，布局见 `vm-shared/DESIGN.md`
- 表头排序：`ldb-th-sort`；列宽：`ldb-col-resize-handle`
- 金额列：`ldb-col-money` + `tabular-nums`；**与文本列统一左对齐**（含明细弹层触发按钮 `ldb-detail-popover-trigger`）
- 操作列：使用 `src/common/OperationActions`（详情/编辑外显 + ⋮ 更多），右冻结 `sticky-col-right`；规范见 [`vm-shared/DESIGN.md`](../vm-shared/DESIGN.md) OperationActions 章节。`ldb-action-btn--*` 仅用于表单内嵌行操作等例外场景
- 勾选列：左冻结 `sticky-col-left`
- 租赁业务台账：自勾选列至「客户名称」（`LEFT_STICKY_LAST_COLUMN_KEY`）均为左冻结，「增值服务」及右侧列参与横向滚动；末列冻结列加 `sticky-col-left-last` 分隔阴影，列类名 `ldb-col-check`（全局规范见 [`vm-shared/DESIGN.md`](../vm-shared/DESIGN.md) 多选框章节）
- 工具栏 / 弹窗内多选：为 `input` 添加 `vm-checkbox` 类名

## 共享样式文件

- 页面壳层：`ledger-shared/styles/ledger-page.css`
- 台账组件样式：`lease-business-ledger/styles/index.css`（import 上述壳层）
- 多选框：`src/common/vm-checkbox.css`（由 `vehicle-management/style.css` 全局引入）

新增台账类页面应直接复用 `ldb-page` 与现有组件，避免再建模块专属页面类（如 `sob-page`）。
