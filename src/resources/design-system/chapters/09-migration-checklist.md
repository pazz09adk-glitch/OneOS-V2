# 09 · 迁移与检查清单

---

## 1. 从 v1 → v2

| 变化 | 说明 |
|------|------|
| 范围 | v1 仅中后台列表 → v2 含详情/表单/工作台/App/小程序/H5 |
| 文档 | 根 `DESIGN.md` 改为总览；细则在 `chapters/00–09` |
| Token | `tokens.json` schemaVersion **2**；补充 info/overlay/图表色/App 尺寸 |
| CSS | 新增 `oneos-ds-tokens.css` 作为共享变量入口 |
| 主色 | **`#533AFD`**（Stripe Violet；对标租赁合同母版） |
| 旧绿 / 若依蓝 | `#32a06e`、`#10b981`、`#409EFF` 视为 **遗留**，V2 新页与迁入页禁止作主色 |
| 暗色 | 母版已支持浅/深；Token 见 `oneos-ds-tokens.css` |
| 迁页清单 | `src/prototypes/oneos-v2/.spec/migration-from-1.2.md` |

编写优先级见 [`../PRIORITY.md`](../PRIORITY.md)。

---

## 2. 工程迁移步骤（Web 模块）

1. 新页 / 大改页：读 `DESIGN.md` + 对应 Patterns。
2. 引入 `vehicle-management/style.css`（列表）或至少 `oneos-ds-tokens.css`（非列表）。
3. `ConfigProvider` 使用规范 `antdTheme`。
4. 替换私有分页 → `TablePagination`；操作列 → `OperationActions`；日期区间 → `DateRangeFilterField`。
5. 去掉重复大标题、重复总条数、右对齐金额。
6. 跑下方检查清单。

## 3. 现场端 / 小程序迁移

1. 确认 `field-theme.css`（或小程序 theme）主色与 `tokens.json` 一致。
2. 主按钮热区 ≥44；底栏加 safe-area。
3. 统一空态/错误/成功 Toast 口径（05）。
4. 列表刷新/加载策略模块内统一。

---

## 4. 新页面检查清单（全类型）

### 4.1 通用

- [ ] 颜色/圆角/关键间距来自 Token，无私有主色
- [ ] 图标为 SVG，非 emoji
- [ ] 主操作区仅一个主按钮
- [ ] 加载 / 空 / 错 状态齐全
- [ ] 文案符合 05；状态色符合词典
- [ ] 对比度与触控热区达标（06）
- [ ] 尊重 `prefers-reduced-motion`

### 4.2 Web 列表

- [ ] 根节点 `vm-page`（及 `ldb-page` / `lc-page`）
- [ ] 已 import `vehicle-management/style.css`
- [ ] 筛选卡 + 日期用 `DateRangeFilterField`（「至」）
- [ ] 按钮 `vm-btn-*`
- [ ] 底部分页 `TablePagination`
- [ ] 操作列 `OperationActions`
- [ ] 金额左对齐 + `tabular-nums`
- [ ] Ant 页已配 `ConfigProvider`
- [ ] 无重复大标题、无重复总条数

### 4.3 Web 详情 / 表单

- [ ] 符合 02 对应模板
- [ ] 表单 label 可见；错误在字段旁
- [ ] 弹窗取消左、确认右；body 限高可滚
- [ ] 未保存离开有确认

### 4.4 App / 小程序 / H5

- [ ] 安全区处理正确
- [ ] 主按钮 ≥44pt/dp
- [ ] Tab ≤5；Navbar 右侧 ≤2
- [ ] 无纯 hover 唯一入口
- [ ] 权限拒绝有引导
- [ ] 与 Web 主色一致

---

## 5. AI 生成检查

生成后必须人工或脚本核对：

1. 是否引用本设计系统而非另起风格
2. 是否复用公共组件
3. 是否写入/更新 `.spec` 与 PRD（若含复杂逻辑或破例）

提示词模板：[`../ai-prompt-template.md`](../ai-prompt-template.md)。

---

## 6. 与 PRD / 标注

- 页面级视觉/交互例外必须写入 `src/prototypes/<id>/.spec/` 并在 PRD 摘要。
- 禁止只改 CSS 不改规范文档（Token 变更同步 chapters + tokens.json）。

---

## Do / Don't

### Do

- 新需求默认按 v2 验收。
- Token 变更同轮改三处：JSON、CSS、文档。

### Don't

- 不要新增 `#10b981` 主色页面。
- 不要复制分页 DOM「临时先用着」。
