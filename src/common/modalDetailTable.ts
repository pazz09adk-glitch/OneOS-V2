import type { ColumnsType } from 'antd/es/table';

/** 弹窗明细表统一 className，配合 src/common/modal-detail-table.css */
export const LN_MODAL_DETAIL_TABLE_CLASS = 'ln-modal-detail-table';

/** 计算 Ant Table scroll.x；expand 默认预留滚动条/展开列余量 */
export function sumColumnScrollX<T>(columns: ColumnsType<T>, expand = 0): number {
  const base = columns.reduce((sum, col) => sum + (Number(col.width) || 0), 0);
  return base + expand;
}

/** 开发环境检查：弹窗表每列必须设置 width，避免表头表体错行 */
export function warnMissingModalColumnWidths<T>(
  columns: ColumnsType<T>,
  context: string,
): void {
  if (typeof import.meta !== 'undefined' && !import.meta.env?.DEV) return;
  const missing = columns.filter((col) => col.width == null);
  if (missing.length > 0) {
    console.warn(
      `[${context}] 弹窗表格列缺少 width，可能导致表头与内容错行：`,
      missing.map((col) => col.key ?? col.title),
    );
  }
}
