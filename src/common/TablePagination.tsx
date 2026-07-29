import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** 全局默认每页条数（对齐租赁合同；可选 10/20/50/100） */
export const DEFAULT_PAGE_SIZE = 10;

/** 全局可选每页条数 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** 加氢站等场景的紧凑每页条数选项 */
export const COMPACT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

export interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  /** 每页条数下拉选项，默认 PAGE_SIZE_OPTIONS */
  pageSizeOptions?: readonly number[];
}

function buildPageItems(current: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | 'ellipsis'> = [1];
  if (current > 3) items.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (current < totalPages - 2) items.push('ellipsis');
  if (totalPages > 1) items.push(totalPages);
  return items;
}

export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = useMemo(() => buildPageItems(page, totalPages), [page, totalPages]);
  const sizeOptions = pageSizeOptions.length > 0 ? pageSizeOptions : PAGE_SIZE_OPTIONS;

  return (
    <div className="vm-pagination" role="navigation" aria-label="表格分页">
      <span className="vm-pagination-total">
        共 <span className="vm-pagination-total-num tabular-nums">{total}</span> 条
      </span>

      {total > 0 && (
        <>
          <div className="vm-pagination-pages">
            <button
              type="button"
              className="vm-pagination-nav"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label="上一页"
            >
              <ChevronLeft size={16} aria-hidden />
            </button>

            {pageItems.map((item, index) => (
              item === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="vm-pagination-ellipsis" aria-hidden>…</span>
              ) : (
                <button
                  key={item}
                  type="button"
                  className={`vm-pagination-page ${page === item ? 'active' : ''}`}
                  onClick={() => onPageChange(item)}
                  aria-current={page === item ? 'page' : undefined}
                >
                  {item}
                </button>
              )
            ))}

            <button
              type="button"
              className="vm-pagination-nav"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              aria-label="下一页"
            >
              <ChevronRight size={16} aria-hidden />
            </button>
          </div>

          <label className="vm-pagination-size">
            <span className="vm-pagination-size-label">每页</span>
            <select
              className="vm-pagination-select"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              aria-label="每页显示条数"
            >
              {sizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="vm-pagination-size-label">条</span>
          </label>
        </>
      )}
    </div>
  );
}
