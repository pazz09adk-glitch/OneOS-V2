import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Filter, RotateCcw } from 'lucide-react';
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
import { MOCK_CONTRACTS } from './mockData';
import {
  formatMoney,
  type AlignStatus,
  type AuditStatus,
  type ContractMaster,
  type Filters,
  type ReceiptChild,
} from './types';

const auditBadge = (s: AuditStatus): V2BadgeStatus => {
  if (s === '审批通过') return 'success';
  if (s === '已驳回') return 'error';
  if (s === '审批中' || s === '待审批') return 'processing';
  return 'default';
};

const alignBadge = (s: AlignStatus): V2BadgeStatus => {
  if (s === '已交车' || s === '已付清') return 'success';
  if (s === '特批放行' || s === '部分收款') return 'warning';
  return 'error';
};

export function PickupHub() {
  const [rows, setRows] = useState<ContractMaster[]>(MOCK_CONTRACTS);
  const [mode, setMode] = useState<'ledger' | 'detail'>('ledger');
  const [tab, setTab] = useState<AlignStatus | 'all'>('all');
  const [filters, setFilters] = useState<Filters>({
    keyword: '',
    auditStatus: 'all',
    alignStatus: 'all',
    businessDept: 'all',
  });
  const [draft, setDraft] = useState(filters);
  const [moreOpen, setMoreOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expanded, setExpanded] = useState<string[]>(['c1']);
  const [active, setActive] = useState<{ contractId: string; receiptId: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const flatReceipts = useMemo(() => {
    const list: { contract: ContractMaster; receipt: ReceiptChild }[] = [];
    rows.forEach((c) => c.children.forEach((r) => list.push({ contract: c, receipt: r })));
    return list;
  }, [rows]);

  const filteredMasters = useMemo(() => {
    return rows
      .map((c) => {
        const children = c.children.filter((r) => {
          if (tab !== 'all' && r.alignStatus !== tab) return false;
          if (filters.alignStatus !== 'all' && r.alignStatus !== filters.alignStatus) return false;
          if (filters.auditStatus !== 'all' && r.auditStatus !== filters.auditStatus) return false;
          if (filters.businessDept !== 'all' && c.businessDept !== filters.businessDept) return false;
          if (filters.keyword) {
            const q = filters.keyword.trim().toLowerCase();
            const hay = [
              c.contractCode,
              c.projectName,
              c.customerName,
              c.businessPerson,
              ...r.vehicles.map((v) => v.plate),
              r.id,
            ]
              .join(' ')
              .toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        });
        return { ...c, children };
      })
      .filter((c) => c.children.length > 0 || (!filters.keyword && tab === 'all' && filters.alignStatus === 'all' && filters.auditStatus === 'all'));
  }, [rows, filters, tab]);

  const pageRows = filteredMasters.slice((page - 1) * pageSize, page * pageSize);

  const kpi = useMemo(() => {
    const pending = flatReceipts.filter((x) => x.receipt.alignStatus === '待收款' || x.receipt.alignStatus === '部分收款');
    const ready = flatReceipts.filter((x) => x.receipt.alignStatus === '已付清' || x.receipt.alignStatus === '特批放行');
    const delivered = flatReceipts.filter((x) => x.receipt.alignStatus === '已交车');
    const gap = flatReceipts.reduce((s, x) => s + Math.max(0, x.receipt.actualTotal - x.receipt.financeReceived), 0);
    return [
      { label: '待对齐收款单', value: String(pending.length), tab: '待收款' as const, sub: '含部分收款' },
      { label: '可交车', value: String(ready.length), tab: '已付清' as const, sub: '付清或特批' },
      { label: '已交车', value: String(delivered.length), tab: '已交车' as const, sub: '已生成交车任务' },
      { label: '业财待关联差额', value: `¥${formatMoney(gap)}`, tab: null, sub: '实收−财务入账' },
    ];
  }, [flatReceipts]);

  const openDetail = (contractId: string, receiptId: string) => {
    setActive({ contractId, receiptId });
    setMode('detail');
  };

  const patchReceipt = (contractId: string, receiptId: string, patch: Partial<ReceiptChild>) => {
    setRows((list) =>
      list.map((c) =>
        c.id !== contractId
          ? c
          : {
              ...c,
              children: c.children.map((r) => (r.id === receiptId ? { ...r, ...patch } : r)),
            },
      ),
    );
  };

  const current = active
    ? (() => {
        const contract = rows.find((c) => c.id === active.contractId);
        const receipt = contract?.children.find((r) => r.id === active.receiptId);
        return contract && receipt ? { contract, receipt } : null;
      })()
    : null;

  if (mode === 'detail' && current) {
    const { contract, receipt } = current;
    const remain = Math.max(0, receipt.actualTotal - receipt.financeReceived);
    const algo = receipt.before15
      ? '≤15 日提车：剩余天租金 + 保证金 + 剩余天服务费（+氢费预付若合同约定）'
      : '＞15 日提车：当月+下月整月租金 + 保证金 + 整月服务费（+氢费预付若合同约定）';

    return (
      <div className="bfcl-detail">
        <header className="bfcl-form-header">
          <V2Button variant="back" size="sm" onClick={() => { setMode('ledger'); setActive(null); }}>
            返回列表
          </V2Button>
          <span className="bfcl-form-header__divider" />
          <div className="bfcl-form-header__title-wrap">
            <h1 className="bfcl-form-header__title">提车收款单</h1>
            <span className="bfcl-form-header__pill">{contract.contractCode}-0{receipt.seq}</span>
            <V2Badge status={auditBadge(receipt.auditStatus)} label={receipt.auditStatus} />
            <V2Badge status={alignBadge(receipt.alignStatus)} label={receipt.alignStatus} />
          </div>
          <div className="bfcl-form-header__actions">
            <V2Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (receipt.alignStatus === '已付清' || receipt.alignStatus === '已交车') {
                  showToast('已付清/已交车无需特批');
                  return;
                }
                patchReceipt(contract.id, receipt.id, { alignStatus: '特批放行', specialApproved: true });
                showToast('特批放行已通过（实收仍不足也可交车）');
              }}
            >
              特批放行
            </V2Button>
            <V2Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (remain <= 0) {
                  showToast('财务入账已齐');
                  return;
                }
                const add = Math.min(remain, Math.max(5000, Math.round(remain / 2)));
                const financeReceived = receipt.financeReceived + add;
                const alignStatus: AlignStatus =
                  financeReceived >= receipt.actualTotal ? '已付清' : '部分收款';
                patchReceipt(contract.id, receipt.id, {
                  financeReceived,
                  arrivalAmount: financeReceived,
                  arrivalTime: '2026-07-29 10:00',
                  alignStatus: receipt.specialApproved && alignStatus !== '已付清' ? '特批放行' : alignStatus,
                });
                showToast(`已关联收款 ¥${formatMoney(add)}（对照收付款中枢）`);
              }}
            >
              关联收款入账
            </V2Button>
            <V2Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (receipt.alignStatus !== '已付清' && receipt.alignStatus !== '特批放行') {
                  showToast('门禁：实收未对齐且无特批，不可生成交车任务');
                  return;
                }
                patchReceipt(contract.id, receipt.id, { alignStatus: '已交车' });
                showToast('已生成运维交车任务（oneos-web-ops）');
              }}
            >
              生成交车任务
            </V2Button>
          </div>
        </header>

        <div className={`bfcl-callout ${remain > 0 && !receipt.specialApproved ? 'is-warn' : ''}`} data-annotation-id="bfcl-pu-gate">
          业财纪律：无收款关联不得假性付清；实收=应收（或特批）才可交车。当前财务已入账 ¥{formatMoney(receipt.financeReceived)}，待关联差额
          <strong className={remain > 0 ? ' is-danger' : ' is-ok'}> ¥{formatMoney(remain)}</strong>。
        </div>

        <section className="bfcl-panel" data-annotation-id="bfcl-pu-project">
          <h2>1. 项目信息（合同反写）</h2>
          <dl className="bfcl-info-grid">
            <div><dt>合同编码</dt><dd className="bfcl-mono">{contract.contractCode}</dd></div>
            <div><dt>合同类型</dt><dd>{contract.contractType}</dd></div>
            <div><dt>项目名称</dt><dd>{contract.projectName}</dd></div>
            <div><dt>客户名称</dt><dd>{contract.customerName}</dd></div>
            <div><dt>付款方式</dt><dd>{contract.payMode}</dd></div>
            <div><dt>付款周期</dt><dd>{contract.payCycleMonths} 个月</dd></div>
            <div><dt>合同生效</dt><dd>{contract.contractStart}</dd></div>
            <div><dt>合同结束</dt><dd>{contract.contractEnd}</dd></div>
            <div><dt>业务部门</dt><dd>{contract.businessDept}</dd></div>
            <div><dt>业务负责人</dt><dd>{contract.businessPerson}</dd></div>
          </dl>
        </section>

        <section className="bfcl-panel" data-annotation-id="bfcl-pu-algo">
          <h2>2. 提车应收款信息</h2>
          <p className="bfcl-muted" style={{ marginTop: 0 }}>{algo} · 约定提车日 {receipt.pickupDate}</p>
          <div className="bfcl-split-3">
            <div className="bfcl-stat">
              <span className="bfcl-stat__label">应收款总额</span>
              <div className="bfcl-stat__value">¥{formatMoney(receipt.receivableTotal)}</div>
              <span className="bfcl-muted">租金+保证金+服务费+氢费预付应收</span>
            </div>
            <div className="bfcl-stat">
              <span className="bfcl-stat__label">实收款总额</span>
              <div className="bfcl-stat__value">¥{formatMoney(receipt.actualTotal)}</div>
              <span className="bfcl-muted">含减免 ¥{formatMoney(receipt.discountTotal)}</span>
            </div>
            <div className="bfcl-stat">
              <span className="bfcl-stat__label">应开票总额</span>
              <div className="bfcl-stat__value">
                ¥{formatMoney(Math.max(0, receipt.actualTotal - receipt.vehicles.reduce((s, x) => s + x.deposit, 0) - receipt.h2PrepaidActual))}
              </div>
              <span className="bfcl-muted">实收租金+服务−减免（不含保证金/氢预付）</span>
            </div>
          </div>

          <h3>车辆应收款明细（可分批勾选 · 已提车锁死）</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="bfcl-table">
              <thead>
                <tr>
                  <th>选</th>
                  <th>序号</th>
                  <th>品牌/型号</th>
                  <th>车牌</th>
                  <th>应收月租金</th>
                  <th>实收月租金</th>
                  <th>减免</th>
                  <th>保证金</th>
                  <th>应收服务费</th>
                  <th>实收服务费</th>
                </tr>
              </thead>
              <tbody>
                {receipt.vehicles.map((veh) => (
                  <tr key={veh.seq}>
                    <td>{veh.locked ? '🔒' : veh.selected ? '✓' : '—'}</td>
                    <td>{veh.seq}</td>
                    <td>{veh.brand} {veh.model}</td>
                    <td className="bfcl-mono">{veh.plate || '—'}</td>
                    <td className="bfcl-mono">¥{formatMoney(veh.rentReceivable)}</td>
                    <td className="bfcl-mono">¥{formatMoney(veh.rentActual)}</td>
                    <td className="bfcl-mono">¥{formatMoney(veh.discount)}</td>
                    <td className="bfcl-mono">¥{formatMoney(veh.deposit)}</td>
                    <td className="bfcl-mono">¥{formatMoney(veh.serviceReceivable)}</td>
                    <td className="bfcl-mono">¥{formatMoney(veh.serviceActual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(receipt.h2PrepaidReceivable > 0 || receipt.h2PrepaidActual > 0) && (
            <>
              <h3>氢费预付款（合同约定预付才展示）</h3>
              <div className="bfcl-row">
                <span>氢费预付应收</span>
                <span className="bfcl-mono">¥{formatMoney(receipt.h2PrepaidReceivable)}</span>
              </div>
              <div className="bfcl-row">
                <span>氢费预付实收</span>
                <span className="bfcl-mono">¥{formatMoney(receipt.h2PrepaidActual)}</span>
              </div>
              <p className="bfcl-muted">关联收款入账后，同步充入客户项目能源账户（无户自动建户）。</p>
            </>
          )}

          <h3>开票</h3>
          <dl className="bfcl-info-grid">
            <div><dt>开票方式</dt><dd>{receipt.invoiceMethod}</dd></div>
            <div><dt>开票状态</dt><dd>{receipt.invoiceStatus}</dd></div>
            <div><dt>已开票金额</dt><dd className="bfcl-mono">¥{formatMoney(receipt.invoicedAmount)}</dd></div>
            <div><dt>开票备注</dt><dd>{receipt.invoiceNote}</dd></div>
            <div><dt>财务入账/到账</dt><dd>¥{formatMoney(receipt.financeReceived)} · {receipt.arrivalTime}</dd></div>
            <div><dt>创建人 / 时间</dt><dd>{receipt.creator} · {receipt.chargeTime}</dd></div>
          </dl>
        </section>

        <div className="bfcl-split">
          <section className="bfcl-panel">
            <h2>服务费项目拆解（示意）</h2>
            {receipt.vehicles[0]?.serviceItems.map((it) => (
              <div key={it.name} className="bfcl-row">
                <span>{it.name}</span>
                <span className="bfcl-mono">
                  应收 ¥{formatMoney(it.receivable)} / 实收 ¥{formatMoney(it.actual)}
                </span>
              </div>
            ))}
          </section>
          <section className="bfcl-panel">
            <h2>联动</h2>
            <ul>
              <li>对照 V1.2：合同主表 + 提车收款单子表 + 车辆明细 + 氢预付 + 开票</li>
              <li>V2 新门禁：关联收款中枢后才算业财闭环</li>
              <li>对齐完成后触发运维交车任务</li>
            </ul>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              <V2Button variant="secondary" size="sm" onClick={() => { window.location.href = '/prototypes/bfcl-payment-hub/'; }}>
                收付款中枢
              </V2Button>
              <V2Button variant="ghost" size="sm" onClick={() => { window.location.href = '/prototypes/bfcl-energy/'; }}>
                能源账户
              </V2Button>
            </div>
          </section>
        </div>
        {toast ? <div className="bfcl-toast" role="status">{toast}</div> : null}
      </div>
    );
  }

  return (
    <div className="bfcl-page">
      <div className="bfcl-toolbar">
        <V2StatusTabs
          value={tab}
          onChange={(v) => { setTab(v); setPage(1); }}
          options={[
            { key: 'all', label: '全部' },
            { key: '待收款', label: '待收款' },
            { key: '部分收款', label: '部分收款' },
            { key: '已付清', label: '已付清' },
            { key: '特批放行', label: '特批' },
            { key: '已交车', label: '已交车' },
          ]}
        />
      </div>

      <div className="bfcl-kpi">
        {kpi.map((k) => (
          <button
            key={k.label}
            type="button"
            className="bfcl-kpi__card"
            onClick={() => { if (k.tab) { setTab(k.tab); setPage(1); } }}
          >
            <span className="bfcl-kpi__label">{k.label}</span>
            <strong className="bfcl-kpi__value">{k.value}</strong>
            <span className="bfcl-kpi__sub">{k.sub}</span>
          </button>
        ))}
      </div>

      <div className="bfcl-shell">
        <div className="bfcl-tools v2-filter-toolbar-tools">
          <V2FilterSearch aria-label="搜索提车应收">
            <input
              type="text"
              placeholder="合同 / 项目 / 客户 / 车牌 / 负责人"
              value={draft.keyword}
              onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setFilters(draft);
                  setMoreOpen(false);
                  setPage(1);
                }
              }}
            />
          </V2FilterSearch>
          <V2FilterMoreButton
            open={moreOpen}
            activeCount={
              (draft.auditStatus !== 'all' ? 1 : 0) +
              (draft.alignStatus !== 'all' ? 1 : 0) +
              (draft.businessDept !== 'all' ? 1 : 0)
            }
            onClick={() => setMoreOpen((o) => !o)}
          />
          <V2Button variant="primary" size="sm" icon={<Filter size={14} />} onClick={() => { setFilters(draft); setMoreOpen(false); setPage(1); }}>
            查询
          </V2Button>
          <V2Button
            variant="secondary"
            size="sm"
            icon={<RotateCcw size={14} />}
            onClick={() => {
              const empty: Filters = { keyword: '', auditStatus: 'all', alignStatus: 'all', businessDept: 'all' };
              setDraft(empty);
              setFilters(empty);
              setTab('all');
              setMoreOpen(false);
              setPage(1);
            }}
          >
            重置
          </V2Button>
        </div>
        {moreOpen ? (
          <div className="bfcl-more">
            <div className="bfcl-field">
              <label>审批状态</label>
              <V2Select
                value={draft.auditStatus}
                onChange={(v) => setDraft((d) => ({ ...d, auditStatus: v as Filters['auditStatus'] }))}
                options={[
                  { value: 'all', label: '全部' },
                  { value: '待提交', label: '待提交' },
                  { value: '待审批', label: '待审批' },
                  { value: '审批中', label: '审批中' },
                  { value: '审批通过', label: '审批通过' },
                  { value: '已驳回', label: '已驳回' },
                ]}
              />
            </div>
            <div className="bfcl-field">
              <label>对齐状态</label>
              <V2Select
                value={draft.alignStatus}
                onChange={(v) => setDraft((d) => ({ ...d, alignStatus: v as Filters['alignStatus'] }))}
                options={[
                  { value: 'all', label: '全部' },
                  { value: '待收款', label: '待收款' },
                  { value: '部分收款', label: '部分收款' },
                  { value: '已付清', label: '已付清' },
                  { value: '特批放行', label: '特批放行' },
                  { value: '已交车', label: '已交车' },
                ]}
              />
            </div>
            <div className="bfcl-field">
              <label>业务部门</label>
              <V2Select
                value={draft.businessDept}
                onChange={(v) => setDraft((d) => ({ ...d, businessDept: v }))}
                options={[
                  { value: 'all', label: '全部' },
                  { value: '业务1部', label: '业务1部' },
                  { value: '业务2部', label: '业务2部' },
                  { value: '业务3部', label: '业务3部' },
                ]}
              />
            </div>
          </div>
        ) : null}

        {pageRows.length === 0 ? (
          <V2Empty type="empty" title="无匹配合同/收款单" description="调整筛选后再试" />
        ) : (
          <table className="bfcl-table">
            <thead>
              <tr>
                <th style={{ width: 36 }} />
                <th>合同编码</th>
                <th>项目 / 客户</th>
                <th>业务</th>
                <th>生效日</th>
                <th>合同应收合计</th>
                <th>实收 / 财务入账</th>
                <th>提车收款单</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((c) => {
                const open = expanded.includes(c.id);
                return (
                  <React.Fragment key={c.id}>
                    <tr
                      className="is-expandable"
                      onClick={() =>
                        setExpanded((keys) => (keys.includes(c.id) ? keys.filter((k) => k !== c.id) : [...keys, c.id]))
                      }
                    >
                      <td>{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</td>
                      <td>
                        <div className="bfcl-primary bfcl-mono">{c.contractCode}</div>
                        <div className="bfcl-muted">{c.contractType} · {c.payMode}/{c.payCycleMonths}月</div>
                      </td>
                      <td>
                        <div className="bfcl-primary">{c.projectName}</div>
                        <div className="bfcl-muted">{c.customerName}</div>
                      </td>
                      <td>
                        <div>{c.businessDept}</div>
                        <div className="bfcl-muted">{c.businessPerson}</div>
                      </td>
                      <td>{c.contractStart}</td>
                      <td className="bfcl-mono">¥{formatMoney(c.totalReceivable)}</td>
                      <td className="bfcl-mono">
                        ¥{formatMoney(c.totalActual)}
                        <div className="bfcl-muted">入账 ¥{formatMoney(c.totalFinanceReceived)}</div>
                      </td>
                      <td>
                        <div className="bfcl-tag-row">
                          <V2Badge status="processing" label={`${c.children.length} 单`} />
                          {c.allVehiclesReceivableCompleted ? (
                            <V2Badge status="success" label="车辆应收已齐" />
                          ) : (
                            <V2Badge status="warning" label="未齐" />
                          )}
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <OperationActions
                          view={{
                            label: '展开',
                            onClick: () =>
                              setExpanded((keys) =>
                                keys.includes(c.id) ? keys.filter((k) => k !== c.id) : [...keys, c.id],
                              ),
                          }}
                        />
                      </td>
                    </tr>
                    {open ? (
                      <tr className="is-child">
                        <td colSpan={9}>
                          <table className="bfcl-nested">
                            <thead>
                              <tr>
                                <th>收款单</th>
                                <th>审批</th>
                                <th>创建</th>
                                <th>提车数</th>
                                <th>车辆</th>
                                <th>应收 / 实收</th>
                                <th>财务入账</th>
                                <th>开票</th>
                                <th>对齐</th>
                                <th>操作</th>
                              </tr>
                            </thead>
                            <tbody>
                              {c.children.map((r) => (
                                <tr key={r.id}>
                                  <td className="bfcl-mono">#{r.seq}</td>
                                  <td><V2Badge status={auditBadge(r.auditStatus)} label={r.auditStatus} /></td>
                                  <td>
                                    <div>{r.creator}</div>
                                    <div className="bfcl-muted">{r.chargeTime}</div>
                                  </td>
                                  <td>{r.deliveryCount}</td>
                                  <td className="bfcl-mono">
                                    {r.vehicles.map((v) => v.plate).join('、')}
                                  </td>
                                  <td className="bfcl-mono">
                                    ¥{formatMoney(r.receivableTotal)}
                                    <div className="bfcl-muted">实收 ¥{formatMoney(r.actualTotal)}</div>
                                  </td>
                                  <td className="bfcl-mono">¥{formatMoney(r.financeReceived)}</td>
                                  <td>
                                    <div>{r.invoiceMethod}</div>
                                    <div className="bfcl-muted">{r.invoiceStatus}</div>
                                  </td>
                                  <td><V2Badge status={alignBadge(r.alignStatus)} label={r.alignStatus} /></td>
                                  <td>
                                    <OperationActions
                                      process={{ label: '对齐办理', onClick: () => openDetail(c.id, r.id) }}
                                      view={{ label: '收款单', onClick: () => openDetail(c.id, r.id) }}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="bfcl-pager">
        <V2Pagination
          total={filteredMasters.length}
          page={page}
          pageSize={pageSize}
          onChange={(p, ps) => { setPage(p); setPageSize(ps); }}
        />
      </div>
      {toast ? <div className="bfcl-toast" role="status">{toast}</div> : null}
    </div>
  );
}
