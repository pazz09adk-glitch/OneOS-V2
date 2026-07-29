import React from 'react';
import { explainCalc, formatMoney } from './mockData';
import type { CustomerReceivable } from './types';
import { V2Button } from '../../resources/design-system/components/UIComponents';
import { V2Badge, type V2BadgeStatus } from '../../resources/design-system/components/V2Badge';

export type CustomerDetailPageProps = {
  customer: CustomerReceivable;
  onBack: () => void;
  onOpenNotice: () => void;
};

const statusBadge = (s: CustomerReceivable['status']): V2BadgeStatus => {
  if (s === '逾期') return 'error';
  if (s === '正常') return 'success';
  return 'default';
};

/**
 * layout: fullBleed（B1）
 * 上期期末锚点 + 租赁台账/氢费对账单推算当前期末。
 */
export function CustomerDetailPage({ customer, onBack, onOpenNotice }: CustomerDetailPageProps) {
  const partyA = customer.contracts[0]?.partyA ?? '—';

  return (
    <div className="rd-detail" data-layout="fullBleed">
      <header className="rd-form-header">
        <div className="rd-form-header__left">
          <V2Button variant="outline" onClick={onBack}>
            返回台账
          </V2Button>
          <div className="rd-form-header__divider" aria-hidden />
          <div>
            <div className="rd-form-header__meta">
              租赁条线 · 应收催款
              <span className="rd-pill-code">{customer.key}</span>
            </div>
            <h1 className="rd-form-header__title">客户应收与分期期末</h1>
          </div>
        </div>
        <div className="rd-form-header__actions">
          <V2Button variant="outline" onClick={onOpenNotice}>
            预览催款单
          </V2Button>
          <V2Button variant="primary" onClick={onOpenNotice}>
            生成催款单
          </V2Button>
        </div>
      </header>

      <div className="rd-context-card" data-annotation-id="rd-customer-context">
        <div className="rd-context-card__item">
          <label>客户名称</label>
          <strong>{customer.customerName}</strong>
        </div>
        <div className="rd-context-card__item">
          <label>运行状态</label>
          <strong>
            <V2Badge status={statusBadge(customer.status)} label={customer.status} />
          </strong>
        </div>
        <div className="rd-context-card__item">
          <label>当前期末余额（推算）</label>
          <strong className="rd-money">¥{formatMoney(customer.currentPeriodEndBalance)}</strong>
        </div>
        <div className="rd-context-card__item">
          <label>当前总欠款</label>
          <strong className="rd-money rd-money--danger">¥{formatMoney(customer.currentTotalDebt)}</strong>
        </div>
        <div className="rd-context-card__item">
          <label>合同甲方（签章主体）</label>
          <strong>{partyA}</strong>
        </div>
        <div className="rd-context-card__item">
          <label>业务部门 / 负责人</label>
          <strong>
            {customer.bizDept} · {customer.owner}
          </strong>
        </div>
      </div>

      <section className="rd-section" data-annotation-id="rd-finance-anchor">
        <div className="rd-section__head">取数锚点与推算</div>
        <div className="rd-section__body">
          <div className="rd-context-card" style={{ margin: 0, border: 'none', padding: 0 }}>
            <div className="rd-context-card__item">
              <label>上期期末余额（财务提供）</label>
              <strong className="rd-money">
                ¥{formatMoney(customer.financeAnchor.priorPeriodEndAmount)}
              </strong>
            </div>
            <div className="rd-context-card__item">
              <label>上期期末时间</label>
              <strong>{customer.financeAnchor.priorPeriodEndAt}</strong>
            </div>
            <div className="rd-context-card__item">
              <label>期间发生额来源</label>
              <strong>租赁业务台账 · 氢费对账单</strong>
            </div>
            <div className="rd-context-card__item">
              <label>当前期末（自动推算）</label>
              <strong className="rd-money">¥{formatMoney(customer.currentPeriodEndBalance)}</strong>
            </div>
          </div>
          <p style={{ margin: '12px 0 0', color: 'var(--rd-body)', fontSize: 13, lineHeight: 1.6 }}>
            {explainCalc(customer)}
          </p>
        </div>
      </section>

      <section className="rd-section" data-annotation-id="rd-period-ledger">
        <div className="rd-section__head">分期期末金额台账</div>
        <div className="rd-table-wrap">
          <table className="rd-table">
            <thead>
              <tr>
                <th>计费期</th>
                <th>周期</th>
                <th>明细（含来源）</th>
                <th>期末金额</th>
                <th>已收</th>
                <th>未收（期末结余）</th>
              </tr>
            </thead>
            <tbody>
              {customer.periods.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="rd-main-title">{p.periodLabel}</div>
                    <div className="rd-mono">{p.id}</div>
                  </td>
                  <td>
                    {p.startDate} ~ {p.endDate}
                  </td>
                  <td>
                    {p.lines.map((l) => (
                      <div key={`${p.id}-${l.vehicleModel}-${l.source ?? ''}`}>
                        {l.vehicleModel} × {l.quantity} · ¥{formatMoney(l.rentAmount)}
                        {l.source ? (
                          <span className="rd-mono" style={{ marginLeft: 6 }}>
                            [{l.source}]
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </td>
                  <td className="rd-money">¥{formatMoney(p.periodEndAmount)}</td>
                  <td className="rd-money">¥{formatMoney(p.paidAmount)}</td>
                  <td className={`rd-money ${p.unpaidAmount > 0 ? 'rd-money--danger' : ''}`}>
                    ¥{formatMoney(p.unpaidAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {customer.violation ? (
        <section className="rd-section">
          <div className="rd-section__head">附加违约金</div>
          <div className="rd-section__body">
            截至 {customer.violation.asOf}，动态违规 {customer.violation.count} 条，违约金{' '}
            <span className="rd-money rd-money--danger">
              ¥{formatMoney(customer.violation.penaltyAmount)}
            </span>
            。计入当前总欠款（在推算期末之外加计）。
          </div>
        </section>
      ) : null}

      <section className="rd-section">
        <div className="rd-section__head">欠款汇总</div>
        <div className="rd-section__body">
          <div className="rd-context-card" style={{ margin: 0, border: 'none', padding: 0 }}>
            <div className="rd-context-card__item">
              <label>当前期末余额</label>
              <strong className="rd-money">¥{formatMoney(customer.currentPeriodEndBalance)}</strong>
            </div>
            <div className="rd-context-card__item">
              <label>违约金</label>
              <strong className="rd-money">
                ¥{formatMoney(customer.violation?.penaltyAmount ?? 0)}
              </strong>
            </div>
            <div className="rd-context-card__item">
              <label>当前总欠款</label>
              <strong className="rd-money rd-money--danger">
                ¥{formatMoney(customer.currentTotalDebt)}
              </strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
