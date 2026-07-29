import React, { useMemo, useState } from 'react';
import { formatMoney } from './mockData';
import type { CustomerReceivable, NoticeSealStatus, SealApplyStatus } from './types';
import { V2Button } from '../../resources/design-system/components/UIComponents';
import { V2Badge, type V2BadgeStatus } from '../../resources/design-system/components/V2Badge';

export type CollectionNoticePreviewProps = {
  customer: CustomerReceivable;
  onBack: () => void;
  onUpdate: (next: CustomerReceivable) => void;
};

const sealBadge = (s: NoticeSealStatus): V2BadgeStatus => {
  if (s === '已盖章') return 'success';
  if (s === '盖章中') return 'processing';
  if (s === '草稿') return 'warning';
  if (s === '盖章失败') return 'error';
  return 'default';
};

const applyBadge = (s: SealApplyStatus): V2BadgeStatus => {
  if (s === '已通过') return 'success';
  if (s === '审批中') return 'processing';
  if (s === '已驳回') return 'error';
  return 'default';
};

/**
 * layout: fullBleed（B1）
 * 平台用印 → E签宝（合同甲方主体）；回写由技术回调配置。
 */
export function CollectionNoticePreview({ customer, onBack, onUpdate }: CollectionNoticePreviewProps) {
  const [toast, setToast] = useState<string | null>(null);
  const notice = customer.notice;
  const sealStatus = notice?.sealStatus ?? '未生成';
  const applyStatus = notice?.sealApplyStatus ?? '未申请';
  const partyA = customer.contracts[0]?.partyA ?? '羚牛氢能科技（广东）有限公司';

  const rentSubtotal = useMemo(
    () => customer.periods.reduce((s, p) => s + p.unpaidAmount, 0),
    [customer.periods],
  );
  const penalty = customer.violation?.penaltyAmount ?? 0;
  const total = rentSubtotal + penalty;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const ensureDraft = (): CustomerReceivable => {
    if (customer.notice) return customer;
    const created = new Date().toISOString().slice(0, 10);
    return {
      ...customer,
      notice: {
        noticeNo: `CK-${created.replace(/-/g, '')}-${customer.key.slice(-3)}`,
        createdAt: created,
        deadline: '2026-07-10',
        sealStatus: '草稿',
        sealApplyStatus: '未申请',
      },
    };
  };

  const handleGenerate = () => {
    const next = ensureDraft();
    onUpdate({
      ...next,
      notice: { ...next.notice!, sealStatus: '草稿', sealApplyStatus: next.notice?.sealApplyStatus ?? '未申请' },
    });
    showToast('催款单已生成（草稿）。请先发起平台用印申请');
  };

  const handleSealApply = () => {
    const base = ensureDraft();
    onUpdate({
      ...base,
      notice: { ...base.notice!, sealStatus: '草稿', sealApplyStatus: '审批中' },
    });
    showToast('已提交平台用印申请（自钉钉迁移）；审批中…');
    window.setTimeout(() => {
      onUpdate({
        ...base,
        notice: { ...base.notice!, sealStatus: '草稿', sealApplyStatus: '已通过' },
      });
      showToast('用印已通过。可提交 E签宝（签章主体：合同甲方）');
    }, 1200);
  };

  const handleSeal = () => {
    if (applyStatus !== '已通过' && notice?.sealApplyStatus !== '已通过') {
      showToast('请先完成平台用印申请并通过');
      return;
    }
    const base = ensureDraft();
    const taskId = `ESIGN-${Date.now().toString().slice(-8)}`;
    onUpdate({
      ...base,
      notice: {
        ...base.notice!,
        sealApplyStatus: '已通过',
        sealStatus: '盖章中',
        esignTaskId: taskId,
      },
    });
    showToast(`已提交 E签宝（主体：${partyA}）任务 ${taskId}`);
    window.setTimeout(() => {
      onUpdate({
        ...base,
        notice: {
          ...base.notice!,
          sealApplyStatus: '已通过',
          sealStatus: '已盖章',
          esignTaskId: taskId,
          stampedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          stampedFileName: `催款函-${customer.customerName.slice(0, 6)}-盖章版.pdf`,
        },
      });
      showToast('E签宝盖章完成。盖章版回写由技术回调地址落库（原型模拟已归档）');
    }, 1600);
  };

  const lines = customer.periods.flatMap((p) =>
    p.lines.map((line) => ({
      ...line,
      period: `${p.startDate.replace(/-/g, '.')} - ${p.endDate.replace(/-/g, '.')}`,
    })),
  );

  const flowSteps: { key: string; label: string; done: boolean; active: boolean }[] = [
    {
      key: 'draft',
      label: '生成催款单',
      done: sealStatus !== '未生成',
      active: sealStatus === '草稿' && applyStatus === '未申请',
    },
    {
      key: 'apply',
      label: '平台用印',
      done: applyStatus === '已通过',
      active: applyStatus === '审批中' || (sealStatus === '草稿' && applyStatus === '未申请'),
    },
    {
      key: 'esign',
      label: 'E签宝盖章',
      done: sealStatus === '已盖章',
      active: sealStatus === '盖章中' || (applyStatus === '已通过' && sealStatus === '草稿'),
    },
    {
      key: 'file',
      label: '盖章版回写',
      done: sealStatus === '已盖章',
      active: sealStatus === '已盖章',
    },
  ];

  return (
    <div className="rd-notice" data-layout="fullBleed">
      <header className="rd-form-header">
        <div className="rd-form-header__left">
          <V2Button variant="outline" onClick={onBack}>
            返回台账
          </V2Button>
          <div className="rd-form-header__divider" aria-hidden />
          <div>
            <div className="rd-form-header__meta">
              租赁条线 · 应收催款
              {notice?.noticeNo ? <span className="rd-pill-code">{notice.noticeNo}</span> : null}
            </div>
            <h1 className="rd-form-header__title">催款单预览与盖章</h1>
          </div>
        </div>
        <div className="rd-form-header__actions">
          {sealStatus === '未生成' || !notice ? (
            <V2Button variant="primary" onClick={handleGenerate}>
              生成催款单
            </V2Button>
          ) : null}
          {sealStatus === '草稿' && (applyStatus === '未申请' || applyStatus === '已驳回') ? (
            <V2Button variant="outline" onClick={handleSealApply}>
              发起平台用印
            </V2Button>
          ) : null}
          {applyStatus === '审批中' ? (
            <V2Button variant="outline" disabled>
              用印审批中…
            </V2Button>
          ) : null}
          {(sealStatus === '草稿' || sealStatus === '盖章失败') && applyStatus === '已通过' ? (
            <V2Button variant="primary" onClick={handleSeal}>
              提交E签宝盖章
            </V2Button>
          ) : null}
          {sealStatus === '盖章中' ? (
            <V2Button variant="outline" disabled>
              盖章处理中…
            </V2Button>
          ) : null}
          {sealStatus === '已盖章' ? (
            <V2Button
              variant="primary"
              onClick={() => showToast(`已下载 ${notice?.stampedFileName ?? '盖章版.pdf'}（原型）`)}
            >
              下载盖章版
            </V2Button>
          ) : null}
        </div>
      </header>

      <div className="rd-context-card" data-annotation-id="rd-notice-status">
        <div className="rd-context-card__item">
          <label>客户</label>
          <strong>{customer.customerName}</strong>
        </div>
        <div className="rd-context-card__item">
          <label>签章主体（合同甲方）</label>
          <strong>{partyA}</strong>
        </div>
        <div className="rd-context-card__item">
          <label>当前总欠款</label>
          <strong className="rd-money rd-money--danger">¥{formatMoney(total)}</strong>
        </div>
        <div className="rd-context-card__item">
          <label>平台用印</label>
          <strong>
            <V2Badge status={applyBadge(applyStatus)} label={applyStatus} />
          </strong>
        </div>
        <div className="rd-context-card__item">
          <label>E签宝盖章</label>
          <strong>
            <V2Badge status={sealBadge(sealStatus)} label={sealStatus} />
          </strong>
        </div>
        <div className="rd-context-card__item">
          <label>E签宝任务号</label>
          <strong className="rd-mono">{notice?.esignTaskId ?? '—'}</strong>
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--rd-muted)', margin: '0 0 12px' }}>
        用印已从钉钉迁入平台；迁移验收后关闭钉钉催款用印流程。盖章版回写路径/回调地址由技术在接入 E签宝后配置。
      </p>

      <div className="rd-flow" aria-label="催款单流程" data-annotation-id="rd-seal-flow">
        {flowSteps.map((s) => (
          <span
            key={s.key}
            className={`rd-flow__step ${s.done ? 'is-done' : ''} ${s.active ? 'is-active' : ''}`}
          >
            {s.label}
          </span>
        ))}
      </div>

      <article className="rd-letter" data-annotation-id="rd-letter-body">
        <h1>氢燃料电池车租金催款函</h1>
        <p>
          <strong>{customer.customerName}：</strong>
        </p>
        <p className="indent">
          我司与贵司分别于
          {customer.contracts
            .map((c) => {
              const [y, m, d] = c.signedAt.split('-');
              return `${y}年${Number(m)}月${Number(d)}日`;
            })
            .join('、')}
          签订了《商用车租赁合同》（合同编号：
          {customer.contracts.map((c) => c.code).join('、')}
          ）。现就贵司欠付我司车辆租金事宜函告如下：
        </p>
        <p>
          <strong>一、欠付租金情况</strong>
        </p>
        <p className="indent">截至本函发出之日，贵司尚欠付我司车辆租金明细如下：</p>
        <table>
          <thead>
            <tr>
              <th>车型</th>
              <th>数量</th>
              <th>租金（元）</th>
              <th>租金计算周期</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={`${line.vehicleModel}-${idx}`}>
                <td>{line.vehicleModel}</td>
                <td>{line.quantity}</td>
                <td>{formatMoney(line.rentAmount)}</td>
                <td>{line.period}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={2}>
                <strong>租金小计</strong>
              </td>
              <td colSpan={2}>
                <strong>{formatMoney(rentSubtotal)}</strong>
              </td>
            </tr>
            {customer.violation ? (
              <tr>
                <td colSpan={2}>动态违规（截至 {customer.violation.asOf}）</td>
                <td colSpan={2}>
                  {customer.violation.count} 条 / 违约金 {formatMoney(customer.violation.penaltyAmount)}{' '}
                  元
                </td>
              </tr>
            ) : null}
            <tr>
              <td colSpan={2}>
                <strong>合计应付</strong>
              </td>
              <td colSpan={2}>
                <strong>{formatMoney(total)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="indent">
          请贵司于 <strong>{notice?.deadline ?? '____年__月__日'}</strong> 前将上述款项合计人民币{' '}
          <strong>{formatMoney(total)}</strong> 元汇入我司指定账户：
        </p>
        <p>
          户名：{partyA.replace('（', '(').replace('）', ')')}
          <br />
          账号：120924165110201
          <br />
          开户行：招商银行广州萝岗支行
        </p>
        <p className="indent">
          逾期未付的，我司有权从保证金中直接扣收；不足部分将严格依据租赁合同及法律规定通过司法途径追索，并主张违约金及全部违约责任。特此函告！
        </p>
        <div className="rd-letter__sign">
          <div>{partyA}</div>
          <div style={{ marginTop: 8 }}>
            {notice?.createdAt
              ? `${notice.createdAt.slice(0, 4)}年 ${Number(notice.createdAt.slice(5, 7))}月 ${Number(notice.createdAt.slice(8, 10))}日`
              : '____年 __月 __日'}
          </div>
          {sealStatus === '已盖章' ? (
            <div className="rd-seal" aria-label={`电子公章（E签宝 · ${partyA}）`}>
              {partyA}
            </div>
          ) : (
            <div style={{ marginTop: 48, color: '#888' }}>（盖章）</div>
          )}
        </div>
      </article>

      {toast ? (
        <div className="rd-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
