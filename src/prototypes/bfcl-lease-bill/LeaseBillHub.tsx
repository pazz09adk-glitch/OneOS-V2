import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Columns, Filter, LayoutGrid, List, RotateCcw } from 'lucide-react';
import { OperationActions } from '../../common/OperationActions';
import {
  V2Button,
  V2Empty,
  V2FilterMoreButton,
  V2FilterSearch,
  V2Pagination,
  V2SegmentedControl,
  V2Select,
  V2SingleInputDateRangePicker,
  V2StatusTabs,
} from '../../resources/design-system/components/UIComponents';
import { V2Badge, type V2BadgeStatus } from '../../resources/design-system/components/V2Badge';
import { MOCK } from './mockData';
import {
  formatMoney,
  worstBillStatus,
  type BillRow,
  type BillStatus,
  type ContractBillMaster,
  type Filters,
  type Tier,
} from './types';

type ViewMode = 'list' | 'kanban' | 'split';

const EMPTY_FILTERS: Filters = {
  keyword: '',
  tier: 'all',
  bizDept: 'all',
  contractType: 'all',
  periodStart: '',
  periodEnd: '',
};

const badge = (s: BillStatus): V2BadgeStatus => {
  if (s === '已结清') return 'success';
  if (s === '逾期') return 'error';
  if (s === '部分收款') return 'warning';
  return 'default';
};

function groupByContract(bills: BillRow[]): ContractBillMaster[] {
  const map = new Map<string, BillRow[]>();
  bills.forEach((b) => {
    const list = map.get(b.contractNo) ?? [];
    list.push(b);
    map.set(b.contractNo, list);
  });
  return Array.from(map.entries()).map(([contractNo, list]) => {
    const sorted = [...list].sort((a, b) => b.periodNo - a.periodNo || b.period.localeCompare(a.period));
    const head = sorted[0];
    return {
      contractNo,
      contractType: head.contractType,
      projectName: head.projectName,
      customer: head.customer,
      plate: head.plate,
      pickupDate: head.pickupDate,
      contractStart: head.contractStart,
      contractEnd: head.contractEnd,
      owner: head.owner,
      bizDept: head.bizDept,
      tier: head.tier,
      graceDays: head.graceDays,
      bills: sorted,
      amountTotal: sorted.reduce((s, r) => s + r.amount, 0),
      receivedTotal: sorted.reduce((s, r) => s + r.received, 0),
      unreceivedTotal: sorted.reduce((s, r) => s + r.unreceived, 0),
      billCount: sorted.length,
      worstStatus: worstBillStatus(sorted),
    };
  });
}

function matchBillFilters(r: BillRow, tab: BillStatus | 'all', filters: Filters): boolean {
  if (tab !== 'all' && r.status !== tab) return false;
  if (filters.tier !== 'all' && r.tier !== filters.tier) return false;
  if (filters.bizDept !== 'all' && r.bizDept !== filters.bizDept) return false;
  if (filters.contractType !== 'all' && r.contractType !== filters.contractType) return false;
  if (filters.periodStart && r.billEnd < filters.periodStart) return false;
  if (filters.periodEnd && r.billStart > filters.periodEnd) return false;
  if (filters.keyword) {
    const q = filters.keyword.trim().toLowerCase();
    if (![r.billNo, r.contractNo, r.customer, r.plate, r.projectName, r.owner].join(' ').toLowerCase().includes(q)) {
      return false;
    }
  }
  return true;
}

function moreActiveCount(d: Filters): number {
  return (
    (d.tier !== 'all' ? 1 : 0) +
    (d.bizDept !== 'all' ? 1 : 0) +
    (d.contractType !== 'all' ? 1 : 0) +
    (d.periodStart || d.periodEnd ? 1 : 0)
  );
}

export function LeaseBillHub() {
  const [rows, setRows] = useState<BillRow[]>(MOCK);
  const [mode, setMode] = useState<'ledger' | 'detail'>('ledger');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [tab, setTab] = useState<BillStatus | 'all'>('all');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [moreOpen, setMoreOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expanded, setExpanded] = useState<string[]>(['ZL-2026-0888']);
  const [splitContractNo, setSplitContractNo] = useState<string | null>('ZL-2026-0888');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2400);
  };

  const toggleExpand = (contractNo: string) => {
    setExpanded((keys) => (keys.includes(contractNo) ? keys.filter((k) => k !== contractNo) : [...keys, contractNo]));
  };

  const openDetail = (id: string) => {
    setActiveId(id);
    setMode('detail');
  };

  const filteredBills = useMemo(
    () => rows.filter((r) => matchBillFilters(r, tab, filters)),
    [rows, filters, tab],
  );

  const filteredMasters = useMemo(() => {
    return groupByContract(rows)
      .map((c) => {
        const bills = c.bills.filter((r) => matchBillFilters(r, tab, filters));
        if (bills.length === 0) return null;
        return {
          ...c,
          bills,
          amountTotal: bills.reduce((s, r) => s + r.amount, 0),
          receivedTotal: bills.reduce((s, r) => s + r.received, 0),
          unreceivedTotal: bills.reduce((s, r) => s + r.unreceived, 0),
          billCount: bills.length,
          worstStatus: worstBillStatus(bills),
        };
      })
      .filter((c): c is ContractBillMaster => c !== null);
  }, [rows, filters, tab]);

  const tabCounts = useMemo(() => {
    const base = rows.filter((r) => matchBillFilters(r, 'all', filters));
    return {
      all: base.length,
      待收款: base.filter((r) => r.status === '待收款').length,
      部分收款: base.filter((r) => r.status === '部分收款').length,
      逾期: base.filter((r) => r.status === '逾期').length,
      已结清: base.filter((r) => r.status === '已结清').length,
    };
  }, [rows, filters]);

  const kpi = useMemo(() => {
    const overdue = rows.filter((r) => r.status === '逾期');
    const pending = rows.filter((r) => r.status === '待收款' || r.status === '部分收款');
    const debt = overdue.reduce((s, r) => s + r.unreceived, 0);
    const recv = rows.reduce((s, r) => s + r.received, 0);
    return [
      { label: '逾期账单', value: String(overdue.length), tab: '逾期' as const, sub: `待收 ¥${formatMoney(debt)}` },
      { label: '待收/部分', value: String(pending.length), tab: '待收款' as const, sub: '宽限内+部分' },
      { label: '本期已收', value: `¥${formatMoney(recv)}`, tab: null, sub: '台账实收合计' },
      { label: '已结清', value: String(rows.filter((r) => r.status === '已结清').length), tab: '已结清' as const, sub: '收款闭环' },
    ];
  }, [rows]);

  const pageRows = filteredMasters.slice((page - 1) * pageSize, page * pageSize);
  const active = rows.find((r) => r.id === activeId) ?? null;
  const patch = (n: BillRow) => {
    setRows((l) => l.map((r) => (r.id === n.id ? n : r)));
    setActiveId(n.id);
  };

  const applyQuery = () => {
    setFilters(draft);
    setMoreOpen(false);
    setPage(1);
  };
  const resetFilters = () => {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setTab('all');
    setMoreOpen(false);
    setPage(1);
  };

  const splitMaster =
    filteredMasters.find((c) => c.contractNo === splitContractNo) ?? filteredMasters[0] ?? null;

  if (mode === 'detail' && active) {
    const remain = Math.max(0, active.amount - active.received);
    return (
      <div className="bfcl-detail">
        <header className="bfcl-form-header">
          <V2Button
            variant="back"
            size="md"
            onClick={() => {
              setMode('ledger');
              setActiveId(null);
            }}
          >
            返回列表
          </V2Button>
          <span className="bfcl-form-header__divider" />
          <div className="bfcl-form-header__title-wrap">
            <h1 className="bfcl-form-header__title">租赁账单明细</h1>
            <span className="bfcl-form-header__pill">{active.billNo}</span>
          </div>
          <div className="bfcl-form-header__actions">
            <V2Button
              variant="outline"
              size="md"
              onClick={() => {
                const received = active.received + (remain > 0 ? Math.max(1, Math.round(remain / 2)) : 0);
                const unreceived = Math.max(0, active.amount - received);
                const status: BillStatus = unreceived <= 0 ? '已结清' : '部分收款';
                patch({
                  ...active,
                  received,
                  unreceived,
                  status,
                  paymentDate: '2026-07-29',
                  paymentMethod: '对公转账',
                });
                showToast('已关联收款，账单状态回写');
              }}
            >
              关联收款
            </V2Button>
            <V2Button
              variant="primary"
              size="md"
              onClick={() => {
                if (active.status !== '已结清') {
                  showToast('门禁：未关联结清不得假性结清');
                  return;
                }
                showToast('账单业财闭环完成');
              }}
            >
              确认结清
            </V2Button>
          </div>
        </header>

        <section className="bfcl-context">
          <div>
            <span className="bfcl-muted">状态</span>
            <V2Badge status={badge(active.status)} label={active.status} />
          </div>
          <div>
            <span className="bfcl-muted">合同</span>
            <strong className="bfcl-mono">{active.contractNo}</strong>
          </div>
          <div>
            <span className="bfcl-muted">客户 / 车牌</span>
            <strong>
              {active.customer} · <span className="bfcl-mono">{active.plate}</span>
            </strong>
          </div>
          <div>
            <span className="bfcl-muted">账期</span>
            <strong>
              {active.period} · 第{active.periodNo}期
            </strong>
          </div>
        </section>

        <div
          className={`bfcl-callout ${active.status === '逾期' ? 'is-danger' : ''}`}
          data-annotation-id="bfcl-lb-grace"
        >
          宽限：{active.tier} {active.graceDays} 日（自生成日 {active.genDay} 起算）· 到期 {active.dueDate}
          {active.status === '逾期' ? ' · 已逾期，可联动应收催款' : ''}
        </div>

        <section className="bfcl-panel">
          <h2>合同与车辆（V1.2 台账字段）</h2>
          <dl className="bfcl-info-grid">
            <div>
              <dt>合同编码</dt>
              <dd className="bfcl-mono">{active.contractNo}</dd>
            </div>
            <div>
              <dt>合同类型</dt>
              <dd>{active.contractType}</dd>
            </div>
            <div>
              <dt>项目</dt>
              <dd>{active.projectName}</dd>
            </div>
            <div>
              <dt>客户</dt>
              <dd>{active.customer}</dd>
            </div>
            <div>
              <dt>车牌</dt>
              <dd className="bfcl-mono">{active.plate}</dd>
            </div>
            <div>
              <dt>提车日</dt>
              <dd>{active.pickupDate}</dd>
            </div>
            <div>
              <dt>合同起止</dt>
              <dd>
                {active.contractStart} ~ {active.contractEnd}
              </dd>
            </div>
            <div>
              <dt>业务</dt>
              <dd>
                {active.bizDept} · {active.owner}
              </dd>
            </div>
          </dl>
        </section>

        <section className="bfcl-panel" data-annotation-id="bfcl-lb-rule">
          <h2>账期与计费构成</h2>
          <p className="bfcl-muted" style={{ marginTop: 0 }}>
            按实际交车起算；12:00 后首日半天；首期至月底；二期起自然月；制度每月 25 日生成。本期平均天数{' '}
            {active.avgDays}。
          </p>
          <div className="bfcl-split-3">
            <div className="bfcl-stat">
              <span className="bfcl-stat__label">应收合计</span>
              <div className="bfcl-stat__value">¥{formatMoney(active.amount)}</div>
            </div>
            <div className="bfcl-stat">
              <span className="bfcl-stat__label">实收</span>
              <div className="bfcl-stat__value">¥{formatMoney(active.received)}</div>
            </div>
            <div className="bfcl-stat">
              <span className="bfcl-stat__label">未收</span>
              <div className={`bfcl-stat__value ${remain > 0 ? 'is-danger' : ''}`}>¥{formatMoney(remain)}</div>
            </div>
          </div>
          <table className="bfcl-table">
            <thead>
              <tr>
                <th>费用项</th>
                <th>金额</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>合同标的租金 / 应收租金</td>
                <td className="bfcl-mono">
                  ¥{formatMoney(active.contractRent)} / ¥{formatMoney(active.receivableRent)}
                </td>
                <td>合同反写</td>
              </tr>
              <tr>
                <td>保险上浮费</td>
                <td className="bfcl-mono">¥{formatMoney(active.insuranceSurcharge)}</td>
                <td>安全侧滚入</td>
              </tr>
              <tr>
                <td>运维费（客户承担）</td>
                <td className="bfcl-mono">¥{formatMoney(active.opsFee)}</td>
                <td>可滚下期</td>
              </tr>
              <tr>
                <td>其他收入</td>
                <td className="bfcl-mono">¥{formatMoney(active.otherIncome)}</td>
                <td>—</td>
              </tr>
              <tr>
                <td>减免</td>
                <td className="bfcl-mono">¥{formatMoney(active.discount)}</td>
                <td>里程减免等</td>
              </tr>
              <tr>
                <td>押金（合同）</td>
                <td className="bfcl-mono">¥{formatMoney(active.deposit)}</td>
                <td>展示不计入本期应收合计时可备注</td>
              </tr>
            </tbody>
          </table>
        </section>

        <div className="bfcl-split">
          <section className="bfcl-panel">
            <h2>收款 / 开票</h2>
            <dl className="bfcl-info-grid">
              <div>
                <dt>开票日期</dt>
                <dd>{active.invoiceDate}</dd>
              </div>
              <div>
                <dt>实际付款日</dt>
                <dd>{active.paymentDate}</dd>
              </div>
              <div>
                <dt>付款方式</dt>
                <dd>{active.paymentMethod}</dd>
              </div>
              <div>
                <dt>备注</dt>
                <dd>{active.remark || '—'}</dd>
              </div>
            </dl>
            <V2Button
              variant="secondary"
              size="md"
              onClick={() => {
                window.location.href = '/prototypes/bfcl-payment-hub/';
              }}
            >
              收付款中枢
            </V2Button>
          </section>
          <section className="bfcl-panel">
            <h2>成本对照（财务台账列）</h2>
            <div className="bfcl-row">
              <span>车辆成本</span>
              <span className="bfcl-mono">¥{formatMoney(active.vehicleCost)}</span>
            </div>
            <div className="bfcl-row">
              <span>氢费成本</span>
              <span className="bfcl-mono">¥{formatMoney(active.h2Cost)}</span>
            </div>
            <div className="bfcl-row">
              <span>示意盈亏（应收−成本）</span>
              <span className="bfcl-mono">¥{formatMoney(active.amount - active.vehicleCost - active.h2Cost)}</span>
            </div>
            <V2Button
              variant="ghost"
              size="md"
              onClick={() => {
                window.location.href = '/prototypes/receivable-dunning/';
              }}
            >
              打开应收催款
            </V2Button>
          </section>
        </div>
        {toast ? (
          <div className="bfcl-toast" role="status">
            {toast}
          </div>
        ) : null}
      </div>
    );
  }

  const filterToolbar = (
    <>
      <div className="bfcl-toolbar">
        <V2StatusTabs
          value={tab}
          onChange={(v) => {
            setTab(v);
            setPage(1);
          }}
          options={[
            { key: 'all', label: '全部', count: tabCounts.all },
            { key: '待收款', label: '待收款', count: tabCounts.待收款 },
            { key: '部分收款', label: '部分', count: tabCounts.部分收款 },
            { key: '逾期', label: '逾期', count: tabCounts.逾期 },
            { key: '已结清', label: '已结清', count: tabCounts.已结清 },
          ]}
        />
        <div className="bfcl-tools v2-filter-toolbar-tools">
          <V2FilterSearch aria-label="搜索合同或账单">
            <input
              type="text"
              placeholder="合同 / 账单号 / 客户 / 车牌 / 项目"
              value={draft.keyword}
              onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyQuery();
              }}
            />
          </V2FilterSearch>
          <V2FilterMoreButton
            open={moreOpen}
            activeCount={moreActiveCount(draft)}
            onClick={() => setMoreOpen((o) => !o)}
          />
          <V2Button variant="primary" size="md" icon={<Filter size={14} />} onClick={applyQuery}>
            查询
          </V2Button>
          <V2Button variant="secondary" size="md" icon={<RotateCcw size={14} />} onClick={resetFilters}>
            重置
          </V2Button>
        </div>
      </div>
      {moreOpen ? (
        <div className="bfcl-more">
          <div className="bfcl-field">
            <label>账期区间</label>
            <V2SingleInputDateRangePicker
              startDate={draft.periodStart}
              endDate={draft.periodEnd}
              onChange={(start, end) => setDraft((d) => ({ ...d, periodStart: start, periodEnd: end }))}
              placeholder="账单起止日期"
            />
          </div>
          <div className="bfcl-field">
            <label>合同类型</label>
            <V2Select
              value={draft.contractType}
              onChange={(v) => setDraft((d) => ({ ...d, contractType: v }))}
              options={[
                { value: 'all', label: '全部' },
                { value: '正式合同', label: '正式合同' },
                { value: '框架协议', label: '框架协议' },
              ]}
            />
          </div>
          <div className="bfcl-field">
            <label>客户分级</label>
            <V2Select
              value={draft.tier}
              onChange={(v) => setDraft((d) => ({ ...d, tier: v as Tier | 'all' }))}
              options={[
                { value: 'all', label: '全部' },
                { value: 'KA', label: 'KA' },
                { value: 'LA', label: 'LA' },
                { value: 'SMB', label: 'SMB' },
              ]}
            />
          </div>
          <div className="bfcl-field">
            <label>业务部门</label>
            <V2Select
              value={draft.bizDept}
              onChange={(v) => setDraft((d) => ({ ...d, bizDept: v }))}
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
    </>
  );

  const billSubTable = (bills: BillRow[]) => (
    <table className="bfcl-nested">
      <thead>
        <tr>
          <th>账单号</th>
          <th>账期</th>
          <th>应收合计</th>
          <th>租金</th>
          <th>上浮/运维</th>
          <th>实收</th>
          <th>未收</th>
          <th>宽限</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {bills.map((r) => (
          <tr key={r.id}>
            <td>
              <div className="bfcl-primary bfcl-mono">{r.billNo}</div>
              <div className="bfcl-muted">第{r.periodNo}期</div>
            </td>
            <td>
              {r.period}
              <div className="bfcl-muted">
                {r.billStart}~{r.billEnd}
              </div>
            </td>
            <td className="bfcl-mono">¥{formatMoney(r.amount)}</td>
            <td className="bfcl-mono">¥{formatMoney(r.receivableRent)}</td>
            <td className="bfcl-mono">¥{formatMoney(r.insuranceSurcharge + r.opsFee)}</td>
            <td className="bfcl-mono">¥{formatMoney(r.received)}</td>
            <td className={`bfcl-mono ${r.unreceived > 0 ? 'is-danger' : ''}`}>¥{formatMoney(r.unreceived)}</td>
            <td>
              {r.tier}/{r.graceDays}日
            </td>
            <td>
              <V2Badge status={badge(r.status)} label={r.status} />
            </td>
            <td>
              <OperationActions
                process={{ label: '关联', onClick: () => openDetail(r.id) }}
                more={[
                  { key: 'detail', label: '明细', onClick: () => openDetail(r.id) },
                ]}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="bfcl-page">
      <div className="bfcl-viewbar">
        <V2SegmentedControl
          value={viewMode}
          onChange={(v) => setViewMode(v)}
          options={[
            { key: 'list', label: '列表模式', icon: <List size={14} /> },
            { key: 'kanban', label: '看板模式', icon: <LayoutGrid size={14} /> },
            { key: 'split', label: '主从工作台', icon: <Columns size={14} /> },
          ]}
        />
      </div>

      {viewMode !== 'split' ? (
        <div className="bfcl-kpi">
          {kpi.map((k) => (
            <button
              key={k.label}
              type="button"
              className="bfcl-kpi__card"
              onClick={() => {
                if (k.tab) {
                  setTab(k.tab);
                  setPage(1);
                  setViewMode('list');
                }
              }}
            >
              <span className="bfcl-kpi__label">{k.label}</span>
              <strong className="bfcl-kpi__value">{k.value}</strong>
              <span className="bfcl-kpi__sub">{k.sub}</span>
            </button>
          ))}
        </div>
      ) : null}

      {viewMode === 'list' ? (
        <div className="bfcl-shell">
          {filterToolbar}
          {pageRows.length === 0 ? (
            <V2Empty type="no_search" title="无匹配合同/账单" description="调整筛选或按合同号检索" />
          ) : (
            <div className="bfcl-table-wrap">
              <table className="bfcl-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }} />
                    <th>合同编码</th>
                    <th>项目 / 客户</th>
                    <th>车牌</th>
                    <th>合同起止</th>
                    <th>业务</th>
                    <th>账单期数</th>
                    <th>应收 / 未收</th>
                    <th>合同风险态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((c) => {
                    const open = expanded.includes(c.contractNo);
                    return (
                      <React.Fragment key={c.contractNo}>
                        <tr className="is-expandable" onClick={() => toggleExpand(c.contractNo)}>
                          <td>{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</td>
                          <td>
                            <div className="bfcl-primary bfcl-mono">{c.contractNo}</div>
                            <div className="bfcl-muted">{c.contractType}</div>
                          </td>
                          <td>
                            <div className="bfcl-primary">{c.projectName}</div>
                            <div className="bfcl-muted">{c.customer}</div>
                          </td>
                          <td className="bfcl-mono">{c.plate}</td>
                          <td>
                            <div>{c.contractStart}</div>
                            <div className="bfcl-muted">~ {c.contractEnd}</div>
                          </td>
                          <td>
                            <div>{c.bizDept}</div>
                            <div className="bfcl-muted">{c.owner}</div>
                          </td>
                          <td>
                            <div className="bfcl-tag-row">
                              <V2Badge status="processing" label={`${c.billCount} 期`} />
                              <span className="bfcl-muted">
                                {c.tier}/{c.graceDays}日
                              </span>
                            </div>
                          </td>
                          <td className="bfcl-mono">
                            ¥{formatMoney(c.amountTotal)}
                            <div className={`bfcl-muted ${c.unreceivedTotal > 0 ? 'is-danger' : ''}`}>
                              未收 ¥{formatMoney(c.unreceivedTotal)}
                            </div>
                          </td>
                          <td>
                            <V2Badge status={badge(c.worstStatus)} label={c.worstStatus} />
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <OperationActions
                              process={{
                                label: '工作台',
                                onClick: () => {
                                  setSplitContractNo(c.contractNo);
                                  setViewMode('split');
                                },
                              }}
                            />
                          </td>
                        </tr>
                        {open ? (
                          <tr className="is-child">
                            <td colSpan={10}>{billSubTable(c.bills)}</td>
                          </tr>
                        ) : null}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="bfcl-pager">
            <V2Pagination
              total={filteredMasters.length}
              page={page}
              pageSize={pageSize}
              onChange={(p, ps) => {
                setPage(p);
                setPageSize(ps);
              }}
            />
          </div>
        </div>
      ) : null}

      {viewMode === 'kanban' ? (
        <div className="bfcl-shell bfcl-shell--flush">
          {filterToolbar}
          <div className="bfcl-kanban">
            {(
              [
                { key: '待收款' as const, title: '待收款', color: 'var(--ln-info, #3B82F6)' },
                { key: '部分收款' as const, title: '部分收款', color: 'var(--ln-warning, #D97706)' },
                { key: '逾期' as const, title: '逾期', color: 'var(--ln-error, #EF4444)' },
                { key: '已结清' as const, title: '已结清', color: 'var(--ln-success, #10B981)' },
              ] as const
            ).map((col) => {
              const colBills =
                tab !== 'all' && tab !== col.key
                  ? []
                  : filteredBills.filter((r) => r.status === col.key);
              return (
                <div key={col.key} className="bfcl-kanban__col">
                  <div className="bfcl-kanban__head">
                    <span>
                      <i className="bfcl-kanban__dot" style={{ background: col.color }} />
                      {col.title}
                    </span>
                    <span className="bfcl-kanban__count">{colBills.length}</span>
                  </div>
                  <div className="bfcl-kanban__list">
                    {colBills.length === 0 ? (
                      <div className="bfcl-muted" style={{ padding: 12 }}>
                        暂无账单
                      </div>
                    ) : (
                      colBills.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          className="bfcl-kanban__card"
                          onClick={() => {
                            setSplitContractNo(r.contractNo);
                            setViewMode('split');
                          }}
                        >
                          <div className="bfcl-kanban__card-top">
                            <span className="bfcl-mono bfcl-kanban__code">{r.billNo}</span>
                            <span className="bfcl-muted">第{r.periodNo}期</span>
                          </div>
                          <div className="bfcl-primary">{r.customer}</div>
                          <div className="bfcl-muted bfcl-mono">
                            {r.contractNo} · {r.plate}
                          </div>
                          <div className="bfcl-kanban__amt">
                            未收{' '}
                            <strong className={r.unreceived > 0 ? 'is-danger' : ''}>
                              ¥{formatMoney(r.unreceived)}
                            </strong>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {viewMode === 'split' ? (
        <div className="bfcl-split-view">
          <aside className="bfcl-split-view__side">
            <div className="bfcl-split-view__search">
              <V2FilterSearch aria-label="搜索合同">
                <input
                  type="text"
                  placeholder="合同 / 客户 / 车牌"
                  value={draft.keyword}
                  onChange={(e) => {
                    const keyword = e.target.value;
                    setDraft((d) => ({ ...d, keyword }));
                    setFilters((f) => ({ ...f, keyword }));
                  }}
                />
              </V2FilterSearch>
            </div>
            <div className="bfcl-split-view__list">
              {filteredMasters.length === 0 ? (
                <V2Empty type="no_search" title="无匹配合同" description="调整关键词" />
              ) : (
                filteredMasters.map((c) => {
                  const on = splitMaster?.contractNo === c.contractNo;
                  return (
                    <button
                      key={c.contractNo}
                      type="button"
                      className={`bfcl-split-view__item${on ? ' is-on' : ''}`}
                      onClick={() => setSplitContractNo(c.contractNo)}
                    >
                      <div className="bfcl-split-view__item-top">
                        <span className="bfcl-mono">{c.contractNo}</span>
                        <V2Badge status={badge(c.worstStatus)} label={c.worstStatus} />
                      </div>
                      <div className="bfcl-primary">{c.projectName}</div>
                      <div className="bfcl-muted">
                        {c.customer} · {c.billCount} 期
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>
          <div className="bfcl-split-view__main">
            {!splitMaster ? (
              <V2Empty type="empty" title="请选择合同" description="左侧点选合同查看全部期账单" />
            ) : (
              <>
                <header className="bfcl-split-view__header">
                  <div>
                    <h2 className="bfcl-split-view__title">{splitMaster.projectName}</h2>
                    <div className="bfcl-muted">
                      <span className="bfcl-mono">{splitMaster.contractNo}</span> · {splitMaster.customer} ·{' '}
                      <span className="bfcl-mono">{splitMaster.plate}</span>
                    </div>
                  </div>
                  <div className="bfcl-tag-row">
                    <V2Badge status={badge(splitMaster.worstStatus)} label={splitMaster.worstStatus} />
                    <V2Badge status="processing" label={`${splitMaster.billCount} 期账单`} />
                  </div>
                </header>
                <div className="bfcl-split-3" style={{ marginBottom: 16 }}>
                  <div className="bfcl-stat">
                    <span className="bfcl-stat__label">合同应收合计</span>
                    <div className="bfcl-stat__value">¥{formatMoney(splitMaster.amountTotal)}</div>
                  </div>
                  <div className="bfcl-stat">
                    <span className="bfcl-stat__label">实收</span>
                    <div className="bfcl-stat__value">¥{formatMoney(splitMaster.receivedTotal)}</div>
                  </div>
                  <div className="bfcl-stat">
                    <span className="bfcl-stat__label">未收</span>
                    <div
                      className={`bfcl-stat__value ${splitMaster.unreceivedTotal > 0 ? 'is-danger' : ''}`}
                    >
                      ¥{formatMoney(splitMaster.unreceivedTotal)}
                    </div>
                  </div>
                </div>
                <section className="bfcl-panel" style={{ marginBottom: 0 }}>
                  <h2>各期账单</h2>
                  {billSubTable(splitMaster.bills)}
                </section>
              </>
            )}
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="bfcl-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
