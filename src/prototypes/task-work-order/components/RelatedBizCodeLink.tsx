import React from 'react';
import { ChevronRight } from 'lucide-react';

interface RelatedBizCodeLinkProps {
  code: string;
  typeLabel?: string;
  onClick: () => void;
  /** 无「查看 ›」引导时仅主色单号（如看板紧凑卡） */
  compact?: boolean;
}

/** 关联业务单号 · 对齐车辆资产合同编号链接（主色下划线 + 查看 ›） */
export const RelatedBizCodeLink: React.FC<RelatedBizCodeLinkProps> = ({
  code,
  onClick,
  compact = false,
}) => {
  return (
    <button
      type="button"
      className={`v2-two-related-link ${compact ? 'is-compact' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={`点击查看工单详情（关联 ${code}）`}
      aria-label={`${code}，点击进入工单详情`}
    >
      <span className="v2-two-related-link__text">{code}</span>
      {!compact && (
        <span className="v2-two-related-link__hint" aria-hidden>
          查看
          <ChevronRight size={13} strokeWidth={2.25} />
        </span>
      )}
    </button>
  );
};

interface WorkOrderCodeLinkProps {
  code: string;
  onClick: () => void;
}

/** 工单编号主色可点 → 同页全页详情 */
export const WorkOrderCodeLink: React.FC<WorkOrderCodeLinkProps> = ({ code, onClick }) => (
  <button
    type="button"
    className="v2-two-code-link"
    onClick={onClick}
    title="点击进入工单详情"
    aria-label={`${code}，点击进入工单详情`}
  >
    {code}
  </button>
);
