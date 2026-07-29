import React from 'react';
import {
  ArrowRight,
  Building2,
  FileText,
  Fuel,
  Link2,
  Shield,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';
import { V2Badge } from '../../resources/design-system/components/V2Badge';
import { V2Button } from '../../resources/design-system/components/UIComponents';

type ModuleStatus = 'ready' | 'reuse' | 'next';

type ModuleCard = {
  id: string;
  chain: string;
  title: string;
  desc: string;
  href: string;
  status: ModuleStatus;
  session: string;
  icon: React.ReactNode;
};

const MODULES: ModuleCard[] = [
  {
    id: 'payment',
    chain: '财务中枢',
    title: '收付款关联',
    desc: '业务单据 ↔ 财务实收实付；无关联不得结清',
    href: '/prototypes/bfcl-payment-hub/',
    status: 'ready',
    session: 'S0',
    icon: <Wallet size={20} />,
  },
  {
    id: 'customer',
    chain: '① 准入',
    title: '客户风险',
    desc: 'KA/LA/SMB 宽限 · 法务/安全/财务三维评分 · 红线预警',
    href: '/prototypes/bfcl-customer-risk/',
    status: 'ready',
    session: 'S0',
    icon: <Users size={20} />,
  },
  {
    id: 'contract',
    chain: '② 签约',
    title: '标准合同 → 租赁合同',
    desc: '模板红线锁死 · 非标审批 · E签宝/线下签章闭环',
    href: '/prototypes/bfcl-contract/',
    status: 'ready',
    session: 'S1',
    icon: <FileText size={20} />,
  },
  {
    id: 'pickup',
    chain: '③ 提车',
    title: '提车应收',
    desc: '15 日前后算法 · 收款关联 · 付清/特批才交车',
    href: '/prototypes/bfcl-pickup-receivable/',
    status: 'ready',
    session: 'S2',
    icon: <Truck size={20} />,
  },
  {
    id: 'bill',
    chain: '④ 账单',
    title: '租赁账单',
    desc: '交车起算 · 25 日生成 · 宽限逾期 · 收款关联',
    href: '/prototypes/bfcl-lease-bill/',
    status: 'ready',
    session: 'S3',
    icon: <Building2 size={20} />,
  },
  {
    id: 'return',
    chain: '⑤ 还车',
    title: '还车应结',
    desc: 'E签宝退租日 · 应收/应退分走收付闭环',
    href: '/prototypes/bfcl-return/',
    status: 'ready',
    session: 'S4',
    icon: <Link2 size={20} />,
  },
  {
    id: 'energy',
    chain: '⑥ 能源',
    title: '能源账户与氢费',
    desc: '预付入账 · 核对后扣费 · 客户月结 / 加氢站付款',
    href: '/prototypes/bfcl-energy/',
    status: 'ready',
    session: 'S5',
    icon: <Fuel size={20} />,
  },
  {
    id: 'insurance',
    chain: '⑦ 采购',
    title: '保险采购',
    desc: '供应商账户 → 比价付款 → 闭环后批量保单·一车多保',
    href: '/prototypes/bfcl-insurance/',
    status: 'ready',
    session: 'S6',
    icon: <Shield size={20} />,
  },
];

const statusLabel = (s: ModuleStatus) => {
  if (s === 'ready') return { label: '已就绪', badge: 'success' as const };
  if (s === 'reuse') return { label: '可复用旧页', badge: 'processing' as const };
  return { label: '下一会话', badge: 'warning' as const };
};

export function BizFinanceClosedLoopHub() {
  const readyCount = MODULES.filter((m) => m.status === 'ready').length;

  return (
    <div className="bfcl-hub" data-annotation-id="bfcl-hub-root">
      <header className="bfcl-hub__hero">
        <div>
          <p className="bfcl-hub__eyebrow">OneOS · 业财一体化</p>
          <h1 className="bfcl-hub__title">业财闭环</h1>
          <p className="bfcl-hub__lead">
            对照 Desktop ONE-OS / V1.2 旧页字段与主从结构，叠加业财关联门禁：业务单据管「该收/该付」，财务管「实收/实付」，条线做「关联」，系统回写并驱动交车、开票、充值、对账与保单归档。
          </p>
          <div style={{ marginTop: 16 }}>
            <V2Button
              variant="primary"
              onClick={() => {
                window.location.href = '/prototypes/biz-finance-line-briefing/';
              }}
            >
              打开业财闭环汇报 <ArrowRight size={14} />
            </V2Button>
          </div>
        </div>
        <div className="bfcl-hub__formula" data-annotation-id="bfcl-formula">
          <code>
            业务单据（应收/应付） ←关联→ 财务收/付款 → 状态回写 + 动作放行
          </code>
          <p className="bfcl-hub__discipline">纪律：无关联，不得假性结清 / 已充值 / 已付款 / 可交车</p>
        </div>
      </header>

      <section className="bfcl-hub__kpi" aria-label="链条概览">
        <div className="bfcl-hub__kpi-card">
          <span className="bfcl-hub__kpi-label">规划链条</span>
          <strong className="bfcl-hub__kpi-value">7</strong>
        </div>
        <div className="bfcl-hub__kpi-card">
          <span className="bfcl-hub__kpi-label">V2 页面已就绪</span>
          <strong className="bfcl-hub__kpi-value">{readyCount}</strong>
        </div>
        <div className="bfcl-hub__kpi-card">
          <span className="bfcl-hub__kpi-label">财务中枢</span>
          <strong className="bfcl-hub__kpi-value">1</strong>
        </div>
        <div className="bfcl-hub__kpi-card">
          <span className="bfcl-hub__kpi-label">待拍板项</span>
          <strong className="bfcl-hub__kpi-value">4</strong>
        </div>
      </section>

      <section className="bfcl-hub__grid" data-annotation-id="bfcl-module-grid">
        {MODULES.map((m) => {
          const st = statusLabel(m.status);
          return (
            <article key={m.id} className={`bfcl-hub__card status-${m.status}`}>
              <div className="bfcl-hub__card-top">
                <span className="bfcl-hub__icon" aria-hidden>
                  {m.icon}
                </span>
                <V2Badge status={st.badge} label={st.label} />
              </div>
              <p className="bfcl-hub__chain">{m.chain}</p>
              <h2 className="bfcl-hub__card-title">{m.title}</h2>
              <p className="bfcl-hub__card-desc">{m.desc}</p>
              <div className="bfcl-hub__card-foot">
                <span className="bfcl-hub__session">{m.session}</span>
                <V2Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.location.href = m.href;
                  }}
                >
                  打开 <ArrowRight size={14} />
                </V2Button>
              </div>
            </article>
          );
        })}
      </section>

      <footer className="bfcl-hub__foot">
        <p>
          汇报主稿：
          <code>src/resources/业财一体化全链条方案-汇报稿.md</code>
          · 知识库：
          <code>foundations/biz-finance-integration</code>
          · 建设路线：
          <code>docs/session-roadmap.md</code>
        </p>
      </footer>
    </div>
  );
}
