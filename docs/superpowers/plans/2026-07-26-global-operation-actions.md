# OneOS V2 Global Operation Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make OneOS V2 list action columns expose “查看/详情” first and one workflow action second, while moving management, history, and dangerous actions into the shared “更多” menu; migrate the vehicle asset list to that shared behavior.

**Architecture:** Keep `OperationActions` as the only renderer and menu owner. Split detail-entry recognition from history recognition in the flat-item adapter, then consume the public `view`, `edit`, and `more` inputs from the vehicle list. Update every normative document that currently describes the old “details in more” behavior.

**Tech Stack:** React 18, TypeScript 5.9, Vitest 4, Lucide React, Vite, CSS.

---

## File map

- Create `src/common/OperationActions.test.tsx`: focused regression tests for action ordering, detail/history classification, hidden actions, and empty menus.
- Modify `src/common/OperationActions.tsx`: render detail first, allow one workflow primary second, and keep history items in `more`.
- Modify `src/common/operation-actions-spec.md`: public component contract and migration guidance.
- Modify `src/resources/design-system/DESIGN.md`: global normative summary.
- Modify `src/resources/design-system/chapters/03-components.md`: component chapter summary and widths.
- Modify `src/prototypes/vm-shared/DESIGN.md`: full shared pattern, examples, and forbidden patterns.
- Modify `src/prototypes/vehicle-management/components/ListView.tsx`: remove the private menu and use `OperationActions`.
- Modify `src/prototypes/vehicle-management/style.css`: remove vehicle-only action-menu skin and size the sticky operation column for the shared component.

### Task 1: Lock the shared action contract with tests

**Files:**

- Create: `src/common/OperationActions.test.tsx`

- [ ] **Step 1: Write regression tests for classification and markup order**

Create the following test file:

```tsx
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
  OperationActions,
  splitOperationActions,
  type OperationActionItem,
} from './OperationActions';

const action = (key: string, label: string): OperationActionItem => ({
  key,
  label,
  onClick: vi.fn(),
});

describe('splitOperationActions', () => {
  it('separates the detail entry from history actions', () => {
    const items = [
      action('history', '操作记录'),
      action('edit', '编辑'),
      action('view', '查看详情'),
      action('owner', '设置运维负责人'),
    ];

    const result = splitOperationActions(items);

    expect(result.view?.label).toBe('查看详情');
    expect(result.edit?.label).toBe('编辑');
    expect(result.more.map((item) => item.label)).toEqual([
      '操作记录',
      '设置运维负责人',
    ]);
  });

  it('does not promote 查看记录 as a detail entry', () => {
    const result = splitOperationActions([
      action('viewRecords', '查看记录'),
      action('process', '处置'),
    ]);

    expect(result.view).toBeUndefined();
    expect(result.process?.label).toBe('处置');
    expect(result.more.map((item) => item.label)).toEqual(['查看记录']);
  });
});

describe('OperationActions', () => {
  it('renders detail before the workflow action and more', () => {
    const html = renderToStaticMarkup(
      <OperationActions
        view={{ label: '查看', onClick: vi.fn() }}
        edit={{ label: '编辑', onClick: vi.fn() }}
        more={[action('owner', '设置运维负责人')]}
      />,
    );

    expect(html.indexOf('>查看<')).toBeLessThan(html.indexOf('>编辑<'));
    expect(html.indexOf('>编辑<')).toBeLessThan(html.indexOf('aria-label="更多操作"'));
  });

  it('does not render more when all menu actions are hidden', () => {
    const html = renderToStaticMarkup(
      <OperationActions
        view={{ label: '详情', onClick: vi.fn() }}
        more={[{ ...action('owner', '设置运维负责人'), hidden: true }]}
      />,
    );

    expect(html).toContain('>详情<');
    expect(html).not.toContain('aria-label="更多操作"');
  });
});
```

- [ ] **Step 2: Run the focused tests and verify the old behavior fails**

Run:

```bash
npm run test:run -- src/common/OperationActions.test.tsx
```

Expected: at least the ordering and classification assertions fail because the current implementation puts `view` into “更多” when `edit` or `process` exists and treats history labels as `view`.

### Task 2: Implement the global shared-component behavior

**Files:**

- Modify: `src/common/OperationActions.tsx`
- Test: `src/common/OperationActions.test.tsx`

- [ ] **Step 1: Update the public contract and primary ordering**

Replace the `view` prop comment, primary-selection block, and `outsidePrimaries` construction with:

```tsx
  /**
   * 查看 / 详情：对象详情入口，固定在外侧首位。
   * 历史型“查看记录 / 操作记录”应通过 more 传入。
   */
  view?: OperationPrimaryAction;
```

```tsx
  const visibleEdit = edit && !edit.hidden ? edit : undefined;
  const visibleProcess = process && !process.hidden ? process : undefined;
  const visibleView = view && !view.hidden ? view : undefined;

  const outsidePrimaries = useMemo(() => {
    const list: Array<{ kind: PrimaryKind; action: OperationPrimaryAction; defaultLabel: string }> =
      [];
    if (visibleView) {
      list.push({
        kind: 'view',
        action: visibleView,
        defaultLabel: visibleView.label || '详情',
      });
    }
    if (visibleEdit) {
      list.push({ kind: 'edit', action: visibleEdit, defaultLabel: '编辑' });
    } else if (visibleProcess) {
      list.push({
        kind: 'process',
        action: visibleProcess,
        defaultLabel: visibleProcess.label || '处理',
      });
    }
    return list.slice(0, 2);
  }, [visibleEdit, visibleProcess, visibleView]);
```

Delete `hasWorkPrimary`, `viewInMore`, `viewOutside`, and the block that injects `visibleView` into `visibleMore`.

- [ ] **Step 2: Keep deduplication without hiding history actions**

Replace `visibleMore` with:

```tsx
  const visibleMore = useMemo(() => {
    const items: OperationActionItem[] = [];
    more.forEach((item) => {
      if (item.hidden) return;
      if (visibleEdit && (item.key === 'edit' || item.label === '编辑' || item.label === '编辑合同')) {
        return;
      }
      if (
        visibleProcess &&
        (item.key === 'process' ||
          item.label === '处理' ||
          item.label === '处置' ||
          item.label === (visibleProcess.label || ''))
      ) {
        return;
      }
      if (
        visibleView &&
        (item.key === 'view' ||
          item.label === '查看' ||
          item.label === '详情' ||
          item.label === '查看详情')
      ) {
        return;
      }
      items.push(item);
    });
    return items;
  }, [more, visibleView, visibleEdit, visibleProcess]);
```

- [ ] **Step 3: Separate detail labels from history labels in the adapter**

Replace the view label set and view classification with:

```tsx
const DETAIL_LABELS = new Set(['详情', '查看', '查看详情']);
const HISTORY_LABELS = new Set(['查看记录', '操作记录']);
```

```tsx
  const viewItem = visible.find(
    (item) => item.key === 'view' || DETAIL_LABELS.has(item.label),
  );
  const more = visible.filter(
    (item) =>
      item !== editItem &&
      item !== processItem &&
      item !== viewItem,
  );
```

Return `viewItem.label` unchanged. Preserve history items—including `key === 'viewRecords'`, `key === 'history'`, and `HISTORY_LABELS` matches—in `more`.

- [ ] **Step 4: Update the component-level summary comment**

Use:

```tsx
/**
 * 列表操作列（强制）：详情入口固定首位，编辑/处理外显一个，
 * 历史、低频管理和危险操作进入更多。
 */
```

- [ ] **Step 5: Run the focused tests**

Run:

```bash
npm run test:run -- src/common/OperationActions.test.tsx
```

Expected: 4 tests pass.

- [ ] **Step 6: Run TypeScript checking**

Run:

```bash
npm run typecheck
```

Expected: exit code 0 with no TypeScript diagnostics.

### Task 3: Update every normative OneOS V2 document

**Files:**

- Modify: `src/resources/design-system/DESIGN.md`
- Modify: `src/resources/design-system/chapters/03-components.md`
- Modify: `src/prototypes/vm-shared/DESIGN.md`
- Modify: `src/common/operation-actions-spec.md`

- [ ] **Step 1: Replace the global §3.16 layout summary**

In `src/resources/design-system/DESIGN.md`, define:

```text
[查看/详情] [编辑/处理/处置] [⋮ 更多]
    ↑ 固定首位       ↑ 最多一个       ↑ 历史 / 管理 / 危险操作
```

State that detail entry is external, “查看记录 / 操作记录” remains in more, only one workflow action is external when detail exists, and two workflow actions are allowed only when there is no detail entry.

- [ ] **Step 2: Update the component chapter summary**

In `src/resources/design-system/chapters/03-components.md`, replace the old sentence with:

```markdown
- 操作列（强制）`OperationActions`：对象入口 `[查看/详情]` 固定首位，常用 `[编辑/处理]` 外显一个；历史、低频管理与危险操作进入 `[⋮ 更多]`；列宽 148–184；推荐 `fixed: 'right'`。详见 `vm-shared/DESIGN.md`。
```

- [ ] **Step 3: Rewrite the shared full pattern**

In `src/prototypes/vm-shared/DESIGN.md`:

- change the diagram to the approved three-part order;
- define `查看/详情` as the object entry;
- define `查看记录/操作记录` as history and keep them in more;
- change the suggested width to `148–184px`;
- update the example so `view={{ label: '查看详情', ... }}` opens the object and `more` contains a history action;
- replace the old forbidden-pattern text with prohibitions against hiding the detail entry, exposing history as the detail entry, or showing more than two primary actions.

- [ ] **Step 4: Rewrite the public component spec**

In `src/common/operation-actions-spec.md`, document the same ordering and replace the example with:

```tsx
<OperationActions
  view={{ label: '查看', onClick: () => openDetail(record) }}
  edit={canEdit ? { onClick: () => openEdit(record) } : undefined}
  more={[
    { key: 'history', label: '操作记录', onClick: () => openHistory(record) },
  ]}
/>
```

- [ ] **Step 5: Scan for stale normative wording**

Run:

```bash
rg -n "查看详情.*更多|查看记录.*外显|低频.*查看详情|\\[编辑\\].*\\[处理\\]" \
  src/resources/design-system \
  src/prototypes/vm-shared/DESIGN.md \
  src/common/operation-actions-spec.md
```

Expected: no statement contradicts the new rules. Historical background text is acceptable only when explicitly marked as the old behavior.

### Task 4: Migrate the vehicle asset operation column

**Files:**

- Modify: `src/prototypes/vehicle-management/components/ListView.tsx`
- Modify: `src/prototypes/vehicle-management/style.css`

- [ ] **Step 1: Import the shared component and remove private-menu imports**

Add the correct relative import:

```tsx
import { OperationActions } from '../../../common/OperationActions';
```

Remove `Eye`, `MoreHorizontal`, `ShieldAlert`, and `UserCog` from Lucide imports only if no remaining usage exists after migration. Keep imports still used elsewhere in `ListView.tsx`.

- [ ] **Step 2: Delete the private `ActionsMoreMenu` component**

Remove the complete `ActionsMoreMenu` function, including its local `open` state, click-outside listener, escape listener, and private menu markup.

- [ ] **Step 3: Replace both vehicle action-cell call sites**

At each current `<ActionsMoreMenu ... />` site, render:

```tsx
<OperationActions
  view={{ label: '查看', onClick: () => onOpenDetail(row) }}
  edit={{ label: '编辑', onClick: () => onEdit(row) }}
  more={[
    {
      key: 'owner',
      label: '设置运维负责人',
      onClick: () => onOps(row),
    },
  ]}
/>
```

If an existing local permission flag controls edit or operations management, pass `undefined` or `hidden: true` before rendering rather than creating an empty menu. Do not introduce new permission semantics.

- [ ] **Step 4: Remove the private menu skin**

Delete vehicle-only selectors whose sole owner was `ActionsMoreMenu`, including:

```css
.va-actions-more-wrap
.va-btn-more
.va-actions-menu
.va-actions-menu__item
.va-actions-menu__icon
.va-actions-menu__text
.va-actions-menu__title
.va-actions-menu__sub
```

Also remove `:has(.va-actions-menu)` stacking workarounds made obsolete by the portal-based shared menu. Keep unrelated table and sticky-column rules.

- [ ] **Step 5: Size and align the shared operation column**

Set the vehicle column styles to:

```css
.va-th-actions,
.va-td-actions {
  min-width: 184px !important;
  width: 184px !important;
  max-width: 184px !important;
  box-sizing: border-box;
}

.va-td-actions {
  overflow: visible !important;
  vertical-align: middle !important;
}

.va-td-actions .vm-operation-actions {
  width: 100%;
  justify-content: flex-start;
}
```

Use the same width in the `ListView.tsx` column definition or width map if it is also hard-coded there.

- [ ] **Step 6: Run static validation**

Run:

```bash
npm run typecheck
npm run test:run -- src/common/OperationActions.test.tsx
npm run build
```

Expected: all commands exit 0.

### Task 5: Browser verification

**Files:**

- Verify: `src/prototypes/vehicle-management/components/ListView.tsx`
- Verify: `src/common/OperationActions.tsx`
- Verify: `src/prototypes/vehicle-management/style.css`

- [ ] **Step 1: Start the local prototype**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL and remains running.

- [ ] **Step 2: Verify desktop behavior**

Open the vehicle asset list and confirm:

- every row shows `查看`, then `编辑`, then the ellipsis;
- `查看` enters the same detail flow as before;
- `编辑` opens the same edit flow as before;
- the ellipsis menu contains only `设置运维负责人`;
- the menu is not clipped by the sticky operation column or scrolling container;
- buttons remain on one line and the operation column is visually stable while horizontally scrolling.

- [ ] **Step 3: Verify keyboard and constrained width**

At desktop and a narrow viewport:

- use Tab to focus `查看`, `编辑`, and the ellipsis in order;
- press Enter or Space to open the menu;
- press Escape and confirm it closes;
- confirm no empty ellipsis appears when a permission-controlled menu item is absent;
- confirm the shared 44px hit areas remain usable and do not overlap.

- [ ] **Step 4: Record verification evidence**

Capture at least one desktop screenshot with the menu open and one narrow-viewport screenshot. Note the tested page path and any permission state used in the final handoff.

### Task 6: Final consistency and completion checks

**Files:**

- Verify: `docs/superpowers/specs/2026-07-26-global-operation-actions-design.md`
- Verify: all files modified in Tasks 1–4

- [ ] **Step 1: Run the full verification suite**

Run:

```bash
npm run test:run
npm run typecheck
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 2: Re-run the normative consistency scan**

Run:

```bash
rg -n "查看详情.*更多|低频.*查看详情|查看记录.*外显" \
  src/resources/design-system \
  src/prototypes/vm-shared/DESIGN.md \
  src/common/operation-actions-spec.md \
  src/common/OperationActions.tsx
```

Expected: no contradictory active rule remains.

- [ ] **Step 3: Review the final change scope**

Because `/Users/sylvawong/oneos-v2` is not currently a Git repository, list changed files by explicit path and verify that `.superpowers/brainstorm/` artifacts are not included in the deliverable. Do not claim commits were created.

