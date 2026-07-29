# OneOS V2 设计规范 · Codex / 开发 AI 接入说明

> **适用对象**：研发侧使用 **OpenAI Codex**（或同类编码 Agent）做页面实现时，强制对齐 OneOS V2。  
> **产品侧外发包**：见 [`HANDOFF-其他前端.md`](./HANDOFF-其他前端.md)；本文偏「怎么让 Codex 写代码时听话」。

| 项 | 说明 |
|---|---|
| 规范事实源 | [`DESIGN.md`](./DESIGN.md)（当前页眉版本为准） |
| 展厅 | https://prototype.lnoneos.com/oneos-v2/index.html |
| 台账母版 | https://prototype.lnoneos.com/lease-contract-management/index.html |

---

## 1. 原理（给研发负责人）

Codex 不会自动知道你们的设计规范，除非：

1. **仓库里有它会读的入口文件**（`AGENTS.md` / 项目指令）  
2. **规范正文在仓库内可 `@` / 可检索**（`docs/oneos-v2/DESIGN.md`）  
3. **开发开任务时口令固定**（提示词模板）  
4. **PR / Code Review 用同一验收清单**（人机双重门禁）

缺任一环，AI 都会退回「通用 Ant Design / 自创紫色」风格。

---

## 2. 在「开发仓库」落盘（一次性）

把外发包解压到开发仓库，推荐路径：

```text
docs/oneos-v2/
├── DESIGN.md
├── chapters/
├── tokens.json
├── oneos-ds-tokens.css
├── oneos-ds-filter-affordance.css
├── ai-prompt-template.md
├── HANDOFF-其他前端.md
├── HANDOFF-Codex开发.md   ← 本文
└── …
```

打外发包（在规范源仓库）：

```bash
node scripts/pack-oneos-v2-design-handoff.mjs
# 或
node scripts/pack-oneos-v2-design-handoff.mjs --out ~/Desktop
```

> 若开发栈不是本原型 React：**不要**强依赖 `UIComponents.tsx`；按 HANDOFF-其他前端 做 Token 映射 + 自研等价组件，但 **DESIGN 规则仍强制**。

---

## 3. 让 Codex「默认读规范」——改 AGENTS.md

在开发仓库根目录 `AGENTS.md`（Codex / 多数 Agent 会优先读）增加一节：

```markdown
## OneOS V2 UI（强制）

凡新建/改版 **页面、表单、台账、弹窗、H5**，必须先阅读并遵守：

- `docs/oneos-v2/DESIGN.md`（事实源）
- 展厅对照：https://prototype.lnoneos.com/oneos-v2/index.html

硬性约束（摘要）：

1. 主色 Stripe Violet `#533AFD`，经 `--oneos-primary` / `--ln-primary`（或团队主题桥接）；禁止旧绿 `#32a06e`、若依蓝 `#409EFF` 作 V2 主色。
2. 禁止原生 `<select>` / `<input type="date">`；用团队封装选择器、日期；H5 用 Bottom Sheet。
3. 按钮遵循 DESIGN §3.0：同一操作区仅一个 primary；弹窗取消左、确认右。
4. 图片上传遵循 §3.17：`V2ImageUpload` 或等价——Web 点击+拖拽；H5 拍照/相册 ≥44px。
5. 台账：主搜索+更多筛选强化；查询/重置后收起筛选（§2.4.3）；操作列编辑/处理外显（§3.16）。
6. 台账默认列表·看板·主从三视图（业务声明例外除外）。
7. **表单页**须声明 `layout: sidebar | fullBleed`（§4.9）：有右栏指派/SLA/审批 → A 侧栏（§4.8）；无右栏需横向空间 → B 横向整屏 B1（主区 100% + PC 边距 20–24px，禁止贴边）。同一页禁止混用。
8. 触控 ≥44px；浅/深色完整；车牌无间隔点 `·`；金额 tabular-nums。

实现前先对照 DESIGN 对应章节；与视觉稿冲突时以 DESIGN + Token 为准，并在 PR 说明。
```

若团队用 **Cursor**：可同时放 `.cursor/rules/oneos-v2-design-system.mdc`（把路径改成 `docs/oneos-v2/**`）。  
若只用 **Codex**：`AGENTS.md` + 任务口令通常足够；有 Codex Project Instructions / Custom instructions 时，把上面整段再贴一份。

---

## 4. 开发同学每次开任务的口令（可复制）

### 4.1 新建页面

```text
按 docs/oneos-v2/DESIGN.md 实现「XX 页面」（Web + H5）。
先读 DESIGN 相关章节再写代码；主色 #533AFD；禁止原生 select/date。
若为表单页：先声明 layout: sidebar | fullBleed（§4.9），再实现。
对照展厅 https://prototype.lnoneos.com/oneos-v2/index.html。
按钮 §3.0；图片上传 §3.17；筛选收起 §2.4.3；操作列 §3.16；表单双布局 §4.9。
技术栈：[Vue3+Element / React+Antd / …]
```

### 4.2 改已有页

```text
按 OneOS V2 规范改「XX 页」的 [上传区 / 筛选 / 按钮 / 表单布局]。
先读 docs/oneos-v2/DESIGN.md §x.x；表单须对齐 §4.8 A 或 §4.9 B；不要自创交互。
改完对照展厅自检：主色、触控 44、浅深色、layout 选型。
```

### 4.3 Codex 技能 / 自定义指令（可选）

在 Codex 侧建一条固定 skill / snippet，名称如 `oneos-v2-ui`，内容指向：

1. 必读 `docs/oneos-v2/DESIGN.md`  
2. 必读 `docs/oneos-v2/ai-prompt-template.md` 系统提示段  
3. 输出前跑 §5 自检清单  

开发说 `@oneos-v2-ui` 或「按 oneos-v2」即可触发。

---

## 5. Codex / 开发自检清单（PR 模板建议）

```markdown
### OneOS V2 UI 自检
- [ ] 已对照 docs/oneos-v2/DESIGN.md 相关章节
- [ ] 主色 / Token 未写死旧绿或若依蓝主色
- [ ] 无原生 select / date（或已用封装等价物）
- [ ] 同一操作区仅一个主按钮；弹窗取消左确认右
- [ ] 图片上传：Web 可拖拽；H5 有拍照/相册且 ≥44px（若本页有上传）
- [ ] 台账筛选：查询/重置后收起（若本页有更多筛选）
- [ ] 操作列：编辑/处理外显（若本页有列表操作）
- [ ] 表单页：已声明并落实 layout sidebar（§4.8 A）或 fullBleed（§4.9 B1）；未混用；B1 有 PC 20–24px 边距非贴边
- [ ] H5 触控 ≥44px；浅/深无外壳内容失配
- [ ] 车牌无 `·`
```

Reviewer 只盯这张表 + 展厅对比，比「感觉像不像」更稳。

---

## 6. 和「产品 Cursor / 原型仓库」的分工

| 角色 | 工具 | 产出 | 规范用法 |
|------|------|------|----------|
| 产品 | Cursor / Axhub 原型 | 可点原型 + PRD | 本仓库 `.mdc` + DESIGN |
| 开发 | Codex + 业务仓 | 生产页面 | `docs/oneos-v2` + `AGENTS.md` + 任务口令 |
| 设计 | 展厅 / Figma | 视觉对齐 | 展厅链接为真源之一 |

**不要**要求 Codex 去 clone 整个原型仓库才能写页；**要**要求业务仓内嵌 DESIGN 副本并锁版本。

---

## 7. 版本升级（规范发布方）

1. 规范仓升 DESIGN 页眉版本 → 重打 zip  
2. 通知研发更新 `docs/oneos-v2/`  
3. changelog 只写行为/验收变化（按钮、上传、筛选等）  
4. Codex 侧 `AGENTS.md` 摘要若有硬编码旧条款，同步改一句  

---

## 8. 常见失败原因

| 现象 | 原因 | 处理 |
|------|------|------|
| 仍出 Ant 默认蓝 | AGENTS 未写 / 任务未点名 DESIGN | 补 AGENTS + 口令 |
| 用了原生 date | 规则未禁止或技术栈示例误导 | DESIGN + 自检清单勾选 |
| H5 仍强调拖拽 | 未读 §3.17 | 任务写明「H5 拍照/相册」 |
| 各业务主色不一致 | Token 未进主题 | 先接 `oneos-ds-tokens` 或主题桥接 |

---

## 9. 一句话转发给研发负责人

> 把 OneOS V2 外发包放进仓库 `docs/oneos-v2/`，在 `AGENTS.md` 加强制读 DESIGN 一节；开发用 Codex 写页面时口令固定「先读 docs/oneos-v2/DESIGN.md」；PR 挂上 V2 自检清单；对照 https://prototype.lnoneos.com/oneos-v2/index.html。

维护：OneOS 产品 / 设计规范。外发 zip 时把本文一并打入包内。
