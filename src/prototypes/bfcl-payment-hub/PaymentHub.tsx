import React, { useMemo, useState } from 'react';
import { Filter, Link2, RotateCcw, Unlink } from 'lucide-react';
import { OperationActions } from '../../common/OperationActions';
import {
  V2Button,
  V2Empty,
  V2FilterMoreButton,
  V2FilterSearch,
  V2Pagination,
  V2Select,
  V2StatusTabs,
} from '../../resources/design-system/components/UIComponents';
import { V2Badge, type V2BadgeStatus } from '../../resources/design-system/components/V2Badge';
import { MOCK_RECORDS, PAYMENT_DOC_OPTIONS, RECEIPT_DOC_OPTIONS } from './mockData';
import {
  formatMoney,
  type BizDocOption,
  type Filters,
  type FinanceRecord,
  type FlowType,
  type LinkStatus,
  type PageMode,
} from './types';

/* V2Select 无 label 属性，筛选项外包 field */

const statusBadge = (s: LinkStatus): V2BadgeStatus => {
  if (s === '已闭环') return 'success';
  if (s === '部分关联') return 'warning';
  return 'error';
};

function recomputeStatus(amount: number, linkedAmount: number): LinkStatus {
  if (linkedAmount <= 0) return '未关联';
  if (linkedAmount + 0.001 >= amount) return '已闭环';
  return '部分关联';
}

export function PaymentHub() {
  const [rows, setRows] = useState<FinanceRecord[]>(MOCK_RECORDS);
  const [pageMode, setPageMode] = useState<PageMode>('ledger');
  const [flowTab, setFlowTab] = useState<FlowType | 'all'>('all');
  const [filters, setFilters] = useState<Filters>({ keyword: '', flow: 'all', status: 'all' });
  const [draft, setDraft] = useState(filters);
  const [moreOpen, setMoreOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (flowTab !== 'all' && r.flow !== flowTab) return false;
      if (filters.flow !== 'all' && r.flow !== filters.flow) return false;
      if (filters.status !== 'all' && r.status !== filters.status) return false;
      if (filters.keyword) {
        const q = filters.keyword.trim().toLowerCase();
        const hay = [r.voucherNo, r.counterparty, ...r.linkedDocs.map((d) => d.docNo)]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filters, flowTab]);

  const kpi = useMemo(() => {
    const unlinked = rows.filter((r) => r.status === '未关联').length;
    const partial = rows.filter((r) => r.status === '部分关联').length;
    const closed = rows.filter((r) => r.status === '已闭环').length;
    const receiptAmt = rows.filter((r) => r.flow === '收款').reduce((s, r) => s + r.amount, 0);
    return [
      { key: 'unlinked', label: '待关联', value: String(unlinked), tab: '未关联' as const },
      { key: 'partial', label: '部分关联', value: String(partial), tab: '部分关联' as const },
      { key: 'closed', label: '已闭环', value: String(closed), tab: '已闭环' as const },
      { key: 'receipt', label: '收款合计', value: `¥${formatMoney(receiptAmt)}`, tab: null },
    ];
  }, [rows]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const active = rows.find((r) => r.id === activeId) ?? null;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const applyFilters = () => {
    setFilters(draft);
    setMoreOpen(false);
    setPage(1);
  };

  const resetFilters = () => {
    const empty: Filters = { keyword: '', flow: 'all', status: 'all' };
    setDraft(empty);
    setFilters(empty);
    setFlowTab('all');
    setMoreOpen(false);
    setPage(1);
  };

  const openDetail = (id: string) => {
    setActiveId(id);
    setPageMode('detail');
  };

  const linkDoc = (doc: BizDocOption) => {
    if (!active) return;
    const remain = active.amount - active.linkedAmount;
    if (remain <= 0) {
      showToast('本流水已闭环，不可再关联');
      return;
    }
    const useAmt = Math.min(remain, doc.amount);
    const nextDocs = [...active.linkedDocs, { type: doc.type, docNo: doc.docNo, amount: useAmt }];
    const linkedAmount = nextDocs.reduce((s, d) => s + d.amount, 0);
    const status = recomputeStatus(active.amount, linkedAmount);
    const patched: FinanceRecord = { ...active, linkedDocs: nextDocs, linkedAmount, status };
    setRows((list) => list.map((r) => (r.id === patched.id ? patched : r)));
    setActiveId(patched.id);
    showToast(`已关联 ${doc.docNo}，业务单据回写「实收/实付」`);
  };

  const clearLinks = () => {
    if (!active) return;
    if (active.status === '已闭环') {
      showToast('门禁：已闭环流水取消关联需财务复核（原型演示拦截）');
      return;
    }
    const patched: FinanceRecord = {
      ...active,
      linkedDocs: [],
      linkedAmount: 0,
      status: '未关联',
    };
    setRows((list) => list.map((r) => (r.id === patched.id ? patched : r)));
    setActiveId(patched.id);
    showToast('已取消关联，业务侧不得假性结清');
  };

  if (pageMode === 'detail' && active) {
    const options = active.flow === '收款' ? RECEIPT_DOC_OPTIONS : PAYMENT_DOC_OPTIONS;
    const remain = Math.max(0, active.amount - active.linkedAmount);
    return (
      <div className="bfcl-pay bfcl-pay-detail">
        <header className="bfcl-pay-form-header">
          <V2Button variant="back" size="sm" onClick={() => { setPageMode('ledger'); setActiveId(null); }}>
            返回列表
          </V2Button>
          <span className="bfcl-pay-form-header__divider" />
          <div className="bfcl-pay-form-header__title-wrap">
            <h1 className="bfcl-pay-form-header__title">关联业务单据</h1>
            <span className="bfcl-pay-form-header__pill">{active.voucherNo}</span>
          </div>
          <div className="bfcl-pay-form-header__actions">
            <V2Button variant="secondary" size="sm" onClick={clearLinks}>
              <Unlink size={14} /> 取消关联
            </V2Button>
            <V2Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (active.status !== '已闭环') {
                  showToast('门禁：未闭环不可标记「已结清」');
                  return;
                }
                showToast('闭环完成：状态已回写业务单据');
                setPageMode('ledger');
              }}
            >
              确认闭环
            </V2Button>
          </div>
        </header>

        <section className="bfcl-pay-context" data-annotation-id="bfcl-pay-gate">
          <div>
            <span className="bfcl-pay-muted">流向</span>
            <strong>{active.flow}</strong>
          </div>
          <div>
            <span className="bfcl-pay-muted">对方</span>
            <strong>{active.counterparty}</strong>
          </div>
          <div>
            <span className="bfcl-pay-muted">流水金额</span>
            <strong className="bfcl-pay-mono">¥{formatMoney(active.amount)}</strong>
          </div>
          <div>
            <span className="bfcl-pay-muted">已关联 / 剩余</span>
            <strong className="bfcl-pay-mono">
              ¥{formatMoney(active.linkedAmount)} / ¥{formatMoney(remain)}
            </strong>
          </div>
          <div>
            <span className="bfcl-pay-muted">状态</span>
            <V2Badge status={statusBadge(active.status)} label={active.status} />
          </div>
        </section>

        <div className="bfcl-pay-split">
          <section className="bfcl-pay-panel">
            <h2>可关联业务单据（{active.flow === '收款' ? '应收' : '应付'}）</h2>
            <p className="bfcl-pay-hint">点击「关联」写入本流水；金额超出剩余可关联额时按剩余核销。</p>
            <div className="bfcl-pay-doc-list">
              {options.map((doc) => (
                <div key={doc.docNo} className="bfcl-pay-doc-row">
                  <div>
                    <div className="bfcl-pay-doc-title">{doc.type}</div>
                    <div className="bfcl-pay-muted">
                      {doc.docNo} · {doc.customer}
                      {doc.plate ? ` · ${doc.plate}` : ''}
                    </div>
                  </div>
                  <div className="bfcl-pay-doc-right">
                    <span className="bfcl-pay-mono">¥{formatMoney(doc.amount)}</span>
                    <V2Button variant="outline" size="sm" onClick={() => linkDoc(doc)}>
                      <Link2 size={14} /> 关联
                    </V2Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="bfcl-pay-panel">
            <h2>已关联明细</h2>
            {active.linkedDocs.length === 0 ? (
              <V2Empty type="empty" title="尚未关联" description="无关联不得假性结清 / 已付款 / 可交车" />
            ) : (
              <ul className="bfcl-pay-linked">
                {active.linkedDocs.map((d) => (
                  <li key={`${d.docNo}-${d.amount}`}>
                    <span>
                      {d.type} · <code>{d.docNo}</code>
                    </span>
                    <span className="bfcl-pay-mono">¥{formatMoney(d.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="bfcl-pay-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--bfcl-border, #e3e8ee)' }}>
              <span>对照 V1.2</span>
              <span className="bfcl-pay-muted">收款认领 + 业务单据核销；本页强化「无关联不得结清」</span>
            </div>
          </section>
        </div>
        {toast ? <div className="bfcl-pay-toast" role="status">{toast}</div> : null}
      </div>
    );
  }

  return (
    <div className="bfcl-pay">
      <div className="bfcl-pay-toolbar">
        <V2StatusTabs
          value={flowTab}
          onChange={(v) => {
            setFlowTab(v);
            setPage(1);
          }}
          options={[
            { key: 'all', label: '全部' },
            { key: '收款', label: '收款记录' },
            { key: '付款', label: '付款记录' },
          ]}
        />
        <V2Button
          variant="secondary"
          size="sm"
          onClick={() => showToast('原型：模拟财务导入银行流水（已写入台账）')}
        >
          导入流水
        </V2Button>
      </div>

      <div className="bfcl-pay-kpi" data-annotation-id="bfcl-pay-kpi">
        {kpi.map((k) => (
          <button
            key={k.key}
            type="button"
            className="bfcl-pay-kpi__card"
            onClick={() => {
              if (!k.tab) return;
              setDraft((d) => ({ ...d, status: k.tab! }));
              setFilters((f) => ({ ...f, status: k.tab! }));
              setPage(1);
            }}
          >
            <span className="bfcl-pay-kpi__label">{k.label}</span>
            <strong className="bfcl-pay-kpi__value">{k.value}</strong>
          </button>
        ))}
      </div>

      <div className={`bfcl-pay-shell ${moreOpen ? 'is-expanded' : ''}`}>
        <div className="bfcl-pay-tools v2-filter-toolbar-tools">
          <V2FilterSearch aria-label="搜索流水">
            <input
              type="text"
              placeholder="流水号 / 对方 / 单据号"
              value={draft.keyword}
              onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters();
              }}
            />
          </V2FilterSearch>
          <V2FilterMoreButton
            open={moreOpen}
            activeCount={(draft.flow !== 'all' ? 1 : 0) + (draft.status !== 'all' ? 1 : 0)}
            onClick={() => setMoreOpen((o) => !o)}
          />
          <V2Button variant="primary" size="sm" icon={<Filter size={14} />} onClick={applyFilters}>
            查询
          </V2Button>
          <V2Button variant="secondary" size="sm" icon={<RotateCcw size={14} />} onClick={resetFilters}>
            重置
          </V2Button>
        </div>

        {moreOpen ? (
          <div className="bfcl-pay-more">
            <div className="bfcl-pay-field">
              <label>流向</label>
              <V2Select
                value={draft.flow}
                onChange={(v) => setDraft((d) => ({ ...d, flow: v as Filters['flow'] }))}
                options={[
                  { value: 'all', label: '全部' },
                  { value: '收款', label: '收款' },
                  { value: '付款', label: '付款' },
                ]}
              />
            </div>
            <div className="bfcl-pay-field">
              <label>关联状态</label>
              <V2Select
                value={draft.status}
                onChange={(v) => setDraft((d) => ({ ...d, status: v as Filters['status'] }))}
                options={[
                  { value: 'all', label: '全部' },
                  { value: '未关联', label: '未关联' },
                  { value: '部分关联', label: '部分关联' },
                  { value: '已闭环', label: '已闭环' },
                ]}
              />
            </div>
          </div>
        ) : null}

        <div className="bfcl-pay-table-wrap">
          {pageRows.length === 0 ? (
            <V2Empty type="empty" title="无匹配流水" description="调整筛选或导入新流水" />
          ) : (
            <table className="bfcl-pay-table">
              <thead>
                <tr>
                  <th>流水号</th>
                  <th>流向</th>
                  <th>对方</th>
                  <th>金额</th>
                  <th>到账/出账日</th>
                  <th>已关联</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="bfcl-pay-primary">{r.voucherNo}</div>
                      <div className="bfcl-pay-muted">{r.channel}</div>
                    </td>
                    <td>{r.flow}</td>
                    <td>{r.counterparty}</td>
                    <td className="bfcl-pay-mono">¥{formatMoney(r.amount)}</td>
                    <td>{r.paidAt}</td>
                    <td className="bfcl-pay-mono">¥{formatMoney(r.linkedAmount)}</td>
                    <td>
                      <V2Badge status={statusBadge(r.status)} label={r.status} />
                    </td>
                    <td>
                      <OperationActions
                        process={{ label: '关联', onClick: () => openDetail(r.id) }}
                        view={{ label: '查看', onClick: () => openDetail(r.id) }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bfcl-pay-pager">
        <V2Pagination
          total={filtered.length}
          page={page}
          pageSize={pageSize}
          onChange={(p, ps) => {
            setPage(p);
            setPageSize(ps);
          }}
        />
      </div>
      {toast ? <div className="bfcl-pay-toast" role="status">{toast}</div> : null}
    </div>
  );
}
