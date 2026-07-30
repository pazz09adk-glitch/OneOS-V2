import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface DetailEntryLinkProps {
  children: React.ReactNode;
  onClick: () => void;
  /** 完整无障碍说明，如「月里程…，点击进入工单详情」 */
  ariaLabel: string;
  title?: string;
  /** title=任务名；code=等宽单号；默认通用 */
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
}) => {
  return (
    <button
      type="button"
      className={[
        'v2-two-detail-entry',
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
      <span className="v2-two-detail-entry__text">{children}</span>
      {!compact && (
        <span className="v2-two-detail-entry__hint" aria-hidden>
          查看
          <ChevronRight size={13} strokeWidth={2.25} />
        </span>
      )}
    </button>
  );
};

interface RelatedBizCodeProps {
  code: string;
}

/**
 * 关联业务单号 · 只读展示（不可点）。
 * 任务台账常被跨部门查看，关联采购合同等单据含敏感信息，禁止从这里跳转业务详情。
 */
export const RelatedBizCodeLink: React.FC<RelatedBizCodeProps> = ({ code }) => (
  <span
    className="v2-two-related-code"
    title="关联业务单号仅作引用展示，不可跳转（跨部门脱敏）"
  >
    {code}
  </span>
);

interface WorkOrderCodeLinkProps {
  code: string;
  onClick: () => void;
  compact?: boolean;
}

/** 工单编号 · 详情入口（进本台账工单详情，非关联业务原单） */
export const WorkOrderCodeLink: React.FC<WorkOrderCodeLinkProps> = ({
  code,
  onClick,
  compact = false,
}) => (
  <DetailEntryLink
    variant="code"
    compact={compact}
    onClick={onClick}
    ariaLabel={`${code}，点击进入工单详情`}
    title="点击进入工单详情"
  >
    {code}
  </DetailEntryLink>
);
