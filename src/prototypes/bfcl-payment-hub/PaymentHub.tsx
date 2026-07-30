import React, { useMemo, useState } from 'react';
import { BfclChainNav } from '../bfcl-shared-chain/BfclChainNav';
import '../bfcl-shared-chain/bfcl-chain-nav.css';
import { Filter, Link2, RotateCcw, Sparkles, Unlink } from 'lucide-react';
import { DetailEntryLink } from '../../common/DetailEntryLink';
import { OperationActions } from '../../common/OperationActions';
import {
  V2Button,
  V2Empty,
  V2FilterSearch,
  V2Pagination,
  V2StatusTabs,
} from '../../resources/design-system/components/UIComponents';
import { V2Badge, type V2BadgeStatus } from '../../resources/design-system/components/V2Badge';
import { MOCK_RECORDS, PAYMENT_DOC_OPTIONS, RECEIPT_DOC_OPTIONS } from './mockData';
import {
  confidenceBadgeStatus,
  rankSmartMatches,
  type SmartMatchHit,
} from './smartMatch';
import {
  formatMoney,
  type BizDocOption,
  type FinanceRecord,
  type FlowType,
  type LinkStatus,
  type PageMode,
  type StatusTab,
} from './types';

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
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [keyword, setKeyword] = useState('');
  const [keywordDraft, setKeywordDraft] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flowCounts = useMemo(() => {
    const all = rows.length;
    const receipt = rows.filter((r) => r.flow === '收款').length;
    const payment = rows.filter((r) => r.flow === '付款').length;
    return { all, receipt, payment };
  }, [rows]);

  const statusScope = useMemo(
    () => (flowTab === 'all' ? rows : rows.filter((r) => r.flow === flowTab)),
    [rows, flowTab],
  );

  const statusCounts = useMemo(() => {
    const all = statusScope.length;
    const unlinked = statusScope.filter((r) => r.status === '未关联').length;
    const partial = statusScope.filter((r) => r.status === '部分关联').length;
    const closed = statusScope.filter((r) => r.status === '已闭环').length;
    return { all, unlinked, partial, closed };
  }, [statusScope]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (flowTab !== 'all' && r.flow !== flowTab) return false;
      if (statusTab !== 'all' && r.status !== statusTab) return false;
      if (keyword) {
        const q = keyword.trim().toLowerCase();
        const hay = [r.voucherNo, r.counterparty, r.remark ?? '', ...r.linkedDocs.map((d) => d.docNo)]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, flowTab, statusTab, keyword]);

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
    setKeyword(keywordDraft);
    setPage(1);
  };

  const resetFilters = () => {
    setKeywordDraft('');
    setKeyword('');
    setFlowTab('all');
    setStatusTab('all');
    setPage(1);
  };

  const openDetail = (id: string) => {
    setActiveId(id);
    setPageMode('detail');
  };

  const applyLinks = (docs: BizDocOption[], toastMsg?: string) => {
    if (!active) return;
    let remain = active.amount - active.linkedAmount;
    if (remain <= 0) {
      showToast('本流水已闭环，不可再关联');
      return;
    }
    const nextDocs = [...active.linkedDocs];
    const applied: string[] = [];
    for (const doc of docs) {
      if (remain <= 0) break;
      if (nextDocs.some((d) => d.docNo === doc.docNo)) continue;
      const useAmt = Math.min(remain, doc.amount);
      nextDocs.push({ type: doc.type, docNo: doc.docNo, amount: useAmt });
      remain -= useAmt;
      applied.push(doc.docNo);
    }
    if (applied.length === 0) {
      showToast('没有可写入的单据');
      return;
    }
    const linkedAmount = nextDocs.reduce((s, d) => s + d.amount, 0);
    const status = recomputeStatus(active.amount, linkedAmount);
    const patched: FinanceRecord = { ...active, linkedDocs: nextDocs, linkedAmount, status };
    setRows((list) => list.map((r) => (r.id === patched.id ? patched : r)));
    setActiveId(patched.id);
    showToast(toastMsg ?? `已关联 ${applied.join('、')}，业务单据回写「实收/实付」`);
  };

  const linkDoc = (doc: BizDocOption) => {
    applyLinks([doc]);
  };

  const applySmartHits = (hits: SmartMatchHit[], onlyHigh = false) => {
    const picked = onlyHigh ? hits.filter((h) => h.confidence === '高') : hits;
    if (picked.length === 0) {
      showToast(onlyHigh ? '暂无高置信建议可一键关联' : '暂无匹配建议');
      return;
    }
    applyLinks(
      picked.map((h) => h.doc),
      onlyHigh
        ? `已按智能匹配写入 ${picked.length} 条高置信单据`
        : `已关联建议单据 ${picked.map((h) => h.doc.docNo).join('、')}`,
    );
  };

  const unlinkDoc = (docNo: string, amount: number) => {
    if (!active) return;
    const nextDocs = active.linkedDocs.filter((d) => !(d.docNo === docNo && d.amount === amount));
    const linkedAmount = nextDocs.reduce((s, d) => s + d.amount, 0);
    const status = recomputeStatus(active.amount, linkedAmount);
    const patched: FinanceRecord = { ...active, linkedDocs: nextDocs, linkedAmount, status };
    setRows((list) => list.map((r) => (r.id === patched.id ? patched : r)));
    setActiveId(patched.id);
    showToast(`已移除 ${docNo}，可重新关联其他单据`);
  };

  if (pageMode === 'detail' && active) {
    const options = active.flow === '收款' ? RECEIPT_DOC_OPTIONS : PAYMENT_DOC_OPTIONS;
    const remain = Math.max(0, active.amount - active.linkedAmount);
    const smartHits = rankSmartMatches(active, options, remain);
    const highHits = smartHits.filter((h) => h.confidence === '高');
    const hitByNo = new Map(smartHits.map((h) => [h.doc.docNo, h]));

    return (
      <div className="bfcl-pay bfcl-pay-detail">
        <BfclChainNav current="pay" />
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
              ¥{formatMoney(active.linkedAmount)}
              {' / '}
              <span className={remain > 0.001 ? 'bfcl-pay-remain-warn' : undefined}>
                ¥{formatMoney(remain)}
              </span>
            </strong>
          </div>
          <div>
            <span className="bfcl-pay-muted">状态</span>
            <V2Badge status={statusBadge(active.status)} label={active.status} />
          </div>
        </section>

        {active.remark ? (
          <p className="bfcl-pay-summary-line">
            <span className="bfcl-pay-muted">银行摘要</span>
            <span>{active.remark}</span>
          </p>
        ) : null}

        <section className="bfcl-pay-smart" data-annotation-id="bfcl-pay-smart-match">
          <div className="bfcl-pay-smart__head">
            <div className="bfcl-pay-smart__title">
              <Sparkles size={16} aria-hidden />
              <h2>智能匹配建议</h2>
              <span className="bfcl-pay-muted">客户名称 · 金额 · 摘要规则</span>
            </div>
            <V2Button
              variant="outline"
              size="sm"
              icon={<Sparkles size={14} />}
              disabled={remain <= 0 || highHits.length === 0}
              onClick={() => applySmartHits(smartHits, true)}
            >
              一键关联高置信（{highHits.length}）
            </V2Button>
          </div>
          {remain <= 0 ? (
            <p className="bfcl-pay-hint">本流水已闭环，无需再匹配。</p>
          ) : smartHits.length === 0 ? (
            <p className="bfcl-pay-hint">暂无达到阈值的建议，请在下方列表手工点选「关联」。</p>
          ) : (
            <ul className="bfcl-pay-smart__list">
              {smartHits.map((hit) => (
                <li key={hit.doc.docNo} className="bfcl-pay-smart__row">
                  <div className="bfcl-pay-smart__main">
                    <div className="bfcl-pay-smart__line">
                      <strong>{hit.doc.type}</strong>
                      <V2Badge status={confidenceBadgeStatus(hit.confidence)} label={`${hit.confidence} · ${hit.score}分`} />
                    </div>
                    <div className="bfcl-pay-muted">
                      <code className="bfcl-pay-mono">{hit.doc.docNo}</code>
                      {' · '}
                      {hit.doc.customer}
                      {hit.doc.plate ? ` · ${hit.doc.plate}` : ''}
                      {' · '}命中：{hit.reasons.join(' / ')}
                    </div>
                  </div>
                  <div className="bfcl-pay-doc-right">
                    <span className="bfcl-pay-mono">¥{formatMoney(hit.doc.amount)}</span>
                    <V2Button
                      variant="outline"
                      size="sm"
                      icon={<Link2 size={14} />}
                      onClick={() => applySmartHits([hit])}
                    >
                      采纳
                    </V2Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="bfcl-pay-split">
          <section className="bfcl-pay-panel">
            <h2>可关联业务单据（{active.flow === '收款' ? '应收' : '应付'}）</h2>
            <p className="bfcl-pay-hint">点击「关联」写入本流水；金额超出剩余可关联额时按剩余核销。带智能建议角标的优先核验。</p>
            <div className="bfcl-pay-doc-list">
              {options.map((doc) => {
                const hit = hitByNo.get(doc.docNo);
                return (
                  <div key={doc.docNo} className={`bfcl-pay-doc-row${hit ? ' is-smart-hit' : ''}`}>
                    <div>
                      <div className="bfcl-pay-doc-title">
                        {doc.type}
                        {hit ? (
                          <V2Badge status={confidenceBadgeStatus(hit.confidence)} label={`建议 ${hit.confidence}`} />
                        ) : null}
                      </div>
                      <div className="bfcl-pay-muted">
                        <code className="bfcl-pay-mono">{doc.docNo}</code>
                        {' · '}
                        {doc.customer}
                        {doc.plate ? ` · ${doc.plate}` : ''}
                        {hit ? ` · ${hit.reasons.join('/')}` : ''}
                      </div>
                    </div>
                    <div className="bfcl-pay-doc-right">
                      <span className="bfcl-pay-mono">¥{formatMoney(doc.amount)}</span>
                      <V2Button variant="outline" size="sm" icon={<Link2 size={14} />} onClick={() => linkDoc(doc)}>
                        关联
                      </V2Button>
                    </div>
                  </div>
                );
              })}
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
                      {d.type} · <code className="bfcl-pay-mono">{d.docNo}</code>
                    </span>
                    <div className="bfcl-pay-linked__right">
                      <span className="bfcl-pay-mono">¥{formatMoney(d.amount)}</span>
                      <V2Button
                        variant="ghost"
                        size="sm"
                        icon={<Unlink size={14} />}
                        onClick={() => unlinkDoc(d.docNo, d.amount)}
                        aria-label={`移除 ${d.docNo}`}
                      >
                        移除
                      </V2Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        {toast ? <div className="bfcl-pay-toast" role="status">{toast}</div> : null}
      </div>
    );
  }

  return (
    <div className="bfcl-pay">
      <BfclChainNav current="pay" />
      <div className="bfcl-pay-toolbar">
        <V2StatusTabs
          value={flowTab}
          onChange={(v) => {
            setFlowTab(v);
            setPage(1);
          }}
          options={[
            { key: 'all', label: '全部', count: flowCounts.all },
            { key: '收款', label: '收款记录', count: flowCounts.receipt },
            { key: '付款', label: '付款记录', count: flowCounts.payment },
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
              setStatusTab(k.tab);
              setPage(1);
            }}
          >
            <span className="bfcl-pay-kpi__label">{k.label}</span>
            <strong className="bfcl-pay-kpi__value">{k.value}</strong>
          </button>
        ))}
      </div>

      <div className="bfcl-pay-shell">
        <div className="bfcl-pay-tools v2-filter-toolbar-tools">
          <V2StatusTabs
            value={statusTab}
            onChange={(v) => {
              setStatusTab(v);
              setPage(1);
            }}
            options={[
              { key: 'all', label: '全部状态', count: statusCounts.all },
              { key: '未关联', label: '未关联', count: statusCounts.unlinked },
              { key: '部分关联', label: '部分关联', count: statusCounts.partial },
              { key: '已闭环', label: '已闭环', count: statusCounts.closed },
            ]}
          />
          <V2FilterSearch aria-label="搜索流水">
            <input
              type="text"
              placeholder="流水号 / 对方 / 单据号 / 摘要"
              value={keywordDraft}
              onChange={(e) => setKeywordDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters();
              }}
            />
          </V2FilterSearch>
          <V2Button variant="primary" size="sm" icon={<Filter size={14} />} onClick={applyFilters}>
            查询
          </V2Button>
          <V2Button variant="secondary" size="sm" icon={<RotateCcw size={14} />} onClick={resetFilters}>
            重置
          </V2Button>
        </div>

        <div className="bfcl-pay-table-wrap">
          {pageRows.length === 0 ? (
            <V2Empty type="empty" title="无匹配流水" description="调整筛选或导入新流水" />
          ) : (
            <table className="bfcl-pay-table">
              <thead>
                <tr>
                  <th>流水号</th>
                  <th>流向</th>
                  <th>金额</th>
                  <th>到账/出账日</th>
                  <th>已关联 / 剩余</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="bfcl-pay-row-title">{r.counterparty}</div>
                      <DetailEntryLink
                        variant="code"
                        ariaLabel={`${r.voucherNo}，点击进入收付款详情`}
                        onClick={() => openDetail(r.id)}
                      >
                        {r.voucherNo}
                      </DetailEntryLink>
                      <div className="bfcl-pay-muted">{r.channel}</div>
                    </td>
                    <td>{r.flow}</td>
                    <td className="bfcl-pay-mono">¥{formatMoney(r.amount)}</td>
                    <td className="bfcl-pay-mono">{r.paidAt}</td>
                    <td className="bfcl-pay-mono">
                      ¥{formatMoney(r.linkedAmount)}
                      {' / '}
                      <span
                        className={
                          r.amount - r.linkedAmount > 0.001
                            ? 'bfcl-pay-remain-warn'
                            : undefined
                        }
                      >
                        ¥{formatMoney(Math.max(0, r.amount - r.linkedAmount))}
                      </span>
                    </td>
                    <td>
                      <V2Badge status={statusBadge(r.status)} label={r.status} />
                    </td>
                    <td>
                      <OperationActions
                        process={{ label: '关联', onClick: () => openDetail(r.id) }}
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
