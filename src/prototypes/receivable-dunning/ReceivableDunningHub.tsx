import React, { useMemo, useState } from 'react';
import { Columns, Filter, LayoutGrid, List, RotateCcw, Search } from 'lucide-react';
import { OperationActions } from '../../common/OperationActions';
import {
  V2Button,
  V2Empty,
  V2FilterMoreButton,
  V2FilterSearch,
  V2Pagination,
  V2SegmentedControl,
  V2Select,
  V2StatusTabs,
} from '../../resources/design-system/components/UIComponents';
import { V2Badge, type V2BadgeStatus } from '../../resources/design-system/components/V2Badge';
import { CollectionNoticePreview } from './CollectionNoticePreview';
import { CustomerDetailPage } from './CustomerDetailPage';
import { formatMoney, MOCK_CUSTOMERS, recomputeDebt } from './mockData';
import type {
  AccountStatus,
  CustomerReceivable,
  LedgerFilters,
  NoticeSealStatus,
  PageMode,
  ViewMode,
} from './types';

const statusBadge = (s: AccountStatus): V2BadgeStatus => {
  if (s === '逾期') return 'error';
  if (s === '正常') return 'success';
  return 'default';
};

const sealBadge = (s?: NoticeSealStatus): V2BadgeStatus => {
  if (!s || s === '未生成') return 'default';
  if (s === '已盖章') return 'success';
  if (s === '盖章中') return 'processing';
  if (s === '草稿') return 'warning';
  if (s === '盖章失败') return 'error';
  return 'default';
};

const KANBAN: NoticeSealStatus[] = ['未生成', '草稿', '盖章中', '已盖章'];

export function ReceivableDunningHub() {
  const [rows, setRows] = useState<CustomerReceivable[]>(MOCK_CUSTOMERS);
  const [pageMode, setPageMode] = useState<PageMode>('ledger');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusTab, setStatusTab] = useState<AccountStatus | 'all'>('all');
  const [filters, setFilters] = useState<LedgerFilters>({
    keyword: '',
    status: 'all',
    sealStatus: 'all',
  });
  const [draft, setDraft] = useState(filters);
  const [moreOpen, setMoreOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [splitId, setSplitId] = useState<string | null>(MOCK_CUSTOMERS[0]?.key ?? null);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusTab !== 'all' && r.status !== statusTab) return false;
      if (filters.status !== 'all' && r.status !== filters.status) return false;
      const seal = r.notice?.sealStatus ?? '未生成';
      if (filters.sealStatus !== 'all' && seal !== filters.sealStatus) return false;
      if (filters.keyword) {
        const q = filters.keyword.trim().toLowerCase();
        const hay = [r.customerName, r.key, r.owner, ...r.contracts.map((c) => c.code)]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filters, statusTab]);

  const kpi = useMemo(() => {
    const overdue = rows.filter((r) => r.status === '逾期');
    const totalDebt = overdue.reduce((s, r) => s + r.currentTotalDebt, 0);
    const periodEndSum = overdue.reduce(
      (s, r) => s + r.periods.reduce((ps, p) => ps + p.periodEndAmount, 0),
      0,
    );
    const pendingSeal = rows.filter((r) => {
      const s = r.notice?.sealStatus;
      return s === '草稿' || s === '盖章中';
    }).length;
    return [
      {
        key: 'overdue',
        label: '逾期客户',
        value: String(overdue.length),
        danger: false,
        onClick: () => setStatusTab('逾期'),
      },
      {
        key: 'debt',
        label: '当前总欠款',
        value: `¥${formatMoney(totalDebt)}`,
        danger: true,
        onClick: () => setStatusTab('逾期'),
      },
      {
        key: 'period',
        label: '逾期期末合计',
        value: `¥${formatMoney(periodEndSum)}`,
        danger: false,
        onClick: () => setStatusTab('逾期'),
      },
      {
        key: 'seal',
        label: '待盖章催款单',
        value: String(pendingSeal),
        danger: false,
        onClick: () => {
          setFilters((f) => ({ ...f, sealStatus: '草稿' }));
          setDraft((f) => ({ ...f, sealStatus: '草稿' }));
          setStatusTab('all');
        },
      },
    ];
  }, [rows]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const active = rows.find((r) => r.key === activeId) ?? null;
  const splitSelected = rows.find((r) => r.key === (splitId || filtered[0]?.key)) ?? null;

  const updateRow = (next: CustomerReceivable) => {
    const patched = { ...next, currentTotalDebt: recomputeDebt(next) };
    setRows((list) => list.map((r) => (r.key === patched.key ? patched : r)));
  };

  const openDetail = (id: string) => {
    setActiveId(id);
    setPageMode('detail');
  };

  const openNotice = (id: string) => {
    setActiveId(id);
    setPageMode('notice');
  };

  const applyFilters = () => {
    setFilters(draft);
    setMoreOpen(false);
    setPage(1);
  };

  const resetFilters = () => {
    const empty: LedgerFilters = { keyword: '', status: 'all', sealStatus: 'all' };
    setDraft(empty);
    setFilters(empty);
    setStatusTab('all');
    setMoreOpen(false);
    setPage(1);
  };

  if (pageMode === 'detail' && active) {
    return (
      <CustomerDetailPage
        customer={active}
        onBack={() => {
          setPageMode('ledger');
          setActiveId(null);
        }}
        onOpenNotice={() => setPageMode('notice')}
      />
    );
  }

  if (pageMode === 'notice' && active) {
    return (
      <CollectionNoticePreview
        customer={active}
        onBack={() => {
          setPageMode('ledger');
          setActiveId(null);
        }}
        onUpdate={updateRow}
      />
    );
  }

  return (
    <div className="rd-page">
      <div className="rd-toolbar">
        <V2SegmentedControl
          value={viewMode}
          onChange={(v) => setViewMode(v)}
          options={[
            { key: 'list', label: '列表', icon: <List size={14} /> },
            { key: 'kanban', label: '看板', icon: <LayoutGrid size={14} /> },
            { key: 'split', label: '主从', icon: <Columns size={14} /> },
          ]}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <V2Button
            variant="primary"
            size="sm"
            onClick={() => {
              const first = filtered.find((r) => r.status === '逾期') ?? filtered[0];
              if (first) openNotice(first.key);
            }}
          >
            生成催款单
          </V2Button>
        </div>
      </div>

      <div className="rd-kpi-bento">
        {kpi.map((k) => (
          <button
            key={k.key}
            type="button"
            className={`rd-kpi-bento__card ${statusTab === '逾期' && k.key !== 'seal' ? 'is-active' : ''}`}
            onClick={k.onClick}
          >
            <span className="rd-kpi-bento__label">{k.label}</span>
            <span className={`rd-kpi-bento__value ${k.danger ? 'is-danger' : ''}`}>{k.value}</span>
          </button>
        ))}
      </div>

      {viewMode === 'list' ? (
        <div className="rd-shell">
          <div className={`rd-filter ${moreOpen ? 'rd-filter--open' : ''}`}>
            <V2StatusTabs
              value={statusTab}
              onChange={(v) => {
                setStatusTab(v);
                setPage(1);
              }}
              options={[
                { key: 'all', label: '全部' },
                { key: '逾期', label: '逾期' },
                { key: '正常', label: '正常' },
                { key: '完结', label: '完结' },
              ]}
            />
            <div className="rd-filter__tools v2-filter-toolbar-tools">
              <V2FilterSearch aria-label="搜索客户应收">
                <input
                  type="text"
                  placeholder="客户 / 合同号 / 负责人"
                  value={draft.keyword}
                  onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applyFilters();
                  }}
                />
              </V2FilterSearch>
              <V2FilterMoreButton
                open={moreOpen}
                activeCount={(draft.status !== 'all' ? 1 : 0) + (draft.sealStatus !== 'all' ? 1 : 0)}
                onClick={() => setMoreOpen((o) => !o)}
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
            <div className="rd-filter-grid">
              <div className="rd-field">
                <label>运行状态</label>
                <V2Select
                  value={draft.status}
                  onChange={(v) => setDraft((d) => ({ ...d, status: v as LedgerFilters['status'] }))}
                  options={[
                    { value: 'all', label: '全部' },
                    { value: '逾期', label: '逾期' },
                    { value: '正常', label: '正常' },
                    { value: '完结', label: '完结' },
                  ]}
                />
              </div>
              <div className="rd-field">
                <label>催款单盖章状态</label>
                <V2Select
                  value={draft.sealStatus}
                  onChange={(v) =>
                    setDraft((d) => ({ ...d, sealStatus: v as LedgerFilters['sealStatus'] }))
                  }
                  options={[
                    { value: 'all', label: '全部' },
                    { value: '未生成', label: '未生成' },
                    { value: '草稿', label: '草稿' },
                    { value: '盖章中', label: '盖章中' },
                    { value: '已盖章', label: '已盖章' },
                  ]}
                />
              </div>
              <div className="rd-field">
                <label>&nbsp;</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--rd-body)', paddingBottom: 8 }}>
                  <Filter size={14} aria-hidden />
                  查询/重置后自动收起更多筛选
                </div>
              </div>
            </div>
          ) : null}

          {pageRows.length === 0 ? (
            <V2Empty type="empty" title="暂无客户应收" description="调整筛选条件后再试" />
          ) : (
            <div className="rd-table-wrap">
              <table className="rd-table">
                <thead>
                  <tr>
                    <th>客户</th>
                    <th>状态</th>
                    <th>最新期末金额</th>
                    <th>当前总欠款</th>
                    <th>逾期天</th>
                    <th>催款单 / 盖章</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => {
                    const latest = r.periods[0];
                    const seal = r.notice?.sealStatus ?? '未生成';
                    return (
                      <tr key={r.key}>
                        <td>
                          <div className="rd-main-title">{r.customerName}</div>
                          <div className="rd-mono">{r.key}</div>
                        </td>
                        <td>
                          <V2Badge status={statusBadge(r.status)} label={r.status} />
                        </td>
                        <td className="rd-money">
                          {latest ? `¥${formatMoney(latest.periodEndAmount)}` : '—'}
                          {latest ? <div className="rd-mono">{latest.periodLabel}</div> : null}
                        </td>
                        <td className={`rd-money ${r.currentTotalDebt > 0 ? 'rd-money--danger' : ''}`}>
                          ¥{formatMoney(r.currentTotalDebt)}
                        </td>
                        <td>{r.overdueDays > 0 ? r.overdueDays : '—'}</td>
                        <td>
                          <V2Badge status={sealBadge(seal)} label={seal} />
                          {r.notice?.noticeNo ? (
                            <div className="rd-mono">{r.notice.noticeNo}</div>
                          ) : null}
                        </td>
                        <td>
                          <OperationActions
                            view={{ label: '分期明细', onClick: () => openDetail(r.key) }}
                            process={{
                              label: seal === '未生成' ? '生成催款单' : '催款单',
                              onClick: () => openNotice(r.key),
                            }}
                            more={[
                              {
                                key: 'contracts',
                                label: `合同 ${r.contracts.length} 份`,
                                onClick: () => openDetail(r.key),
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ padding: '12px 14px' }}>
            <V2Pagination
              page={page}
              pageSize={pageSize}
              total={filtered.length}
              onChange={(p, ps) => {
                setPage(p);
                setPageSize(ps);
              }}
            />
          </div>
        </div>
      ) : null}

      {viewMode === 'kanban' ? (
        <div className="rd-kanban">
          {KANBAN.map((col) => {
            const cards = filtered.filter((r) => (r.notice?.sealStatus ?? '未生成') === col);
            return (
              <div key={col} className="rd-kanban__col">
                <div className="rd-kanban__title">
                  {col} · {cards.length}
                </div>
                {cards.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    className="rd-kanban__card"
                    onClick={() => openNotice(r.key)}
                  >
                    <div className="rd-main-title">{r.customerName}</div>
                    <div className="rd-money rd-money--danger" style={{ marginTop: 6 }}>
                      ¥{formatMoney(r.currentTotalDebt)}
                    </div>
                    <div className="rd-mono" style={{ marginTop: 4 }}>
                      {r.bizDept} · {r.owner}
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      ) : null}

      {viewMode === 'split' ? (
        <div className="rd-split">
          <div className="rd-split__list">
            {filtered.map((r) => (
              <button
                key={r.key}
                type="button"
                className={`rd-split__item ${splitSelected?.key === r.key ? 'is-active' : ''}`}
                onClick={() => setSplitId(r.key)}
              >
                <div className="rd-main-title">{r.customerName}</div>
                <div className="rd-mono">
                  总欠款 ¥{formatMoney(r.currentTotalDebt)} · {r.notice?.sealStatus ?? '未生成'}
                </div>
              </button>
            ))}
          </div>
          <div className="rd-split__panel">
            {splitSelected ? (
              <>
                <div className="rd-form-header" style={{ marginBottom: 12 }}>
                  <div>
                    <div className="rd-form-header__meta">
                      {splitSelected.key}
                      <span className="rd-pill-code">{splitSelected.notice?.sealStatus ?? '未生成'}</span>
                    </div>
                    <h2 className="rd-form-header__title" style={{ fontSize: 18 }}>
                      {splitSelected.customerName}
                    </h2>
                  </div>
                  <div className="rd-form-header__actions">
                    <V2Button variant="outline" onClick={() => openDetail(splitSelected.key)}>
                      分期明细
                    </V2Button>
                    <V2Button variant="primary" onClick={() => openNotice(splitSelected.key)}>
                      催款单
                    </V2Button>
                  </div>
                </div>
                <div className="rd-context-card">
                  <div className="rd-context-card__item">
                    <label>当前总欠款</label>
                    <strong className="rd-money rd-money--danger">
                      ¥{formatMoney(splitSelected.currentTotalDebt)}
                    </strong>
                  </div>
                  <div className="rd-context-card__item">
                    <label>最新期末</label>
                    <strong className="rd-money">
                      {splitSelected.periods[0]
                        ? `¥${formatMoney(splitSelected.periods[0].periodEndAmount)}`
                        : '—'}
                    </strong>
                  </div>
                  <div className="rd-context-card__item">
                    <label>逾期天数</label>
                    <strong>{splitSelected.overdueDays || '—'}</strong>
                  </div>
                </div>
                <div className="rd-section">
                  <div className="rd-section__head">分期摘要</div>
                  <div className="rd-section__body">
                    {splitSelected.periods.map((p) => (
                      <div key={p.id} style={{ marginBottom: 8 }}>
                        <strong>{p.periodLabel}</strong> · 期末 ¥{formatMoney(p.periodEndAmount)} ·
                        未收 ¥{formatMoney(p.unpaidAmount)}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <V2Empty title="请选择客户" />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
