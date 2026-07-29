import React from 'react';
import { RightOutlined } from '@ant-design/icons';
import type { ApprovalCardItem } from '../types';
import {
  formatStatusLabel,
  getApprovalTypeColor,
  getApprovalTypeLabel,
} from '../config/approvalTypeConfig';

export interface ApprovalCardProps {
  item: ApprovalCardItem;
  selected?: boolean;
  onClick?: (item: ApprovalCardItem) => void;
}

function statusClassName(status: ApprovalCardItem['status']): string {
  if (status === 'approved') return 'ap-status ap-status--approved';
  if (status === 'rejected' || status === 'terminated') return 'ap-status ap-status--rejected';
  return 'ap-status ap-status--pending';
}

export function ApprovalCard({ item, selected = false, onClick }: ApprovalCardProps) {
  const typeColor = getApprovalTypeColor(item.type);
  const statusLabel = item.statusLabel ?? formatStatusLabel(item);

  return (
    <article
      className={`ap-card${selected ? ' ap-card--selected' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(item)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.(item);
        }
      }}
    >
      <div className="ap-card__header">
        <span
          className="ap-card__type"
          style={{ backgroundColor: `${typeColor}14`, color: typeColor, borderColor: `${typeColor}33` }}
        >
          {item.typeLabel ?? getApprovalTypeLabel(item.type)}
        </span>
        <span className={statusClassName(item.status)}>{statusLabel}</span>
      </div>

      <div className="ap-card__body">
        <h3 className="ap-card__title">{item.title}</h3>
        {item.subtitle ? <p className="ap-card__subtitle">{item.subtitle}</p> : null}

        {item.keyFacts && item.keyFacts.length > 0 ? (
          <dl className="ap-card__facts">
            {item.keyFacts.map((fact) => (
              <div key={`${item.id}-${fact.label}`} className="ap-card__fact">
                <dt>{fact.label}</dt>
                <dd className={fact.emphasis ? 'ap-card__fact-value--emphasis' : undefined}>
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {item.risks && item.risks.length > 0 ? (
          <div className="ap-card__risks">
            {item.risks.map((risk) => (
              <span
                key={`${item.id}-${risk.label}`}
                className={`ap-card__risk ap-card__risk--${risk.level ?? 'default'}`}
              >
                {risk.label}
              </span>
            ))}
          </div>
        ) : null}

        {item.extraTags && item.extraTags.length > 0 ? (
          <div className="ap-card__extra-tags">
            {item.extraTags.map((tag) => (
              <span key={`${item.id}-${tag}`} className="ap-card__extra-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="ap-card__footer">
        <div className="ap-card__footer-meta">
          {item.initiatorSuffixInFooter ? (
            <span className="ap-card__footer-text">{item.initiatedBy}发起</span>
          ) : item.showInitiatorInFooter ? (
            <span className="ap-card__footer-text">发起人 {item.initiatedBy}</span>
          ) : null}
          <span className="ap-card__footer-text">
            {item.footerText ?? `发起时间 ${item.initiatedAt}`}
          </span>
        </div>
        <span className="ap-card__action">
          查看详情
          <RightOutlined />
        </span>
      </div>
    </article>
  );
}
