import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Shield,
  Wrench,
} from 'lucide-react';
import {
  V2Button,
  V2Empty,
  V2Select,
} from '../../resources/design-system/components/UIComponents';
import { V2Badge, type V2BadgeStatus } from '../../resources/design-system/components/V2Badge';
import {
  CARE_PACKAGE_TIP,
  OPS_WAIVER_MAP,
  WEAR_PACKAGE_TIP,
  calcCarePackages,
  formatMoney,
  opsNetAmount,
} from './carePackageRates';
import { ROLE_OPTIONS, recomputeTotals } from './mockData';
import type { FeeRow, PreviewRole, SettlementRecord } from './types';

export type SettlementDetailPageProps = {
  record: SettlementRecord;
  onBack: () => void;
  onUpdateRecord: (next: SettlementRecord) => void;
};

const approvalBadge = (s: SettlementRecord['approvalStatus']): V2BadgeStatus => {
  if (s === '审批完成') return 'success';
  if (s === '审批中' || s === '待审批') return 'processing';
  if (s === '审批驳回') return 'error';
  if (s === '撤回') return 'warning';
  return 'default';
};

function DeptSubmitPill({ status }: { status: '待提交' | '已提交' }) {
  return <V2Badge status={status === '已提交' ? 'success' : 'warning'} label={status} />;
}

function YesNoPill({ yes, tip }: { yes: boolean; tip: string }) {
  return (
    <span className="vrs-yn" title={tip}>
      <V2Badge status={yes ? 'success' : 'default'} label={yes ? '是' : '否'} />
      <HelpCircle size={14} className="vrs-yn__tip" aria-label={tip} />
    </span>
  );
}

/**
 * layout: fullBleed（B1）
 * 无忧包：业管谈妥是否购买 → 系统按《各车型收费方案》自动核算；运维无忧包减免挂钩
 */
export const SettlementDetailPage: React.FC<SettlementDetailPageProps> = ({
  record,
  onBack,
  onUpdateRecord,
}) => {
  const [role, setRole] = useState<PreviewRole>('biz');
  const [openSafety, setOpenSafety] = useState(true);
  const [openOps, setOpenOps] = useState(true);
  const [openBiz, setOpenBiz] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const canEditSafety = role === 'safety' && record.safety.status !== '已提交';
  const canRevokeSafety = role === 'safety' && record.safety.status === '已提交';
  const canEditOps = role === 'ops' && record.ops.status !== '已提交';
  const canRevokeOps = role === 'ops' && record.ops.status === '已提交';

  const pkg = useMemo(() => calcCarePackages(record), [record]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const kpi = useMemo(
    () => [
      { label: '保证金总额', value: record.depositTotal },
      { label: '待结算总额', value: record.pendingTotal },
      { label: '应退还总额', value: record.refundTotal },
      { label: '应补缴总额', value: record.payTotal },
    ],
    [record],
  );

  const commit = (next: SettlementRecord) => {
    onUpdateRecord(recomputeTotals(next));
  };

  const handleSafetySubmit = () => {
    commit({
      ...record,
      safety: {
        ...record.safety,
        submitBy: record.safety.submitBy || '安全-赵六',
        status: '已提交',
        feeRows: record.safety.feeRows.map((r) => ({
          ...r,
          updatedAt: '2026-07-28 21:10',
        })),
      },
    });
    showToast('安全组已提交；业管可查看最新内容');
  };

  const handleSafetyRevoke = () => {
    commit({ ...record, safety: { ...record.safety, status: '待提交' } });
    showToast('安全组已撤回，可继续编辑');
  };

  const handleSafetySave = () => {
    commit({
      ...record,
      safety: {
        ...record.safety,
        submitBy: record.safety.submitBy || '安全-赵六',
      },
    });
    showToast('安全组已暂存');
  };

  const updateOpsRow = (key: string, patch: Partial<FeeRow>) => {
    const feeRows = record.ops.feeRows.map((r) => (r.key === key ? { ...r, ...patch } : r));
    commit({
      ...record,
      ops: {
        ...record.ops,
        submitBy: record.ops.submitBy || '运维-陈涛',
        feeRows,
      },
    });
  };

  const handleOpsSave = () => {
    commit({
      ...record,
      ops: { ...record.ops, submitBy: record.ops.submitBy || '运维-陈涛' },
    });
    showToast('运维组已暂存');
  };

  const handleOpsSubmit = () => {
    commit({
      ...record,
      ops: {
        ...record.ops,
        submitBy: record.ops.submitBy || '运维-陈涛',
        status: '已提交',
        feeRows: record.ops.feeRows.map((r) => ({ ...r, updatedAt: '2026-07-28 21:10' })),
      },
    });
    showToast('运维组已提交');
  };

  const handleOpsRevoke = () => {
    commit({ ...record, ops: { ...record.ops, status: '待提交' } });
    showToast('运维组已撤回');
  };

  const waiverEnabled = (feeItem: string): boolean => {
    const kind = OPS_WAIVER_MAP[feeItem];
    if (kind === 'care') return record.hasCarePackage;
    if (kind === 'wear') return record.hasWearPackage;
    if (kind === 'tire') return record.hasTirePackage;
    return false;
  };

  const opsGross = record.ops.feeRows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const opsNet = record.ops.feeRows.reduce(
    (s, r) => s + opsNetAmount(r.amount, waiverEnabled(r.feeItem) ? r.packageWaiver : '0'),
    0,
  );

  return (
    <div className="vrs-detail" data-layout="fullBleed">
      <header className="vrs-form-header">
        <div className="vrs-form-header__left">
          <V2Button variant="back" size="sm" onClick={onBack}>
            返回列表
          </V2Button>
          <div className="vrs-form-header__divider" aria-hidden />
          <div className="vrs-form-header__meta">
            <span className="vrs-form-header__path">财务管理 · 还车应结款</span>
            <span className="vrs-bill-pill">{record.billNo}</span>
          </div>
        </div>
        <div className="vrs-form-header__actions">
          <div className="vrs-role-switch">
            <span>预览角色</span>
            <V2Select
              value={role}
              options={ROLE_OPTIONS}
              onChange={(v) => setRole(v as PreviewRole)}
              style={{ minWidth: 200 }}
            />
          </div>
          {canEditSafety ? (
            <>
              <V2Button variant="secondary" size="sm" onClick={handleSafetySave}>
                暂存
              </V2Button>
              <V2Button variant="primary" size="sm" onClick={handleSafetySubmit}>
                提交安全组
              </V2Button>
            </>
          ) : null}
          {canRevokeSafety ? (
            <V2Button variant="secondary" size="sm" onClick={handleSafetyRevoke}>
              撤回安全组
            </V2Button>
          ) : null}
          {canEditOps ? (
            <>
              <V2Button variant="secondary" size="sm" onClick={handleOpsSave}>
                暂存运维
              </V2Button>
              <V2Button variant="primary" size="sm" onClick={handleOpsSubmit}>
                提交运维组
              </V2Button>
            </>
          ) : null}
          {canRevokeOps ? (
            <V2Button variant="secondary" size="sm" onClick={handleOpsRevoke}>
              撤回运维组
            </V2Button>
          ) : null}
        </div>
      </header>

      <h1 className="vrs-detail-title">还车应结款详情</h1>

      <section className="vrs-context-card">
        <div className="vrs-context-card__row">
          <div>
            <span className="vrs-label">车牌</span>
            <strong className="vrs-plate">{record.plateNo}</strong>
          </div>
          <div>
            <span className="vrs-label">收费车型</span>
            <span>{record.vehicleModel}</span>
          </div>
          <div>
            <span className="vrs-label">合同编号</span>
            <span className="tabular-nums">{record.contractCode}</span>
          </div>
          <div>
            <span className="vrs-label">客户</span>
            <span>{record.customerName}</span>
          </div>
          <div>
            <span className="vrs-label">审批状态</span>
            <V2Badge status={approvalBadge(record.approvalStatus)} label={record.approvalStatus} />
          </div>
          <div>
            <span className="vrs-label">本段租期</span>
            <span className="tabular-nums">
              {record.deliveryTime.slice(0, 10)} ～ {record.returnTime.slice(0, 10)}
            </span>
          </div>
          <div>
            <span className="vrs-label">养护保</span>
            <YesNoPill yes={record.hasCarePackage} tip={CARE_PACKAGE_TIP} />
          </div>
          <div>
            <span className="vrs-label">易损保</span>
            <YesNoPill yes={record.hasWearPackage} tip={WEAR_PACKAGE_TIP} />
          </div>
        </div>
        <p className="vrs-hint">
          <AlertTriangle size={14} aria-hidden />
          是否购买无忧包由业管与客户谈妥反写；系统按《各车型收费方案》自动核算费用，不人工改价。
        </p>
      </section>

      <section className="vrs-pkg-card" data-annotation-id="vrs-care-package">
        <div className="vrs-pkg-card__head">
          <h2>无忧包自动核算</h2>
          <span className="vrs-muted">标准来自各车型收费方案最终版 · 未购买不计费</span>
        </div>
        <div className="vrs-pkg-grid">
          <div className="vrs-pkg-item">
            <div className="vrs-pkg-item__title">
              <span>保养无忧包（养护保）</span>
              <V2Badge
                status={record.hasCarePackage ? 'success' : 'default'}
                label={record.hasCarePackage ? '已购买' : '未购买'}
              />
            </div>
            <p className="vrs-pkg-item__formula">{pkg.careFormula}</p>
            <strong className="tabular-nums vrs-pkg-item__fee">
              {pkg.carePackageFeeText}
              <em>元</em>
            </strong>
            {pkg.rate ? (
              <span className="vrs-sub">
                单价 {pkg.rate.maintainPerKm} 元/公里 · 本段里程{' '}
                {record.mileageKm.toLocaleString('zh-CN')} 公里
              </span>
            ) : (
              <span className="vrs-sub vrs-warn">车型未在收费方案中配置</span>
            )}
          </div>
          <div className="vrs-pkg-item">
            <div className="vrs-pkg-item__title">
              <span>维修无忧包（易损保）</span>
              <V2Badge
                status={record.hasWearPackage ? 'success' : 'default'}
                label={record.hasWearPackage ? '已购买' : '未购买'}
              />
            </div>
            <p className="vrs-pkg-item__formula">{pkg.wearFormula}</p>
            <strong className="tabular-nums vrs-pkg-item__fee">
              {pkg.wearPackageFeeText}
              <em>元</em>
            </strong>
            {pkg.rate ? (
              <span className="vrs-sub">
                月费 {pkg.rate.repairMonthly} 元/月 · 计费月数 {pkg.billableMonths}（不含轮胎、漆面、玻璃）
              </span>
            ) : (
              <span className="vrs-sub vrs-warn">车型未在收费方案中配置</span>
            )}
          </div>
        </div>
      </section>

      <div className="vrs-kpi-row">
        {kpi.map((item) => (
          <div key={item.label} className="vrs-kpi-card">
            <span>{item.label}</span>
            <strong className="tabular-nums">
              {item.value}
              <em>元</em>
            </strong>
          </div>
        ))}
      </div>

      <section className="vrs-dept-card" data-annotation-id="vrs-biz-block">
        <button
          type="button"
          className="vrs-dept-card__head"
          onClick={() => setOpenBiz((v) => !v)}
          aria-expanded={openBiz}
        >
          <div className="vrs-dept-card__title">
            {openBiz ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <h2>业务服务组</h2>
            <DeptSubmitPill status={record.bizService.status} />
          </div>
          <div className="vrs-dept-card__meta">
            <span>提交人：{record.bizService.submitBy || '—'}</span>
            <span className="vrs-auto-tag">
              <CheckCircle2 size={12} aria-hidden />
              含无忧包自动费用
            </span>
          </div>
        </button>
        {openBiz ? (
          <div className="vrs-dept-card__body">
            <div className="vrs-table-wrap">
              <table className="vrs-table">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>费用项</th>
                    <th>金额</th>
                    <th>备注 / 核算式</th>
                    <th>最后更新时间</th>
                  </tr>
                </thead>
                <tbody>
                  {record.bizService.feeRows.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <V2Empty type="empty" size="compact" title="暂无业务服务费用" />
                      </td>
                    </tr>
                  ) : (
                    record.bizService.feeRows.map((row) => (
                      <tr
                        key={row.key}
                        className={
                          row.feeItem.includes('无忧包') ? 'vrs-row--auto' : undefined
                        }
                      >
                        <td className="tabular-nums">{row.seq}</td>
                        <td>{row.feeItem}</td>
                        <td className="tabular-nums">{row.amount}</td>
                        <td>{row.remark || '—'}</td>
                        <td className="tabular-nums">{row.updatedAt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>

      <section className="vrs-dept-card" data-annotation-id="vrs-ops-block">
        <button
          type="button"
          className="vrs-dept-card__head"
          onClick={() => setOpenOps((v) => !v)}
          aria-expanded={openOps}
        >
          <div className="vrs-dept-card__title">
            {openOps ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Wrench size={16} aria-hidden />
            <h2>运维组</h2>
            <DeptSubmitPill status={record.ops.status} />
          </div>
          <div className="vrs-dept-card__meta">
            <span>提交人：{record.ops.submitBy || '—'}</span>
            <span className="tabular-nums">
              净额 {formatMoney(opsNet)} 元
              <em className="vrs-muted">（毛额 {formatMoney(opsGross)}）</em>
            </span>
          </div>
        </button>
        {openOps ? (
          <div className="vrs-dept-card__body">
            <p className="vrs-hint vrs-hint--inline">
              无忧包减免计入业务成本、不列入运维成本。未购买对应无忧包时，减免输入禁用。
            </p>
            <div className="vrs-table-wrap">
              <table className="vrs-table">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>费用项</th>
                    <th>金额（元）</th>
                    <th>
                      无忧包减免（元）
                      <span className="vrs-th-tip" title="无忧包减免不会列入运维成本，而是计入业务成本">
                        <HelpCircle size={12} aria-hidden />
                      </span>
                    </th>
                    <th>净计入</th>
                    <th>备注</th>
                    <th>最后更新时间</th>
                  </tr>
                </thead>
                <tbody>
                  {record.ops.feeRows.map((row) => {
                    const canWaiver = waiverEnabled(row.feeItem);
                    const showWaiver = OPS_WAIVER_MAP[row.feeItem] != null;
                    const net = opsNetAmount(row.amount, canWaiver ? row.packageWaiver : '0');
                    return (
                      <tr key={row.key}>
                        <td className="tabular-nums">{row.seq}</td>
                        <td>{row.feeItem}</td>
                        <td>
                          {canEditOps ? (
                            <input
                              className="vrs-input tabular-nums"
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.amount}
                              onChange={(e) => updateOpsRow(row.key, { amount: e.target.value })}
                              aria-label={`${row.feeItem}金额`}
                            />
                          ) : (
                            <span className="tabular-nums">{row.amount}</span>
                          )}
                        </td>
                        <td>
                          {showWaiver ? (
                            canEditOps && canWaiver ? (
                              <input
                                className="vrs-input tabular-nums"
                                type="number"
                                step="0.01"
                                min="0"
                                value={row.packageWaiver ?? '0.00'}
                                onChange={(e) =>
                                  updateOpsRow(row.key, { packageWaiver: e.target.value })
                                }
                                aria-label={`${row.feeItem}无忧包减免`}
                              />
                            ) : (
                              <span
                                className={`tabular-nums${canWaiver ? '' : ' vrs-disabled-val'}`}
                                title={canWaiver ? undefined : '未购买对应无忧包，减免禁用'}
                              >
                                {canWaiver ? row.packageWaiver ?? '0.00' : '—'}
                              </span>
                            )
                          ) : (
                            <span className="vrs-muted">—</span>
                          )}
                        </td>
                        <td className="tabular-nums">{formatMoney(net)}</td>
                        <td>{row.remark || '—'}</td>
                        <td className="tabular-nums">{row.updatedAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>

      <section className="vrs-dept-card" data-annotation-id="vrs-safety-block">
        <button
          type="button"
          className="vrs-dept-card__head"
          onClick={() => setOpenSafety((v) => !v)}
          aria-expanded={openSafety}
        >
          <div className="vrs-dept-card__title">
            {openSafety ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Shield size={16} aria-hidden />
            <h2>安全组</h2>
            <DeptSubmitPill status={record.safety.status} />
          </div>
          <div className="vrs-dept-card__meta">
            <span>提交人：{record.safety.submitBy || '—'}</span>
            {role === 'biz' ? (
              <span className="vrs-auto-tag">
                <CheckCircle2 size={12} aria-hidden />
                业管可见 · 自动带出
              </span>
            ) : null}
          </div>
        </button>

        {openSafety ? (
          <div className="vrs-dept-card__body">
            <h3 className="vrs-subtitle">费用项</h3>
            <div className="vrs-table-wrap">
              <table className="vrs-table">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>费用项</th>
                    <th>金额</th>
                    <th>备注</th>
                    <th>最后更新时间</th>
                  </tr>
                </thead>
                <tbody>
                  {record.safety.feeRows.map((row) => (
                    <tr key={row.key}>
                      <td className="tabular-nums">{row.seq}</td>
                      <td>{row.feeItem}</td>
                      <td className="tabular-nums">{row.amount}</td>
                      <td>{row.remark || '—'}</td>
                      <td className="tabular-nums">{row.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="vrs-subtitle">违章清单</h3>
            {record.violations.length === 0 ? (
              <V2Empty
                type="empty"
                size="compact"
                title="暂无违章记录"
                description="本段租期内未检索到违章信息，非加载失败。"
              />
            ) : (
              <div className="vrs-table-wrap">
                <table className="vrs-table">
                  <thead>
                    <tr>
                      <th>违章编码</th>
                      <th>车牌号</th>
                      <th>违法行为</th>
                      <th>违法时间</th>
                      <th>罚款金额</th>
                      <th>缴费状态</th>
                      <th>记分值</th>
                      <th>是否处理</th>
                      <th>违章客户</th>
                      <th>备注</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.violations.map((v) => (
                      <tr key={v.key}>
                        <td className="vrs-mono">{v.code}</td>
                        <td className="vrs-plate">{v.plateNo}</td>
                        <td>{v.violationBehavior}</td>
                        <td className="tabular-nums">{v.violationTime}</td>
                        <td className="tabular-nums">{v.penaltyAmount}</td>
                        <td>{v.paymentStatus}</td>
                        <td className="tabular-nums">{v.score}</td>
                        <td>
                          <V2Badge
                            status={v.handleStatus === '已处理' ? 'success' : 'warning'}
                            label={v.handleStatus}
                          />
                        </td>
                        <td>{v.violationCustomer}</td>
                        <td>{v.remark || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h3 className="vrs-subtitle">事故清单</h3>
            {record.accidents.length === 0 ? (
              <V2Empty
                type="empty"
                size="compact"
                title="暂无违章记录"
                description="本段租期内暂无事故信息。"
              />
            ) : (
              <div className="vrs-table-wrap">
                <table className="vrs-table">
                  <thead>
                    <tr>
                      <th>事故编码</th>
                      <th>车牌号</th>
                      <th>事故时间</th>
                      <th>事故地点</th>
                      <th>事故类型</th>
                      <th>客户名称</th>
                      <th>我方定损</th>
                      <th>对方定损</th>
                      <th>责任划分</th>
                      <th>事故状态</th>
                      <th>结案时间</th>
                      <th>其他费用</th>
                      <th>备注</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.accidents.map((a) => (
                      <tr key={a.key}>
                        <td className="vrs-mono">{a.accidentCode}</td>
                        <td className="vrs-plate">{a.plateNo}</td>
                        <td className="tabular-nums">{a.accidentTime}</td>
                        <td>{a.accidentPlace}</td>
                        <td>{a.accidentType}</td>
                        <td>{a.customerName}</td>
                        <td className="tabular-nums">{a.ourClaimAmount || '—'}</td>
                        <td className="tabular-nums">{a.theirClaimAmount || '—'}</td>
                        <td>{a.responsibility}</td>
                        <td>{a.accidentStatus}</td>
                        <td className="tabular-nums">{a.closeTime || '—'}</td>
                        <td className="tabular-nums">{a.otherFee || '—'}</td>
                        <td>{a.remark || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </section>

      <section className="vrs-dept-card vrs-dept-card--muted">
        <div className="vrs-dept-card__head vrs-dept-card__head--static">
          <div className="vrs-dept-card__title">
            <h2>能源组</h2>
            <DeptSubmitPill status={record.energy.status} />
          </div>
          <span className="vrs-muted">提交人：{record.energy.submitBy || '—'} · 本期演示摘要</span>
        </div>
        {record.energy.feeRows.length > 0 ? (
          <div className="vrs-dept-summary">
            {record.energy.feeRows.map((r) => (
              <div key={r.key}>
                <span>{r.feeItem}</span>
                <em className="tabular-nums">{r.amount} 元</em>
              </div>
            ))}
          </div>
        ) : (
          <div className="vrs-dept-summary">
            <div>
              <span>暂无能源费用项</span>
            </div>
          </div>
        )}
      </section>

      {toast ? (
        <div className="vrs-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
};
