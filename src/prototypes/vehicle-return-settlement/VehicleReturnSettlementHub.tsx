import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  CircleDashed,
  Columns,
  Download,
  Filter,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
} from 'lucide-react';
import { OperationActions } from '../../common/OperationActions';
import {
  V2Button,
  V2Empty,
  V2FilterSearch,
  V2FilterMoreButton,
  V2Pagination,
  V2SegmentedControl,
  V2SingleInputDateRangePicker,
  V2Select,
  V2StatusTabs,
} from '../../resources/design-system/components/UIComponents';
import { V2Badge, type V2BadgeStatus } from '../../resources/design-system/components/V2Badge';
import { APPROVAL_OPTIONS, MOCK_SETTLEMENTS } from './mockData';
import { SettlementDetailPage } from './SettlementDetailPage';
import type {
  ApprovalStatus,
  DeptBlock,
  PageMode,
  SettlementFilters,
  SettlementRecord,
  ViewMode,
} from './types';

const approvalBadge = (s: ApprovalStatus): V2BadgeStatus => {
  if (s === '审批完成') return 'success';
  if (s === '审批中' || s === '待审批') return 'processing';
  if (s === '审批驳回') return 'error';
  if (s === '撤回') return 'warning';
  return 'default';
};

function SubmitIcon({ done }: { done: boolean }) {
  return done ? (
    <CheckCircle2 size={14} className="vrs-submit-ico vrs-submit-ico--done" aria-label="已提交" />
  ) : (
    <CircleDashed size={14} className="vrs-submit-ico" aria-label="未提交" />
  );
}

/** 提交人展示：去掉 mock 里「部门-」前缀，未填显示 — */
function submitPersonLabel(submitBy: string): string {
  const name = submitBy.replace(/^(安全|业务|运维|能源)-/, '').trim();
  return name || '—';
}

function SubmitSituationItem({ label, block }: { label: string; block: DeptBlock }) {
  return (
    <span className="vrs-submit-item">
      <SubmitIcon done={block.status === '已提交'} />
      <span className="vrs-submit-item__body">
        <span className="vrs-submit-item__dept">{label}</span>
        <span className="vrs-submit-item__meta">
          {submitPersonLabel(block.submitBy)} · {block.status}
        </span>
      </span>
    </span>
  );
}

const KANBAN_COLS: ApprovalStatus[] = ['待提交', '待审批', '审批中', '审批完成'];

export function VehicleReturnSettlementHub() {
  const [records, setRecords] = useState<SettlementRecord[]>(MOCK_SETTLEMENTS);
  const [pageMode, setPageMode] = useState<PageMode>('ledger');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusTab, setStatusTab] = useState<ApprovalStatus | 'all'>('all');
  const [filters, setFilters] = useState<SettlementFilters>({
    keyword: '',
    approvalStatus: 'all',
    returnDateRange: null,
  });
  const [draft, setDraft] = useState(filters);
  const [moreOpen, setMoreOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [splitId, setSplitId] = useState<string | null>(MOCK_SETTLEMENTS[0]?.key ?? null);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (statusTab !== 'all' && r.approvalStatus !== statusTab) return false;
      if (filters.approvalStatus !== 'all' && r.approvalStatus !== filters.approvalStatus) return false;
      if (filters.keyword) {
        const q = filters.keyword.trim().toLowerCase();
        const hay = [r.billNo, r.contractCode, r.customerName, r.projectName, r.plateNo]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.returnDateRange) {
        const [start, end] = filters.returnDateRange;
        const d = r.returnTime.slice(0, 10);
        if (start && d < start) return false;
        if (end && d > end) return false;
      }
      return true;
    });
  }, [records, filters, statusTab]);

  const kpi = useMemo(() => {
    const pending = records.filter((r) => r.approvalStatus === '待提交').length;
    const approving = records.filter(
      (r) => r.approvalStatus === '待审批' || r.approvalStatus === '审批中',
    ).length;
    const openSafety = records.filter((r) => r.safety.status === '待提交').length;
    const done = records.filter((r) => r.approvalStatus === '审批完成').length;
    return [
      { key: 'all', label: '全部单据', value: records.length, onClick: () => setStatusTab('all') },
      { key: 'pending', label: '待提交', value: pending, onClick: () => setStatusTab('待提交') },
      {
        key: 'flow',
        label: '审批推进中',
        value: approving,
        onClick: () => setStatusTab('审批中'),
      },
      {
        key: 'safety',
        label: '安全未提交',
        value: openSafety,
        onClick: () => setStatusTab('all'),
      },
    ];
  }, [records]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const active = records.find((r) => r.key === activeId) ?? null;
  const splitSelected = records.find((r) => r.key === (splitId || filtered[0]?.key)) ?? null;

  const openDetail = (row: SettlementRecord) => {
    setActiveId(row.key);
    setPageMode('detail');
  };

  const applyFilters = () => {
    setFilters(draft);
    setPage(1);
    setMoreOpen(false);
  };

  const resetFilters = () => {
    const next: SettlementFilters = { keyword: '', approvalStatus: 'all', returnDateRange: null };
    setDraft(next);
    setFilters(next);
    setStatusTab('all');
    setPage(1);
    setMoreOpen(false);
  };

  const updateRecord = (next: SettlementRecord) => {
    setRecords((prev) => prev.map((r) => (r.key === next.key ? next : r)));
  };

  if (pageMode === 'detail' && active) {
    return (
      <SettlementDetailPage
        record={active}
        onBack={() => {
          setPageMode('ledger');
          setActiveId(null);
        }}
        onUpdateRecord={updateRecord}
      />
    );
  }

  return (
    <div className="vrs-page">
      <div className="vrs-toolbar">
        <V2SegmentedControl
          value={viewMode}
          onChange={(v) => setViewMode(v)}
          options={[
            { key: 'list', label: '列表', icon: <List size={14} /> },
            { key: 'kanban', label: '看板', icon: <LayoutGrid size={14} /> },
            { key: 'split', label: '主从', icon: <Columns size={14} /> },
          ]}
        />
        <div className="vrs-toolbar__right">
          <V2Button variant="secondary" size="sm" icon={<Download size={14} />}>
            导出
          </V2Button>
        </div>
      </div>

      <div className="vrs-kpi-bento">
        {kpi.map((item) => (
          <button key={item.key} type="button" className="vrs-kpi-bento__card" onClick={item.onClick}>
            <span>{item.label}</span>
            <strong className="tabular-nums">{item.value}</strong>
          </button>
        ))}
      </div>

      <div className={`vrs-ledger-stack${moreOpen ? ' is-filter-open' : ''}`}>
        <div className="vrs-filter-bar">
          <V2StatusTabs
            value={statusTab}
            onChange={(v) => {
              setStatusTab(v);
              setPage(1);
            }}
            options={[
              { key: 'all', label: '全部' },
              { key: '待提交', label: '待提交' },
              { key: '待审批', label: '待审批' },
              { key: '审批中', label: '审批中' },
              { key: '审批完成', label: '审批完成' },
            ]}
          />
          <div className="vrs-filter-bar__tools v2-filter-toolbar-tools">
            <V2FilterSearch aria-label="搜索应结单">
              <input
                type="text"
                placeholder="单号 / 合同 / 客户 / 车牌"
                value={draft.keyword}
                onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyFilters();
                }}
              />
            </V2FilterSearch>
            <V2FilterMoreButton
              open={moreOpen}
              activeCount={
                (draft.approvalStatus !== 'all' ? 1 : 0) + (draft.returnDateRange ? 1 : 0)
              }
              onClick={() => setMoreOpen((v) => !v)}
            />
            <V2Button variant="primary" size="sm" icon={<Search size={14} />} onClick={applyFilters}>
              查询
            </V2Button>
            <V2Button variant="secondary" size="sm" icon={<RotateCcw size={14} />} onClick={resetFilters}>
              重置
            </V2Button>
          </div>
        </div>

        {moreOpen ? (
          <div className="vrs-filter-grid">
            <label>
              <span>审批状态</span>
              <V2Select
                value={draft.approvalStatus}
                options={APPROVAL_OPTIONS}
                onChange={(v) => setDraft((d) => ({ ...d, approvalStatus: v as ApprovalStatus | 'all' }))}
              />
            </label>
            <label>
              <span>还车时间</span>
              <V2SingleInputDateRangePicker
                startDate={draft.returnDateRange?.[0] || ''}
                endDate={draft.returnDateRange?.[1] || ''}
                onChange={(start, end) =>
                  setDraft((d) => ({
                    ...d,
                    returnDateRange: start || end ? [start, end] : null,
                  }))
                }
              />
            </label>
            <div className="vrs-filter-grid__hint">
              <Filter size={14} aria-hidden />
              查询/重置后自动收起更多筛选
            </div>
          </div>
        ) : null}

        {viewMode === 'list' ? (
          <div className="vrs-table-card">
            {pageRows.length === 0 ? (
              <V2Empty type="empty" title="暂无还车应结款" description="调整筛选条件或等待还车生成单据。" />
            ) : (
              <>
                <div className="vrs-table-wrap">
                  <table className="vrs-table vrs-table--ledger">
                    <thead>
                      <tr>
                        <th>应结单号</th>
                        <th>提交情况</th>
                        <th>审批状态</th>
                        <th>客户 / 项目</th>
                        <th>车牌 / 车型</th>
                        <th>养护保</th>
                        <th>易损保</th>
                        <th>业务部门</th>
                        <th>交还车时间</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((row) => (
                        <tr key={row.key}>
                          <td>
                            <button type="button" className="vrs-link-title" onClick={() => openDetail(row)}>
                              {row.billNo}
                            </button>
                            <div className="vrs-sub tabular-nums">{row.contractCode}</div>
                          </td>
                          <td>
                            <div className="vrs-submit-grid">
                              <SubmitSituationItem label="安全" block={row.safety} />
                              <SubmitSituationItem label="业务" block={row.bizService} />
                              <SubmitSituationItem label="运维" block={row.ops} />
                              <SubmitSituationItem label="能源" block={row.energy} />
                            </div>
                          </td>
                          <td>
                            <V2Badge status={approvalBadge(row.approvalStatus)} label={row.approvalStatus} />
                          </td>
                          <td>
                            <div className="vrs-strong">{row.customerName}</div>
                            <div className="vrs-sub">{row.projectName}</div>
                          </td>
                          <td>
                            <div className="vrs-plate">{row.plateNo}</div>
                            <div className="vrs-sub">{row.vehicleModel}</div>
                          </td>
                          <td>
                            <V2Badge
                              status={row.hasCarePackage ? 'success' : 'default'}
                              label={row.hasCarePackage ? '是' : '否'}
                            />
                          </td>
                          <td>
                            <V2Badge
                              status={row.hasWearPackage ? 'success' : 'default'}
                              label={row.hasWearPackage ? '是' : '否'}
                            />
                          </td>
                          <td>
                            <div>{row.bizDept}</div>
                            <div className="vrs-sub">{row.bizOwner}</div>
                          </td>
                          <td className="tabular-nums">
                            <div>{row.deliveryTime}</div>
                            <div className="vrs-sub">{row.returnTime}</div>
                          </td>
                          <td>
                            <OperationActions
                              view={{ label: '查看', onClick: () => openDetail(row) }}
                              process={
                                row.approvalStatus === '待提交' || row.approvalStatus === '撤回'
                                  ? { label: '费用明细', onClick: () => openDetail(row) }
                                  : undefined
                              }
                              more={[
                                {
                                  key: 'history',
                                  label: '操作记录',
                                  onClick: () => undefined,
                                },
                              ]}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="vrs-pagination">
                  <V2Pagination
                    currentPage={page}
                    pageSize={pageSize}
                    total={filtered.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        ) : null}

        {viewMode === 'kanban' ? (
          <div className="vrs-kanban">
            {KANBAN_COLS.map((col) => {
              const cards = filtered.filter((r) => r.approvalStatus === col);
              return (
                <div key={col} className="vrs-kanban__col">
                  <header>
                    <strong>{col}</strong>
                    <span className="tabular-nums">{cards.length}</span>
                  </header>
                  <div className="vrs-kanban__list">
                    {cards.map((card) => (
                      <button
                        key={card.key}
                        type="button"
                        className="vrs-kanban__card"
                        onClick={() => openDetail(card)}
                      >
                        <div className="vrs-kanban__card-top">
                          <span className="vrs-mono">{card.billNo}</span>
                          <span className="vrs-plate">{card.plateNo}</span>
                        </div>
                        <div className="vrs-strong">{card.customerName}</div>
                        <div className="vrs-sub">
                          安全 {card.safety.status} · 违章 {card.violations.length} 条
                        </div>
                      </button>
                    ))}
                    {cards.length === 0 ? <div className="vrs-kanban__empty">暂无单据</div> : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {viewMode === 'split' ? (
          <div className="vrs-split">
            <aside className="vrs-split__list">
              <div className="vrs-split__list-head">应结单据</div>
              {filtered.map((row) => (
                <button
                  key={row.key}
                  type="button"
                  className={`vrs-split__item${splitSelected?.key === row.key ? ' is-active' : ''}`}
                  onClick={() => setSplitId(row.key)}
                >
                  <strong className="vrs-mono">{row.billNo}</strong>
                  <span className="vrs-plate">{row.plateNo}</span>
                  <em>{row.customerName}</em>
                </button>
              ))}
            </aside>
            <div className="vrs-split__main">
              {splitSelected ? (
                <>
                  <div className="vrs-split__main-head">
                    <div>
                      <h2>{splitSelected.billNo}</h2>
                      <p>
                        {splitSelected.plateNo} · {splitSelected.customerName}
                      </p>
                    </div>
                    <V2Button variant="primary" size="sm" onClick={() => openDetail(splitSelected)}>
                      打开费用明细
                    </V2Button>
                  </div>
                  <div className="vrs-split__preview">
                    <V2Badge
                      status={approvalBadge(splitSelected.approvalStatus)}
                      label={splitSelected.approvalStatus}
                    />
                    <p>
                      安全组 {splitSelected.safety.status}
                      {splitSelected.safety.submitBy ? ` · ${splitSelected.safety.submitBy}` : ' · 未提交'}
                    </p>
                    <p>
                      本段租期违章 <strong className="tabular-nums">{splitSelected.violations.length}</strong> 条
                      ，事故 <strong className="tabular-nums">{splitSelected.accidents.length}</strong> 条
                      （进明细自动展示，无需等安全员提交）
                    </p>
                  </div>
                </>
              ) : (
                <V2Empty type="empty" title="请选择左侧单据" />
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
