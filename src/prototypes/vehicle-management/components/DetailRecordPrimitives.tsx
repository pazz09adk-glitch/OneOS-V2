import React from 'react';
import { Inbox } from 'lucide-react';
import {
  V2Empty,
  V2FilterMoreButton,
  V2FilterSearch,
  V2Pagination,
  V2Select,
  V2SingleInputDateRangePicker,
  type SelectOption,
} from '../../../resources/design-system/components/UIComponents';
import { V2Button } from '../../../resources/design-system/components/V2Button';

export interface DetailRecordColumn<Row> {
  key: string;
  label: string;
  width?: number;
  className?: string;
  /** 横向滚动时固定列：右固定用于操作 / 保单文件等 */
  sticky?: 'left' | 'right';
  render: (row: Row) => React.ReactNode;
}

function columnClassName<Row>(column: DetailRecordColumn<Row>): string | undefined {
  const parts = [
    column.className,
    column.sticky === 'right' ? 'sticky-right' : '',
    column.sticky === 'left' ? 'sticky-left' : '',
  ].filter(Boolean);
  return parts.length ? parts.join(' ') : undefined;
}

export interface DetailRecordFilterBarProps {
  title: string;
  children: React.ReactNode;
  onQuery: () => void;
  onReset: () => void;
  /** 已生效「更多筛选」条件数（徽标，不含工具栏主筛）；不传则按 0 */
  activeCount?: number;
  /** 默认是否展开；设计规范默认收起 */
  defaultExpanded?: boolean;
  /** 工具栏主筛（显示在「更多筛选」左侧，如客户名称） */
  toolbarFilter?: React.ReactNode;
}

export interface DetailRecordTableProps<Row extends { id: string }> {
  columns: readonly DetailRecordColumn<Row>[];
  rows: readonly Row[];
  title?: string;
  ariaLabel?: string;
  emptyText?: string;
  emptyDescription?: string;
}

export interface DetailRecordFooterProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/** 统计已生效筛选条件数（非空字符串 / 有效值） */
export function countActiveFilters(filters: object): number {
  return Object.values(filters as Record<string, unknown>).filter((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value === 'boolean') return value;
    return Boolean(value);
  }).length;
}

/** 下拉选项：首项「全部」对应空值 */
export function toFilterSelectOptions(
  values: readonly string[],
  allLabel = '全部',
): SelectOption[] {
  return [
    { value: '', label: allLabel },
    ...values.map((value) => ({ value, label: value })),
  ];
}

export function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="va-record-filter-field">
      <span className="va-record-filter-field__label">{label}</span>
      <div className="va-record-filter-field__control">{children}</div>
    </label>
  );
}

export function FilterTextInput({
  label,
  value,
  onChange,
  placeholder = '请输入',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <FilterField label={label}>
      <input
        type="text"
        className="va-record-filter-input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </FilterField>
  );
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder = '请选择',
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <FilterField label={label}>
      <V2Select
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        searchable={options.length > 8}
      />
    </FilterField>
  );
}

export function FilterDateRange({
  label,
  startDate,
  endDate,
  onChange,
  placeholder,
  popupAlign = 'start',
}: {
  label: string;
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  placeholder?: string;
  popupAlign?: 'start' | 'end';
}) {
  return (
    <FilterField label={label}>
      <V2SingleInputDateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={onChange}
        placeholder={placeholder ?? `${label}范围`}
        popupAlign={popupAlign}
      />
    </FilterField>
  );
}

/**
 * 详情业务记录 Tab 筛选条（对齐 DESIGN.md §2.4.3）：
 * - 工具栏：「更多筛选」用 V2FilterMoreButton（主入口强化 + 生效徽标）
 * - 展开面板：FilterBar 网格 auto-fill/minmax(200px) · gap 16×12 · align-items end
 * - 查询 / 重置后自动收起
 */
export function DetailRecordFilterBar({
  title,
  children,
  onQuery,
  onReset,
  activeCount = 0,
  defaultExpanded = false,
  toolbarFilter,
}: DetailRecordFilterBarProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const contentId = React.useId();
  const rootRef = React.useRef<HTMLElement | null>(null);

  const focusToggle = () => {
    rootRef.current
      ?.querySelector<HTMLButtonElement>('.va-record-filter__toggle')
      ?.focus();
  };

  const handleQuery = () => {
    onQuery();
    setExpanded(false);
    focusToggle();
  };

  const handleReset = () => {
    onReset();
    setExpanded(false);
    focusToggle();
  };

  return (
    <section
      ref={rootRef}
      className={`va-record-filter${expanded ? ' is-expanded' : ''}`}
      role="region"
      aria-label={`${title}筛选`}
    >
      <div className="va-record-filter__toolbar">
        <div className="va-record-filter__heading">
          <h3>{title}</h3>
          <span className="va-record-filter__sub">
            {activeCount > 0 ? `已生效 ${activeCount} 项高阶条件` : '可按条件筛选本车记录'}
          </span>
        </div>
        <div className="va-record-filter__toolbar-actions">
          {toolbarFilter ? (
            <div className="va-record-filter__primary">{toolbarFilter}</div>
          ) : null}
          <V2FilterMoreButton
            className="va-record-filter__toggle"
            open={expanded}
            activeCount={activeCount}
            aria-controls={contentId}
            onClick={() => setExpanded((current) => !current)}
          />
        </div>
      </div>

      {expanded ? (
        <div id={contentId} className="va-record-filter__panel">
          <div className="va-record-filter__grid">{children}</div>
          <div className="va-record-filter__actions">
            <V2Button variant="secondary" size="md" onClick={handleReset}>
              重置
            </V2Button>
            <V2Button variant="primary" size="md" onClick={handleQuery}>
              查询
            </V2Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

/** 工具栏主搜索（客户名称等）：V2FilterSearch 壳 + 即时输入 */
export function FilterToolbarSearch({
  value,
  onChange,
  placeholder = '搜索客户名称',
  ariaLabel = '客户名称',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  return (
    <V2FilterSearch aria-label={ariaLabel} className="va-record-filter__search">
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
      />
    </V2FilterSearch>
  );
}

/** 工具栏日期主筛（事故时间等）：靠右对齐浮层，选择后即时生效 */
export function FilterToolbarDateRange({
  startDate,
  endDate,
  onChange,
  placeholder = '事故时间范围',
  ariaLabel = '事故时间',
}: {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  return (
    <div className="va-record-filter__date" aria-label={ariaLabel}>
      <V2SingleInputDateRangePicker
        className="va-record-filter__date-picker"
        startDate={startDate}
        endDate={endDate}
        onChange={onChange}
        placeholder={placeholder}
        popupAlign="end"
      />
    </div>
  );
}

export function DetailRecordTable<Row extends { id: string }>({
  columns,
  rows,
  title,
  ariaLabel,
  emptyText = '暂无数据',
  emptyDescription = '可调整筛选条件后重试，或清空筛选查看全部记录。',
}: DetailRecordTableProps<Row>) {
  if (columns.length === 0) {
    return (
      <div className="vm-table-card va-record-table-card">
        <V2Empty
          type="empty"
          size="small"
          icon={<Inbox size={26} aria-hidden />}
          title="暂无可显示字段"
          description="当前表格未配置可展示列。"
          primaryActionText=""
        />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="vm-table-card va-record-table-card va-record-table-card--empty">
        {title ? <span className="va-sr-only">{title}</span> : null}
        <V2Empty
          type="no_search"
          size="small"
          icon={<Inbox size={26} aria-hidden />}
          title={emptyText}
          description={emptyDescription}
          primaryActionText=""
        />
      </div>
    );
  }

  return (
    <div className="vm-table-card va-record-table-card">
      <div className="vm-table-wrap vm-table-wrap--detail-tab vm-table-wrap--wide va-table-wrap">
        <table
          className="vm-table va-record-table"
          aria-label={ariaLabel ?? (title ? undefined : '记录列表')}
        >
          {title ? <caption className="va-sr-only">{title}</caption> : null}
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={columnClassName(column)}
                  style={column.width ? { width: column.width, minWidth: column.width } : undefined}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={columnClassName(column)}
                    style={column.width ? { width: column.width, minWidth: column.width } : undefined}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DetailRecordFooter({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: DetailRecordFooterProps) {
  return (
    <div className="va-record-footer">
      <V2Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        size="default"
        align="between"
      />
    </div>
  );
}
