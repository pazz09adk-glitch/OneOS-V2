# 02 · Layout（栅格、断点、安全区、页面模板）

---

## 1. 栅格与容器（Web）

| 项 | 规则 |
|----|------|
| 盒模型 | 强制 `box-sizing: border-box`，Flex/Grid 容器与列项配置 `min-width: 0` 防溢出 |
| 内容区 | 列表页随主内容区撑满；营销类落地页不在本规范范围 |
| 页面 padding | 见 Foundations：`24px 32px 32px` |
| 栏数 | 表单/筛选常用 **4 列**（Bento 4列 / FilterBar 4列）；详情描述可用 2–3 列 |
| Gutter | 筛选网格 `16px 12px`（行距×列距）；Bento 大盘 `16px` / `20px` |
| Sticky | 表头可粘性；底部分页在 `vm-table-footer` 内，不与表头抢层 |

### 1.1 核心栅格模式

#### 4列 Bento Grid (KPI 大盘)
- `grid-template-columns: repeat(4, 1fr)`（>1024px）；≤1024px 降级 2 列，≤640px 1 列。
- Gap: `16px` 或 `20px`。

#### 13项高阶筛选网格 (FilterBar Grid)
- `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`。
- Gap: `16px 12px`（行距 16px，列距 12px），`align-items: end` 底部对齐。
- **主入口强化**：列表工具栏主搜索与「更多筛选」必须用 `.v2-filter-search` / `.v2-filter-more-btn`（或 `V2FilterSearch` / `V2FilterMoreButton`）。
- **尺寸统一（强制）**：PC 高度 **36px**、圆角 **8px**（`--v2-filter-entry-height` / `--v2-filter-entry-radius`），与 `V2Button md` 及旁侧导出同高；H5 **44px**。引导靠主色浅底+描边+外晕，禁止私自改高度造成高低不一。详见 `DESIGN.md` §2.4.3.2。
- **工具栏单行（PC）**：右侧操作链（搜索 + 更多筛选 + 导出/导入/列设置）≥1024 保持同一行；主搜索可 flex 收缩，不得硬 `min-width` 挤掉后续按钮。

#### 响应式多列布局网格
- `ds-grid-3`: `repeat(auto-fill, minmax(320px, 1fr))`，gap `20px`（3列卡片/表单网格）。
- `ds-grid-4`: `repeat(auto-fill, minmax(260px, 1fr))`，gap `16px`（4列高密度网格）。

#### 三视角 Split 主从模式分栏
- 左侧 `340px` (或 `320px~360px`) 固定任务单据列表 + 右侧 `1fr` (`flex: 1; min-width: 0`) 详情工作台，gap `16px`。

### 表单栅格

- 弹窗/抽屉内：`layout="vertical"`（Ant）
- 宽页编辑：可 2 列字段，标签仍在上；窄屏改 1 列

---

## 2. 断点与响应式

| 断点 | 变化 |
|------|------|
| ≤1440px | 超宽屏仍保持标准密度，不无限拉宽字号 |
| ≤1280px | 筛选 2 列 |
| ≤960px | KPI 2 列；侧栏可收起（壳层约定） |
| ≤640px | padding 16px；筛选/KPI 1 列；考虑表→卡片 |

**禁止**整页横向滚动。表格允许在 `vm-table-wrap` 内横向滚动。

**PC / H5 弹层形态**：`V2Select` / 日期类控件的 Bottom Sheet **只**在视口 ≤767 或 `data-viewport="h5"` 时启用；不得因详情窄栏宽度在 PC 上误用 H5 吸底面板。

---

## 3. App / 小程序安全区

| 项 | 规则 |
|----|------|
| 顶部 | 避开刘海 / Dynamic Island；导航内容在 safe-area 内 |
| 底部 | TabBar / 主操作条垫 `env(safe-area-inset-bottom)` |
| 小程序 | 预留右侧胶囊按钮区域，标题勿伸入 |
| 键盘 | 表单底栏随键盘上推，主按钮不可被挡 |
| 横屏 | 现场作业默认竖屏；若支持横屏须重算边距 |
| 单位 | iOS pt / Android dp / 小程序 rpx（以 375 宽为设计基准时 1px≈1rpx@375） |

顶栏高度、TabBar 高度使用各端标准组件默认值；自定义时顶栏内容区约 44pt，TabBar 约 48–56 + 安全区。

---

## 4. 页面模板（强制结构）

新建页面必须落入下表某一模板；例外写入该原型 `.spec`。

### 4.1 Web 列表页

```text
.vm-page
├── .vm-filter-card
├── .vm-kpi-row                 # 可选
└── .vm-table-section
    ├── .vm-table-toolbar
    └── .vm-table-card
        ├── .vm-table-wrap
        └── .vm-table-footer    # TablePagination
```

- 必须 `import '../vehicle-management/style.css'`
- 侧栏已有模块名时，**正文禁止重复 h1 大标题**
- 详情：`src/prototypes/vm-shared/DESIGN.md`

#### 4.1.1 复杂台账列个性化的端侧边界

- 列宽、列显隐和列顺序仅适用于 PC / Web 表格。
- H5（≤767px）按本规范转换为单列卡片，不显示列设置入口，也不提供表头拖拽。
- H5 忽略但不得删除同一用户已经保存的 PC 列配置。
- 用户扩大业务列后，只允许表格自身滚动容器横向滚动；页面壳层不得产生横向滚动。
- 完整交互和保存规则见 [03-components §3.1.1](./03-components.md#311-复杂台账列个性化pc--web-强制)。

### 4.2 Web 详情页

```text
页头：返回 + 标题 + 主/次操作
├── 摘要头（关键字段 / 状态 Tag）
├── Tabs 或锚点分区
├── 信息分组（Description / 子表）
└── （可选）底栏主操作 —— 长页时 Sticky
```

### 4.3 Web 创建 / 编辑页

```text
页头：返回 + 标题
├── 分区表单（区块标题 + 字段）
└── 底栏：取消（次）+ 保存/提交（主）
```

- 离开有未保存更改 → 确认
- 校验失败定位到首个错误字段

### 4.4 工作台 / 仪表盘

```text
可选筛选/时间范围
├── KPI / 待办条
├── 卡片栅格（图表、列表摘要）
└── 消息 / 审批入口
```

- 单屏信息有主次；禁止首屏堆砌无交互装饰卡

### 4.5 审批 / 流程页

```text
单据摘要
├── 流程轴 / 节点
├── 表单只读或可编辑区
├── 附件
└── 意见 + 通过/驳回（主操作区固定）
```

### 4.6 设置 / 配置页

```text
分组列表
├── 行：标签 + 说明 + 控件（Switch/进入）
└── 危险区单独成组（破坏性操作）
```

### 4.7 登录 / 空壳

```text
品牌区（Logo/产品名）
├── 表单
└── 辅助链接（忘记密码等）
```

### 4.8 App 首页

```text
顶栏（标题/城市/消息）
├── 金刚区（≤10 入口，一屏可扫）
├── 任务/消息摘要
└── 列表或卡片流
+ TabBar
```

### 4.9 App 表单 / 任务流

```text
顶栏返回 + 标题
├── 步进器（多步时）
├── 字段分组
├── 拍照 / 扫码区
└── 底栏主按钮（单主操作）
```

### 4.10 结果页

```text
成功/失败图标（语义色）
├── 标题 + 一句话说明
└── 主按钮（返回列表/查看详情）+ 可选次按钮
```

---

## Do / Don't

### Do

- 先选模板再堆组件。
- App 主操作放底栏并处理安全区。

### Don't

- 不要在标准列表页再塞与侧栏重复的大标题和长说明。
- 不要整页横向滚动。
