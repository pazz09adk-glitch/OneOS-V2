# OneOS V2 Complex Ledger Column Customization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add complete, discoverable OneOS V2 design-system rules for PC/Web complex-ledger column resizing, column visibility, column ordering, persistence, recovery, and accessibility.

**Architecture:** Keep the complete normative rules in the existing Table component section, then add narrow scope and accessibility references in the Layout and Accessibility chapters. Add only a concise mandatory summary to the top-level design-system document so the overview stays readable while all implementation details remain in one authoritative section.

**Tech Stack:** Markdown design-system documentation, OneOS V2 design tokens, existing React vehicle-assets table as the standard example.

---

## File Map

- Modify `src/resources/design-system/chapters/03-components.md`: authoritative component, interaction, persistence, recovery, and acceptance rules.
- Modify `src/resources/design-system/chapters/02-layout.md`: PC/Web scope, H5 exclusion, and horizontal-overflow boundary.
- Modify `src/resources/design-system/chapters/06-accessibility.md`: keyboard, focus, live-region, and drag-alternative requirements.
- Modify `src/resources/design-system/DESIGN.md`: mandatory overview summary and links to the authoritative chapter rules.
- Reference only `src/prototypes/vehicle-management/components/ListView.tsx`: existing standard example; do not change its business behavior in this plan.

The workspace is not a Git repository, so this plan intentionally contains no commit commands. Each task ends with a file-level verification checkpoint instead.

### Task 1: Add the authoritative Table column-personalization rules

**Files:**
- Modify: `src/resources/design-system/chapters/03-components.md`, immediately after the current `### 3.1 Table（Web）` base bullets and before `### 3.2 List / Description / KPI / Card`
- Reference: `docs/superpowers/specs/2026-07-26-complex-ledger-column-customization-design.md`

- [ ] **Step 1: Capture the expected section contract before editing**

Run:

```bash
rg -n "复杂台账列个性化|列宽调整|列设置|userId.*ledgerId.*schemaVersion" \
  src/resources/design-system/chapters/03-components.md
```

Expected: no matches, proving the normative section is currently absent.

- [ ] **Step 2: Add the complete normative section**

Insert this Markdown:

```markdown
#### 3.1.1 复杂台账列个性化（PC / Web 强制）

适用于字段较多、需要横向浏览或用户角色关注字段不同的复杂台账。车辆资产页
`src/prototypes/vehicle-management/components/ListView.tsx` 为标准交互示例。

**能力与入口**

- 表头列分隔线提供列宽调节把手；拖动时实时预览，释放后保存。
- 台账工具栏提供“列设置”图标按钮，弹层集中处理列显隐、列顺序和恢复默认。
- 弹层内修改先暂存；“确认”后一次应用并保存，“取消”不改变当前列表。

**列宽**

- 调节把手命中区约 `12px`；默认显示细分隔线，Hover、Focus 和拖动时使用主题主色增强。
- 普通业务列限制为 `90–480px`；首个核心识别列建议限制为 `120–360px`。
- 达到边界后停止变化，不允许无限缩小或撑宽。
- 双击把手只恢复当前列默认宽度。
- 表格继续在自身滚动容器内横向滚动，不得造成整页横向滚动。

**固定列与业务列**

- 首个核心识别列：必须显示、不可换序、允许在限制范围内调宽。
- 末尾操作列：必须显示、不可换序、不可调宽，宽度依据 `OperationActions` 规范固定。
- 其他业务列：允许显隐、换序和调宽；排序不得越过两端固定列。
- “全选/全不选”只影响可选业务列。固定列必须展示“固定”标识及限制说明。

**保存与恢复**

- 配置按“用户 + 台账页面”自动保存；建议保存键包含
  `userId + ledgerId + schemaVersion`。
- 配置至少包含 `columnWidths`、`visibleColumns`、`columnOrder`。
- 列宽在拖动结束后保存；列显隐与顺序在弹层确认后保存。
- 再次进入同一台账时恢复配置；不同用户和不同台账之间隔离。
- “恢复默认”在弹层内预览默认列宽、显隐和顺序，用户确认后应用并保存，不使用危险确认弹窗。
- 新增字段按设计默认显隐状态和默认位置合并；已删除字段自动忽略，历史配置不得整体失效。
- 配置损坏、版本不兼容或加载失败时回退默认配置，不阻塞台账数据加载。
- 保存失败时保留当前会话配置并轻提示：
  “当前设置暂未同步，下次进入可能恢复默认”。

**主题与反馈**

- 把手、焦点、选中和拖拽目标状态必须消费 OneOS V2 主题 Token，不得硬编码品牌色。
- 固定和禁用状态必须有文字或图标加文字说明，不能只依赖颜色。
- 保存过程不得阻塞台账浏览和操作。
```

- [ ] **Step 3: Verify the authoritative section is complete and unique**

Run:

```bash
rg -n "复杂台账列个性化|90–480px|120–360px|columnWidths|当前设置暂未同步" \
  src/resources/design-system/chapters/03-components.md
```

Expected: each required phrase appears once inside section `3.1.1`.

### Task 2: Define platform and overflow boundaries

**Files:**
- Modify: `src/resources/design-system/chapters/02-layout.md`, in `### 4.1 Web 列表页`
- Reference: `src/resources/design-system/DESIGN.md`, existing H5 table-to-card rule

- [ ] **Step 1: Verify the platform boundary is missing**

Run:

```bash
rg -n "H5.*忽略.*列配置|列个性化.*PC|整页横向滚动.*列宽" \
  src/resources/design-system/chapters/02-layout.md
```

Expected: no complete rule matching all three concerns.

- [ ] **Step 2: Add the PC/Web and H5 layout rule**

Append this block within `### 4.1 Web 列表页`:

```markdown
#### 4.1.1 复杂台账列个性化的端侧边界

- 列宽、列显隐和列顺序仅适用于 PC / Web 表格。
- H5（≤767px）按本规范转换为单列卡片，不显示列设置入口，也不提供表头拖拽。
- H5 忽略但不得删除同一用户已经保存的 PC 列配置。
- 用户扩大业务列后，只允许表格自身滚动容器横向滚动；页面壳层不得产生横向滚动。
- 完整交互和保存规则见 [03-components §3.1.1](./03-components.md#311-复杂台账列个性化pc--web-强制)。
```

- [ ] **Step 3: Verify the layout chapter contains the boundary and link**

Run:

```bash
rg -n "4\\.1\\.1 复杂台账列个性化的端侧边界|H5 忽略但不得删除|03-components §3\\.1\\.1" \
  src/resources/design-system/chapters/02-layout.md
```

Expected: three matches in the new subsection.

### Task 3: Add keyboard and screen-reader equivalence

**Files:**
- Modify: `src/resources/design-system/chapters/06-accessibility.md`, under `## 2. 焦点与键盘（Web）`

- [ ] **Step 1: Capture the current accessibility gap**

Run:

```bash
rg -n "Shift.*24px|Home.*默认宽度|上移/下移|aria-live.*列" \
  src/resources/design-system/chapters/06-accessibility.md
```

Expected: no matches; the current chapter only states the general requirement that drag sorting needs an alternative.

- [ ] **Step 2: Add the complex-ledger accessibility rules**

Append these bullets under `## 2. 焦点与键盘（Web）`:

```markdown

### 2.1 复杂台账列控制

- “列设置”按钮必须提供 `aria-label`、`aria-expanded` 和弹层关联；打开后焦点进入弹层，关闭后回到触发按钮，`Esc` 可关闭。
- 列宽调节把手必须可聚焦：方向键每次调整 `8px`，`Shift + 方向键` 每次调整 `24px`，`Home` 恢复当前列默认宽度。
- 读屏必须播报当前列名和调整后的像素宽度。
- 列排序除拖拽外必须提供“上移/下移”按钮；达到边界或属于固定列时禁用并说明原因。
- 显隐复选框必须与列名关联；固定列控件禁用并以文字说明“固定列不可隐藏”。
- 调宽、排序、恢复默认、保存成功和保存失败使用 `aria-live="polite"` 播报，不能只依赖颜色。
- 视觉分隔线可以为 `2–3px`，但鼠标命中区保持约 `12px`；所有可聚焦控件使用主题 Focus Token。
```

- [ ] **Step 3: Verify all keyboard operations and announcements are present**

Run:

```bash
rg -n "aria-expanded|方向键每次调整 `8px`|Shift \\+ 方向键|Home.*默认宽度|上移/下移|aria-live=\"polite\"" \
  src/resources/design-system/chapters/06-accessibility.md
```

Expected: all six patterns match inside `2.1 复杂台账列控制`.

### Task 4: Add the mandatory overview summary

**Files:**
- Modify: `src/resources/design-system/DESIGN.md`, under `## 1. 设计原则`
- Modify: `src/resources/design-system/DESIGN.md`, frontmatter version and document-version row

- [ ] **Step 1: Verify the overview principle is absent**

Run:

```bash
rg -n "复杂台账列个性化|列宽、列显隐、列顺序" src/resources/design-system/DESIGN.md
```

Expected: no matches.

- [ ] **Step 2: Add the seventh design principle**

Append this item after the current sixth principle:

```markdown
7. **复杂台账列个性化（PC / Web 强制）**：字段较多的复杂台账必须支持列宽调整、可选业务列显隐、可选业务列顺序调整及恢复默认；配置按“用户 + 台账页面”保存。首个核心识别列与末尾操作列遵守固定列限制，H5 卡片列表不提供列操作。完整规则见 [03-components §3.1.1](./chapters/03-components.md#311-复杂台账列个性化pc--web-强制)、[02-layout §4.1.1](./chapters/02-layout.md#411-复杂台账列个性化的端侧边界) 与 [06-accessibility §2.1](./chapters/06-accessibility.md#21-复杂台账列控制)。
```

- [ ] **Step 3: Update both version declarations**

Replace the frontmatter version and version-row content with:

```markdown
version: "2.6"
| 文档版本 | **v2.6 复杂台账列个性化规范**（2026-07-26） |
```

- [ ] **Step 4: Verify the overview stays concise and links all rule owners**

Run:

```bash
rg -n '^version: "2\\.6"|v2\\.6 复杂台账列个性化规范|03-components §3\\.1\\.1|02-layout §4\\.1\\.1|06-accessibility §2\\.1' \
  src/resources/design-system/DESIGN.md
```

Expected: both version declarations match and the seventh principle links all three chapters.

### Task 5: Cross-document verification

**Files:**
- Verify: `src/resources/design-system/DESIGN.md`
- Verify: `src/resources/design-system/chapters/02-layout.md`
- Verify: `src/resources/design-system/chapters/03-components.md`
- Verify: `src/resources/design-system/chapters/06-accessibility.md`

- [ ] **Step 1: Check the confirmed requirements are represented**

Run:

```bash
rg -n \
  "列宽|列显隐|列顺序|恢复默认|用户 \\+ 台账页面|固定列|H5|方向键|上移/下移|保存失败" \
  src/resources/design-system/DESIGN.md \
  src/resources/design-system/chapters/02-layout.md \
  src/resources/design-system/chapters/03-components.md \
  src/resources/design-system/chapters/06-accessibility.md
```

Expected: every requirement category appears in its designated owner document, with the complete behavior in `03-components.md`.

- [ ] **Step 2: Check for unfinished or ambiguous markers**

Run:

```bash
rg -n "TB""D|TO""DO|待""定|待""确认|FIX""ME|酌情|视情况" \
  src/resources/design-system/DESIGN.md \
  src/resources/design-system/chapters/02-layout.md \
  src/resources/design-system/chapters/03-components.md \
  src/resources/design-system/chapters/06-accessibility.md
```

Expected: no new matches in the edited sections.

- [ ] **Step 3: Confirm the standard example still resolves**

Run:

```bash
test -f src/prototypes/vehicle-management/components/ListView.tsx
rg -n "DEFAULT_COLUMN_WIDTHS|列表设置（自定义显隐与列顺序）|va-th-resizer" \
  src/prototypes/vehicle-management/components/ListView.tsx
```

Expected: the file exists and all three reference patterns match.

- [ ] **Step 4: Review the final diff manually**

Because this workspace has no Git metadata, run:

```bash
sed -n '1,220p' src/resources/design-system/chapters/03-components.md
sed -n '55,125p' src/resources/design-system/chapters/02-layout.md
sed -n '15,75p' src/resources/design-system/chapters/06-accessibility.md
sed -n '1,55p' src/resources/design-system/DESIGN.md
```

Expected: headings are correctly nested, cross-links use existing relative paths, detailed rules are not duplicated in the overview, and no unrelated content changed.
