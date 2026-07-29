import React, { useState } from 'react';
import { ShieldCheck, Clock, ExternalLink, ArrowRight, Send, User } from 'lucide-react';
import type { ApprovalCardItem } from '../types';
import { MOCK_APPROVAL_CARDS } from '../mockData';
import { UrgeModal } from './UrgeModal';
import { V2Tag } from '../../../resources/design-system/components/UIComponents';

export interface ApprovalEmbedProps {
  onUrgeSuccessToast?: (message: string) => void;
}

export const ApprovalEmbed: React.FC<ApprovalEmbedProps> = ({ onUrgeSuccessToast }) => {
  const [cards] = useState<ApprovalCardItem[]>(MOCK_APPROVAL_CARDS);
  const [activeTab, setActiveTab] = useState<'todo' | 'initiated' | 'done' | 'cc'>('todo');
  const [urgeCard, setUrgeCard] = useState<ApprovalCardItem | null>(null);

  const filteredCards = cards.filter((card) => card.tab === activeTab);

  const tabCounts = {
    todo: cards.filter((c) => c.tab === 'todo').length,
    initiated: cards.filter((c) => c.tab === 'initiated').length,
    done: cards.filter((c) => c.tab === 'done').length,
    cc: cards.filter((c) => c.tab === 'cc').length,
  };

  return (
    <div className="v2-wb-panel">
      <div className="v2-wb-panel__header v2-wb-panel__header--stack">
        <div className="v2-wb-panel__title">
          <ShieldCheck size={18} style={{ color: 'var(--oneos-primary)' }} />
          <span>审批中心</span>
        </div>

        <div className="v2-wb-cockpit__role-switcher" role="tablist" aria-label="审批分类">
          {(
            [
              { key: 'todo', label: '待办审批' },
              { key: 'initiated', label: '我发起的' },
              { key: 'done', label: '已办审批' },
              { key: 'cc', label: '抄送我的' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`v2-wb-cockpit__role-btn ${activeTab === tab.key ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.label}</span>
              <span className="v2-wb-tab-badge">{tabCounts[tab.key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="v2-wb-todo-list">
        {filteredCards.length === 0 ? (
          <div className="v2-wb-todo-empty">当前队列暂无审批单据</div>
        ) : (
          filteredCards.map((card) => (
            <div key={card.id} className="v2-wb-todo-card">
              <div className="v2-wb-todo-card__top">
                <div className="v2-wb-todo-card__main">
                  <V2Tag type={card.isUrgent ? 'error' : 'primary'}>{card.typeLabel}</V2Tag>
                  <span className="v2-wb-todo-card__title">{card.title}</span>
                </div>
                <span className="v2-wb-todo-card__sla">
                  <Clock size={12} />
                  停留 {card.stayDuration}
                </span>
              </div>

              <div className="v2-wb-approval-meta">
                <span>
                  <User size={12} /> 发起人:{' '}
                  <strong>{card.applicant}</strong>
                </span>
                <span>
                  发起时间: <strong className="tabular">{card.applyTime}</strong>
                </span>
                <span>
                  当前节点: <strong className="is-primary">{card.currentStep}</strong>
                </span>
              </div>

              {activeTab === 'cc' && card.ccContent && (
                <div className="v2-wb-cc-box">
                  <div className="v2-wb-cc-box__label">抄送内容</div>
                  <p>{card.ccContent}</p>
                </div>
              )}

              <div className="v2-wb-approval-nodes">
                {card.flowNodes.map((node, idx) => (
                  <React.Fragment key={`${card.id}-${idx}`}>
                    <span className={`v2-wb-node-pill is-${node.status}`}>
                      {node.label}
                      {node.handler ? ` (${node.handler})` : ''}
                    </span>
                    {idx < card.flowNodes.length - 1 && (
                      <ArrowRight size={10} style={{ color: 'var(--ln-muted)', flexShrink: 0 }} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="v2-wb-todo-card__foot">
                <span className="v2-wb-todo-card__time">审批进展：{card.currentStep}</span>
                <div className="v2-wb-todo-card__actions">
                  {activeTab === 'initiated' && card.initiatorCanUrge && (
                    <button
                      type="button"
                      className="v2-wb-btn v2-wb-btn--secondary"
                      onClick={() => setUrgeCard(card)}
                    >
                      <Send size={12} />
                      催办
                    </button>
                  )}
                  {card.href && (
                    <a
                      href={card.href}
                      className="v2-wb-btn v2-wb-btn--primary"
                      style={{ textDecoration: 'none' }}
                    >
                      <span>{activeTab === 'todo' ? '立即审批' : '查看详情'}</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <UrgeModal
        isOpen={!!urgeCard}
        title={urgeCard?.title || ''}
        subtitle="催办审批"
        onClose={() => setUrgeCard(null)}
        onConfirmUrge={(channels) => {
          onUrgeSuccessToast?.(
            `已通过【${channels.join('、')}】向审批人发送催办（演示时间: ${new Date().toLocaleTimeString()}）`,
          );
        }}
      />
    </div>
  );
};
