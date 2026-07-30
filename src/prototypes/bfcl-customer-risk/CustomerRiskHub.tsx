import React, { useMemo, useState } from 'react';
import { BfclChainNav } from '../bfcl-shared-chain/BfclChainNav';
import '../bfcl-shared-chain/bfcl-chain-nav.css';
import { Filter, RotateCcw, ShieldAlert } from 'lucide-react';
import { DetailEntryLink } from '../../common/DetailEntryLink';
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
import { MOCK_CUSTOMERS } from './mockData';
import type { CoopStatus, CustomerRisk, CustomerTier, Filters, PageMode, RiskLevel } from './types';

const riskBadge = (s: RiskLevel): V2BadgeStatus => {
  if (s === '高风险') return 'error';
  if (s === '关注') return 'warning';
  return 'success';
};

export function CustomerRiskHub() {
  const [rows, setRows] = useState<CustomerRisk[]>(MOCK_CUSTOMERS);
  const [pageMode, setPageMode] = useState<PageMode>('ledger');
  const [riskTab, setRiskTab] = useState<RiskLevel | 'all'>('all');
  const [filters, setFilters] = useState<Filters>({ keyword: '', tier: 'all', risk: 'all', coop: 'all' });
  const [draft, setDraft] = useState(filters);
  const [moreOpen, setMoreOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (riskTab !== 'all' && r.riskLevel !== riskTab) return false;
      if (filters.tier !== 'all' && r.tier !== filters.tier) return false;
      if (filters.risk !== 'all' && r.riskLevel !== filters.risk) return false;
      if (filters.coop !== 'all' && r.coopStatus !== filters.coop) return false;
      if (filters.keyword) {
        const q = filters.keyword.trim().toLowerCase();
        const hay = [r.name, r.id, r.code, r.owner, r.city, r.contact, r.creditCode].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filters, riskTab]);

  const kpi = useMemo(() => {
    const high = rows.filter((r) => r.riskLevel === '高风险' || r.redline).length;
    const watch = rows.filter((r) => r.riskLevel === '关注').length;
    const ka = rows.filter((r) => r.tier === 'KA').length;
    const overdue = rows.filter((r) => r.overdueDays > 0).length;
    return [
      { key: 'high', label: '高风险/触红线', value: String(high), tab: '高风险' as const },
      { key: 'watch', label: '关注客户', value: String(watch), tab: '关注' as const },
      { key: 'ka', label: 'KA 客户', value: String(ka), tab: null },
      { key: 'od', label: '有逾期天数', value: String(overdue), tab: null },
    ];
  }, [rows]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const active = rows.find((r) => r.id === activeId) ?? null;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  const applyFilters = () => {
    setFilters(draft);
    setMoreOpen(false);
    setPage(1);
  };

  const resetFilters = () => {
    const empty: Filters = { keyword: '', tier: 'all', risk: 'all', coop: 'all' };
    setDraft(empty);
    setFilters(empty);
    setRiskTab('all');
    setMoreOpen(false);
    setPage(1);
  };

  const openDetail = (id: string) => {
    setActiveId(id);
    setPageMode('detail');
  };

  const requestSpecial = () => {
    if (!active) return;
    if (!active.redline && active.composite >= 10) {
      showToast('当前未触发红线且综合分≥10，可走标准新签');
      return;
    }
    showToast('已发起新签特殊审批（通知法务/安全/财务/业管）');
  };

  const forceReturn = () => {
    if (!active) return;
    if (!active.redline && active.composite >= 10) {
      showToast('未达强制收车条件（需触红线或综合分＜10）');
      return;
    }
    showToast('已发起强制收车流程（标准合同条款待会上拍板）');
  };

  if (pageMode === 'detail' && active) {
    return (
      <div className="bfcl-risk bfcl-risk-detail">
        <header className="bfcl-risk-form-header">
          <V2Button
            variant="back"
            size="sm"
            onClick={() => {
              setPageMode('ledger');
              setActiveId(null);
            }}
          >
            返回列表
          </V2Button>
          <span className="bfcl-risk-form-header__divider" />
          <div className="bfcl-risk-form-header__title-wrap">
            <h1 className="bfcl-risk-form-header__title">客户风险评估</h1>
            <span className="bfcl-risk-form-header__pill">{active.id}</span>
          </div>
          <div className="bfcl-risk-form-header__actions">
            <V2Button variant="secondary" size="sm" onClick={requestSpecial}>
              新签特批
            </V2Button>
            <V2Button
              variant="secondary"
              size="sm"
              style={{ color: 'var(--ln-error, #EF4444)', borderColor: 'var(--ln-error, #EF4444)' }}
              onClick={forceReturn}
            >
              强制收车
            </V2Button>
          </div>
        </header>

        <section className="bfcl-risk-context" data-annotation-id="bfcl-risk-context">
          <div>
            <span className="bfcl-risk-muted">客户 / 编码</span>
            <strong>{active.name}</strong>
            <span className="bfcl-risk-muted">{active.code}</span>
          </div>
          <div>
            <span className="bfcl-risk-muted">分级 / 宽限</span>
            <strong>
              {active.tier} · {active.graceDays} 日
            </strong>
          </div>
          <div>
            <span className="bfcl-risk-muted">综合分</span>
            <strong className={active.composite < 10 ? 'is-danger' : ''}>{active.composite}</strong>
          </div>
          <div>
            <span className="bfcl-risk-muted">风险</span>
            <V2Badge status={riskBadge(active.riskLevel)} label={active.riskLevel} />
            {active.redline ? <V2Badge status="error" label="触红线" /> : null}
          </div>
        </section>

        <section className="bfcl-risk-panel" style={{ marginBottom: 16 }}>
          <h2>客户主数据（对照 V1.2 客户管理）</h2>
          <ul>
            <li>合作状态：{active.coopStatus} · 区域 {active.region}/{active.city}</li>
            <li>信用代码：{active.creditCode}</li>
            <li>联系人：{active.contact} · {active.mobile}</li>
            <li>地址：{active.address}</li>
            <li>业务：{active.bizDept} · {active.owner} · 在营车辆 {active.vehicleCount} 台</li>
          </ul>
        </section>

        <div className="bfcl-risk-score-grid" data-annotation-id="bfcl-risk-scores">
          <article className="bfcl-risk-score-card">
            <h2>法务 · 法律风险</h2>
            <p className="bfcl-risk-score-num">{active.legalScore}</p>
            <p className="bfcl-risk-muted">每 3 个月系统自动生成评估</p>
          </article>
          <article className="bfcl-risk-score-card">
            <h2>安全 · 安全评分</h2>
            <p className="bfcl-risk-score-num">{active.safetyScore}</p>
            <p className="bfcl-risk-muted">按违规自动计算</p>
          </article>
          <article className="bfcl-risk-score-card">
            <h2>财务 · 账务评分</h2>
            <p className="bfcl-risk-score-num">{active.financeScore}</p>
            <p className="bfcl-risk-muted">按逾期自动计算</p>
          </article>
        </div>

        <section className="bfcl-risk-panel">
          <h2>
            <ShieldAlert size={16} /> 业务影响
          </h2>
          <ul>
            <li>账单宽限自生成日（通常每月 25 日）起算：KA 15 / LA 10 / SMB 6 日。</li>
            <li>综合分＜10 或触红线：新签可走特殊审批；在途合同风险预警通知法务/安全/财务/业务业管。</li>
            <li>可终止合作并强制收车——标准合同条款与最终解释权待会上拍板。</li>
            <li>
              当前在途合同 {active.contractsInFlight} 份 · 逾期天数 {active.overdueDays} · 运营车辆{' '}
              {active.vehicleCount} 台。
            </li>
          </ul>
          <div className="bfcl-risk-panel__actions">
            <V2Button
              variant="outline"
              size="sm"
              onClick={() => {
                showToast('已模拟推送预警（短信/邮件/微信）');
              }}
            >
              发送风险预警
            </V2Button>
            <V2Button
              variant="primary"
              size="sm"
              onClick={() => {
                setRows((list) =>
                  list.map((r) =>
                    r.id === active.id
                      ? {
                          ...r,
                          riskLevel: '高风险',
                          redline: true,
                          composite: Math.min(r.composite, 9),
                        }
                      : r,
                  ),
                );
                showToast('已标记高风险触红线（演示）');
              }}
            >
              模拟触红线
            </V2Button>
          </div>
        </section>
        {toast ? <div className="bfcl-risk-toast" role="status">{toast}</div> : null}
      </div>
    );
  }

  return (
    <div className="bfcl-risk">
      <div className="bfcl-risk-toolbar">
        <V2StatusTabs
          value={riskTab}
          onChange={(v) => {
            setRiskTab(v);
            setPage(1);
          }}
          options={[
            { key: 'all', label: '全部' },
            { key: '正常', label: '正常' },
            { key: '关注', label: '关注' },
            { key: '高风险', label: '高风险' },
          ]}
        />
      </div>

      <div className="bfcl-risk-kpi">
        {kpi.map((k) => (
          <button
            key={k.key}
            type="button"
            className="bfcl-risk-kpi__card"
            onClick={() => {
              if (!k.tab) return;
              setRiskTab(k.tab);
              setPage(1);
            }}
          >
            <span className="bfcl-risk-kpi__label">{k.label}</span>
            <strong className="bfcl-risk-kpi__value">{k.value}</strong>
          </button>
        ))}
      </div>

      <div className={`bfcl-risk-shell ${moreOpen ? 'is-expanded' : ''}`}>
        <div className="bfcl-risk-tools v2-filter-toolbar-tools">
          <V2FilterSearch aria-label="搜索客户">
            <input
              type="text"
              placeholder="客户 / 编号 / 负责人"
              value={draft.keyword}
              onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters();
              }}
            />
          </V2FilterSearch>
          <V2FilterMoreButton
            open={moreOpen}
            activeCount={(draft.tier !== 'all' ? 1 : 0) + (draft.risk !== 'all' ? 1 : 0) + (draft.coop !== 'all' ? 1 : 0)}
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
          <div className="bfcl-risk-more">
            <div className="bfcl-risk-field">
              <label>客户分级</label>
              <V2Select
                value={draft.tier}
                onChange={(v) => setDraft((d) => ({ ...d, tier: v as CustomerTier | 'all' }))}
                options={[
                  { value: 'all', label: '全部' },
                  { value: 'KA', label: 'KA（宽限15日）' },
                  { value: 'LA', label: 'LA（宽限10日）' },
                  { value: 'SMB', label: 'SMB（宽限6日）' },
                ]}
              />
            </div>
            <div className="bfcl-risk-field">
              <label>风险等级</label>
              <V2Select
                value={draft.risk}
                onChange={(v) => setDraft((d) => ({ ...d, risk: v as RiskLevel | 'all' }))}
                options={[
                  { value: 'all', label: '全部' },
                  { value: '正常', label: '正常' },
                  { value: '关注', label: '关注' },
                  { value: '高风险', label: '高风险' },
                ]}
              />
            </div>
            <div className="bfcl-risk-field">
              <label>合作状态</label>
              <V2Select
                value={draft.coop}
                onChange={(v) => setDraft((d) => ({ ...d, coop: v as CoopStatus | 'all' }))}
                options={[
                  { value: 'all', label: '全部' },
                  { value: '已合作', label: '已合作' },
                  { value: '洽谈中', label: '洽谈中' },
                  { value: '终止合作', label: '终止合作' },
                  { value: '合约过期', label: '合约过期' },
                ]}
              />
            </div>
          </div>
        ) : null}

        <div className="bfcl-risk-table-wrap">
          {pageRows.length === 0 ? (
            <V2Empty type="empty" title="无匹配客户" description="调整分级或风险筛选" />
          ) : (
            <table className="bfcl-risk-table">
              <thead>
                <tr>
                  <th>客户</th>
                  <th>合作 / 城市</th>
                  <th>分级</th>
                  <th>宽限</th>
                  <th>法务</th>
                  <th>安全</th>
                  <th>财务</th>
                  <th>综合分</th>
                  <th>风险</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <DetailEntryLink
                        variant="title"
                        ariaLabel={`${r.name}，点击进入客户风险评估详情`}
                        onClick={() => openDetail(r.id)}
                      >
                        {r.name}
                      </DetailEntryLink>
                      <div className="bfcl-risk-muted bfcl-risk-mono">
                        {r.code} · {r.owner}
                      </div>
                    </td>
                    <td>
                      <div>{r.coopStatus}</div>
                      <div className="bfcl-risk-muted">{r.city}</div>
                    </td>
                    <td>{r.tier}</td>
                    <td>{r.graceDays} 日</td>
                    <td>{r.legalScore}</td>
                    <td>{r.safetyScore}</td>
                    <td>{r.financeScore}</td>
                    <td className={r.composite < 10 ? 'is-danger' : ''}>{r.composite}</td>
                    <td>
                      <V2Badge status={riskBadge(r.riskLevel)} label={r.riskLevel} />
                      {r.redline ? (
                        <>
                          {' '}
                          <V2Badge status="error" label="红线" />
                        </>
                      ) : null}
                    </td>
                    <td>
                      <OperationActions
                        view={{ label: '评估详情', onClick: () => openDetail(r.id) }}
                        process={{
                          label: '预警',
                          onClick: () => {
                            openDetail(r.id);
                            window.setTimeout(() => showToast('已打开详情，可发送预警'), 100);
                          },
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bfcl-risk-pager">
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
      {toast ? <div className="bfcl-risk-toast" role="status">{toast}</div> : null}
    </div>
  );
}
