import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  RefreshCw,
} from 'lucide-react';
import type {
  ApprovalCardItem,
  ApprovalTabKey,
  ApprovalFilters,
} from './types';
import { CURRENT_USER, INITIAL_APPROVAL_FILTERS } from './types';
import { MOCK_APPROVAL_CASES, filterCasesByTab } from './data/mockApprovalCases';
import { ApprovalList } from './components/ApprovalList';
import {
  ApprovalDetail,
  type ApproveFormPayload,
} from './components/ApprovalDetail';
import './styles/approval-v2.css';

export function ApprovalCenterHub() {
  const [cases, setCases] = useState<ApprovalCardItem[]>(MOCK_APPROVAL_CASES);
  const [activeTab, setActiveTab] = useState<ApprovalTabKey>('todo');
  const [filters, setFilters] = useState<ApprovalFilters>(INITIAL_APPROVAL_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 1. 当切换 4 个 Tab 时，自动高亮选中当前 Tab 下的首条单据
  useEffect(() => {
    const list = filterCasesByTab(cases, activeTab);
    if (list.length > 0) {
      if (!selectedId || !list.some(i => i.id === selectedId)) {
        setSelectedId(list[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [activeTab, cases]);

  // 当前选中的 Case
  const selectedItem = useMemo(() => {
    return cases.find(c => c.id === selectedId) || null;
  }, [cases, selectedId]);

  const nowLabel = () =>
    new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');

  const handleApprove = (id: string, payload: ApproveFormPayload) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        const comment = payload.message.trim() || '通过';
        const nodes = [...(c.flowNodes || [])];
        const processingIdx = nodes.findIndex(n => n.status === 'processing');
        if (processingIdx >= 0) {
          nodes[processingIdx] = {
            ...nodes[processingIdx],
            status: 'approved',
            comment,
            time: nowLabel(),
            approverName: CURRENT_USER,
          };
        }
        const nextPendingIdx = nodes.findIndex(
          (n, i) => i > processingIdx && n.status === 'pending',
        );
        if (nextPendingIdx >= 0) {
          nodes[nextPendingIdx] = {
            ...nodes[nextPendingIdx],
            status: 'processing',
          };
        }
        const hasMore = nextPendingIdx >= 0;
        return {
          ...c,
          status: hasMore ? ('processing' as const) : ('approved' as const),
          listTab: 'done' as const,
          handledBy: CURRENT_USER,
          handledAt: nowLabel(),
          currentApprover: hasMore ? nodes[nextPendingIdx].role : undefined,
          flowNodes: nodes,
        };
      }),
    );
  };

  const handleTerminate = (id: string, comment: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        const newFlowNodes = (c.flowNodes || []).map(n => {
          if (n.status === 'processing') {
            return {
              ...n,
              status: 'rejected' as const,
              title: '审批终止',
              comment: comment.trim() || '终止',
              time: nowLabel(),
              approverName: CURRENT_USER,
            };
          }
          return n;
        });
        return {
          ...c,
          status: 'terminated' as const,
          listTab: 'done' as const,
          handledBy: CURRENT_USER,
          handledAt: nowLabel(),
          currentApprover: undefined,
          flowNodes: newFlowNodes,
        };
      }),
    );
  };

  const handleComment = (id: string, content: string, attachments: string[] = []) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        const nodes = [...(c.flowNodes || [])];
        const attachmentNote =
          attachments.length > 0 ? `\n附件：${attachments.join('、')}` : '';
        nodes.push({
          id: `cmt-${Date.now()}`,
          title: '评论',
          role: '评论',
          approverName: CURRENT_USER,
          status: 'cc',
          time: nowLabel(),
          comment: `${content}${attachmentNote}`,
        });
        return { ...c, flowNodes: nodes };
      }),
    );
  };

  const handleWithdraw = (id: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        return {
          ...c,
          status: 'terminated' as const,
          currentApprover: undefined,
          handledBy: CURRENT_USER,
          handledAt: nowLabel(),
        };
      }),
    );
  };

  return (
    <div className="v2-ap-container">
      {/* ── 顶栏 Chrome ────────────────────────────────────────── */}
      <header className="v2-ap-header">
        <div className="v2-ap-header__title-group">
          <div className="v2-ap-header__icon">
            <CheckSquare style={{ width: 18, height: 18 }} />
          </div>
          <h1 className="v2-ap-header__title">审批中心</h1>
        </div>

        <div className="v2-ap-header__actions">
          <button
            onClick={() => setCases(MOCK_APPROVAL_CASES)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--ln-hairline)',
              background: 'var(--ln-surface-card)',
              color: 'var(--ln-ink)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RefreshCw style={{ width: 13, height: 13 }} />
            重置演示数据
          </button>
        </div>
      </header>

      {/* ── 主从 Split 视图区域 ────────────────────────────────────────── */}
      <div className="v2-ap-split-body">
        {/* 左侧 Master：1页 4 Tab 切换 + 卡片列表 */}
        <ApprovalList
          cases={cases}
          activeTab={activeTab}
          onTabChange={tab => {
            setActiveTab(tab);
            setFilters(prev => ({ ...prev, keyword: '' }));
          }}
          selectedId={selectedId}
          onSelectCase={item => setSelectedId(item.id)}
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* 右侧 Detail：深度工作台与审批流程图谱 */}
        <ApprovalDetail
          item={selectedItem}
          activeTab={activeTab}
          onApprove={handleApprove}
          onTerminate={handleTerminate}
          onComment={handleComment}
          onWithdraw={handleWithdraw}
        />
      </div>
    </div>
  );
}

export default ApprovalCenterHub;
