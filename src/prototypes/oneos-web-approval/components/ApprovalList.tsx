import React, { useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import type {
  ApprovalCardItem,
  ApprovalTabKey,
  ApprovalFilters,
} from '../types';
import {
  APPROVAL_TYPE_CONFIG,
  APPROVAL_TYPE_OPTIONS,
  filterCasesByTab,
} from '../data/mockApprovalCases';
import { V2Select } from '../../../resources/design-system/components/UIComponents';

/** 钉钉式列表标题：发起人提交的{类型}-{短摘要} */
function buildListCardTitle(item: ApprovalCardItem, typeName: string) {
  const rawHint =
    item.subtitle?.split('·')[0]?.trim() ||
    item.title.replace(/审批$/, '').trim();
  const hint = rawHint.length > 18 ? `${rawHint.slice(0, 18)}…` : rawHint;
  return `${item.initiatedBy}提交的${typeName}-${hint}`;
}

function formatInitiatedDate(initiatedAt: string) {
  // 2026-07-22 14:30 → 2026.07.22 发起
  const day = initiatedAt.slice(0, 10).replace(/-/g, '.');
  return `${day} 发起`;
}

function getWaitingLabel(item: ApprovalCardItem) {
  if (item.status === 'approved') return '已完成';
  if (item.status === 'rejected') return '已驳回';
  if (item.status === 'terminated') return '已撤销';
  const approver = item.currentApprover?.trim();
  if (
    approver &&
    approver !== '已结案' &&
    approver !== '流程已完成' &&
    approver !== '已驳回'
  ) {
    if (item.listTab === 'todo') return '等待我处理';
    return `等待${approver}处理`;
  }
  return '待审核';
}

export interface ApprovalListProps {
  cases: ApprovalCardItem[];
  activeTab: ApprovalTabKey;
  onTabChange: (tab: ApprovalTabKey) => void;
  selectedId: string | null;
  onSelectCase: (item: ApprovalCardItem) => void;
  filters: ApprovalFilters;
  onFiltersChange: React.Dispatch<React.SetStateAction<ApprovalFilters>>;
}

export const TAB_CONFIG: Array<{ key: ApprovalTabKey; label: string }> = [
  { key: 'todo', label: '我的待办' },
  { key: 'initiated', label: '我发起的' },
  { key: 'done', label: '我的已办' },
  { key: 'cc', label: '我的抄送' },
];

export const ApprovalList: React.FC<ApprovalListProps> = ({
  cases,
  activeTab,
  onTabChange,
  selectedId,
  onSelectCase,
  filters,
  onFiltersChange,
}) => {
  // 1. 计算各个 Tab 下的计数
  const tabCounts = useMemo(() => {
    return {
      todo: filterCasesByTab(cases, 'todo').length,
      initiated: filterCasesByTab(cases, 'initiated').length,
      done: filterCasesByTab(cases, 'done').length,
      cc: filterCasesByTab(cases, 'cc').length,
    };
  }, [cases]);

  // 2. 根据当前 activeTab 和 filters 过滤出要展示列表
  const filteredList = useMemo(() => {
    let list = filterCasesByTab(cases, activeTab);

    if (filters.status !== 'all') {
      if (filters.status === 'pending') {
        list = list.filter(item => item.status === 'pending' || item.status === 'processing');
      } else {
        list = list.filter(item => item.status === filters.status);
      }
    }

    if (filters.type !== 'all') {
      list = list.filter(item => item.type === filters.type);
    }

    if (filters.urgency === 'urgent') {
      list = list.filter(item => item.urgency === 'urgent' || item.urgency === 'emergency');
    }

    if (filters.keyword.trim()) {
      const q = filters.keyword.trim().toLowerCase();
      list = list.filter(
        item =>
          item.title.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          (item.bizDocNo?.toLowerCase().includes(q) ?? false) ||
          (item.subtitle?.toLowerCase().includes(q) ?? false) ||
          item.initiatedBy.toLowerCase().includes(q)
      );
    }

    return list;
  }, [cases, activeTab, filters]);

  // 下拉框 Options 转换
  const typeSelectOptions = useMemo(() => {
    return [
      { value: 'all', label: '全部审批类型' },
      ...APPROVAL_TYPE_OPTIONS.map(opt => ({
        value: opt.value,
        label: opt.shortLabel,
      })),
    ];
  }, []);

  return (
    <div className="v2-ap-master">
      {/* ── 1. 1页 4 Tab 切换区 (Segmented Pills Bar) ────────────────────────── */}
      <div className="v2-ap-tabs-wrapper">
        <div className="v2-ap-segmented-track" role="tablist">
          {TAB_CONFIG.map(tab => {
            const count = tabCounts[tab.key];
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                className={`v2-ap-tab-item ${isActive ? 'is-active' : ''}`}
                onClick={() => onTabChange(tab.key)}
              >
                <span className="v2-ap-tab-label">{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`v2-ap-tab-badge ${
                      tab.key === 'todo' && count > 0 ? 'is-unread' : 'is-neutral'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. 筛选搜卡栏 ────────────────────────────────────────── */}
      <div className="v2-ap-filter-bar">
        <div className="v2-ap-search-input">
          <Search className="v2-ap-search-input__icon" aria-hidden />
          <input
            type="text"
            placeholder="搜索审批单"
            value={filters.keyword}
            onChange={e => onFiltersChange(prev => ({ ...prev, keyword: e.target.value }))}
            aria-label="搜索审批单"
          />
        </div>

        <div className="v2-ap-filter-row">
          <div style={{ flex: 1, minWidth: 0 }}>
            <V2Select
              options={typeSelectOptions}
              value={filters.type}
              onChange={val => onFiltersChange(prev => ({ ...prev, type: val as ApprovalFilters['type'] }))}
              placeholder="全部审批类型"
            />
          </div>
        </div>
      </div>

      {/* ── 3. 卡片列表 Scroll 区域 ────────────────────────────────────────── */}
      <div className="v2-ap-card-list">
        {filteredList.length === 0 ? (
          <div
            style={{
              padding: '40px 16px',
              textAlign: 'center',
              color: 'var(--ln-muted)',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Filter style={{ width: 32, height: 32, opacity: 0.4 }} />
            <div>暂无满足条件的审批事项</div>
          </div>
        ) : (
          filteredList.map(item => {
            const isSelected = selectedId === item.id;
            const typeConfig = APPROVAL_TYPE_CONFIG[item.type] || {
              label: item.typeLabel || '审批事项',
              shortLabel: item.typeLabel || '审批',
              color: '#533AFD',
            };
            // 左卡用短类型名（对齐钉钉「付款申请」密度），全称留给详情 Tag
            const typeName = typeConfig.shortLabel || typeConfig.label || '审批';
            const cardTitle = buildListCardTitle(item, typeName);
            // 钉钉顺序：先业务事实，金额/强调项靠后；最多 2 行
            const summaryFacts = (() => {
              const facts = item.keyFacts || [];
              if (facts.length <= 2) return facts;
              const emphasized = facts.filter(f => f.emphasis);
              const rest = facts.filter(f => !f.emphasis);
              const primary = rest[0] ? [rest[0]] : [];
              const secondary = emphasized[0]
                ? [emphasized[0]]
                : rest[1]
                ? [rest[1]]
                : [];
              return [...primary, ...secondary].slice(0, 2);
            })();
            const waiting = getWaitingLabel(item);
            const waitingTone =
              item.status === 'approved'
                ? 'is-success'
                : item.status === 'rejected' || item.status === 'terminated'
                ? 'is-error'
                : 'is-waiting';

            return (
              <div
                key={item.id}
                className={`v2-ap-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => onSelectCase(item)}
                data-annotation-id="biz-type-tag"
              >
                <div className="v2-ap-card__title-row">
                  <span
                    className="v2-ap-card__type-dot"
                    style={{ background: typeConfig.color }}
                    aria-hidden
                  />
                  <h4 className="v2-ap-card__title" title={`${item.title}（${item.id}）`}>
                    {cardTitle}
                  </h4>
                </div>

                {summaryFacts.length > 0 && (
                  <div className="v2-ap-card__summary" data-annotation-id="v2-ap-card__ids">
                    {summaryFacts.map((fact, idx) => (
                      <div key={idx} className="v2-ap-card__summary-line" title={`${fact.label}：${fact.value}`}>
                        <span className="v2-ap-card__summary-label">{fact.label}：</span>
                        <span className="v2-ap-card__summary-value">{fact.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="v2-ap-card__foot">
                  <span className={`v2-ap-card__waiting ${waitingTone}`}>{waiting}</span>
                  <span className="v2-ap-card__date">{formatInitiatedDate(item.initiatedAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="v2-ap-list-footer">
        <span>共 {filteredList.length} 项</span>
      </div>
    </div>
  );
};
