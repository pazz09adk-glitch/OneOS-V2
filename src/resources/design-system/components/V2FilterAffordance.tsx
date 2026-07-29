import React from 'react';
import { Filter, Search } from 'lucide-react';

export interface V2FilterSearchProps {
  /** 搜索控件（input / LnSelect / V2Select 等） */
  children: React.ReactNode;
  /** 左侧图标，默认 Search */
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** 无障碍标签，描述整块搜索入口 */
  'aria-label'?: string;
}

/**
 * 台账工具栏「主搜索」壳：主色描边 + 浅底 + 外晕，引导优先查车/查单。
 * 样式类名：`.v2-filter-search`（见 oneos-ds-filter-affordance.css）
 */
export function V2FilterSearch({
  children,
  icon,
  className = '',
  style,
  'aria-label': ariaLabel = '主搜索',
}: V2FilterSearchProps) {
  return (
    <div
      className={`v2-filter-search${className ? ` ${className}` : ''}`}
      style={style}
      aria-label={ariaLabel}
    >
      <span className="v2-filter-search__ico" aria-hidden>
        {icon ?? <Search size={15} strokeWidth={2.25} />}
      </span>
      {children}
    </div>
  );
}

export interface V2FilterMoreButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** 面板是否展开 */
  open?: boolean;
  /** 已生效的高阶筛选条件数；>0 时高亮并显示徽标 */
  activeCount?: number;
  openLabel?: string;
  closedLabel?: string;
  icon?: React.ReactNode;
}

/**
 * 台账工具栏「更多筛选」按钮：与主搜索同级视觉强化。
 * 样式类名：`.v2-filter-more-btn` + `.is-open` / `.has-filters`
 */
export function V2FilterMoreButton({
  open = false,
  activeCount = 0,
  openLabel = '收起筛选',
  closedLabel = '更多筛选',
  icon,
  className = '',
  type = 'button',
  ...rest
}: V2FilterMoreButtonProps) {
  const hasFilters = activeCount > 0;
  const label = open ? openLabel : closedLabel;
  const ariaLabel = hasFilters
    ? `${closedLabel}，已生效 ${activeCount} 项条件`
    : closedLabel;

  return (
    <button
      type={type}
      className={[
        'v2-filter-more-btn',
        open ? 'is-open active' : '',
        hasFilters ? 'has-filters' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-expanded={open}
      aria-label={ariaLabel}
      {...rest}
    >
      {icon ?? <Filter size={15} strokeWidth={2.25} aria-hidden />}
      <span>{label}</span>
      {hasFilters ? (
        <span className="v2-filter-more-badge" aria-hidden>
          {activeCount > 9 ? '9+' : activeCount}
        </span>
      ) : null}
    </button>
  );
}
