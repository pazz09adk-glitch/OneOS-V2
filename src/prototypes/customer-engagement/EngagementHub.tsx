import React, { useMemo, useState } from 'react';
import { Filter, RotateCcw, UserPlus } from 'lucide-react';
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
import { MOCK_ENGAGEMENTS, OCCUPIED_SAMPLE } from './mockData';
import {
  CURRENT_USER,
  type AdmissionStatus,
  type EngagementOrder,
  type EngagementStatus,
  type Filters,
  type PageMode,
  type StatusTab,
} from './types';

const statusBadge = (s: EngagementStatus): V2BadgeStatus => {
  if (s === '已转化') return 'success';
  if (s === '跟进中' || s === '待准入') return 'processing';
  if (s === '转让审批中') return 'warning';
  if (s === '失败') return 'error';
  return 'default';
};

const admissionBadge = (a: AdmissionStatus): V2BadgeStatus => {
  if (a === '标准' || a === '非标') return 'success';
  if (a === '禁止') return 'error';
  if (a === '评级中') return 'warning';
  return 'default';
};

const ACTIVE_STATUSES: EngagementStatus[] = ['跟进中', '待准入', '转让审批中'];

function daysUntil(dateStr: string): number {
  const end = new Date(`${dateStr}T23:59:59`).getTime();
  return Math.ceil((end - Date.now()) / (24 * 3600 * 1000));
}

export function EngagementHub() {
  const [rows, setRows] = useState<EngagementOrder[]>(MOCK_ENGAGEMENTS);
  const [pageMode, setPageMode] = useState<PageMode>('ledger');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [filters, setFilters] = useState<Filters>({ keyword: '', region: 'all', protect: 'all' });
  const [draft, setDraft] = useState(filters);
  const [moreOpen, setMoreOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [claimName, setClaimName] = useState('');
  const [claimCode, setClaimCode] = useState('');
  const [followText, setFollowText] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const tabCounts = useMemo(() => {
    const all = rows.length;
    const by = (s: EngagementStatus) => rows.filter((r) => r.status === s).length;
    return {
      all,
      跟进中: by('跟进中'),
      待准入: by('待准入'),
      已转化: by('已转化'),
      已释放: by('已释放'),
      失败: by('失败'),
      转让审批中: by('转让审批中'),
    };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusTab !== 'all' && r.status !== statusTab) return false;
      if (filters.region !== 'all' && r.region !== filters.region) return false;
      if (filters.protect === 'expiring') {
        const d = daysUntil(r.protectUntil);
        if (!(ACTIVE_STATUSES.includes(r.status) && d >= 0 && d <= 7)) return false;
      }
      if (filters.protect === 'ok') {
        if (!(ACTIVE_STATUSES.includes(r.status) && daysUntil(r.protectUntil) > 7)) return false;
      }
      if (filters.keyword) {
        const q = filters.keyword.trim().toLowerCase();
        const hay = [r.id, r.customerName, r.creditCode, r.owner, r.city].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filters, statusTab]);

  const kpi = useMemo(() => {
    const mine = rows.filter((r) => r.owner === CURRENT_USER && ACTIVE_STATUSES.includes(r.status)).length;
    const expiring = rows.filter(
      (r) => ACTIVE_STATUSES.includes(r.status) && daysUntil(r.protectUntil) >= 0 && daysUntil(r.protectUntil) <= 7,
    ).length;
    const pendingAdmit = rows.filter((r) => r.status === '待准入').length;
    const converted = rows.filter((r) => r.status === '已转化').length;
    return [
      { key: 'mine', label: '我的有效对接', value: String(mine), tab: '跟进中' as StatusTab },
      { key: 'exp', label: '7日内到期', value: String(expiring), tab: null },
      { key: 'adm', label: '待准入', value: String(pendingAdmit), tab: '待准入' as StatusTab },
      { key: 'ok', label: '已转化', value: String(converted), tab: '已转化' as StatusTab },
    ];
  }, [rows]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const active = rows.find((r) => r.id === activeId) ?? null;
  const isOwner = active ? active.owner === CURRENT_USER : false;
  const canAct =
    isOwner && active && (active.status === '跟进中' || active.status === '待准入');

  const applyFilters = () => {
    setFilters(draft);
    setMoreOpen(false);
    setPage(1);
  };

  const resetFilters = () => {
    const empty: Filters = { keyword: '', region: 'all', protect: 'all' };
    setDraft(empty);
    setFilters(empty);
    setStatusTab('all');
    setMoreOpen(false);
    setPage(1);
  };

  const openDetail = (id: string) => {
    setActiveId(id);
    setPageMode('detail');
    setFollowText('');
  };

  const submitClaim = () => {
    const name = claimName.trim();
    const code = claimCode.trim().toUpperCase();
    if (!name || !code) {
      showToast('请填写客户名称与统一社会信用代码');
      return;
    }
    const occupied = rows.find(
      (r) => r.creditCode.toUpperCase() === code && ACTIVE_STATUSES.includes(r.status),
    );
    if (occupied) {
      showToast(
        `撞单拦截：该主体已被 ${occupied.owner} 独占（${occupied.id}，保护至 ${occupied.protectUntil}）`,
      );
      return;
    }
    if (code === OCCUPIED_SAMPLE.creditCode) {
      showToast(
        `撞单拦截：该主体已被 ${OCCUPIED_SAMPLE.owner} 独占（${OCCUPIED_SAMPLE.orderId}，保护至 ${OCCUPIED_SAMPLE.protectUntil}）`,
      );
      return;
    }
    const id = `DJ${Date.now().toString().slice(-10)}`;
    const protect = new Date();
    protect.setDate(protect.getDate() + 30);
    const protectUntil = protect.toISOString().slice(0, 10);
    const next: EngagementOrder = {
      id,
      customerName: name,
      creditCode: code,
      region: '华东',
      city: '待补充',
      owner: CURRENT_USER,
      status: '跟进中',
      admission: '未准入',
      protectUntil,
      claimedAt: new Date().toISOString().slice(0, 10),
      intentVehicles: 0,
      followUps: [
        {
          id: `f-${id}`,
          at: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: CURRENT_USER,
          kind: '其他',
          content: '认领成功，进入跟进中（保护期 30 日）。',
        },
      ],
    };
    setRows((list) => [next, ...list]);
    setClaimName('');
    setClaimCode('');
    setActiveId(id);
    setPageMode('detail');
    showToast('认领成功，已生成对接单');
  };

  const addFollowUp = () => {
    if (!active || !canAct) {
      showToast(isOwner ? '当前状态不可写跟进' : '仅主对接人可写跟进');
      return;
    }
    const text = followText.trim();
    if (!text) {
      showToast('请填写跟进内容');
      return;
    }
    setRows((list) =>
      list.map((r) =>
        r.id === active.id
          ? {
              ...r,
              followUps: [
                {
                  id: `f-${Date.now()}`,
                  at: new Date().toISOString().replace('T', ' ').slice(0, 16),
                  author: CURRENT_USER,
                  kind: '拜访',
                  content: text,
                },
                ...r.followUps,
              ],
            }
          : r,
      ),
    );
    setFollowText('');
    showToast('已登记跟进');
  };

  const urgeAdmission = () => {
    if (!active || !canAct) {
      showToast(isOwner ? '当前状态不可催准入' : '仅主对接人可催准入');
      return;
    }
    setRows((list) =>
      list.map((r) =>
        r.id === active.id
          ? {
              ...r,
              status: '待准入',
              admission: '评级中',
              followUps: [
                {
                  id: `f-${Date.now()}`,
                  at: new Date().toISOString().replace('T', ' ').slice(0, 16),
                  author: CURRENT_USER,
                  kind: '其他',
                  content: '已催办客户准入（法务/财务/安全）。',
                },
                ...r.followUps,
              ],
            }
          : r,
      ),
    );
    showToast('已催办准入，状态更新为待准入');
  };

  const simulateAdmission = (result: AdmissionStatus) => {
    if (!active || !isOwner) {
      showToast('仅主对接人可演示准入回写');
      return;
    }
    if (result === '禁止') {
      setRows((list) =>
        list.map((r) =>
          r.id === active.id
            ? {
                ...r,
                admission: '禁止',
                status: '失败',
                followUps: [
                  {
                    id: `f-${Date.now()}`,
                    at: new Date().toISOString().replace('T', ' ').slice(0, 16),
                    author: '系统',
                    kind: '其他',
                    content: '准入结论禁止签约，对接单关闭为失败。',
                  },
                  ...r.followUps,
                ],
              }
            : r,
        ),
      );
      showToast('准入禁止：对接单已失败关闭');
      return;
    }
    setRows((list) =>
      list.map((r) =>
        r.id === active.id
          ? {
              ...r,
              admission: result,
              status: '跟进中',
              followUps: [
                {
                  id: `f-${Date.now()}`,
                  at: new Date().toISOString().replace('T', ' ').slice(0, 16),
                  author: '系统',
                  kind: '其他',
                  content: `准入结论：${result}，可发起租赁合同。`,
                },
                ...r.followUps,
              ],
            }
          : r,
      ),
    );
    showToast(`准入回写：${result}`);
  };

  const tryCreateContract = () => {
    if (!active) return;
    if (!isOwner) {
      showToast(`门禁拦截：仅主对接人可建合同（当前归属 ${active.owner}）`);
      return;
    }
    if (!ACTIVE_STATUSES.includes(active.status) && active.status !== '跟进中') {
      if (active.status === '已转化') {
        showToast('该对接单已转化，请到租赁合同查看');
        return;
      }
      if (active.status === '已释放' || active.status === '失败') {
        showToast('对接已失效，请重新认领');
        return;
      }
    }
    if (active.status === '转让审批中') {
      showToast('转让审批中，暂不可建合同');
      return;
    }
    if (active.admission !== '标准' && active.admission !== '非标') {
      showToast(`门禁拦截：准入未通过（当前 ${active.admission}），可先催办准入`);
      return;
    }
    const contractNo = `ZL${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(
      Math.floor(Math.random() * 90 + 10),
    )}`;
    setRows((list) =>
      list.map((r) =>
        r.id === active.id
          ? {
              ...r,
              status: '已转化',
              contractNo,
              followUps: [
                {
                  id: `f-${Date.now()}`,
                  at: new Date().toISOString().replace('T', ' ').slice(0, 16),
                  author: CURRENT_USER,
                  kind: '其他',
                  content: `演示：合同 ${contractNo} 生效，对接单已转化，业绩归属快照为 ${CURRENT_USER}。`,
                },
                ...r.followUps,
              ],
            }
          : r,
      ),
    );
    showToast(`建合同门禁通过，已演示转化（${contractNo}）`);
  };

  const approveTransfer = () => {
    if (!active || active.status !== '转让审批中') return;
    const nextOwner = active.collaborator || '赵敏';
    setRows((list) =>
      list.map((r) =>
        r.id === active.id
          ? {
              ...r,
              owner: nextOwner,
              collaborator: undefined,
              status: '跟进中',
              followUps: [
                {
                  id: `f-${Date.now()}`,
                  at: new Date().toISOString().replace('T', ' ').slice(0, 16),
                  author: '主管',
                  kind: '其他',
                  content: `转让审批通过，主对接人变更为 ${nextOwner}。`,
                },
                ...r.followUps,
              ],
            }
          : r,
      ),
    );
    showToast(`转让已通过，归属 → ${nextOwner}`);
  };

  const releaseNow = () => {
    if (!active || !isOwner) {
      showToast('仅主对接人可主动释放');
      return;
    }
    if (!ACTIVE_STATUSES.includes(active.status) && active.status !== '跟进中') {
      showToast('当前状态不可释放');
      return;
    }
    setRows((list) =>
      list.map((r) =>
        r.id === active.id
          ? {
              ...r,
              status: '已释放',
              followUps: [
                {
                  id: `f-${Date.now()}`,
                  at: new Date().toISOString().replace('T', ' ').slice(0, 16),
                  author: CURRENT_USER,
                  kind: '其他',
                  content: '主动放弃对接，已释放，可被他人再认领。',
                },
                ...r.followUps,
              ],
            }
          : r,
      ),
    );
    showToast('已释放对接');
  };

  if (pageMode === 'claim') {
    return (
      <div className="ce ce-detail">
        <header className="ce-form-header">
          <V2Button variant="back" size="sm" onClick={() => setPageMode('ledger')}>
            返回列表
          </V2Button>
          <span className="ce-form-header__divider" />
          <div className="ce-form-header__title-wrap">
            <h1 className="ce-form-header__title">新建对接认领</h1>
          </div>
          <div className="ce-form-header__actions">
            <V2Button variant="secondary" size="sm" onClick={() => setPageMode('ledger')}>
              取消
            </V2Button>
            <V2Button variant="primary" size="sm" onClick={submitClaim}>
              确认认领
            </V2Button>
          </div>
        </header>

        <section className="ce-panel" data-annotation-id="ce-claim">
          <h2>客户主体（撞单键）</h2>
          <p className="ce-muted">
            当前登录：{CURRENT_USER}。同一信用代码同时仅允许一名主对接人；可先认领再准入。
          </p>
          <div className="ce-claim-grid">
            <label className="ce-field">
              <span>客户名称</span>
              <input
                value={claimName}
                onChange={(e) => setClaimName(e.target.value)}
                placeholder="如：杭州绿能物流有限公司"
              />
            </label>
            <label className="ce-field">
              <span>统一社会信用代码</span>
              <input
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
                placeholder="试填 91330400MA2HXXXX03 可演示撞单"
              />
            </label>
          </div>
          <p className="ce-hint">
            演示撞单：填入嘉兴冷链信用代码 <code>{OCCUPIED_SAMPLE.creditCode}</code>（归属{' '}
            {OCCUPIED_SAMPLE.owner}）。
          </p>
        </section>
        {toast ? <div className="ce-toast" role="status">{toast}</div> : null}
      </div>
    );
  }

  if (pageMode === 'detail' && active) {
    return (
      <div className="ce ce-detail">
        <header className="ce-form-header">
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
          <span className="ce-form-header__divider" />
          <div className="ce-form-header__title-wrap">
            <h1 className="ce-form-header__title">客户对接详情</h1>
            <span className="ce-form-header__pill">{active.id}</span>
          </div>
          <div className="ce-form-header__actions">
            {active.status === '转让审批中' ? (
              <V2Button variant="secondary" size="sm" onClick={approveTransfer}>
                主管通过转让
              </V2Button>
            ) : null}
            <V2Button variant="secondary" size="sm" onClick={releaseNow} disabled={!canAct}>
              主动释放
            </V2Button>
            <V2Button variant="primary" size="sm" onClick={tryCreateContract}>
              发起租赁合同
            </V2Button>
          </div>
        </header>

        <section className="ce-context" data-annotation-id="ce-context">
          <div>
            <span className="ce-muted">客户</span>
            <strong>{active.customerName}</strong>
            <span className="ce-mono">{active.creditCode}</span>
          </div>
          <div>
            <span className="ce-muted">主对接人</span>
            <strong>{active.owner}</strong>
            {active.collaborator ? <span className="ce-muted">协作 {active.collaborator}</span> : null}
          </div>
          <div>
            <span className="ce-muted">对接状态</span>
            <V2Badge status={statusBadge(active.status)} label={active.status} />
          </div>
          <div>
            <span className="ce-muted">准入 / 保护至</span>
            <V2Badge status={admissionBadge(active.admission)} label={active.admission} />
            <strong>{active.protectUntil}</strong>
          </div>
        </section>

        <section className="ce-panel" data-annotation-id="ce-gates">
          <h2>建合同门禁（演示）</h2>
          <ul>
            <li>操作人须为主对接人（当前登录 {CURRENT_USER}{isOwner ? ' · 已通过' : ' · 非归属人'}）</li>
            <li>准入须为标准或非标（当前 {active.admission}）</li>
            <li>对接须为有效态（当前 {active.status}）</li>
            {active.contractNo ? <li>已转化合同号：{active.contractNo}</li> : null}
          </ul>
          <div className="ce-panel__actions">
            <V2Button variant="outline" size="sm" onClick={urgeAdmission} disabled={!canAct}>
              催办准入
            </V2Button>
            <V2Button variant="secondary" size="sm" onClick={() => simulateAdmission('标准')}>
              模拟准入·标准
            </V2Button>
            <V2Button variant="secondary" size="sm" onClick={() => simulateAdmission('非标')}>
              模拟准入·非标
            </V2Button>
            <V2Button
              variant="secondary"
              size="sm"
              style={{ color: 'var(--ln-error, #EF4444)', borderColor: 'var(--ln-error, #EF4444)' }}
              onClick={() => simulateAdmission('禁止')}
            >
              模拟准入·禁止
            </V2Button>
          </div>
        </section>

        <section className="ce-panel" data-annotation-id="ce-follow">
          <h2>跟进时间线</h2>
          {canAct ? (
            <div className="ce-follow-compose">
              <textarea
                value={followText}
                onChange={(e) => setFollowText(e.target.value)}
                placeholder="登记拜访 / 报价 / 意向…"
                rows={3}
              />
              <V2Button variant="primary" size="sm" onClick={addFollowUp}>
                登记跟进
              </V2Button>
            </div>
          ) : (
            <p className="ce-muted">非主对接人或非有效态时，仅可查看时间线。</p>
          )}
          <ol className="ce-timeline">
            {active.followUps.map((f) => (
              <li key={f.id}>
                <div className="ce-timeline__meta">
                  <span className="ce-mono">{f.at}</span>
                  <V2Badge status="processing" label={f.kind} />
                  <span>{f.author}</span>
                </div>
                <p>{f.content}</p>
              </li>
            ))}
          </ol>
        </section>
        {toast ? <div className="ce-toast" role="status">{toast}</div> : null}
      </div>
    );
  }

  return (
    <div className="ce">
      <div className="ce-toolbar">
        <V2StatusTabs
          value={statusTab}
          onChange={(v) => {
            setStatusTab(v as StatusTab);
            setPage(1);
          }}
          options={[
            { key: 'all', label: '全部', count: tabCounts.all },
            { key: '跟进中', label: '跟进中', count: tabCounts.跟进中 },
            { key: '待准入', label: '待准入', count: tabCounts.待准入 },
            { key: '转让审批中', label: '转让审批中', count: tabCounts.转让审批中 },
            { key: '已转化', label: '已转化', count: tabCounts.已转化 },
            { key: '已释放', label: '已释放', count: tabCounts.已释放 },
            { key: '失败', label: '失败', count: tabCounts.失败 },
          ]}
        />
        <V2Button
          variant="primary"
          size="sm"
          icon={<UserPlus size={14} />}
          onClick={() => setPageMode('claim')}
        >
          新建对接
        </V2Button>
      </div>

      <div className="ce-kpi" data-annotation-id="ce-kpi">
        {kpi.map((k) => (
          <button
            key={k.key}
            type="button"
            className="ce-kpi__card"
            onClick={() => {
              if (!k.tab) return;
              setStatusTab(k.tab);
              setPage(1);
            }}
          >
            <span className="ce-kpi__label">{k.label}</span>
            <strong className="ce-kpi__value">{k.value}</strong>
          </button>
        ))}
      </div>

      <div className={`ce-shell ${moreOpen ? 'is-expanded' : ''}`}>
        <div className="ce-tools v2-filter-toolbar-tools">
          <V2FilterSearch aria-label="搜索对接单">
            <input
              type="text"
              placeholder="客户 / 对接单号 / 信用代码 / 归属人"
              value={draft.keyword}
              onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters();
              }}
            />
          </V2FilterSearch>
          <V2FilterMoreButton
            open={moreOpen}
            activeCount={(draft.region !== 'all' ? 1 : 0) + (draft.protect !== 'all' ? 1 : 0)}
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
          <div className="ce-more">
            <div className="ce-field">
              <label>区域</label>
              <V2Select
                value={draft.region}
                onChange={(v) => setDraft((d) => ({ ...d, region: v }))}
                options={[
                  { value: 'all', label: '全部' },
                  { value: '华东', label: '华东' },
                  { value: '华南', label: '华南' },
                ]}
              />
            </div>
            <div className="ce-field">
              <label>保护期</label>
              <V2Select
                value={draft.protect}
                onChange={(v) => setDraft((d) => ({ ...d, protect: v as Filters['protect'] }))}
                options={[
                  { value: 'all', label: '全部' },
                  { value: 'expiring', label: '7日内到期' },
                  { value: 'ok', label: '保护充足' },
                ]}
              />
            </div>
          </div>
        ) : null}

        <div className="ce-table-wrap" data-annotation-id="ce-table">
          {pageRows.length === 0 ? (
            <V2Empty title="暂无对接单" description="点击「新建对接」认领客户主体" />
          ) : (
            <table className="ce-table">
              <thead>
                <tr>
                  <th>客户 / 对接单</th>
                  <th>主对接人</th>
                  <th>状态</th>
                  <th>准入</th>
                  <th>意向台数</th>
                  <th>保护至</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <DetailEntryLink
                        variant="title"
                        ariaLabel={`查看对接单 ${r.id}`}
                        onClick={() => openDetail(r.id)}
                      >
                        {r.customerName}
                      </DetailEntryLink>
                      <div className="ce-sub">
                        <DetailEntryLink
                          variant="code"
                          ariaLabel={`对接单号 ${r.id}`}
                          onClick={() => openDetail(r.id)}
                        >
                          {r.id}
                        </DetailEntryLink>
                      </div>
                    </td>
                    <td>{r.owner}</td>
                    <td>
                      <V2Badge status={statusBadge(r.status)} label={r.status} />
                    </td>
                    <td>
                      <V2Badge status={admissionBadge(r.admission)} label={r.admission} />
                    </td>
                    <td>{r.intentVehicles}</td>
                    <td className="ce-mono">{r.protectUntil}</td>
                    <td>
                      <OperationActions
                        view={{ label: '查看', onClick: () => openDetail(r.id) }}
                        process={{ label: '处理', onClick: () => openDetail(r.id) }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="ce-pager">
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
      {toast ? <div className="ce-toast" role="status">{toast}</div> : null}
    </div>
  );
}
