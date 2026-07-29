/**
 * 列表页筛选区全局规则（与 vehicle-management/style.css 中 .vm-filter-grid 4 列布局一致）
 *
 * 完整视觉与交互规范：`rules/global-design-spec.md` §4.1
 * 参考实现：`src/prototypes/lease-business-detail/components/FilterPanel.tsx`
 *
 * ## 布局约束
 * 1. 收起时：首行（primary）最多展示 `VM_FILTER_COLUMNS_PER_ROW`（默认 4）项，占满 1 行。
 * 2. 展开时：其余项放入 `vm-filter-expand`（`ldb-filter-expand` 为同义别名）；primary 与 extra 各自使用 4 列栅格。
 * 3. 禁止「末行仅 1 项」：若展开区项数为 4n+1，从首行尾部借调 1 项到展开区（首行变为 3 项）。
 *    典型：总项数 5 → 首行 3 + 展开 2；总项数 6 → 首行 4 + 展开 2。
 * 4. 切换文案仅「更多筛选」/「收起」；按钮类名 `vm-btn vm-btn-link vm-filter-toggle`。
 *
 * ## 占位符（筛选卡内强制）
 * font: `var(--vm-font)`；size: 0.875rem；weight: 400；color: `var(--ln-muted-soft)`；opacity: 1
 */
export const VM_FILTER_COLUMNS_PER_ROW = 4;

/** 默认首行展示的筛选项数量（1 行） */
export const VM_FILTER_PRIMARY_VISIBLE_COUNT = VM_FILTER_COLUMNS_PER_ROW;

export function splitFilterFields<T>(
  fields: T[],
  primaryCount: number = VM_FILTER_PRIMARY_VISIBLE_COUNT,
): { primary: T[]; extra: T[] } {
  const columnsPerRow = primaryCount;
  if (fields.length <= columnsPerRow) {
    return { primary: fields, extra: [] };
  }

  const primary = fields.slice(0, columnsPerRow);
  const extra = fields.slice(columnsPerRow);

  return rebalanceFilterSplit(primary, extra, columnsPerRow);
}

/** 避免展开区出现 4n+1 项导致末行孤零零 1 项 */
function rebalanceFilterSplit<T>(
  primary: T[],
  extra: T[],
  columnsPerRow: number,
): { primary: T[]; extra: T[] } {
  const nextPrimary = [...primary];
  const nextExtra = [...extra];

  while (
    nextExtra.length > 0
    && nextExtra.length % columnsPerRow === 1
    && nextPrimary.length > 0
  ) {
    const moved = nextPrimary.pop();
    if (moved === undefined) break;
    nextExtra.unshift(moved);
  }

  return { primary: nextPrimary, extra: nextExtra };
}

export function shouldShowFilterExpand(
  fieldCount: number,
  primaryCount: number = VM_FILTER_PRIMARY_VISIBLE_COUNT,
): boolean {
  return fieldCount > primaryCount;
}
