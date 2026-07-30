import React from 'react';
import { ChevronRight } from 'lucide-react';
import './detail-entry.css';

export interface DetailEntryLinkProps {
  children: React.ReactNode;
  onClick: () => void;
  /** 完整无障碍说明，如「账单号…，点击进入详情」 */
  ariaLabel: string;
  title?: string;
  /** title=主标题；code=等宽单号；默认通用 */
  variant?: 'title' | 'code' | 'default';
  /** 看板等紧凑场景可不显示「查看 ›」 */
  compact?: boolean;
  className?: string;
  stopPropagation?: boolean;
}

/** 详情入口链接 · DESIGN.md §5.1：主色下划线 + 后方「查看 ›」 */
export const DetailEntryLink: React.FC<DetailEntryLinkProps> = ({
  children,
  onClick,
  ariaLabel,
  title,
  variant = 'default',
  compact = false,
  className = '',
  stopPropagation = false,
}) => (
  <button
    type="button"
    className={[
      'bfcl-detail-entry',
      `is-${variant}`,
      compact ? 'is-compact' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    onClick={(e) => {
      if (stopPropagation) e.stopPropagation();
      onClick();
    }}
    title={title || ariaLabel}
    aria-label={ariaLabel}
  >
    <span className="bfcl-detail-entry__text">{children}</span>
    {!compact && (
      <span className="bfcl-detail-entry__hint" aria-hidden>
        查看
        <ChevronRight size={13} strokeWidth={2.25} />
      </span>
    )}
  </button>
);
