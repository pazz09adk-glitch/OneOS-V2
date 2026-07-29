# vm-page 列表页 · 全局设计规范

与 **vehicle-management**（Linear 主题 token + `vm-*` 类名）对齐的中后台列表页壳层规范。  
**所有新建 `vm-page` 列表页必须遵循本规范**，台账类页面另见 `ledger-shared/DESIGN.md`。

## 适用范围

| 类型 | 页面类名示例 | 样式入口 |
|------|--------------|----------|
| 通用列表 | `vm-page` | `vehicle-management/style.css` |
| 台账列表 | `vm-page ldb-page` | 同上 + `ledger-shared/styles/ledger-page.css` |
| 合同列表 | `vm-page lc-page` | 同上 + `lease-contract-management/styles/lease-contract.css` |

## 样式与组件依赖

新建列表页 **必须** 引入：

```typescript
import '../vehicle-management/style.css';
```

`vehicle-management/style.css` 已内联全局分页样式（`src/common/vm-pagination.css`）与多选框样式（`src/common/vm-checkbox.css`）。

分页组件 **必须** 使用公共实现：

```typescript
import { TablePagination, DEFAULT_PAGE_SIZE } from '../../common/TablePagination';
```

禁止复制粘贴分页 DOM、手写 Ant Design Pagination、或自建另一套分页类名。

## 筛选区日期区间（强制）

凡筛选区需要「开始—结束」日期区间，**一律**使用：

```typescript
import { DateRangeFilterField } from '../vehicle-management/components/DateRangeFilterField';
```

- 展示文案用中文「**至**」连接起止日期（如 `2025-06-01 至 2025-06-30`）
- 样式类名：`vm-date-range-field`、`vm-filter-picker-control`、`vm-date-range-popover`（见 `vehicle-management/style.css`）
- 禁止在筛选区使用 Ant Design `RangePicker`、原生 `<input type="date">` 双框或其它自定义日期区间控件

## 页面壳层（强制）

侧栏 / 导航已标明当前模块名称时，**列表页正文区不再重复放页面大标题与说明段落**。

### 禁止

- `*-page-header` 内独立的 `h1` 页面标题 + 副标题 / 说明 `p`（如「租赁业务明细」+ 功能描述）
- 与侧栏菜单文案重复的 `vm-page-title`、`ldb-page-title`、`lbd-page-title` 等

### 推荐结构

```text
vm-page
├── vm-filter-card          # 筛选区（标题用 vm-filter-title「筛选条件」即可）
├── KPI 行（可选）
└── vm-table-section        # 工具栏 + 表格 + 分页
```

页面定位、目标用户与验收说明写入 **annotation / PRD**，不占用列表首屏垂直空间。

例外：详情页、创建页、带面包屑 + 返回的编辑壳层，可按需保留标题区；**标准台账 / 数据列表页默认不加**。

## 列表工具栏（强制）

当页面已有 **KPI 卡片**和/或 **底部分页 `TablePagination`（含「共 x 条」）** 时，工具栏 **禁止** 再展示总条数文案。

### 禁止

- `当前列表 N 条`、`共 N 条`、`共 N 条记录` 等重复计数（类名如 `*-table-toolbar-meta`、`*-toolbar-data-count`）
- 工具栏左侧仅用于占位的条数摘要

### 允许

- 筛选开关、图例、字段说明、批量操作按钮
- 与条数无关的上下文（如「保单录入」分区标题）
- 导出 Toast 内可带条数（操作反馈，非常驻 UI）

工具栏默认 **右对齐操作按钮**（`vm-table-actions` + `margin-left: auto`）；左侧仅在有筛选开关等非计数控件时使用。

## 表格底部分页（强制）

凡带数据表格的列表页，**一律使用底部分页**，禁止「下拉加载更多」「无限滚动」替代分页（除非产品需求明确排除分页且已在 PRD 写明）。

### 布局结构

```text
vm-table-card
├── vm-table-wrap / ldb-table-wrap   # 表格主体
└── vm-table-footer                  # 表格底栏（上边框分隔，右对齐）
    └── TablePagination              # 内置：共 x 条 → 页码 → 每页 N 条
```

标准 DOM 示例：

```tsx
<div className="vm-table-footer">
  <TablePagination
    page={Math.min(page, totalPages)}
    pageSize={pageSize}
    total={total}
    onPageChange={setPage}
    onPageSizeChange={(size) => {
      setPageSize(size);
      setPage(1);
    }}
  />
</div>
```

台账页 footer 可追加 `ldb-table-footer`；若底栏另有操作按钮（如「添加行」），用 `ldb-table-footer-actions` 包裹分页与按钮，**禁止**在 footer 外重复写「共 x 条」。

### 元素顺序（强制）

分页栏内从左到右固定为：

```text
共 {total} 条  →  上一页 / 页码 / 下一页  →  每页 N 条
```

总条数由 `TablePagination` 内置渲染，使用 `vm-pagination-total` / `vm-pagination-total-num`；**禁止**在 footer 另写 `vm-table-total`、`ldb-table-total` 等重复文案。

### 视觉规格

| 元素 | 类名 | 说明 |
|------|------|------|
| 分页容器 | `vm-pagination` | 右对齐，可换行；gap 12px / 16px |
| 总条数 | `vm-pagination-total` + `vm-pagination-total-num` | 0.875rem；数字加粗、等宽数字 |
| 页码区 | `vm-pagination-pages` | 上一页 / 页码 / 下一页 |
| 当前页 | `vm-pagination-page active` | 主色填充 + 轻阴影 |
| 省略 | `vm-pagination-ellipsis` | 超过 7 页时显示 … |
| 每页条数 | `vm-pagination-size` + `vm-pagination-select` | 位于页码区**右侧**，文案「每页 N 条」 |

样式源文件：`src/common/vm-pagination.css`（由 `vehicle-management/style.css` 引入）。

### 交互与状态

| 项 | 规则 |
|----|------|
| 默认每页条数 | `DEFAULT_PAGE_SIZE`（20） |
| 可选每页条数 | 10 / 20 / 50 / 100（`PAGE_SIZE_OPTIONS`） |
| 紧凑场景选项 | 5 / 10 / 20 / 50（`COMPACT_PAGE_SIZE_OPTIONS`，传 `pageSizeOptions`） |
| 筛选 / 重置 / KPI 切换 | 将 `page` 重置为 1 |
| 切换每页条数 | 将 `page` 重置为 1 |
| 无数据 | 仍显示「共 0 条」；页码与每页条数控件隐藏 |
| 悬停 / 聚焦 | 页码按钮 hover 主题色描边；active 页主色底；可见 focus 环 |
| 点击反馈 | 页码按钮轻微缩放；`prefers-reduced-motion` 时关闭 |
| 无障碍 | `role="navigation"`、`aria-label="表格分页"`、当前页 `aria-current="page"` |

### 数据切片

```typescript
const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
const paged = useMemo(() => {
  const start = (page - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
}, [filtered, page, pageSize]);
```

表格 `records` 传入 `paged`，分页 `total` 传入筛选后总数 `filtered.length`。

### 表格列对齐（强制）

| 列类型 | 对齐 | 类名 / 说明 |
|--------|------|-------------|
| 文本、日期、状态等 | 左对齐 | 默认，无需额外设置 |
| 金额、数量等数字 | **左对齐** | `ldb-col-money` 或 `ln-modal-detail-table__money` + `tabular-nums` |
| 操作列 | 左对齐 | `OperationActions` 组件（见下文） |
| 可点击金额 / 明细弹层触发按钮 | 左对齐 | `ldb-detail-popover-trigger`、费用列内 `button` 与文本列一致左对齐 |

- 禁止对金额列使用 `align: 'right'`、`text-align: right` 或 `justify-content: flex-end`
- 全局样式见 `vehicle-management/style.css` 中「金额/数字列」与 Ant Design 表格 `cell-align-right` 覆盖规则

## 操作列 OperationActions（强制）

凡 `vm-page` / OneOS V2 列表主表「操作」列，**一律**使用公共组件 `OperationActions`，禁止各页自建链接组、pipe 分隔或模块私有 `*-row-actions` 样式。

### 依赖

```typescript
import { OperationActions } from '../../common/OperationActions';
```

车辆管理入口 `vehicle-management/index.tsx` 已直接引入 `src/common/vm-operation-actions.css`；其他 V2 入口必须自行直接引入该共享样式，例如 `import '../../common/vm-operation-actions.css'`。

### 布局结构（强制 · 2026-07 定稿）

```text
[图标 查看/详情]  [图标 编辑/处理/处置]  [⋮ 更多]
      ↑ 固定第一          ↑ 最多 1 个工作流动作       ↑ 留痕 / 低频 / 危险
```

| 区域 | 规则 |
|------|------|
| **查看 / 详情** | 对象详情或对象工作台入口，存在时必须**外显且固定第一**；文案按业务语义使用「查看」或「详情」 |
| **编辑 / 处理 / 处置** | 当前最重要的工作流动作，存在详情入口时只外显 **1 个**并固定第二；多个候选按业务优先级选择，其余进入更多 |
| **无详情入口** | 可外显最多 **2 个**工作流动作，按业务优先级排列 |
| **更多** | `查看记录` / `操作记录` / 历史日志，以及低频管理、终止、删除、撤回、改负责人等；仅有菜单项时显示 **⋮ 图标按钮**（`aria-label="更多操作"`），禁止空菜单 |
| 无操作 | 渲染 `-` |

> 「详情」是对象入口；「查看记录 / 操作记录 / 历史」是留痕入口。两者不得因文案都含“查看”而混为同一优先级。

### 列宽与冻结

| 项 | 值 |
|----|-----|
| 建议列宽 | 148–184px（含详情入口、最多 1 个工作流动作与可选更多） |
| 对齐 | 左对齐（组件内）；单元格可不强制右对齐 |
| 冻结 | `fixed: 'right'`（主列表推荐） |
| 类名 | 容器 `vm-operation-actions`（组件内置） |

### API 示例

```tsx
import { OperationActions } from '../../common/OperationActions';

<OperationActions
  edit={canEdit ? { onClick: () => openEdit(record) } : undefined}
  view={{ label: '详情', onClick: () => openDetail(record) }}
  more={[
    { key: 'history', label: '查看记录', onClick: () => openHistory(record) },
    { key: 'process', label: '处置', onClick: () => openProcess(record) },
    { key: 'terminate', label: '终止合同', danger: true, onClick: () => terminate(record) },
  ]}
/>
```

该示例只把选定的 `edit` 作为外显工作流动作，并将次级「处置」显式放入 `more`，因此可见顺序为 `[详情] [编辑] [⋮]`。「查看记录」也留在更多中。若调用方同时传入 `view`、`edit`、`process`，组件按确定性优先级选择 `edit`，`process` 不会自动移入更多；若 `more` 为空，组件不得显示 `[⋮]`。

无详情入口时，允许外显两个工作流动作：

```tsx
<OperationActions
  edit={{ label: '编辑', onClick: () => openEdit(record) }}
  process={{ label: '处理', onClick: () => openProcess(record) }}
/>
```

旧页面若已有扁平 `items[]`，可用 `splitOperationActions(items)` 拆出详情入口、工作流动作与更多；迁移后仍须检查上述数量和顺序，不得把「查看记录 / 操作记录 / 历史」识别为详情入口。有 `view` 且拆分结果同时包含 `edit`、`process` 时，`edit` 确定性优先；调用方须将有意保留的次级动作显式放入 `more`，或只向组件传入选定的工作流动作。

### 视觉与无障碍

| 项 | 规则 |
|----|------|
| 主操作按钮 | `vm-op-action`，图标 16px + 文案，最小触控区 44×44px |
| 更多按钮 | `vm-op-more-btn`，Lucide `MoreHorizontal`，44×44px |
| 危险操作 | `more` 项设 `danger: true`，下拉项红色 |
| 聚焦 | 可见 focus 环；尊重 `prefers-reduced-motion` |
| 图标 | 使用 Lucide SVG，禁止 emoji 作图标 |

### 禁止做法

- 有详情入口时外显超过 **1** 个工作流动作；无详情入口时外显超过 **2** 个工作流动作
- 将详情 / 对象入口放到工作流动作之后或收入更多
- 将「查看记录 / 操作记录 / 历史」作为详情入口外显
- 在没有菜单项时渲染空的更多触发器
- 使用 `\|` 分隔符串联操作链接（客户/供应商旧版 pipe 模式）
- 各模块自定义 `lc-row-actions`、`h2-action-more-btn` 等（逐步废弃，统一用 `OperationActions`）
- 更多触发器使用文字「更多」而非图标

### 参考实现

| 页面 | 路径 |
|------|------|
| 车辆资产 | `vehicle-management/components/ListView.tsx` |
| 故障处置 | `vehicle-fault-handling/FaultHandlingApp.tsx` |
| 租赁合同 | `lease-contract-management/LeaseContractHub.tsx` |
| 组件源码 | `src/common/OperationActions.tsx` |


### 紧凑变体（详情 Tab 内嵌表格）

详情页 Tab 等小空间场景，footer 追加 `vm-table-footer--compact`：

```html
<div class="vm-table-footer vm-table-footer--compact">
```

仍使用同一 `TablePagination` 组件（内置「共 x 条」）；紧凑样式见 `vm-pagination.css` 内 `.vm-table-footer--compact` 规则。

参考：`vehicle-management/components/Detail*RecordsTab.tsx`。

## 多选框（强制）

凡 `vm-page` 内需要勾选、批量选择或多选筛选，**一律**使用全局多选框规范。

### 样式与依赖

- 样式源文件：`src/common/vm-checkbox.css`（由 `vehicle-management/style.css` 引入）
- 引入 `vehicle-management/style.css` 后自动生效，**禁止**在模块内重复定义多选框外观

### 类名与用法

| 场景 | 类名 | 说明 |
|------|------|------|
| 显式多选框 | `vm-checkbox` | 工具栏筛选、弹窗列表、表单内勾选等 |
| 表格勾选列 | `vm-col-check` / `ldb-col-check` / `cm-col-check` | 列宽 48px、居中；列内 `input[type="checkbox"]` **自动**应用 `vm-checkbox` 样式 |
| 下拉多选面板 | `vm-ops-picker-option` 内 checkbox | **例外**：保持紧凑原生 `accent-color`，不使用 `vm-checkbox` |

工具栏筛选示例：

```tsx
<label className="ldb-toolbar-unpaid-filter is-active">
  <input type="checkbox" className="vm-checkbox" checked={...} onChange={...} />
  <span>仅显示未收款数据</span>
</label>
```

表格勾选列示例：

```tsx
<th className="ldb-col-check sticky-col-left">
  <input type="checkbox" checked={allSelected} onChange={...} aria-label="全选" />
</th>
```

### 视觉规格

| 状态 | 表现 |
|------|------|
| 默认 | 18×18px 圆角方框，白底 + 细边框 + 内阴影 |
| 悬停 | 主题色描边 + 浅色外发光 |
| 选中 | 主题绿底 + 白色对勾 |
| 半选（`indeterminate`） | 主题绿底 + 白色横线（表头部分选中时） |
| 聚焦 | 可见 focus 环 |
| 禁用 | 45% 透明度 |

### 交互与无障碍

| 项 | 规则 |
|----|------|
| 表头全选 | 部分选中时设置 `input.indeterminate = true` |
| 勾选列 | 左冻结时使用 `sticky-col-left` |
| 无障碍 | 表头 `aria-label="全选"`；行内 `aria-label` 说明所选对象 |
| 动效 | 点击轻微缩放；`prefers-reduced-motion` 时关闭 |

## 禁止做法

- 不使用 `vm-pagination*` 类名自建分页 UI
- 不在列表主表格使用「下拉显示更多」代替分页
- 不引入与 Linear token 冲突的第三方分页皮肤
- 不在 footer 混用多种分页交互（分页 + 加载更多并存）
- 不在 footer 重复写总条数（须由 `TablePagination` 统一输出）
- 不在列表工具栏重复写总条数（KPI / 分页已展示时）
- 不在 `vm-page` 内为表格/工具栏多选框自定义 checkbox 皮肤（须用 `vm-checkbox` 或勾选列自动样式）
- 不覆盖 `vm-ops-picker-option` 内多选框的紧凑样式

## 参考实现

| 页面 | 路径 |
|------|------|
| 车辆管理 | `src/prototypes/vehicle-management/index.tsx` |
| 租赁业务台账 | `src/prototypes/lease-business-ledger/index.tsx` |
| 客户管理 | `src/prototypes/customer-management/index.tsx` |
| 收款记录 | `src/prototypes/payment-records/index.tsx` |
| 加氢站站点信息 | `src/prototypes/oneos-web-h2-station-site/pages/03-站点信息.jsx` |
| 车辆维修明细 | `src/prototypes/vehicle-maintenance-ledger/MaintenanceLedgerPage.jsx` |
| 租赁合同管理 | `src/prototypes/lease-contract-management/LeaseContractManagement.jsx` |
