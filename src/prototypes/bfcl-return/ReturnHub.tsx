import React, { useMemo, useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
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
import { MOCK } from './mockData';
import { deptTotal, formatMoney, type Filters, type ReturnRow, type ReturnStatus } from './types';

const badge = (s: ReturnStatus): V2BadgeStatus => {
  if (s === '已闭环') return 'success';
  if (s === '结算中') return 'processing';
  if (s === '应退客户') return 'warning';
  return 'error';
};

function FeeTable({ fees }: { fees: { seq: number; feeItem: string; amount: number; remark: string; updatedAt: string }[] }) {
  if (fees.length === 0) return <p className="bfcl-muted">本组无费用项</p>;
  return (
    <table className="bfcl-nested">
      <thead>
        <tr><th>序号</th><th>费用项</th><th>金额</th><th>备注</th><th>更新</th></tr>
      </thead>
      <tbody>
        {fees.map((f) => (
          <tr key={f.seq}>
            <td>{f.seq}</td>
            <td>{f.feeItem}</td>
            <td className="bfcl-mono">¥{formatMoney(f.amount)}</td>
            <td className="bfcl-muted">{f.remark || '—'}</td>
            <td className="bfcl-muted">{f.updatedAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ReturnHub() {
  const [rows, setRows] = useState(MOCK);
  const [mode, setMode] = useState<'ledger' | 'detail'>('ledger');
  const [tab, setTab] = useState<ReturnStatus | 'all'>('all');
  const [filters, setFilters] = useState<Filters>({ keyword: '', status: 'all', approval: 'all' });
  const [draft, setDraft] = useState(filters);
  const [moreOpen, setMoreOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2400); };

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (tab !== 'all' && r.status !== tab) return false;
        if (filters.status !== 'all' && r.status !== filters.status) return false;
        if (filters.approval !== 'all' && r.approvalStatus !== filters.approval) return false;
        if (filters.keyword) {
          const q = filters.keyword.trim().toLowerCase();
          if (![r.docNo, r.contractNo, r.customer, r.plate, r.projectName].join(' ').toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [rows, filters, tab],
  );

  const kpi = useMemo(() => [
    { label: '客户应付', value: String(rows.filter((r) => r.status === '客户应付').length), tab: '客户应付' as const },
    { label: '应退客户', value: String(rows.filter((r) => r.status === '应退客户').length), tab: '应退客户' as const },
    { label: '结算中', value: String(rows.filter((r) => r.status === '结算中').length), tab: '结算中' as const },
    { label: '已闭环', value: String(rows.filter((r) => r.status === '已闭环').length), tab: '已闭环' as const },
  ], [rows]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const active = rows.find((r) => r.id === activeId) ?? null;
  const patch = (n: ReturnRow) => { setRows((l) => l.map((r) => (r.id === n.id ? n : r))); setActiveId(n.id); };

  if (mode === 'detail' && active) {
    const remain = Math.max(0, active.amount - active.linked);
    const sums = {
      safety: deptTotal(active.safety.fees),
      ops: deptTotal(active.ops.fees),
      biz: deptTotal(active.biz.fees),
      energy: deptTotal(active.energy.fees),
    };
    return (
      <div className="bfcl-detail">
        <header className="bfcl-form-header">
          <V2Button variant="back" size="sm" onClick={() => { setMode('ledger'); setActiveId(null); }}>返回列表</V2Button>
          <span className="bfcl-form-header__divider" />
          <div className="bfcl-form-header__title-wrap">
            <h1 className="bfcl-form-header__title">还车费用明细</h1>
            <span className="bfcl-form-header__pill">{active.docNo}</span>
            <V2Badge status={badge(active.status)} label={active.status} />
          </div>
          <div className="bfcl-form-header__actions">
            <V2Button variant="outline" size="sm" onClick={() => {
              patch({ ...active, linked: active.amount, status: '已闭环' });
              showToast(active.direction === '应收' ? '已关联收款闭环' : '已关联付款（保证金退还）闭环');
            }}>{active.direction === '应收' ? '关联收款' : '关联付款'}</V2Button>
            <V2Button variant="primary" size="sm" onClick={() => {
              if (active.status !== '已闭环') { showToast('门禁：未关联收/付款不得闭环'); return; }
              showToast('还车应结业财闭环完成');
            }}>确认闭环</V2Button>
          </div>
        </header>

        <div className="bfcl-callout" data-annotation-id="bfcl-rt-date">
          E 签宝用户签字日 = 实际退租日 <strong>{active.returnSignDate}</strong>；方向 <strong>{active.direction}</strong>；
          已关联 ¥{formatMoney(active.linked)} / 剩余 <span className={remain > 0 ? 'is-danger' : 'is-ok'}>¥{formatMoney(remain)}</span>
        </div>

        <section className="bfcl-panel">
          <h2>还车车辆信息（V1.2）</h2>
          <dl className="bfcl-info-grid">
            <div><dt>合同编码</dt><dd className="bfcl-mono">{active.contractNo}</dd></div>
            <div><dt>项目</dt><dd>{active.projectName}</dd></div>
            <div><dt>客户</dt><dd>{active.customer}</dd></div>
            <div><dt>车牌 / 车型</dt><dd className="bfcl-mono">{active.plate} · {active.brand} {active.model}</dd></div>
            <div><dt>交车时间</dt><dd>{active.deliveryTime}</dd></div>
            <div><dt>还车时间</dt><dd>{active.returnTime}</dd></div>
            <div><dt>还车人</dt><dd>{active.returnPerson}</dd></div>
            <div><dt>业务</dt><dd>{active.bizDept} · {active.owner}</dd></div>
            <div><dt>审批</dt><dd>{active.approvalStatus}</dd></div>
            <div><dt>无忧包</dt><dd>
              养护保{active.hasCarePackage ? '✓' : '✗'} · 易损保{active.hasWearPackage ? '✓' : '✗'} · 轮胎保{active.hasTirePackage ? '✓' : '✗'}
            </dd></div>
          </dl>
        </section>

        <div className="bfcl-split-3">
          <div className="bfcl-stat"><span className="bfcl-stat__label">安全组</span><div className="bfcl-stat__value">¥{formatMoney(sums.safety)}</div><span className="bfcl-muted">{active.safety.status} · 违章{active.safety.violations}/事故{active.safety.accidents}</span></div>
          <div className="bfcl-stat"><span className="bfcl-stat__label">运维组</span><div className="bfcl-stat__value">¥{formatMoney(sums.ops)}</div><span className="bfcl-muted">{active.ops.status} · {active.ops.submitBy || '—'}</span></div>
          <div className="bfcl-stat"><span className="bfcl-stat__label">业务+能源</span><div className="bfcl-stat__value">¥{formatMoney(sums.biz + sums.energy)}</div><span className="bfcl-muted">应结合计 ¥{formatMoney(active.amount)}</span></div>
        </div>

        <section className="bfcl-panel" data-annotation-id="bfcl-rt-items">
          <h2>安全组 · 违章事故与费用</h2>
          <FeeTable fees={active.safety.fees} />
        </section>
        <section className="bfcl-panel">
          <h2>运维组 · 点检与维修（无忧包减免挂钩）</h2>
          <FeeTable fees={active.ops.fees} />
        </section>
        <section className="bfcl-panel">
          <h2>业务服务组 · 尾期 / ETC / 无忧包</h2>
          <FeeTable fees={active.biz.fees} />
        </section>
        <section className="bfcl-panel">
          <h2>能源采购组 · 氢量差 / 能源补退</h2>
          <FeeTable fees={active.energy.fees} />
        </section>

        <div className="bfcl-panel">
          <V2Button variant="secondary" size="sm" onClick={() => { window.location.href = '/prototypes/vehicle-return-settlement/'; }}>打开旧版还车应结（完整交互）</V2Button>
          {' '}
          <V2Button variant="ghost" size="sm" onClick={() => { window.location.href = '/prototypes/bfcl-payment-hub/'; }}>收付款中枢</V2Button>
        </div>
        {toast ? <div className="bfcl-toast" role="status">{toast}</div> : null}
      </div>
    );
  }

  return (
    <div className="bfcl-page">
      <div className="bfcl-toolbar">
        <V2StatusTabs value={tab} onChange={(v) => { setTab(v); setPage(1); }} options={[
          { key: 'all', label: '全部' }, { key: '结算中', label: '结算中' }, { key: '客户应付', label: '客户应付' },
          { key: '应退客户', label: '应退客户' }, { key: '已闭环', label: '已闭环' },
        ]} />
      </div>
      <div className="bfcl-kpi">
        {kpi.map((k) => (
          <button key={k.label} type="button" className="bfcl-kpi__card" onClick={() => { if (k.tab) { setTab(k.tab); setPage(1); } }}>
            <span className="bfcl-kpi__label">{k.label}</span>
            <strong className="bfcl-kpi__value">{k.value}</strong>
          </button>
        ))}
      </div>
      <div className="bfcl-shell">
        <div className="bfcl-tools v2-filter-toolbar-tools">
          <V2FilterSearch aria-label="搜索还车应结">
            <input type="text" placeholder="单号 / 合同 / 客户 / 车牌 / 项目" value={draft.keyword}
              onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { setFilters(draft); setMoreOpen(false); setPage(1); } }} />
          </V2FilterSearch>
          <V2FilterMoreButton open={moreOpen} activeCount={(draft.status !== 'all' ? 1 : 0) + (draft.approval !== 'all' ? 1 : 0)} onClick={() => setMoreOpen((o) => !o)} />
          <V2Button variant="primary" size="sm" icon={<Filter size={14} />} onClick={() => { setFilters(draft); setMoreOpen(false); setPage(1); }}>查询</V2Button>
          <V2Button variant="secondary" size="sm" icon={<RotateCcw size={14} />} onClick={() => { const e: Filters = { keyword: '', status: 'all', approval: 'all' }; setDraft(e); setFilters(e); setTab('all'); setMoreOpen(false); setPage(1); }}>重置</V2Button>
        </div>
        {moreOpen ? (
          <div className="bfcl-more">
            <div className="bfcl-field"><label>结算状态</label>
              <V2Select value={draft.status} onChange={(v) => setDraft((d) => ({ ...d, status: v as Filters['status'] }))}
                options={[{ value: 'all', label: '全部' }, { value: '结算中', label: '结算中' }, { value: '客户应付', label: '客户应付' }, { value: '应退客户', label: '应退客户' }, { value: '已闭环', label: '已闭环' }]} />
            </div>
            <div className="bfcl-field"><label>审批状态</label>
              <V2Select value={draft.approval} onChange={(v) => setDraft((d) => ({ ...d, approval: v }))}
                options={[{ value: 'all', label: '全部' }, { value: '待审批', label: '待审批' }, { value: '审批中', label: '审批中' }, { value: '审批完成', label: '审批完成' }]} />
            </div>
          </div>
        ) : null}
        {pageRows.length === 0 ? <V2Empty type="empty" title="无匹配单据" description="调整筛选" /> : (
          <table className="bfcl-table">
            <thead>
              <tr>
                <th>应结单</th><th>客户 / 车牌</th><th>交还车</th><th>提交情况</th><th>方向</th><th>金额</th><th>审批</th><th>状态</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="bfcl-primary bfcl-mono">{r.docNo}</div>
                    <div className="bfcl-muted">{r.contractNo}</div>
                  </td>
                  <td>
                    <div className="bfcl-primary">{r.customer}</div>
                    <div className="bfcl-muted bfcl-mono">{r.plate} · {r.projectName}</div>
                  </td>
                  <td>
                    <div className="bfcl-muted">交 {r.deliveryTime.slice(0, 10)}</div>
                    <div>还 {r.returnSignDate}</div>
                  </td>
                  <td>
                    <div className="bfcl-tag-row">
                      <V2Badge status={r.safety.status === '已提交' ? 'success' : 'warning'} label={`安全${r.safety.status === '已提交' ? '✓' : '…'}`} />
                      <V2Badge status={r.ops.status === '已提交' ? 'success' : 'warning'} label={`运维${r.ops.status === '已提交' ? '✓' : '…'}`} />
                      <V2Badge status={r.biz.status === '已提交' ? 'success' : 'warning'} label={`业务${r.biz.status === '已提交' ? '✓' : '…'}`} />
                      <V2Badge status={r.energy.status === '已提交' ? 'success' : 'warning'} label={`能源${r.energy.status === '已提交' ? '✓' : '…'}`} />
                    </div>
                  </td>
                  <td>{r.direction}</td>
                  <td className="bfcl-mono">¥{formatMoney(r.amount)}</td>
                  <td>{r.approvalStatus}</td>
                  <td><V2Badge status={badge(r.status)} label={r.status} /></td>
                  <td>
                    <OperationActions
                      process={{ label: '费用明细', onClick: () => { setActiveId(r.id); setMode('detail'); } }}
                      view={{ label: '查看', onClick: () => { setActiveId(r.id); setMode('detail'); } }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="bfcl-pager">
        <V2Pagination total={filtered.length} page={page} pageSize={pageSize} onChange={(p, ps) => { setPage(p); setPageSize(ps); }} />
      </div>
      {toast ? <div className="bfcl-toast" role="status">{toast}</div> : null}
    </div>
  );
}
