# ONE-OS Web 端样式

与 `docs/ONE-OS-DESIGN-SPEC.md` 及车辆管理页面规范一致，可直接用于前端构建。

## 文件说明

| 文件 | 用途 |
|------|------|
| `oneos-tokens.css` | **全局设计令牌**（`:root` CSS 变量，`--oneos-*`） |
| `oneos-app.css` | **全局组件样式**（筛选、KPI、表格、详情、Ant 覆盖） |
| `contract-template.css` | 合同模板管理模块样式 |
| `vm-tokens.css` | 向后兼容别名（`@import oneos-tokens.css`） |
| `vehicle-management.css` | 车辆管理模块扩展样式 |
| `ant-table-global-fix.css` | Ant Table measure-row 全局修复 |
| `index.css` | **推荐入口**，聚合上述文件 |

## 引入方式

### 1. 静态 HTML

```html
<link rel="stylesheet" href="https://unpkg.com/antd@5/dist/reset.css" />
<link rel="stylesheet" href="./web端/styles/index.css" />
```

页面根节点（新页面）：

```html
<div class="oneos-page">
  <!-- 列表 / 详情内容 -->
</div>
```

车辆管理现有页面可继续使用 `vm-page`。

### 2. Vite / Webpack

```js
import 'antd/dist/reset.css';
import '../web端/styles/index.css';
```

### 3. Axhub / JSX 原型

`车辆管理.jsx` 会在运行时自动注入样式。新页面建议：

```js
window.ONEOS_STYLESHEET_HREF = '/assets/styles/index.css';
```

## 类名约定

| 前缀 | 说明 |
|------|------|
| `oneos-` | 全局标准（新页面必须使用） |
| `vm-` | 车辆管理历史命名（等价，逐步迁移） |
| `lc-` | 列表页通用别名（filter/table/kpi，与 oneos- 等价） |

### 常用类名

- 页面容器：`.oneos-page` 或 `.vm-page`
- 详情页：`.oneos-page.oneos-detail-shell`
- 筛选：`.oneos-filter-card`、`.oneos-filter-grid`、`.oneos-filter-field`
- KPI：`.oneos-kpi-row`、`.oneos-kpi-card`、`.oneos-kpi-card-active`
- 表格：`.oneos-table-section`、`.oneos-table-card`、`.oneos-list-table`
- 弹窗：Modal 增加 `wrapClassName="oneos-modal-wrap"`

## 定制主题

修改 `oneos-tokens.css` 中 `--oneos-color-primary` 等变量即可全局换色。

完整规范见：[docs/ONE-OS-DESIGN-SPEC.md](../../docs/ONE-OS-DESIGN-SPEC.md)
