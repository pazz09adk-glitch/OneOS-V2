# OneOS V2 设计规范 · 其他前端接入说明

> **适用对象**：不使用本仓库 Axhub 原型栈的产品团队（Vue / React 自研 / Ant Design / Element Plus / 小程序 / 原生 App WebView 等）。  
> **目标**：让「人 + AI」在**各自技术栈**里产出符合 OneOS V2 视觉与交互的界面，**不要求**直接依赖本仓库 `UIComponents.tsx`。

| 项 | 说明 |
|---|---|
| 规范版本 | 以 [`DESIGN.md`](./DESIGN.md) 页眉为准（当前 **v2.5**） |
| 规范事实源 | `src/resources/design-system/` |
| 视觉预览 | [OneOS V2 展厅](https://prototype.lnoneos.com/oneos-v2/index.html) |
| 台账母版参考 | [租赁合同台账](https://prototype.lnoneos.com/lease-contract-management/index.html)（三视角） |

---

## 1. 交付包清单（给对方什么）

### 1.1 必给（文档 + Token）

| 文件 / 目录 | 用途 |
|---|---|
| [`DESIGN.md`](./DESIGN.md) | **总规范**（AI 与人类必读） |
| [`chapters/`](./chapters/) | 分章细则（建议至少 00–06、09） |
| [`tokens.json`](./tokens.json) | 机器可读 Design Token |
| [`oneos-ds-tokens.css`](./oneos-ds-tokens.css) | CSS 变量（`--ln-*`、`--oneos-primary`） |
| [`oneos-ds-filter-affordance.css`](./oneos-ds-filter-affordance.css) | 台账「主搜索 / 更多筛选」强化样式 |
| [`ai-prompt-template.md`](./ai-prompt-template.md) | AI 提示词模板（需按本文 §4 改路径） |
| 本文 [`HANDOFF-其他前端.md`](./HANDOFF-其他前端.md) | 接入步骤与验收 |

### 1.2 按需给

| 文件 | 何时需要 |
|---|---|
| [`ruoyi-theme-preset.json`](./ruoyi-theme-preset.json) + [`ruoyi-oneos-v2-theme.css`](./ruoyi-oneos-v2-theme.css) | 对方也基于若依 / Element Plus 且要做主题色桥接 |
| [`theme-variants.json`](./theme-variants.json) | 需要预置浅/深或多主题变体 |
| [`PRIORITY.md`](./PRIORITY.md) | 需要了解规范优先级与冲突裁决 |

### 1.3 不建议整包拷贝

| 内容 | 原因 |
|---|---|
| `components/UIComponents.tsx` 及整库 | 强依赖本仓库 React + Vite 运行时；仅作**交互与 API 命名参考** |
| `src/prototypes/**` 整目录 | 业务原型与种子数据，非通用组件库 |
| `.cursor/rules/*.mdc` | 仅 Cursor + 本仓库路径有效；对方需自建等价规则（见 §3） |

**推荐打包方式**：在本仓库根目录执行：

```bash
node scripts/pack-oneos-v2-design-handoff.mjs
# 或
node scripts/pack-oneos-v2-design-handoff.mjs --out ~/Desktop
```

产出 zip 含本文、[`HANDOFF-Confluence摘要.md`](./HANDOFF-Confluence摘要.md)、`DESIGN.md`、`chapters/`、Token 与 AI 模板（**不含** React 组件库）。

一页可粘贴摘要：[`HANDOFF-Confluence摘要.md`](./HANDOFF-Confluence摘要.md)。

---

## 2. 对方仓库怎么落盘

建议在对方项目中建立固定目录，例如：

```text
docs/oneos-v2/
├── DESIGN.md              ← 从本包复制
├── chapters/              ← 从本包复制
├── tokens.json
├── oneos-ds-tokens.css
├── oneos-ds-filter-affordance.css
├── ai-prompt-template.md
└── HANDOFF-其他前端.md
```

并在团队 README 或 Confluence 写一句：

> **OneOS V2 界面事实源**：`docs/oneos-v2/DESIGN.md`。与 Figma / 旧规范冲突时，以 DESIGN.md 为准。

---

## 3. Token 映射到「另一套前端」

原则：**颜色、圆角、间距走 Token / CSS 变量**，禁止页面内写死 `#533AFD` 或旧品牌绿 `#32a06e`、若依蓝 `#409EFF` 作为 V2 主色。

### 3.1 核心变量（最少要对齐）

| 语义 | 浅色参考 | CSS 变量 |
|---|---|---|
| 主色 | `#533AFD` | `--oneos-primary` / `--ln-primary` |
| 主色 Hover | `#6346FF` | `--ln-primary-hover` |
| 画布背景 | `#F6F9FC` | `--ln-canvas-parchment` |
| 卡片背景 | `#FFFFFF` | `--ln-surface-card` |
| 边框 | `#E3E8EE` | `--ln-hairline` |
| 主正文 | `#0A2540` | `--ln-ink` |
| 次要正文 | `#425466` | `--ln-body` |
| 控件圆角 | `8px` | `--ln-radius-control` |

深色模式：通过 `[data-ds-mode="dark"]` 或 `[data-oneos-theme="dark"]` 切换（见 `oneos-ds-tokens.css`）。

### 3.2 按技术栈接入（示例）

| 技术栈 | 建议做法 |
|---|---|
| **任意 Web + CSS** | 全局引入 `oneos-ds-tokens.css`；业务样式只写 `var(--ln-*)` |
| **Vue + Less/Scss** | 将 `tokens.json` 转为 Scss map 或 CSS 变量；组件库 theme 的 primary 指向 `#533AFD` |
| **React + Ant Design** | `ConfigProvider` 的 `token.colorPrimary: '#533AFD'`；仍建议叠加 `--ln-*` 做壳层与表格密度 |
| **Vue + Element Plus** | 使用 `ruoyi-oneos-v2-theme.css` 或自写 `--el-color-primary` 桥接到 `--oneos-primary` |
| **Tailwind / UnoCSS** | 从 `tokens.json` 生成 `theme.extend.colors` |
| **小程序** | 将主色与背景写入 `app.wxss` 变量；H5 嵌入页复用同一套 hex / 变量表 |
| **原生 App WebView** | H5 页引入 Token CSS；原生导航栏色与 `#533AFD` 对齐 |

### 3.3 组件「等价实现」对照表

对方在**自研组件库**中实现下列能力即可，**不必** API 与 `UIComponents.tsx` 完全一致：

| 规范章节 | 必须对齐的行为 |
|---|---|
| §3.0 `V2Button` | 主/次/描边/幽灵/危险/返回；同一操作区仅一个 primary |
| §2.4.3.2 筛选主入口 | 主搜索 +「更多筛选」视觉强化 + 统一高度 36/44（`.v2-filter-search` / `.v2-filter-more-btn`） |
| §3.15 `V2StatusTabs` | 少量状态胶囊（约 4–6 项）；**多阶段（>8）改用下拉** |
| §3.16 `OperationActions` | 编辑/处理外显，查看记录等进「更多」 |
| §3.17 `V2ImageUpload` | Web：点击+拖拽 Dropzone / 缩略图新增；H5：拍照+相册双入口 ≥44px |
| §2.4.3 筛选 | 查询/重置后自动收起「更多筛选」 |
| §4 三视角 | 台账类：列表 / 看板 / 主从（若产品范围包含） |
| H5 | 触控 ≥44px；Select/Date 等用 Bottom Sheet |

参考交互（只读）：[展厅 · 按钮与筛选](https://prototype.lnoneos.com/oneos-v2/index.html)。

---

## 4. 给「对方 AI」的系统提示（可直接粘贴）

将下方内容放入 Cursor Rules / Claude Project / 内部 Agent 的 **System Prompt**，并把 `docs/oneos-v2/` 换成对方实际路径。

```markdown
你是 ONE-OS V2 界面开发助手。目标技术栈：[填写：Vue3+Element / React+Antd / …]。
你必须严格遵循团队 docs/oneos-v2/DESIGN.md 及 chapters，不得自行发明视觉风格。

## 硬性约束

1. 主色 Stripe Violet #533AFD，经主题变量或 --oneos-primary / --ln-primary 消费；禁止 #32a06e、#409EFF 作为 V2 主色。
2. 禁止原生 <select>、<input type="date">；使用团队封装的等价选择器、日期/时间组件；H5 用 Bottom Sheet。
3. 按钮遵循 DESIGN §3.0：同一操作区仅一个 primary；弹窗取消在左、确认在右。
4. 台账工具栏：主搜索与「更多筛选」须视觉强化且同高 36px（见 §2.4.3.2）；查询/重置后收起更多筛选（§2.4.3）。
5. 列表操作列：编辑/处理外显，查看记录等进「更多」（§3.16）。
6. 金额、编号、VIN、日期：tabular-nums；车牌号禁止间隔点「·」。
7. 支持浅色/深色（data-ds-mode 或 data-oneos-theme）；触控区 ≥44px（H5 正文 ≥14px）。
8. 中后台台账默认考虑列表·看板·主从三视图；若只做一种，须在需求中声明例外。

## 输出要求

- 只生成对方技术栈代码；与规范冲突时先说明并给出合规方案。
- 复杂业务判定须同步产品文档 / 验收项，不得只改 UI。
```

**用户任务示例**（给对方产品经理复制）：

```markdown
请按 docs/oneos-v2/DESIGN.md 生成「XX 管理」列表页（Vue3 + Element Plus）。
- 顶栏：标题 + 三视图切换 + 主/次按钮
- KPI 四宫格 + Pill 状态 Tab + 主搜索 + 更多筛选 + 导出
- 主色 #533AFD；支持浅/深；表格操作列符合 OperationActions 规则
- 附 8 条样例数据与验收清单
```

更完整模板见 [`ai-prompt-template.md`](./ai-prompt-template.md)。

---

## 5. 若对方也用 Cursor

1. 在对方仓库新建 `.cursor/rules/oneos-v2-design-system.mdc`（可从本仓库复制后**改 globs** 为对方源码目录）。
2. 规则首条强制：`生成或修改页面前必须先 Read docs/oneos-v2/DESIGN.md`。
3. 禁止写「去读本仓库 `src/prototypes/...`」——路径改为对方 `docs/oneos-v2/`。

---

## 6. 版本与升级

| 做法 | 说明 |
|---|---|
| **锁版本** | 在对方 `docs/oneos-v2/VERSION` 记录 DESIGN 页眉版本（如 v2.5） |
| **升级** | 仅替换 DESIGN / chapters / tokens；对方组件库由己方按 changelog 跟进 |
| **冲突** | 以 DESIGN.md 为准；Figma 滞后时以 Token + 展厅为准 |

升级时建议附「变更摘要」：只写行为/验收变化，不写纯布局微调（与 AutoPRD 定稿口径一致）。

---

## 7. 验收清单（给对方测试 / AI 自检）

- [ ] 主色、Hover、Focus 环与 [展厅](https://prototype.lnoneos.com/oneos-v2/index.html) 一致
- [ ] 无原生 select / date；H5 弹层为 Bottom Sheet 形态
- [ ] 按钮区仅一个 primary；危险操作有二次确认
- [ ] 台账「更多筛选」查询/重置后自动收起
- [ ] 操作列：编辑/处理外显，查看记录等在「更多」
- [ ] 浅/深切换无「外壳深、内容浅」失配
- [ ] 车牌展示无 `·`（如 `浙A88888F`）
- [ ] H5 可点击区域高度 ≥44px

---

## 8. 常见问题

**Q：能否直接 npm 安装本仓库的 UIComponents？**  
A：当前**未**作为独立 npm 包发布。另一套前端应映射 Token + 自研等价组件。若多团队长期共用，再评估抽 `@oneos/design-system` 包。

**Q：只有设计稿、没有开发资源？**  
A：至少交付 DESIGN.md + tokens + 展厅链接；AI 生成代码时以 DESIGN 为事实源，设计稿为补充。

**Q：对方是若依后台，怎么最快对齐？**  
A：引入 `ruoyi-oneos-v2-theme.css`，后台配置主题色 `#533AFD`，业务页引入 `oneos-ds-tokens.css`。

**Q：阶段/状态特别多怎么办？**  
A：不要用长条 `V2StatusTabs` 铺满；改用下拉（参考车辆详情「生命周期」阶段筛选）。

---

## 9. 本仓库内相关索引

| 资源 | 路径 |
|---|---|
| 规范总览 | [`DESIGN.md`](./DESIGN.md) |
| 规范包说明 | [`README.md`](./README.md) |
| AI 模板 | [`ai-prompt-template.md`](./ai-prompt-template.md) |
| Agent 规则（本仓库） | [`.cursor/rules/oneos-v2-design-system.mdc`](../../.cursor/rules/oneos-v2-design-system.mdc) |
| 全局指引副本 | [`rules/global-design-spec.md`](../../../rules/global-design-spec.md) |

---

**维护**：OneOS 产品 / 设计规范负责人。外发前请确认 DESIGN 页眉版本与展厅已发布版本一致。
